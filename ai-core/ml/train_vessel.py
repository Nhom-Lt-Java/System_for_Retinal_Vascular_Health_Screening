import os
import argparse
import random
from typing import Dict, List, Tuple

import numpy as np
import torch
import yaml
from tqdm import tqdm
import albumentations as A
import cv2

from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split

from ml.datasets.fundus import FundusVesselDataset

try:
    from ml.models.factory import build_model
except Exception:
    build_model = None

try:
    from ml.models.vessel_unet import build_unet
except Exception:
    build_unet = None


# -------------------------
# Utils
# -------------------------
def seed_all(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def freeze_bn(m):
    if isinstance(m, torch.nn.modules.batchnorm._BatchNorm):
        m.eval()


def load_items(data_root: str, datasets) -> List[Tuple[str, str]]:
    items: List[Tuple[str, str]] = []
    for ds in datasets:
        image_dir = os.path.join(data_root, ds, "images")
        mask_dir = os.path.join(data_root, ds, "masks")
        if os.path.isdir(image_dir) and os.path.isdir(mask_dir):
            items += FundusVesselDataset.from_folder(image_dir, mask_dir)
    if not items:
        raise RuntimeError("No training items found. Check `data/` layout.")
    return items


def soft_dice_loss(logits: torch.Tensor, target: torch.Tensor, eps: float = 1e-6) -> torch.Tensor:
    prob = torch.sigmoid(logits)
    target = target.float()
    inter = (prob * target).sum(dim=(1, 2, 3))
    union = prob.sum(dim=(1, 2, 3)) + target.sum(dim=(1, 2, 3))
    dice = (2 * inter + eps) / (union + eps)
    return 1 - dice.mean()


@torch.no_grad()
def soft_dice_coeff(prob: torch.Tensor, target: torch.Tensor, eps: float = 1e-6) -> float:
    gt = (target > 0.5).float()
    inter = (prob * gt).sum(dim=(1, 2, 3))
    union = prob.sum(dim=(1, 2, 3)) + gt.sum(dim=(1, 2, 3))
    d = (2 * inter + eps) / (union + eps)
    return float(d.mean().item())


@torch.no_grad()
def confusion_from_prob(prob: torch.Tensor, target: torch.Tensor, thr: float):
    pred = (prob > thr).float()
    gt = (target > 0.5).float()
    tp = float((pred * gt).sum().item())
    tn = float(((1 - pred) * (1 - gt)).sum().item())
    fp = float((pred * (1 - gt)).sum().item())
    fn = float(((1 - pred) * gt).sum().item())
    return tp, tn, fp, fn


def metrics_from_confusion(tp: float, tn: float, fp: float, fn: float, eps: float = 1e-6):
    acc = (tp + tn) / (tp + tn + fp + fn + eps)
    prec = tp / (tp + fp + eps)
    rec = tp / (tp + fn + eps)
    dice = (2 * tp + eps) / (2 * tp + fp + fn + eps)
    return float(dice), float(acc), float(prec), float(rec)


def save_debug_images(debug_dir: str, epoch: int, x: torch.Tensor, y: torch.Tensor, prob: torch.Tensor, thr: float):
    os.makedirs(debug_dir, exist_ok=True)

    x0 = x[0].detach().cpu()
    y0 = y[0, 0].detach().cpu()
    p0 = prob[0, 0].detach().cpu()

    gt_ratio = float((y0 > 0.5).float().mean().item())
    pr_ratio = float((p0 > thr).float().mean().item())
    print(
        f"[DEBUG] epoch {epoch+1} | GT vessel ratio={gt_ratio:.6f} | Pred vessel ratio={pr_ratio:.6f} | "
        f"thr={thr:.2f} | prob min/max/mean={float(p0.min()):.4f}/{float(p0.max()):.4f}/{float(p0.mean()):.4f}"
    )

    img = (x0.permute(1, 2, 0).numpy() * 255.0).clip(0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(debug_dir, f"epoch{epoch+1:03d}_input.png"), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))

    gt = ((y0.numpy() > 0.5).astype(np.uint8) * 255)
    cv2.imwrite(os.path.join(debug_dir, f"epoch{epoch+1:03d}_gt.png"), gt)

    prob_img = (p0.numpy() * 255.0).clip(0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(debug_dir, f"epoch{epoch+1:03d}_prob.png"), prob_img)

    pred = ((p0.numpy() > thr).astype(np.uint8) * 255)
    cv2.imwrite(os.path.join(debug_dir, f"epoch{epoch+1:03d}_pred.png"), pred)


# -------------------------
# Train / Val
# -------------------------
def main(cfg: Dict):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    seed_all(int(cfg.get("seed", 42)))

    # thresholds
    eval_thr = float(cfg.get("eval_threshold", 0.2))
    deploy_thr = float(cfg.get("deploy_threshold", 0.5))
    debug_thr = float(cfg.get("debug_threshold", deploy_thr))

    # save criterion: "deploy" (default) or "eval"
    save_by = str(cfg.get("save_by", "deploy")).lower()  # deploy/eval

    # training settings
    epochs = int(cfg.get("epochs", 50))
    lr = float(cfg.get("lr", 3e-4))
    size = int(cfg.get("image_size", 512))
    batch_size = int(cfg.get("batch_size", 2))
    num_workers = int(cfg.get("num_workers", 0))

    use_dice_loss = bool(cfg.get("use_dice_loss", True))
    bce_pos_weight = float(cfg.get("bce_pos_weight", 12.0))
    w_bce = float(cfg.get("loss_bce_weight", 0.2))
    w_dice = float(cfg.get("loss_dice_weight", 0.8))

    freeze_bn_flag = bool(cfg.get("freeze_bn", True))
    grad_clip = float(cfg.get("grad_clip_norm", 0.0))

    # debug saving
    debug_save = bool(cfg.get("debug_save", True))
    debug_dir = str(cfg.get("debug_dir", "debug"))
    debug_every = int(cfg.get("debug_every", 1))

    # split
    val_split = float(cfg.get("val_split", 0.2))

    # output
    out_dir = str(cfg.get("output_dir", "artifacts/models"))
    out_name = str(cfg.get("output_name", "b_unet.pt"))
    os.makedirs(out_dir, exist_ok=True)
    best_path = os.path.join(out_dir, out_name)

    # data
    items = load_items(cfg["data_root"], cfg["datasets"])
    items = sorted(items, key=lambda x: (x[0], x[1]))
    train_items, val_items = train_test_split(items, test_size=val_split, random_state=int(cfg.get("seed", 42)))

    # augmentation
    aug = cfg.get("augment", {}) or {}
    hflip_p = float(aug.get("hflip_p", 0.5))
    bc_p = float(aug.get("brightness_contrast_p", 0.3))
    ssr_p = float(aug.get("ssr_p", 0.15))
    shift_limit = float(aug.get("shift_limit", 0.01))
    scale_limit = float(aug.get("scale_limit", 0.03))
    rotate_limit = float(aug.get("rotate_limit", 5))

    train_tf = A.Compose([
        A.Resize(size, size),
        A.HorizontalFlip(p=hflip_p),
        A.RandomBrightnessContrast(p=bc_p),
        A.ShiftScaleRotate(
            shift_limit=shift_limit,
            scale_limit=scale_limit,
            rotate_limit=rotate_limit,
            p=ssr_p
        ),
    ])
    val_tf = A.Compose([A.Resize(size, size)])

    train_ds = FundusVesselDataset(train_items, transform=train_tf)
    val_ds = FundusVesselDataset(val_items, transform=val_tf)

    pin_memory = (device == "cuda")
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=pin_memory)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=pin_memory)

    # model
    mcfg = cfg.get("model", {}) or {}
    if build_model is not None:
        model = build_model(mcfg).to(device)
    else:
        if build_unet is None:
            raise RuntimeError("No model builder found.")
        model = build_unet(
            encoder_name=mcfg.get("encoder", "resnet34"),
            encoder_weights=mcfg.get("encoder_weights", "imagenet"),
            in_channels=3,
            classes=1,
        ).to(device)

    opt = torch.optim.AdamW(model.parameters(), lr=lr)
    loss_fn = torch.nn.BCEWithLogitsLoss(pos_weight=torch.tensor([bce_pos_weight], device=device))

    print(f"[INFO] device={device} | epochs={epochs} | img_size={size} | batch={batch_size} | lr={lr}")
    print(f"[INFO] eval_thr={eval_thr} | deploy_thr={deploy_thr} | debug_thr={debug_thr} | save_by={save_by}")
    print(f"[INFO] pos_weight={bce_pos_weight} | loss_w=(bce={w_bce}, dice={w_dice}) | freeze_bn={freeze_bn_flag}")

    best_score = -1.0

    for epoch in range(epochs):
        # ---- train ----
        model.train()
        if freeze_bn_flag:
            model.apply(freeze_bn)

        pbar = tqdm(train_loader, desc=f"train epoch {epoch+1}")
        for x, y in pbar:
            x = x.to(device, dtype=torch.float32)
            y = y.to(device, dtype=torch.float32)

            opt.zero_grad(set_to_none=True)
            logits = model(x)

            bce = loss_fn(logits, y)
            if use_dice_loss:
                dice_l = soft_dice_loss(logits, y)
                loss = w_bce * bce + w_dice * dice_l
            else:
                loss = bce

            if not torch.isfinite(loss):
                print("[ERROR] Non-finite loss detected:", float(loss.detach().cpu().item()))
                return

            loss.backward()
            if grad_clip and grad_clip > 0:
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=grad_clip)
            opt.step()

            pbar.set_postfix(loss=float(loss.detach().cpu().item()))

        # ---- val ----
        model.eval()

        tp_e = tn_e = fp_e = fn_e = 0.0
        tp_d = tn_d = fp_d = fn_d = 0.0
        soft_dices = []
        prob_means = []

        with torch.no_grad():
            for bi, (x, y) in enumerate(val_loader):
                x = x.to(device, dtype=torch.float32)
                y = y.to(device, dtype=torch.float32)

                prob = torch.sigmoid(model(x))

                soft_dices.append(soft_dice_coeff(prob, y))
                prob_means.append(float(prob.mean().item()))

                a, b, c, d = confusion_from_prob(prob, y, eval_thr)
                tp_e += a; tn_e += b; fp_e += c; fn_e += d

                a, b, c, d = confusion_from_prob(prob, y, deploy_thr)
                tp_d += a; tn_d += b; fp_d += c; fn_d += d

                if debug_save and (epoch % debug_every == 0) and bi == 0:
                    save_debug_images(debug_dir, epoch, x, y, prob, thr=debug_thr)

        mean_soft_dice = float(np.mean(soft_dices)) if soft_dices else 0.0
        mean_prob = float(np.mean(prob_means)) if prob_means else 0.0

        dice_e, acc_e, prec_e, rec_e = metrics_from_confusion(tp_e, tn_e, fp_e, fn_e)
        dice_d, acc_d, prec_d, rec_d = metrics_from_confusion(tp_d, tn_d, fp_d, fn_d)

        print(
            f"val dice@{eval_thr:.2f}: {dice_e:.6f} | acc: {acc_e:.4f} | prec: {prec_e:.4f} | rec: {rec_e:.4f} | "
            f"soft_dice: {mean_soft_dice:.4f} | prob_mean: {mean_prob:.4f}"
        )
        print(
            f"val dice@{deploy_thr:.2f}: {dice_d:.6f} | acc: {acc_d:.4f} | prec: {prec_d:.4f} | rec: {rec_d:.4f}"
        )

        score = dice_d if save_by == "deploy" else dice_e
        if score > best_score:
            best_score = score
            torch.save({"state_dict": model.state_dict(), "config": cfg}, best_path)
            print(f"saved best -> {best_path} (best_{save_by}_dice={best_score:.6f})")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    args = ap.parse_args()

    with open(args.config, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    main(cfg)

import os, argparse, random, numpy as np, torch, yaml
from tqdm import tqdm
import albumentations as A
from torch.utils.data import DataLoader
from sklearn.model_selection import train_test_split
from ml.datasets.fundus import FundusVesselDataset
from ml.models.vessel_unet import build_unet
from ml.tasks.metrics import dice_coeff

def seed_all(seed: int):
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed); torch.cuda.manual_seed_all(seed)

def load_items(data_root: str, datasets):
    items = []
    for ds in datasets:
        image_dir = os.path.join(data_root, ds, "images")
        mask_dir = os.path.join(data_root, ds, "masks")
        if os.path.isdir(image_dir) and os.path.isdir(mask_dir):
            items += FundusVesselDataset.from_folder(image_dir, mask_dir)
    if not items:
        raise RuntimeError("No training items found. Check `data/` layout. See scripts/datasets.md")
    return items

def main(cfg):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    seed_all(int(cfg.get("seed", 42)))

    items = load_items(cfg["data_root"], cfg["datasets"])
    train_items, val_items = train_test_split(items, test_size=0.2, random_state=int(cfg.get("seed", 42)))

    size = int(cfg.get("image_size", 512))
    train_tf = A.Compose([
        A.Resize(size, size),
        A.HorizontalFlip(p=0.5),
        A.RandomBrightnessContrast(p=0.3),
        A.ShiftScaleRotate(shift_limit=0.02, scale_limit=0.05, rotate_limit=10, p=0.4),
    ])
    val_tf = A.Compose([A.Resize(size, size)])

    train_ds = FundusVesselDataset(train_items, transform=train_tf)
    val_ds = FundusVesselDataset(val_items, transform=val_tf)
    train_loader = DataLoader(train_ds, batch_size=int(cfg["batch_size"]), shuffle=True, num_workers=int(cfg["num_workers"]))
    val_loader = DataLoader(val_ds, batch_size=int(cfg["batch_size"]), shuffle=False, num_workers=int(cfg["num_workers"]))

    mcfg = cfg.get("model", {})
    model = build_unet(encoder_name=mcfg.get("encoder","resnet34"), encoder_weights=mcfg.get("encoder_weights","imagenet")).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=float(cfg["lr"]))
    loss_fn = torch.nn.BCEWithLogitsLoss()

    out_dir = cfg["output_dir"]; os.makedirs(out_dir, exist_ok=True)
    best = 0.0

    for epoch in range(int(cfg["epochs"])):
        model.train()
        pbar = tqdm(train_loader, desc=f"train epoch {epoch+1}")
        for x, y in pbar:
            x = torch.from_numpy(x).to(device)
            y = torch.from_numpy(y).to(device)
            opt.zero_grad()
            logits = model(x)
            loss = loss_fn(logits, y)
            loss.backward()
            opt.step()
            pbar.set_postfix(loss=float(loss.detach().cpu().item()))

        model.eval()
        dices = []
        with torch.no_grad():
            for x, y in val_loader:
                x = torch.from_numpy(x).to(device)
                y = torch.from_numpy(y).to(device)
                prob = torch.sigmoid(model(x))
                dices.append(dice_coeff(prob, y).mean().item())
        mean_dice = float(np.mean(dices))
        print(f"val dice: {mean_dice:.4f}")
        if mean_dice > best:
            best = mean_dice
            out = os.path.join(out_dir, "vessel_unet.pt")
            torch.save({"state_dict": model.state_dict(), "config": cfg}, out)
            print(f"saved best -> {out}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    args = ap.parse_args()
    with open(args.config, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    main(cfg)

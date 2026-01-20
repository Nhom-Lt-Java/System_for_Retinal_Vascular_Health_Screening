import os
import io
from typing import Optional, Dict, Any

import numpy as np
import cv2
import torch
import yaml
from PIL import Image
from torchvision import transforms

from minio import Minio

from ml.models.disease_classifier import build_disease_classifier
from ml.models.attention_r2unet import AttentionR2UNet

try:
    import segmentation_models_pytorch as smp
except Exception:
    smp = None


# =========================
# ENV / CONFIG
# =========================
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Classifier checkpoint (dict with keys: state_dict, classes, config) OR plain state_dict
CLS_CKPT = os.getenv("CLS_CKPT", "artifacts/models/disease_cls_rgb.pt")

# Vessel checkpoint (your log shows R2AttU-Net style keys: RRCNN*, Up*, Att*, out_conv*)
VESSEL_CKPT = os.getenv("VESSEL_CKPT", "artifacts/models/b_unet.pt")
VESSEL_CFG = os.getenv("VESSEL_CFG", "ml/configs/vessel_unet.yaml")

CLS_SIZE = int(os.getenv("CLS_SIZE", "256"))
VESSEL_SIZE = int(os.getenv("VESSEL_SIZE", "512"))
VESSEL_THR = float(os.getenv("VESSEL_THR", "0.78"))
OVERLAY_ALPHA = float(os.getenv("OVERLAY_ALPHA", "0.35"))
HEAT_ALPHA = float(os.getenv("HEAT_ALPHA", "0.45"))

OUT_DIR = os.getenv("OUT_DIR", "artifacts/api_outputs")
os.makedirs(OUT_DIR, exist_ok=True)

# =========================
# MinIO (upload artifacts)
# =========================
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin123")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "aura")
MINIO_PREFIX = os.getenv("MINIO_PREFIX", "analyses")

_secure = MINIO_ENDPOINT.startswith("https://")
_endpoint = MINIO_ENDPOINT.replace("http://", "").replace("https://", "")

minio_client = Minio(
    _endpoint,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=_secure,
)


# =========================
# Helpers
# =========================
def _strip_module_prefix(sd: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
    out = {}
    for k, v in sd.items():
        if k.startswith("module."):
            out[k[len("module."):]] = v
        else:
            out[k] = v
    return out


def _load_ckpt_any(path: str) -> Any:
    return torch.load(path, map_location="cpu")


def _extract_state_dict(obj: Any) -> Dict[str, torch.Tensor]:
    if isinstance(obj, dict) and "state_dict" in obj and isinstance(obj["state_dict"], dict):
        return obj["state_dict"]
    if isinstance(obj, dict) and all(isinstance(k, str) for k in obj.keys()):
        # could already be a state_dict
        return obj  # type: ignore
    raise RuntimeError(f"Checkpoint format không hợp lệ: {type(obj)}")


def _png_bytes_from_rgb(rgb: np.ndarray) -> bytes:
    """rgb uint8 HWC -> png bytes"""
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    ok, buf = cv2.imencode(".png", bgr)
    return buf.tobytes() if ok else b""


def _png_bytes_from_gray(gray: np.ndarray) -> bytes:
    """gray uint8 HW -> png bytes"""
    ok, buf = cv2.imencode(".png", gray)
    return buf.tobytes() if ok else b""


def _ensure_bucket_exists() -> None:
    # an toàn khi chạy nhiều lần
    try:
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
    except Exception:
        # nếu đã có bucket/không đủ quyền thì bỏ qua; minio-init thường đã tạo sẵn
        pass


def _put_png(object_key: str, data: bytes) -> int:
    """upload png bytes -> MinIO, return size bytes"""
    _ensure_bucket_exists()
    minio_client.put_object(
        MINIO_BUCKET,
        object_key,
        io.BytesIO(data),
        length=len(data),
        content_type="image/png",
    )
    return len(data)


def _overlay_vessels_green(rgb: np.ndarray, mask: np.ndarray, alpha: float) -> np.ndarray:
    """
    rgb: uint8 HWC (RGB)
    mask: uint8 HW (0/255)
    overlay: green on vessels
    """
    out = rgb.copy()
    green = np.zeros_like(out)
    green[..., 1] = 255  # Green channel
    m = (mask > 0).astype(np.float32)[..., None]
    out = (out * (1 - alpha * m) + green * (alpha * m)).clip(0, 255).astype(np.uint8)
    return out


def _apply_heatmap(rgb: np.ndarray, heatmap01: np.ndarray, alpha: float) -> tuple[np.ndarray, np.ndarray]:
    """
    heatmap01: float32 HW in [0..1]
    returns: (heat_overlay_rgb, heat_rgb)
    """
    hm = (heatmap01 * 255).clip(0, 255).astype(np.uint8)
    hm_color_bgr = cv2.applyColorMap(hm, cv2.COLORMAP_JET)
    hm_rgb = cv2.cvtColor(hm_color_bgr, cv2.COLOR_BGR2RGB)
    out = (rgb * (1 - alpha) + hm_rgb * alpha).clip(0, 255).astype(np.uint8)
    return out, hm_rgb


# =========================
# Load CLASSIFIER (once)
# =========================
_cls_obj = _load_ckpt_any(CLS_CKPT)

# classes list
if isinstance(_cls_obj, dict) and "classes" in _cls_obj:
    CLASSES = _cls_obj["classes"]
else:
    # fallback default
    CLASSES = ["NORMAL", "DR", "AMD", "OTHER"]

# model name config
if isinstance(_cls_obj, dict) and "config" in _cls_obj and isinstance(_cls_obj["config"], dict):
    CLS_MODEL_NAME = _cls_obj["config"].get("model", "efficientnet_b0")
else:
    CLS_MODEL_NAME = "efficientnet_b0"

CLS_MODEL = build_disease_classifier(
    CLS_MODEL_NAME,
    num_classes=len(CLASSES),
    pretrained=False,
    in_channels=3,
)

_cls_sd = _strip_module_prefix(_extract_state_dict(_cls_obj))
CLS_MODEL.load_state_dict(_cls_sd, strict=True)
CLS_MODEL.to(DEVICE).eval()

CLS_TF = transforms.Compose(
    [
        transforms.Resize((CLS_SIZE, CLS_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


# =========================
# Grad-CAM (simple)
# =========================
def _find_last_conv(model: torch.nn.Module) -> Optional[torch.nn.Module]:
    last = None
    for m in model.modules():
        if isinstance(m, torch.nn.Conv2d):
            last = m
    return last


_LAST_CONV = _find_last_conv(CLS_MODEL)


def gradcam_heatmap(pil_img: Image.Image, class_idx: int) -> np.ndarray:
    """
    returns heatmap float32 in [0..1], shape (CLS_SIZE, CLS_SIZE)
    """
    if _LAST_CONV is None:
        return np.zeros((CLS_SIZE, CLS_SIZE), dtype=np.float32)

    CLS_MODEL.zero_grad(set_to_none=True)

    x = CLS_TF(pil_img).unsqueeze(0).to(DEVICE)
    feats = None
    grads = None

    def f_hook(_module, _inp, out):
        nonlocal feats
        feats = out

    def b_hook(_module, _gin, gout):
        nonlocal grads
        grads = gout[0]

    h1 = _LAST_CONV.register_forward_hook(f_hook)
    h2 = _LAST_CONV.register_full_backward_hook(b_hook)

    logits = CLS_MODEL(x)
    score = logits[0, int(class_idx)]
    score.backward()

    h1.remove()
    h2.remove()

    if feats is None or grads is None:
        return np.zeros((CLS_SIZE, CLS_SIZE), dtype=np.float32)

    w = grads.mean(dim=(2, 3), keepdim=True)  # (1,C,1,1)
    cam = (w * feats).sum(dim=1, keepdim=False)  # (1,H,W)
    cam = torch.relu(cam)[0].detach().cpu().numpy()

    cam = cam - cam.min()
    cam = cam / (cam.max() + 1e-6)
    cam = cv2.resize(cam.astype(np.float32), (CLS_SIZE, CLS_SIZE), interpolation=cv2.INTER_CUBIC)
    return cam.astype(np.float32)


# =========================
# Load VESSEL model (once) - auto-detect + auto-base
# =========================
def _looks_like_r2att(keys) -> bool:
    return any(k.startswith(("RRCNN", "Up", "Att", "Up_RRCNN", "out_conv")) for k in keys)


def _looks_like_smp(keys) -> bool:
    return any(k.startswith(("encoder.", "decoder.", "segmentation_head.")) for k in keys)


def _infer_r2att_base_from_state(sd: Dict[str, torch.Tensor]) -> int:
    """
    Infer base from deep channels:
      deep=512  -> base=32
      deep=1024 -> base=64
    """
    candidate_keys = [
        "RRCNN5.conv_1x1.weight",
        "RRCNN4.conv_1x1.weight",
        "RRCNN3.conv_1x1.weight",
    ]
    deep = None
    for k in candidate_keys:
        if k in sd and hasattr(sd[k], "shape"):
            deep = int(sd[k].shape[0])
            break

    if deep is None:
        for k, v in sd.items():
            if k.endswith("conv_1x1.weight") and k.startswith("RRCNN") and hasattr(v, "shape"):
                oc = int(v.shape[0])
                deep = oc if deep is None else max(deep, oc)

    if deep is None:
        return 32

    base = max(1, deep // 16)
    common = [16, 32, 64, 128]
    base = min(common, key=lambda x: abs(x - base))
    return base


def load_vessel_model():
    in_ch, classes = 3, 1
    try:
        with open(VESSEL_CFG, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f) or {}
        mcfg = (cfg.get("model") or {})
        in_ch = int(mcfg.get("in_channels", in_ch))
        classes = int(mcfg.get("classes", classes))
        encoder = mcfg.get("encoder", "resnet34")
    except Exception:
        encoder = "resnet34"

    v_obj = _load_ckpt_any(VESSEL_CKPT)
    v_sd = _strip_module_prefix(_extract_state_dict(v_obj))
    keys = list(v_sd.keys())

    if _looks_like_r2att(keys):
        base = _infer_r2att_base_from_state(v_sd)
        model = AttentionR2UNet(in_channels=in_ch, out_channels=classes, base=base, t=2)
        model.load_state_dict(v_sd, strict=True)
        return model.to(DEVICE).eval()

    if _looks_like_smp(keys):
        if smp is None:
            raise RuntimeError("Checkpoint là SMP Unet nhưng segmentation_models_pytorch chưa cài.")
        model = smp.Unet(
            encoder_name=encoder,
            encoder_weights=None,
            in_channels=in_ch,
            classes=classes,
            activation=None,
        )
        model.load_state_dict(v_sd, strict=True)
        return model.to(DEVICE).eval()

    raise RuntimeError("Không nhận dạng được kiến trúc vessel checkpoint (keys lạ).")


VESSEL_MODEL = load_vessel_model()


# =========================
# Main predict
# =========================
def predict_image(
    pil_img: Image.Image,
    filename: str = "image.png",
    vessel_thr: Optional[float] = None,
    analysis_id: Optional[str] = None,
) -> Dict[str, Any]:
    thr = float(vessel_thr) if vessel_thr is not None else VESSEL_THR

    pil_img = pil_img.convert("RGB")
    rgb0 = np.array(pil_img)  # H,W,3 RGB

    # ---------- classification ----------
    x_cls = CLS_TF(pil_img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        logits = CLS_MODEL(x_cls)
        prob = torch.softmax(logits, dim=1)[0].detach().cpu().numpy()

    pred_idx = int(np.argmax(prob))
    pred_label = CLASSES[pred_idx] if pred_idx < len(CLASSES) else str(pred_idx)
    pred_conf = float(prob[pred_idx])

    # ---------- heatmap ----------
    hm = gradcam_heatmap(pil_img, pred_idx)  # CLS_SIZE x CLS_SIZE
    hm_up = cv2.resize(hm, (rgb0.shape[1], rgb0.shape[0]), interpolation=cv2.INTER_CUBIC)
    heat_overlay, heat_rgb = _apply_heatmap(rgb0, hm_up, alpha=HEAT_ALPHA)

    # ---------- vessel segmentation ----------
    rgb_v = cv2.resize(rgb0, (VESSEL_SIZE, VESSEL_SIZE), interpolation=cv2.INTER_AREA)
    x_v = (rgb_v.astype(np.float32) / 255.0).transpose(2, 0, 1)  # CHW
    x_v = torch.from_numpy(x_v).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        v_logits = VESSEL_MODEL(x_v)
        if v_logits.dim() == 4:
            v_map = v_logits[0, 0]
        else:
            v_map = v_logits[0]
        v_prob = torch.sigmoid(v_map).detach().cpu().numpy()

    v_mask = (v_prob > thr).astype(np.uint8) * 255
    overlay = _overlay_vessels_green(rgb_v, v_mask, alpha=OVERLAY_ALPHA)

    # ---------- save debug outputs ----------
    base = os.path.splitext(os.path.basename(filename))[0]
    out_overlay = os.path.join(OUT_DIR, f"{base}_overlay.png")
    out_mask = os.path.join(OUT_DIR, f"{base}_vessel_mask.png")
    out_heat = os.path.join(OUT_DIR, f"{base}_heatmap.png")
    out_heat_overlay = os.path.join(OUT_DIR, f"{base}_heatmap_overlay.png")

    cv2.imwrite(out_overlay, cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    cv2.imwrite(out_mask, v_mask)
    cv2.imwrite(out_heat, cv2.cvtColor(heat_rgb, cv2.COLOR_RGB2BGR))
    cv2.imwrite(out_heat_overlay, cv2.cvtColor(heat_overlay, cv2.COLOR_RGB2BGR))

    # ---------- upload artifacts to MinIO ----------
    if not analysis_id:
        analysis_id = base  # fallback nếu backend không truyền

    prefix = f"{MINIO_PREFIX}/{analysis_id}"
    overlay_key = f"{prefix}/overlay.png"
    mask_key = f"{prefix}/mask.png"
    heatmap_key = f"{prefix}/heatmap.png"
    heatmap_overlay_key = f"{prefix}/heatmap_overlay.png"

    overlay_bytes = _png_bytes_from_rgb(overlay)
    mask_bytes = _png_bytes_from_gray(v_mask)
    heat_bytes = _png_bytes_from_rgb(heat_rgb)
    heat_overlay_bytes = _png_bytes_from_rgb(heat_overlay)

    overlay_size = _put_png(overlay_key, overlay_bytes)
    mask_size = _put_png(mask_key, mask_bytes)
    heatmap_size = _put_png(heatmap_key, heat_bytes)
    heatmap_overlay_size = _put_png(heatmap_overlay_key, heat_overlay_bytes)

    # ---------- return JSON (small) ----------
    return {
        "pred_label": pred_label,
        "pred_conf": pred_conf,
        "probs": {CLASSES[i]: float(prob[i]) for i in range(len(CLASSES))},
        "vessel_threshold": thr,
        "outputs": {
            "overlay_path": out_overlay,
            "mask_path": out_mask,
            "heatmap_path": out_heat,
            "heatmap_overlay_path": out_heat_overlay,
        },
        "artifacts": {
            "overlay_key": overlay_key,
            "mask_key": mask_key,
            "heatmap_key": heatmap_key,
            "heatmap_overlay_key": heatmap_overlay_key,
            "overlay_size": overlay_size,
            "mask_size": mask_size,
            "heatmap_size": heatmap_size,
            "heatmap_overlay_size": heatmap_overlay_size,
        },
    }

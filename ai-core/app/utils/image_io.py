import io
import numpy as np
import cv2
from PIL import Image


def bytes_to_rgb(image_bytes: bytes) -> np.ndarray:
    if not image_bytes:
        raise ValueError("Empty image bytes")
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(img, dtype=np.uint8)
    except Exception:
        pass
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Cannot decode image bytes")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return rgb


def rgb_to_bytes(rgb: np.ndarray, fmt: str = ".png") -> bytes:
    if rgb is None or rgb.size == 0:
        raise ValueError("Empty rgb array")
    if rgb.ndim != 3 or rgb.shape[2] != 3:
        raise ValueError("rgb must be HxWx3")

    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    ok, buf = cv2.imencode(fmt, bgr)
    if not ok:
        raise ValueError("Failed to encode image")
    return buf.tobytes()

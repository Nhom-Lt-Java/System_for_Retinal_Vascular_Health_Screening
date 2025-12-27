import cv2
import numpy as np

def simple_vessel_mask_stub(rgb: np.ndarray) -> np.ndarray:
    """
    Placeholder vessel extractor:
    - Uses green channel + CLAHE + Otsu thresholding.
    Replace with a trained segmentation model later.
    """
    g = rgb[:, :, 1]
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    g2 = clahe.apply(g)

    inv = 255 - g2
    blur = cv2.GaussianBlur(inv, (5, 5), 0)
    _, thr = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    mask = (thr > 0).astype(np.uint8)
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    return mask

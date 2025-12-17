import cv2
import numpy as np
from typing import Tuple, List

def quality_check(rgb: np.ndarray) -> Tuple[float, float, bool, List[str]]:
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())

    notes: List[str] = []
    passed = True

    if blur_score < 50.0:
        passed = False
        notes.append("Image seems blurry (low Laplacian variance).")
    if brightness < 30.0:
        passed = False
        notes.append("Image too dark.")
    if brightness > 220.0:
        passed = False
        notes.append("Image too bright/overexposed.")

    return blur_score, brightness, passed, notes

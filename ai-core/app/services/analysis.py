import os
import uuid
import cv2
import numpy as np

from app.schemas import AnalyzeResponse, Quality, Artifacts, Finding
from app.utils.image_io import bytes_to_rgb
from app.services.quality import quality_check
from app.services.vessel_stub import simple_vessel_mask_stub
from app.features.biomarkers import compute_biomarkers

AI_VERSION = "0.1.0"

def _save_png(path: str, rgb: np.ndarray) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    cv2.imwrite(path, bgr)

def analyze_image_bytes(image_bytes: bytes, filename: str, eye: str, patient_id: str) -> AnalyzeResponse:
    request_id = str(uuid.uuid4())
    rgb = bytes_to_rgb(image_bytes)

    blur_score, brightness, passed, notes = quality_check(rgb)

    if not passed:
        return AnalyzeResponse(
            request_id=request_id,
            risk_level="QUALITY_LOW",
            risk_score=0.0,
            findings=[Finding(name="QUALITY_LOW", confidence=1.0)],
            biomarkers={},
            quality=Quality(blur_score=blur_score, brightness=brightness, passed=False, notes=notes),
            artifacts=Artifacts(),
            ai_version=AI_VERSION,
            thresholds={"blur_min": 50.0, "brightness_min": 30.0, "brightness_max": 220.0},
        )

    # Vessel mask (stub for now)
    mask = simple_vessel_mask_stub(rgb)  # HxW {0,1}
    biomarkers = compute_biomarkers(mask)

    # Rule-based risk baseline (placeholder)
    density = biomarkers.get("vessel_density", 0.0)
    risk_score = float(np.clip((density - 0.03) / 0.05, 0.0, 1.0))
    risk_level = "LOW" if risk_score < 0.33 else ("MED" if risk_score < 0.66 else "HIGH")

    # Artifacts
    mask_vis = (mask * 255).astype(np.uint8)
    mask_rgb = np.stack([mask_vis] * 3, axis=-1)

    overlay = rgb.copy()
    overlay[mask.astype(bool)] = [0, 255, 0]
    annotated = (0.6 * rgb + 0.4 * overlay).astype(np.uint8)

    mask_path = f"artifacts/{request_id}_vessel_mask.png"
    annotated_path = f"artifacts/{request_id}_annotated.png"
    _save_png(mask_path, mask_rgb)
    _save_png(annotated_path, annotated)

    return AnalyzeResponse(
        request_id=request_id,
        risk_level=risk_level,
        risk_score=risk_score,
        findings=[Finding(name="VASCULAR_RISK_ESTIMATE", confidence=min(1.0, 0.5 + risk_score / 2))],
        biomarkers=biomarkers,
        quality=Quality(blur_score=blur_score, brightness=brightness, passed=True, notes=[]),
        artifacts=Artifacts(
            vessel_mask_url=f"/artifacts/{request_id}_vessel_mask.png",
            annotated_url=f"/artifacts/{request_id}_annotated.png",
        ),
        ai_version=AI_VERSION,
        thresholds={"density_low": 0.33, "density_med": 0.66},
    )

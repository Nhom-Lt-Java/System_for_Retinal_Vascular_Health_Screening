import os
import uuid
from typing import List, Dict

import cv2
import numpy as np
from PIL import Image

from app.utils.schemas import AnalyzeResponse
from app.services.predict import predict_image
from app.utils.image_io import bytes_to_rgb

AI_VERSION = "0.1.0"


def _save_png_rgb(path: str, rgb: np.ndarray) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    cv2.imwrite(path, bgr)


def _save_png_gray(path: str, gray_u8: np.ndarray) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cv2.imwrite(path, gray_u8)


def _advice_for(label: str, conf: float) -> List[str]:
    key = (label or "").upper()

    base = [
        "Kết quả AI chỉ mang tính hỗ trợ, không thay thế chẩn đoán của bác sĩ.",
        "Nếu có triệu chứng (mờ mắt, ruồi bay, đau nhức), nên khám chuyên khoa mắt sớm.",
    ]

    advice_map: Dict[str, List[str]] = {
        "NORMAL": [
            "Duy trì kiểm tra mắt định kỳ (6–12 tháng/lần).",
            "Kiểm soát huyết áp/đường huyết nếu có bệnh nền.",
        ],
        "DR": [
            "Gợi ý bệnh võng mạc đái tháo đường: ưu tiên khám chuyên khoa võng mạc.",
            "Kiểm soát đường huyết (HbA1c), huyết áp, mỡ máu.",
            "Nếu nhìn mờ/tối vùng trung tâm: đi khám sớm.",
        ],
        "AMD": [
            "Gợi ý thoái hoá hoàng điểm: nên khám chuyên khoa đáy mắt/hoàng điểm.",
            "Theo dõi thị lực trung tâm, biến dạng đường thẳng (Amsler grid).",
        ],
        "GLAUCOMA": [
            "Gợi ý glaucoma: nên đo nhãn áp, soi gai thị/đánh giá thị trường.",
            "Nếu đau nhức mắt, nhìn quầng sáng: đi khám cấp cứu.",
        ],
    }

    extra: List[str] = []
    for k in advice_map:
        if k in key:
            extra = advice_map[k]
            break
    if not extra:
        extra = ["Nên khám chuyên khoa mắt để xác nhận kết quả."]

    if conf < 0.6:
        extra = ["Độ tin cậy AI chưa cao, nên coi đây là gợi ý ban đầu."] + extra

    return base + extra


def analyze_image_bytes(image_bytes: bytes, filename: str, eye: str, patient_id: str, vessel_thr: float | None = None) -> AnalyzeResponse:
    request_id = str(uuid.uuid4())

    rgb = bytes_to_rgb(image_bytes)
    pil = Image.fromarray(rgb)

    if vessel_thr is None:
        vessel_thr = float(os.getenv("VESSEL_THR", "0.78"))

    out = predict_image(pil, filename=filename, vessel_thr=vessel_thr)

    label = out["pred_label"]
    conf = float(out["pred_conf"])
    probs = out["probs"]

    vessel_mask_u8 = out["vessel_mask_u8"]
    vessel_overlay_rgb = out["vessel_overlay_rgb"]
    heat_overlay_rgb = out["heat_overlay_rgb"]

    # save artifacts
    mask_path = f"artifacts/{request_id}_vessel_mask.png"
    overlay_path = f"artifacts/{request_id}_overlay.png"
    heat_path = f"artifacts/{request_id}_heat.png"

    _save_png_gray(mask_path, vessel_mask_u8)
    _save_png_rgb(overlay_path, vessel_overlay_rgb)
    _save_png_rgb(heat_path, heat_overlay_rgb)

    advice = _advice_for(label, conf)

    return AnalyzeResponse(
        request_id=request_id,
        filename=filename,
        eye=eye,
        patient_id=patient_id,

        prediction_label=label,
        prediction_score=conf,
        probs=probs,
        advice=advice,

        segmentation_url=f"/artifacts/{request_id}_vessel_mask.png",
        overlay_url=f"/artifacts/{request_id}_overlay.png",
        heatmap_url=f"/artifacts/{request_id}_heat.png",

        ai_version=AI_VERSION,
        thresholds={"vessel_thr": vessel_thr},
    )

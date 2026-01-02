from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class AnalyzeResponse(BaseModel):
    request_id: str
    filename: str
    eye: str = "UNKNOWN"
    patient_id: str = "UNKNOWN"

    prediction_label: str
    prediction_score: float = Field(ge=0.0, le=1.0)
    probs: Dict[str, float] = Field(default_factory=dict)

    advice: List[str] = Field(default_factory=list)

    segmentation_url: Optional[str] = None
    overlay_url: Optional[str] = None
    heatmap_url: Optional[str] = None

    ai_version: str = "0.1.0"
    thresholds: Dict[str, float] = Field(default_factory=dict)


class AiArtifactsKeys(BaseModel):
    overlay_key: str
    mask_key: str
    heatmap_key: str
    heatmap_overlay_key: str
    overlay_size: int
    mask_size: int
    heatmap_size: int
    heatmap_overlay_size: int

class AiPredictResponse(BaseModel):
    pred_label: str
    pred_conf: float
    probs: Dict[str, float]
    vessel_threshold: float
    artifacts: AiArtifactsKeys
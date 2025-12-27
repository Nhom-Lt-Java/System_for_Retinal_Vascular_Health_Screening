from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

RiskLevel = Literal["LOW", "MED", "HIGH", "QUALITY_LOW"]

class Finding(BaseModel):
    name: str
    confidence: float = Field(ge=0.0, le=1.0)

class Artifacts(BaseModel):
    vessel_mask_url: Optional[str] = None
    annotated_url: Optional[str] = None

class Quality(BaseModel):
    blur_score: float
    brightness: float
    passed: bool
    notes: List[str] = []

class AnalyzeResponse(BaseModel):
    request_id: str
    risk_level: RiskLevel
    risk_score: float = Field(ge=0.0, le=1.0)
    findings: List[Finding] = []
    biomarkers: Dict[str, float] = {}
    quality: Quality
    artifacts: Artifacts
    ai_version: str
    thresholds: Dict[str, Any] = {}

from fastapi import APIRouter, UploadFile, File

router = APIRouter(tags=["Analysis"])

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    return {
        "risk_scores": {"hypertension": 0.8, "stroke": 0.4, "diabetes": 0.2},
        "overall_risk": "HIGH",
        "heatmap_url": "https://dummy/heatmap.jpg",
        "vessel_map_url": "https://dummy/vessel.jpg",
        "ai_version": "dummy-1.0.0"
    }

from fastapi import APIRouter, UploadFile, File, Form
from app.schemas import AnalyzeResponse
from app.services.analysis import analyze_image_bytes

router = APIRouter()

@router.get("/health")
def health():
    return {"ok": True}

@router.get("/version")
def version():
    return {"ai_version": "0.1.0"}

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    eye: str = Form(default="UNKNOWN"),
    patient_id: str = Form(default="UNKNOWN"),
):
    content = await file.read()
    return analyze_image_bytes(content, filename=file.filename, eye=eye, patient_id=patient_id)

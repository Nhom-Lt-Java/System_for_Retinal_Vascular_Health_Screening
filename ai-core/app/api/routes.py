from fastapi import APIRouter, UploadFile, File, Form
from app.utils.schemas import AnalyzeResponse, AiPredictResponse
from app.services.analysis import analyze_image_bytes
from app.utils.image_io import bytes_to_rgb
from app.services.predict import predict_image
from PIL import Image

router = APIRouter()

@router.get("/health")
def health():
    return {"ok": True}

@router.get("/version")
def version():
    return {"ai_version": "0.1.0"}

# ✅ Endpoint backend gọi (base64)
@router.post("/api/predict", response_model=AiPredictResponse)
async def predict(
    file: UploadFile = File(...),
    vessel_thr: float = Form(default=0.78),
):
    content = await file.read()
    rgb = bytes_to_rgb(content)
    pil = Image.fromarray(rgb)
    return predict_image(pil, filename=file.filename or "upload.png", vessel_thr=vessel_thr)

# (Tuỳ chọn) Giữ endpoint trả URL artifacts để debug
# @router.post("/api/analyze", response_model=AnalyzeResponse)
# async def analyze(
#     file: UploadFile = File(...),
#     eye: str = Form(default="UNKNOWN"),
#     patient_id: str = Form(default="UNKNOWN"),
#     vessel_thr: float = Form(default=0.78),
# ):
#     content = await file.read()
#     return analyze_image_bytes(
#         content,
#         filename=file.filename or "upload.jpg",
#         eye=eye,
#         patient_id=patient_id,
#         vessel_thr=vessel_thr,
#     )

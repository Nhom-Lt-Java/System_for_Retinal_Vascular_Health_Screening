from fastapi import APIRouter, UploadFile, File, Form
from PIL import Image
from app.utils.image_io import bytes_to_rgb
from app.services.predict import predict_image
from app.utils.schemas import AiPredictResponse

router = APIRouter()

@router.get("/health")
def health():
    return {"ok": True}

@router.get("/version")
def version():
    return {"ai_version": "0.1.0"}

@router.post("/api/predict", response_model=AiPredictResponse)
async def predict(
    file: UploadFile = File(...),
    vessel_thr: float = Form(default=0.78),
    analysis_id: str = Form(default=""),   # backend gửi qua
):
    content = await file.read()
    rgb = bytes_to_rgb(content)
    pil = Image.fromarray(rgb)
    return predict_image(pil, filename=file.filename or "upload.jpg", vessel_thr=vessel_thr, analysis_id=analysis_id)

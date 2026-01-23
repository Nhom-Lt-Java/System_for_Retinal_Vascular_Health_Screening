from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from PIL import Image
from app.utils.image_io import bytes_to_rgb
from app.services.predict import predict_image, models_status, ensure_models_loaded
from app.utils.schemas import AiPredictResponse

router = APIRouter()

@router.get("/health")
def health(load: bool = Query(default=False, description="Try to load models now")):
    if load:
        ensure_models_loaded(load_vessel=True)
    return {"ok": True, "models": models_status()}

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
    try:
        return predict_image(pil, filename=file.filename or "upload.jpg", vessel_thr=vessel_thr, analysis_id=analysis_id)
    except RuntimeError as e:
        # 503 => backend worker can retry
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

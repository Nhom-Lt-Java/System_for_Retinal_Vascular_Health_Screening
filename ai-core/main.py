from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.routes import router

app = FastAPI(title="AURA AI Core", version="0.1.0")
app.mount("/artifacts", StaticFiles(directory="artifacts"), name="artifacts")
app.include_router(router)

from fastapi import FastAPI
from api.router_analysis import router as analysis_router

app = FastAPI(title="AURA AI Core")

app.include_router(analysis_router, prefix="/api")

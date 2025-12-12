from fastapi import FastAPI

app = FastAPI(title="AURA AI Core")

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-core"}

@app.post("/analyze")
def analyze():
    # mock tạm để backend gọi test flow upload -> analyze -> result
    return {
        "risk_level": "low",
        "scores": {"diabetic": 0.12, "hypertension": 0.18, "stroke": 0.05},
        "message": "Mock response (no model yet)"
    }

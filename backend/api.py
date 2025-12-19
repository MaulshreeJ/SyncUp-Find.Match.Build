# api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from graph_with_gemini import run_syncup_pipeline

app = FastAPI(title="SyncUp Agentic API (Gemini)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-profile")
async def analyze_profile(user_profile: dict):
    result = run_syncup_pipeline(user_profile)
    return {"status": "success", "data": result}

@app.get("/")
async def root():
    return {"message": "SyncUp Agentic AI API (Gemini) is live!"}

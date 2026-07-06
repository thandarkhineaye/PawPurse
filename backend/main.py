import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import traceback

from .triage_engine import TriageEngine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PawPurse Triage API")

# Enable CORS for cross-origin frontend hosting (e.g., GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the engine (it will pull GEMINI_API_KEY from env, or we can mock it in tests)
engine = TriageEngine()


class TriageRequest(BaseModel):
    symptoms: str
    language: str | None = None

class TriageResponse(BaseModel):
    urgency: str
    action_directive: str
    key_instructions: list[str]

@app.post("/api/triage", response_model=TriageResponse)
def api_triage(request: TriageRequest):
    symptoms = request.symptoms.strip()
    if not symptoms:
        raise HTTPException(status_code=400, detail="Symptoms cannot be empty.")
        
    try:
        # Call the triage engine
        result = engine.classify_symptoms(symptoms, request.language)
        return TriageResponse(**result)
    except Exception as e:
        # In case of API failure or timeout, return a safe fallback with 503 status
        # but we also need to log it securely in real app.
        traceback.print_exc()
        raise HTTPException(
            status_code=503, 
            detail="Triage service unavailable. If this is a life-threatening emergency, please visit a clinic immediately."
        )

# Serve the static files from the repository root
static_dir = os.path.dirname(os.path.dirname(__file__))

@app.get("/style.css")
def serve_css():
    return FileResponse(os.path.join(static_dir, "style.css"))

@app.get("/script.js")
def serve_js():
    return FileResponse(os.path.join(static_dir, "script.js"))

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(static_dir, "index.html"))

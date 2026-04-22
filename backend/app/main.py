from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import detection, recipes
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Initialize FastAPI App
app = FastAPI(
    title="CookLens API",
    description="Backend for cinematic AI-powered cooking vision.",
    version="0.1.0"
)

# --- MIDDLEWARE ---
# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Expand this to specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTERS ---
# Include modular endpoint routers
app.include_router(detection.router, tags=["Vision"])
app.include_router(recipes.router, tags=["Recipes"])

# --- ROOT ENDPOINT ---
@app.get("/")
def read_root():
    """
    Root endpoint for health check.
    """
    return {
        "status": "online",
        "message": "Welcome to the CookLens API. Cinematic vision system initialized."
    }

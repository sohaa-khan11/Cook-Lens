from pydantic import BaseModel, Field
from typing import List, Optional

# --- Detection Models ---

class DetectionResponse(BaseModel):
    """
    Response schema for the /detect endpoint.
    Returns structured ingredient data with confidence awareness.
    """
    ingredients: List[str] = Field(..., example=["tomato", "potato"])
    low_confidence: List[str] = Field(default=[], example=["onion"])
    raw_detections: List[str] = Field(default=[], example=["tomato", "potato", "onion", "sports ball"])
    needs_confirmation: bool = Field(default=False)

# --- Recipe Models ---

class RecipeRequest(BaseModel):
    """
    Request schema for the /recipes endpoint.
    Expects a list of ingredients to match recipes against.
    """
    ingredients: List[str] = Field(..., example=["tomato", "onion", "potato"])

class Recipe(BaseModel):
    """
    Individual recipe object structure with Phase 5 Smart Metadata.
    """
    recipe_name: str
    used_ingredients: List[str]
    missing_ingredients: List[str]
    substitutions: Optional[List[str]] = []
    steps: List[str]
    match_score: Optional[float] = 0.0
    reason: Optional[str] = ""
    time_minutes: Optional[int] = None
    notes: Optional[str] = ""

class RecipeResponse(BaseModel):
    """
    Response schema for the /recipes endpoint.
    Returns a list of matched recipe objects with metadata.
    """
    recipes: List[Recipe]
    confidence_source: str = Field(default="user_confirmed")
    message: Optional[str] = ""
    mode: Optional[str] = "fallback_retrieval"

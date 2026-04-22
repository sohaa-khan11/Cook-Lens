from pydantic import BaseModel, Field
from typing import List

# --- Detection Models ---

class DetectionResponse(BaseModel):
    """
    Response schema for the /detect endpoint.
    Returns a list of identified ingredients.
    """
    ingredients: List[str] = Field(..., example=["tomato", "onion", "potato"])

# --- Recipe Models ---

class RecipeRequest(BaseModel):
    """
    Request schema for the /recipes endpoint.
    Expects a list of ingredients to match recipes against.
    """
    ingredients: List[str] = Field(..., example=["tomato", "onion", "potato"])

class Recipe(BaseModel):
    """
    Individual recipe object structure.
    """
    recipe_name: str
    used_ingredients: List[str]
    missing_ingredients: List[str]
    substitutions: List[str]
    steps: List[str]

class RecipeResponse(BaseModel):
    """
    Response schema for the /recipes endpoint.
    Returns a list of matched recipe objects.
    """
    recipes: List[Recipe]

from fastapi import APIRouter
from app.models.schemas import RecipeRequest, RecipeResponse
from app.services.gemini_service import generate_recipes

router = APIRouter()

@router.post("/recipes", response_model=RecipeResponse)
async def list_recipes(request: RecipeRequest):
    """
    POST /recipes
    Input: List of ingredients (JSON)
    Output: List of recipe objects (AI-synthesized via Gemini Flash)
    """
    recipes_data = await generate_recipes(request.ingredients)
    
    return {"recipes": recipes_data}

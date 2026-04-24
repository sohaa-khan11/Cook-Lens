from fastapi import APIRouter, HTTPException
from app.models.schemas import RecipeRequest, RecipeResponse
from app.services.recipe_retrieval_service import retrieve_recipes

router = APIRouter()

@router.post("/recipes/search", response_model=RecipeResponse)
async def search_recipes(request: RecipeRequest):
    """
    POST /recipes/search
    Input: List of ingredients (JSON)
    Output: List of recipe objects (Confirmed Source of Truth)
    """
    # Task 4 & 5: Clean and Validate Ingredients
    confirmed_ingredients = [i.lower().strip() for i in request.ingredients if i.strip()]
    
    if not confirmed_ingredients:
        raise HTTPException(status_code=400, detail="Ingredient list cannot be empty.")

    # Use ONLY confirmed ingredients for retrieval
    recipes_data = await retrieve_recipes(confirmed_ingredients)
    
    return {
        "recipes": recipes_data,
        "confidence_source": "user_confirmed"
    }

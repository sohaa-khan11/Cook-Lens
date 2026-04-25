from fastapi import APIRouter, HTTPException
from app.models.schemas import RecipeRequest, RecipeResponse
from app.services.recipe_retrieval_service import retrieve_recipes, is_retrieval_strong, normalize_ingredient
from app.services.llm_service import generate_recipe
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
@router.post("/recipes/search", response_model=RecipeResponse)
async def search_recipes(request: RecipeRequest):
    """
    Stabilized Hybrid Pipeline (Phase 6):
    1. Input Normalization
    2. Candidate Retrieval
    3. Hybrid Decision (Retrieval vs Generation)
    4. LLM Execution with Text-based Recovery
    5. Final Serialization
    """
    # 1. Normalization (Task 3)
    raw_ingredients = [i.lower().strip() for i in request.ingredients if i.strip()]
    confirmed_ingredients = [normalize_ingredient(i) for i in raw_ingredients]
    
    logger.info(f"[PIPELINE] START | Inputs: {raw_ingredients} -> Normalized: {confirmed_ingredients}")
    
    if not confirmed_ingredients:
        raise HTTPException(status_code=400, detail="Ingredient list cannot be empty.")

    # 2. Retrieve Candidate Shortlist
    shortlist = await retrieve_recipes(confirmed_ingredients)
    logger.info(f"[PIPELINE] RETRIEVAL | Found {len(shortlist)} candidates")
    
    # 3. Decision Layer (Task 4)
    is_strong = await is_retrieval_strong(confirmed_ingredients, shortlist)
    pipeline_mode = "retrieval" if is_strong else "generation"
    logger.info(f"[PIPELINE] DECISION | Mode: {pipeline_mode}")

    # 4. LLM Call Stage (Task 5)
    llm_input_shortlist = shortlist[:3] if is_strong else []
    
    import re
    def is_match(u, ing_norm):
        # Match only on whole words or if one is exactly inside the other as a significant part
        pattern = rf"\b{re.escape(u)}\b"
        return bool(re.search(pattern, ing_norm))

    import asyncio
    import time
    
    start_pipeline = time.time()
    final_recipes = []
    seen_names = set()
    user_set = set(confirmed_ingredients)
    
    # Task 2 & 3: Expanded Style Diversity (3 Styles)
    styles = ["Dry Sauté", "Classic Gravy", "Fusion Snack"]
    
    for i, style in enumerate(styles):
        # Task 1: Relaxed Latency Guard (Allowing 60s for CPU stability)
        elapsed = time.time() - start_pipeline
        if elapsed > 60 and len(final_recipes) >= 1:
            logger.warning(f"[PIPELINE] Latency Budget Exceeded ({elapsed:.2f}s). Stopping at {len(final_recipes)} recipes.")
            break
            
        refined, burst_mode = await asyncio.to_thread(
            generate_recipe, 
            confirmed_ingredients, 
            llm_input_shortlist, 
            mode=pipeline_mode,
            style_hint=style
        )
        
        if refined:
            name = refined.get("title", f"AI {style}")
            
            # Task 4: Safe Deduplication
            if name.lower() in seen_names:
                logger.info(f"[PIPELINE] Skipping duplicate recipe name: {name}")
                continue
            seen_names.add(name.lower())

            recipe_ings = refined.get("ingredients", [])
            used, missing = [], []
            for ing in recipe_ings:
                ing_norm = normalize_ingredient(ing)
                if any(is_match(u, ing_norm) for u in user_set):
                    used.append(ing)
                else:
                    missing.append(ing)

            final_recipes.append({
                "recipe_name": name,
                "used_ingredients": used if used else confirmed_ingredients,
                "missing_ingredients": missing,
                "substitutions": [],
                "steps": refined.get("steps", []),
                "match_score": 1.0 - (len(final_recipes) * 0.05),
                "reason": f"AI Burst ({style})",
                "time_minutes": 20 + (i * 5),
                "notes": f"Generation Style: {style}."
            })

    # Task 6: Fill only if absolutely empty or retrieval mode
    if not final_recipes:
        if pipeline_mode == "retrieval":
            for top_fallback in shortlist[:2]:
                final_recipes.append({
                    "recipe_name": top_fallback["recipe_name"],
                    "used_ingredients": top_fallback["used_ingredients"],
                    "missing_ingredients": top_fallback["missing_ingredients"],
                    "substitutions": [],
                    "steps": top_fallback["steps"],
                    "match_score": 0.7,
                    "reason": "Dataset Match",
                    "time_minutes": 20,
                    "notes": "Verified archive data."
                })
        else:
            # Task 6: Generation Recovery (No retrieval leak)
            final_recipes.append({
                "recipe_name": "Home-Style Dish",
                "used_ingredients": confirmed_ingredients,
                "missing_ingredients": [],
                "substitutions": [],
                "steps": ["Sauté your ingredients in oil.", "Season and serve warm."],
                "match_score": 0.5,
                "reason": "AI Recovery",
                "time_minutes": 15,
                "notes": "Emergency fallback."
            })

    # Task 7: Detailed Aggregation Logging
    final_mode_string = f"{pipeline_mode}_multi_burst"
    logger.info(f"[PIPELINE] AGGREGATION | Generated: {len(styles)} | Collected: {len(final_recipes)} | Mode: {final_mode_string}")
    
    response_data = {
        "recipes": final_recipes,
        "confidence_source": "user_confirmed",
        "mode": final_mode_string
    }

    if final_recipes:
        logger.info(f"[PIPELINE] OUTBOUND | Primary: {final_recipes[0]['recipe_name']} | Count: {len(final_recipes)}")
    
    return response_data

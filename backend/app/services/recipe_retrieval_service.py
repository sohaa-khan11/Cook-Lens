import json
import logging
from pathlib import Path
from typing import List, Dict

logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CLEAN_DATA_FILE = BASE_DIR / "data" / "processed" / "recipes_clean.json"

# Descriptors to remove (Sync with cleaning script)
DESCRIPTORS = ["chopped", "sliced", "fresh", "large", "small", "diced", "minced", "grated", "peeled"]

def normalize_ingredient(ing: str) -> str:
    """
    Normalizes a single ingredient string.
    """
    ing = ing.lower().strip()
    for desc in DESCRIPTORS:
        ing = ing.replace(f"{desc} ", "").replace(f" {desc}", "").strip()
    
    # Basic plural handling
    if ing == "onions": ing = "onion"
    elif ing == "tomatoes": ing = "tomato"
    elif ing == "eggs": ing = "egg"
    elif ing.endswith("s") and len(ing) > 3:
        if not ing.endswith("ss"):
            ing = ing[:-1]
    return ing

def load_clean_recipes() -> List[Dict]:
    """Loads the processed recipes from JSON."""
    if not CLEAN_DATA_FILE.exists():
        logger.error(f"Clean data file not found at {CLEAN_DATA_FILE}")
        return []
    
    with open(CLEAN_DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

async def retrieve_recipes(user_ingredients: List[str]) -> List[Dict]:
    """
    Retrieval Logic (Phase 3):
    1. Normalize user ingredients
    2. Intersection-based scoring
    3. Sort and limit
    """
    recipes = load_clean_recipes()
    if not recipes:
        return []

    # 1. Normalize user ingredients
    normalized_user = set(normalize_ingredient(ing) for ing in user_ingredients if ing.strip())
    
    results = []
    
    for recipe in recipes:
        recipe_ings = set(recipe["ingredients"])
        
        # 2. Intersection-based scoring
        matched = normalized_user.intersection(recipe_ings)
        score = len(matched)
        
        if score > 0:
            results.append({
                "recipe_name": recipe["title"],
                "used_ingredients": list(matched),
                "missing_ingredients": list(recipe_ings.difference(normalized_user)),
                "steps": recipe["steps"],
                "match_score": score
            })

    # 3. Sort Results (descending)
    results.sort(key=lambda x: x["match_score"], reverse=True)

    # 4. Handle No Match
    if not results:
        logger.info("No direct matches found. Returning fallback recipes.")
        # Return first 5 recipes as "partial matches" (or just fallback)
        # to ensure we DO NOT return an empty list.
        for recipe in recipes[:5]:
            results.append({
                "recipe_name": recipe["title"],
                "used_ingredients": [],
                "missing_ingredients": recipe["ingredients"],
                "steps": recipe["steps"],
                "match_score": 0
            })

    # 5. Return top 5 results
    top_results = results[:5]
    
    return top_results

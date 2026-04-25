import json
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CLEAN_DATA_FILE = BASE_DIR / "data" / "processed" / "recipes_clean.json"

# Descriptors to remove
DESCRIPTORS = ["chopped", "sliced", "fresh", "large", "small", "diced", "minced", "grated", "peeled"]

def normalize_ingredient(ing: str) -> str:
    """Normalizes a single ingredient string."""
    ing = ing.lower().strip()
    for desc in DESCRIPTORS:
        ing = ing.replace(f"{desc} ", "").replace(f" {desc}", "").strip()
    
    if ing == "onions": ing = "onion"
    elif ing == "tomatoes": ing = "tomato"
    elif ing == "eggs": ing = "egg"
    elif ing.endswith("s") and len(ing) > 3:
        if not ing.endswith("ss"):
            ing = ing[:-1]
    return ing

def clean_recipe_title(title: str, matched_ingredients: List[str] = None) -> str:
    """Standardizes messy dataset titles for UI display."""
    title = title.lower().strip()
    
    # Task 3: Noise patterns
    NOISE = [
        "i cant believe it", "i cant believe", "how i got my family to eat", 
        "how i got my family to", "a bit different", "better than", 
        "the best ever", "a different kind of", "a different", 
        "the best", "my favorite", "quick and easy", "super easy",
        "i yam what i yam", "beat this"
    ]
    
    for pattern in NOISE:
        title = title.replace(pattern, "").strip()
    
    # Task 2: Remove extra spaces
    title = " ".join(title.split())
    
    # Task 4 & 5: Simplification and Fallback
    if not title or len(title) < 3:
        if matched_ingredients:
            title = " ".join([ing.title() for ing in matched_ingredients[:2]]) + " Dish"
        else:
            title = "Savory Recipe"
    elif title.lower() in ["spinach", "egg", "onion"]: # Single word titles
        title = title.title() + " Dish"
    else:
        # Deduplicate repeated words (e.g., "spinach spinach casserole")
        words = title.split()
        unique_words = []
        for w in words:
            if not unique_words or w != unique_words[-1]:
                unique_words.append(w)
        title = " ".join(unique_words).title()
        
    return title

def load_clean_recipes() -> List[Dict]:
    """Loads the processed recipes from JSON."""
    if not CLEAN_DATA_FILE.exists():
        logger.error(f"Clean data file not found at {CLEAN_DATA_FILE}")
        return []
    with open(CLEAN_DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def infer_context(ingredients: set) -> str:
    """Infers if the input is Savory or Sweet."""
    SAVORY_MARKERS = {"onion", "garlic", "salt", "oil", "tomato", "chili", "pepper", "chicken", "meat", "potato"}
    SWEET_MARKERS = {"sugar", "honey", "chocolate", "vanilla", "berry", "fruit", "cinnamon", "syrup"}
    
    savory_count = len(ingredients.intersection(SAVORY_MARKERS))
    sweet_count = len(ingredients.intersection(SWEET_MARKERS))
    
    if sweet_count > savory_count: return "sweet"
    return "savory"

async def is_retrieval_strong(user_ingredients: List[str], shortlist: List[Dict[str, Any]]) -> bool:
    """
    Evaluates if the retrieval results are high-quality enough to be used as a base (Task 1 & 3).
    """
    if not shortlist:
        return False

    # Normalize all inputs for consistent checks (Task 3)
    normalized_user = [normalize_ingredient(i) for i in user_ingredients]
    
    # 1. Identify Core Ingredients (Task 5)
    CORE_IDENTIFIERS = ["egg", "chicken", "paneer", "dal", "potato", "fish", "meat", "rice"]
    core_present = []
    for ing in normalized_user:
        if any(core in ing for core in CORE_IDENTIFIERS):
            core_present.append(ing)
    
    # 2. Forbidden Categories (Task 1)
    FORBIDDEN = ["toast", "batter", "waffle", "pancake", "sweet", "dessert", "cake", "bread"]

    top_match = shortlist[0]
    title_lower = top_match["raw_title"].lower()

    # REJECT if top match is a forbidden category for savory input (Task 4)
    SAVORY_MARKERS = ["onion", "tomato", "garlic", "chili", "ginger", "salt", "oil"]
    is_savory_input = any(i in SAVORY_MARKERS for i in normalized_user)
    
    if is_savory_input and any(f in title_lower for f in FORBIDDEN):
        logger.info(f"[QUALITY] Weak: Savory input but top match '{top_match['raw_title']}' is in forbidden categories.")
        return False

    # REJECT if core protein/base is missing from top match
    if core_present:
        main_core = core_present[0]
        if main_core not in title_lower and not any(main_core in normalize_ingredient(i) for i in top_match["used_ingredients"]):
            logger.info(f"[QUALITY] Weak: Core ingredient '{main_core}' missing from top match.")
            return False

    # REJECT if overlap is too low
    if top_match["match_score"] < 0.3:
        logger.info(f"[QUALITY] Weak: Match score too low ({top_match['match_score']})")
        return False

    logger.info(f"[QUALITY] Strong: Top match '{top_match['raw_title']}' passed quality checks.")
    return True

async def retrieve_recipes(user_ingredients: List[str]) -> List[Dict]:
    """
    Robust Pipeline (Phase 6):
    1. Context Inference (Savory vs Sweet)
    2. Pre-Filtering (Category Exclusion)
    3. Weighted Scoring (Core vs Weak matches)
    4. Shortlist Generation (Top 3)
    """
    recipes = load_clean_recipes()
    if not recipes: return []

    normalized_user = set(normalize_ingredient(ing) for ing in user_ingredients if ing.strip())
    input_context = infer_context(normalized_user)
    
    # Task 1 & 3: Define category exclusion patterns
    DESSERT_KW = {"cake", "pudding", "cookie", "pie", "muffin", "sweet", "jam", "jelly", "brownie", "mousse"}
    BAKING_KW = {"bread", "dough", "roll", "bun", "loaf"}
    
    results = []
    logs = {"total": len(recipes), "pre_filtered": 0, "mismatched_context": 0}

    for recipe in recipes:
        recipe_ings = set(recipe["ingredients"])
        recipe_title_lower = recipe["title"].lower()
        
        # --- Stage 1: Pre-Filtering (Task 1) ---
        # If we have savory markers, reject anything that looks like a dessert/baking
        if input_context == "savory":
            if any(kw in recipe_title_lower for kw in DESSERT_KW.union(BAKING_KW)):
                logs["pre_filtered"] += 1
                continue
        
        # --- Stage 2: Weighted Scoring (Task 2) ---
        matched = normalized_user.intersection(recipe_ings)
        matched_count = len(matched)
        
        # Strict Match Rule (Task 1)
        min_match = 2 if len(normalized_user) >= 2 else 1
        if matched_count < min_match:
            continue

        # Weighted Calculation
        # Core matches (protein, base veggies) get 0.2 boost
        CORE = {"egg", "chicken", "meat", "onion", "tomato", "potato", "dal", "paneer"}
        score = matched_count / len(recipe_ings) # Base ratio
        
        boost = 0.0
        for ing in matched:
            if ing in CORE: boost += 0.15
        
        # Penalize missing ingredients (Task 2)
        missing_count = len(recipe_ings) - matched_count
        penalty = missing_count * 0.05
        
        final_score = (score + boost) - penalty
        
        # --- Stage 3: Shortlist Candidate ---
        results.append({
            "id": recipe.get("id", ""), # Assuming ID exists or we use index
            "recipe_name": clean_recipe_title(recipe["title"], list(matched)),
            "raw_title": recipe["title"],
            "used_ingredients": list(matched),
            "missing_ingredients": list(recipe_ings.difference(normalized_user)),
            "steps": recipe["steps"],
            "match_score": round(final_score, 3)
        })

    # Sort and Build Shortlist (Task 4)
    results.sort(key=lambda x: x["match_score"], reverse=True)
    shortlist = results[:5] # Return 5 for internal use, LLM gets top 3
    
    logger.info(f"Pipeline Logs: {logs}")
    if shortlist:
        logger.info(f"Shortlist Candidates: {[r['recipe_name'] for r in shortlist[:3]]}")
    
    return shortlist

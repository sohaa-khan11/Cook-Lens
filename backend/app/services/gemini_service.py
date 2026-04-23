import json
import google.generativeai as genai
from typing import List, Dict
import os
import logging

# Configure minimal, safe logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini with API Key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY not set in environment.")
    raise ValueError("GEMINI_API_KEY is not set in the environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

# Use Gemini 1.5 Flash for speed and stability
model = genai.GenerativeModel('gemini-1.5-flash')

def normalize_recipe_data(recipes: List[Dict]) -> List[Dict]:
    """
    Normalizes recipe output: lowercases ingredients, removes duplicates, and strips whitespace.
    """
    for recipe in recipes:
        # Normalize simple string fields
        recipe["recipe_name"] = recipe.get("recipe_name", "Unknown Recipe").strip()
        
        # Normalize and deduplicate ingredient lists
        for field in ["used_ingredients", "missing_ingredients", "substitutions"]:
            if field in recipe and isinstance(recipe[field], list):
                original_list = recipe[field]
                # Lowercase, strip, and deduplicate
                cleaned = sorted(list(set(str(item).strip().lower() for item in original_list)))
                recipe[field] = cleaned
        
        # Normalize steps
        if "steps" in recipe and isinstance(recipe["steps"], list):
            recipe["steps"] = [str(step).strip() for step in recipe["steps"] if str(step).strip()]
            
    return recipes

def validate_recipe_structure(data: Dict) -> bool:
    """
    Strictly validates that the AI response matches the expected internal schema.
    """
    if not isinstance(data, dict) or "recipes" not in data or not isinstance(data["recipes"], list):
        return False
        
    required_fields = ["recipe_name", "used_ingredients", "missing_ingredients", "substitutions", "steps"]
    
    for recipe in data["recipes"]:
        if not all(field in recipe for field in required_fields):
            logger.warning(f"Validation Failed: Recipe missing required fields.")
            return False
        # Optional: check if steps is empty
        if not recipe["steps"]:
            return False
            
    return True

async def generate_recipes(ingredients: List[str]) -> List[Dict]:
    """
    Calls Gemini Flash with strict validation, normalization, and quality control filtering.
    """
    # 1. Input Normalization
    if not ingredients:
        logger.info("Empty ingredients list provided.")
        return []
    
    # Task 2: Convert to lowercase, remove duplicates, and strip whitespace
    ingredients = list(set([i.strip().lower() for i in ingredients if i.strip()]))
    
    if not ingredients:
        return []

    ingredients_str = ", ".join(ingredients)
    
    # Task 1: Improved Expert Indian Chef prompt
    prompt = f"""
    You are an expert Indian home chef.

    Given these ingredients:
    {ingredients_str}

    Your task is to suggest 2–3 realistic Indian recipes.

    Rules:
    - Use as many of the given ingredients as possible
    - Recipes must be feasible using mostly these ingredients
    - Missing ingredients should be minimal (maximum 1–3)
    - Prefer recipes that can actually be cooked with what is available
    - DO NOT suggest unrelated or completely different dishes

    For each recipe include:
    - recipe_name
    - used_ingredients (only from provided list)
    - missing_ingredients (keep minimal)
    - substitutions (practical Indian kitchen alternatives)
    - steps (4–6 simple steps)

    STRICT:
    Return ONLY valid JSON in this exact format:
    {{
      "recipes": [
        {{
          "recipe_name": "...",
          "used_ingredients": [],
          "missing_ingredients": [],
          "substitutions": [],
          "steps": []
        }}
      ]
    }}
    """

    try:
        # 3. Call AI with JSON constraint
        response = await model.generate_content_async(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        if not response or not response.text:
            logger.warning("Gemini returned an empty response.")
            return []

        # 4. Parsing and Validation (Task 3)
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError as je:
            logger.error(f"Malformed JSON from Gemini: {je}")
            return []

        if not validate_recipe_structure(data):
            logger.warning("Gemini response failed schema validation.")
            return []

        # 5. Output Normalization
        cleaned_recipes = normalize_recipe_data(data["recipes"])
        
        # 6. Quality Control (Task 4)
        # Filter out recipes where:
        # - too many missing ingredients (>3)
        # - used_ingredients overlap is too low (must use at least one)
        filtered_recipes = [
            r for r in cleaned_recipes 
            if len(r.get("missing_ingredients", [])) <= 3 
            and len(r.get("used_ingredients", [])) > 0
        ]
        
        logger.info(f"Generated {len(filtered_recipes)} qualified recipes.")
        return filtered_recipes
        
    except Exception as e:
        logger.error(f"Critical Synthesis Failure: {e}")
        return []

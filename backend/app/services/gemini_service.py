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
    Calls Gemini Flash with strict validation, normalization, and error handling.
    """
    # 1. Edge Case: Empty input
    if not ingredients:
        logger.info("Empty ingredients list provided. Returning empty recipes.")
        return []

    ingredients_str = ", ".join(ingredients)
    
    # 2. Improved restrictive prompt
    prompt = f"""
    You are a professional Indian Chef. 
    Suggest 2–3 Indian recipes using these ingredients as the primary components: {ingredients_str}.

    FORMAT REQUIREMENTS:
    - Return ONLY valid JSON.
    - No conversational text, no markdown code blocks outside JSON, no explanation.
    - JSON structure:
    {{
      "recipes": [
        {{
          "recipe_name": "String",
          "used_ingredients": ["string"],
          "missing_ingredients": ["string"],
          "substitutions": ["string"],
          "steps": ["string"]
        }}
      ]
    }}

    CONSTRAINTS:
    - Recipes MUST be Indian-style.
    - Limit output to 2–3 of the best matches.
    - Limit instructions to 5–7 concise steps per recipe.
    - Use provided ingredients primarily. Avoid recommending rare or exotic secondary ingredients.
    - If no relevant Indian recipe can be made, return {{"recipes": []}}.
    - If unsure, return {{"recipes": []}}.
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

        # 4. Parsing and Validation
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError as je:
            logger.error(f"Malformed JSON from Gemini: {je}")
            return []

        if not validate_recipe_structure(data):
            logger.warning("Gemini response failed schema validation.")
            return []

        # 5. Normalization
        cleaned_recipes = normalize_recipe_data(data["recipes"])
        
        return cleaned_recipes
        
    except Exception as e:
        logger.error(f"Critical Sythensis Failure: {e}")
        # Safeguard fallback
        return []

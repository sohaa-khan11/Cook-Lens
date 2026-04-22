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

# Use Gemini 1.5 Flash for vision (multimodal)
model = genai.GenerativeModel('gemini-1.5-flash')

async def detect_ingredients_from_image(image_bytes: bytes) -> List[str]:
    """
    Submits image bytes to Gemini Vision to identify food ingredients.
    Returns a clean, normalized list of ingredient names.
    """
    if not image_bytes:
        return []

    # Prompt optimized for structured extraction
    prompt = """
    Identify edible food ingredients in this image.

    Return ONLY a JSON array of ingredient names like:
    ["tomato", "onion", "potato"]

    Rules:
    - Only include edible food ingredients.
    - Use simple, singular names (e.g., 'onion', not 'red onion slices').
    - No explanation text, no markdown outside the JSON.
    - If no ingredients are identified or if the image is not food, return [].
    """

    try:
        # Prepare the multimodal part
        image_part = {
            "mime_type": "image/jpeg", # Common default, Gemini handles others gracefully
            "data": image_bytes
        }

        # Generate content
        response = await model.generate_content_async(
            [prompt, image_part],
            generation_config={"response_mime_type": "application/json"}
        )

        if not response or not response.text:
            logger.warning("Gemini Vision returned an empty response.")
            return []

        # Parse JSON
        try:
            detected_list = json.loads(response.text)
        except json.JSONDecodeError as je:
            logger.error(f"Malformed JSON from Gemini Vision: {je}")
            return []

        # Normalize and Limit
        if isinstance(detected_list, list):
            # Lowercase, strip, deduplicate, and limit to top 10
            cleaned = []
            seen = set()
            for item in detected_list:
                val = str(item).strip().lower()
                if val and val not in seen:
                    cleaned.append(val)
                    seen.add(val)
            
            return cleaned[:10]
        
        return []

    except Exception as e:
        logger.error(f"Critical Vision Failure: {e}")
        return []

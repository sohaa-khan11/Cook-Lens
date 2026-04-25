import requests
import json
import logging
import time
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "phi3:mini"
OLLAMA_TIMEOUT = 120 # Increased for CPU-based inference (Task 1 & 2)

def generate_recipe(user_ingredients: List[str], shortlist: List[Dict[str, Any]], mode: str = "retrieval", style_hint: str = "home-style") -> Tuple[Optional[Dict[str, Any]], str]:
    """
    CPU-Optimized Single Burst:
    - Generates 1 concise recipe per call.
    - Uses style_hint to differentiate results.
    """
    
    CORE = ["egg", "chicken", "paneer", "dal", "potato", "fish", "mutton", "rice", "flour"]
    SUPPORTING = ["onion", "tomato", "garlic", "chili", "ginger", "lemon", "curd", "oil"]
    
    core_items = [i for i in user_ingredients if any(c in i.lower() for c in CORE)]
    supporting_items = [i for i in user_ingredients if any(s in i.lower() for s in SUPPORTING)]
    outliers = [i for i in user_ingredients if i not in core_items and i not in supporting_items]

    if mode == "retrieval":
        r = shortlist[0] if shortlist else {"raw_title": "Indian Dish", "used_ingredients": [], "steps": ["Cook."]}
        prompt_body = f"""Base Dish: {r['raw_title']}
Ingredients: {', '.join(user_ingredients)}
Style: {style_hint} (Adapt the base dish to this style)"""
    else:
        prompt_body = f"""Main Ingredients: {', '.join(core_items)}
Supporting: {', '.join(supporting_items)}
Style: {style_hint} (e.g., Curry, Dry Fry, or Quick Snack)"""

    prompt = f"""You are a skilled Indian cook. Create 1 CONCISE {style_hint} recipe.
{prompt_body}

Structure:
TITLE: [Name]
INGREDIENTS:
- [Item]
STEPS:
1. [Step 1]
2. [Step 2] (Max 4 steps total)

Rule: Be extremely brief. No extra text."""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.5,
            "num_predict": 500,
            "stop": ["###", "---", "RULES:", "Structure:"] 
        }
    }

    def extract_from_text(text: str) -> Optional[Dict[str, Any]]:
        # Robust parsing for single-burst mode
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if not lines: return None
        
        title, ingredients, steps = "", [], []
        current_section = ""

        for line in lines:
            line_upper = line.upper()
            if "TITLE:" in line_upper:
                title = line.split(":", 1)[1].strip()
            elif "INGREDIENT" in line_upper:
                current_section = "ing"
            elif "STEP" in line_upper:
                current_section = "step"
            elif current_section == "ing" and (line.startswith(("-", "*", "+")) or ":" not in line):
                cleaned = line.lstrip("- *+").strip()
                if cleaned: ingredients.append(cleaned)
            elif current_section == "step" and (line[0].isdigit() or line.startswith(("-", "*")) or ":" not in line):
                cleaned = line.lstrip("0123456789. -*").strip()
                if cleaned: steps.append(cleaned)
        
        # Final fallback for title: take first line if TITLE: was missing
        if not title and lines:
            first_line = lines[0].replace("TITLE:", "").replace("**", "").strip()
            if len(first_line) > 3: title = first_line

        if ingredients and steps:
            return {
                "title": title or "Home-Style Dish", 
                "ingredients": ingredients, 
                "steps": steps
            }
        return None

    try:
        start_time = time.time()
        response = requests.post(OLLAMA_URL, json=payload, timeout=OLLAMA_TIMEOUT)
        latency = round(time.time() - start_time, 2)
        
        if response.status_code != 200: return None, "error"

        raw_text = response.json().get("response", "")
        logger.info(f"[LLM] Burst ({style_hint}) received in {latency}s")

        data = extract_from_text(raw_text)
        if data: return data, "single_burst"
        return None, "parse_failed"

    except Exception as e:
        logger.error(f"[LLM] Error: {str(e)}")
        return None, "exception"

from typing import List, Dict

# --- MOCK DATABASE ---

MOCK_RECIPES = [
    {
        "recipe_name": "Aloo Tamatar Sabzi",
        "used_ingredients": ["tomato", "potato"],
        "missing_ingredients": ["cumin seeds"],
        "substitutions": ["Use mustard seeds instead"],
        "steps": [
            "Heat oil in a pan",
            "Sauté chopped onions until golden",
            "Add diced tomatoes and spices",
            "Add cubed potatoes and cook until soft"
        ]
    },
    {
        "recipe_name": "Tomato Onion Salad",
        "used_ingredients": ["tomato", "onion"],
        "missing_ingredients": ["lemon juice", "cilantro"],
        "substitutions": ["Use lime juice or vinegar"],
        "steps": [
            "Thinly slice onions and tomatoes",
            "Toss together in a bowl",
            "Season with salt and pepper",
            "Drizzle with lemon juice and serve"
        ]
    }
]

# --- MOCK SERVICES ---

def get_mock_ingredients() -> List[str]:
    """
    Simulates real-time ingredient detection.
    LATER: This will be replaced by an AI model that processes image buffers.
    """
    return ["tomato", "onion", "potato"]

def get_mock_recipes(input_ingredients: List[str]) -> List[Dict]:
    """
    Simulates a recipe recommendation engine based on input ingredients.
    LATER: This will be replaced by a vector search or RAG flow using a recipe database.
    """
    # Simple mock logic: Return recipes where at least one ingredient matches
    results = []
    input_set = set(ing.lower() for ing in input_ingredients)
    
    for recipe in MOCK_RECIPES:
        recipe_ings = set(ing.lower() for ing in recipe["used_ingredients"])
        if input_set.intersection(recipe_ings):
            results.append(recipe)
            
    return results if results else [MOCK_RECIPES[0]] # Fallback to first if no match

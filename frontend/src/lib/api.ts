/**
 * CookLens API utilities.
 * Handles communication between the Next.js frontend and the FastAPI backend.
 */

const BASE_URL = "http://127.0.0.1:8000";

export interface DetectionResponse {
  ingredients: string[];
}

export interface Recipe {
  recipe_name: string;
  used_ingredients: string[];
  missing_ingredients: string[];
  substitutions: string[];
  steps: string[];
}

export interface RecipeResponse {
  recipes: Recipe[];
}

/**
 * Sends a captured image to the backend for ingredient detection.
 * Currently uses mock detection as per Phase 1 backend implementation.
 */
export async function detectIngredients(image?: File): Promise<string[]> {
  try {
    const formData = new FormData();
    if (image) {
      formData.append("image", image);
    }

    const response = await fetch(`${BASE_URL}/detect`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.statusText}`);
    }

    const data: DetectionResponse = await response.json();
    return data.ingredients;
  } catch (error) {
    console.error("Error detecting ingredients:", error);
    throw error;
  }
}

/**
 * Fetches matching recipes from the backend based on provided ingredients.
 */
export async function getRecipes(ingredients: string[]): Promise<Recipe[]> {
  try {
    const response = await fetch(`${BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error(`Recipe fetching failed: ${response.statusText}`);
    }

    const data: RecipeResponse = await response.json();
    return data.recipes;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
}

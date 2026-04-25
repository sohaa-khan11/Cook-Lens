const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Validates the base URL configuration.
 */
function getBaseUrl(): string {
  // FORCE FIX: Hardcoded to 127.0.0.1:8000 to resolve environment variable loading issues
  const baseUrl = "http://127.0.0.1:8000";
  
  if (typeof window !== "undefined") {
    console.log(`[API] FORCE CONNECT: ${baseUrl}`);
  }
  
  return baseUrl;
}

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
  mode: string;
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

    const url = getBaseUrl();
    const response = await fetch(`${url}/detect`, {
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
export async function getRecipes(ingredients: string[]): Promise<RecipeResponse> {
  try {
    const url = getBaseUrl();
    const response = await fetch(`${url}/recipes/search`, {
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
    return data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
}

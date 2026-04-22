"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Recipe } from "@/lib/api";

export interface ProjectContextType {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAll = () => {
    setIngredients([]);
    setRecipes([]);
    setSelectedRecipe(null);
    setLoading(false);
    setError(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        ingredients,
        setIngredients,
        recipes,
        setRecipes,
        selectedRecipe,
        setSelectedRecipe,
        loading,
        setLoading,
        error,
        setError,
        clearAll,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

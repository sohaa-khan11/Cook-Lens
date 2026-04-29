"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { getRecipes } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function IngredientsPage() {
  const { ingredients, setIngredients, setRecipes, loading, setLoading, setError } = useProject();
  const [newIngredient, setNewIngredient] = useState("");
  const router = useRouter();

  const handleRemove = (name: string) => {
    setIngredients(ingredients.filter(i => i !== name));
  };

  const handleAdd = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const handleSynthesize = async () => {
    if (ingredients.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      setRecipes([]);
      
      const response = await getRecipes(ingredients);
      setRecipes(response.recipes);
      router.push("/recipes");
    } catch (err) {
      console.error(err);
      setError("Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden text-[var(--color-text-primary)]">
      {/* Ambient Depth Gradient */}
      <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[60%] bg-[radial-gradient(ellipse_at_center,var(--color-primary-glow)_0%,transparent_70%)] pointer-events-none opacity-50 z-0"></div>

      <header className="w-full flex items-center px-6 py-6 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 glass-surface rounded-full flex items-center justify-center hover:bg-[var(--color-bg-surface-elevated)] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-semibold tracking-tight">Ingredients</h1>
        </div>
      </header>

      <main className="w-full flex flex-col px-6 pt-2 pb-32 z-10 flex-1 max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Detected Items</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">Review and refine your ingredients before generating AI recipes.</p>
        </div>

        {/* Ingredient Chips Container */}
        <div className="flex flex-wrap gap-3 mb-10">
          <AnimatePresence mode="popLayout">
            {ingredients.map((name) => (
              <motion.div 
                key={name} 
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-4 py-2.5 rounded-full glass-surface flex items-center gap-3 transition-colors hover:border-[var(--color-border-strong)]"
              >
                <span className="text-sm font-medium">{name}</span>
                <button 
                  onClick={() => handleRemove(name)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty State */}
          {ingredients.length === 0 && (
            <div className="w-full py-16 flex flex-col items-center justify-center glass-surface rounded-2xl border-dashed">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]">
                <span className="material-symbols-outlined text-[var(--color-text-tertiary)] text-3xl">kitchen</span>
              </div>
              <p className="text-[var(--color-text-secondary)] text-sm font-medium">No ingredients detected.</p>
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="glass-surface rounded-2xl p-1.5 flex items-center gap-3 mb-10">
          <input 
            type="text" 
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Type to add manually..."
            className="flex-1 min-h-[48px] bg-transparent border-none outline-none px-4 text-sm placeholder:text-[var(--color-text-tertiary)]"
          />
          <button 
            onClick={handleAdd}
            className="w-12 h-12 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-surface-elevated)] active:scale-95 transition-all text-[var(--color-primary)]"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="mt-auto">
          {/* Action Button */}
          <button 
            onClick={handleSynthesize}
            disabled={ingredients.length === 0 || loading}
            className="w-full min-h-[64px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[#0f172a] rounded-2xl font-bold text-lg shadow-[var(--shadow-primary)] disabled:opacity-50 disabled:shadow-none disabled:bg-[var(--color-bg-surface-elevated)] disabled:text-[var(--color-text-tertiary)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-[#0f172a]/20 border-t-[#0f172a] rounded-full"
              />
            ) : (
              <>
                <span>Generate Recipes</span>
                <span className="material-symbols-outlined text-[24px]">magic_button</span>
              </>
            )}
          </button>
        </div>
      </main>

      <BottomNav activeId="vault" />
    </div>
  );
}

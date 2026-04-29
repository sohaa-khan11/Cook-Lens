"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { RecipeCard } from "@/components/cards/RecipeCard";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecipesPage() {
  const { recipes } = useProject();
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col relative text-[var(--color-text-primary)]">
      {/* Ambient Depth Gradient */}
      <div className="absolute top-0 right-[-20%] w-[100%] h-[60%] bg-[radial-gradient(ellipse_at_center,var(--color-primary-glow)_0%,transparent_60%)] pointer-events-none opacity-40 z-0"></div>

      <header className="w-full flex items-center px-6 py-6 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 glass-surface rounded-full flex items-center justify-center hover:bg-[var(--color-bg-surface-elevated)] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-semibold tracking-tight">Recipes</h1>
        </div>
      </header>

      <main className="w-full flex flex-col px-6 pt-2 pb-32 gap-6 z-10 flex-1 max-w-3xl mx-auto">
        
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => {
                return (
                  <motion.div 
                    key={`${recipe.recipe_name}-${index}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full"
                  >
                    <RecipeCard 
                      id={recipe.recipe_name}
                      title={recipe.recipe_name}
                      recipeData={recipe}
                    />
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 flex flex-col items-center gap-4 text-center glass-surface rounded-2xl px-6 border-dashed">
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                  <span className="material-symbols-outlined text-[var(--color-text-tertiary)] text-3xl">restaurant_menu</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">No Recipes Generated</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">Scan ingredients to generate your personalized AI recipes.</p>
                </div>
                <Link href="/scan" className="w-full mt-6">
                  <button className="w-full min-h-[48px] glass-surface rounded-xl font-semibold text-sm active:scale-95 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                    Start Scan
                  </button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>

      <BottomNav activeId="vault" />
    </div>
  );
}

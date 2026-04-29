"use client";

import { motion } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RecipeDetailPage() {
  const { selectedRecipe } = useProject();
  const router = useRouter();

  // Redirect if no recipe is selected
  useEffect(() => {
    if (!selectedRecipe) {
      router.push("/recipes");
    }
  }, [selectedRecipe, router]);

  if (!selectedRecipe) return null;

  return (
    <div className="min-h-screen w-full flex flex-col relative text-[var(--color-text-primary)]">
      {/* Ambient Depth Gradient */}
      <div className="fixed top-[-10%] left-[20%] w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_center,var(--color-primary-glow)_0%,transparent_60%)] pointer-events-none opacity-40 z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-base)]/80 backdrop-blur-xl border-b border-[var(--color-border-subtle)] w-full flex justify-between items-center px-6 py-4">
        <button onClick={() => router.back()} className="w-10 h-10 glass-surface rounded-full flex items-center justify-center hover:bg-[var(--color-bg-surface-elevated)] active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
          <span className="material-symbols-outlined text-[24px]">bookmark_border</span>
        </button>
      </header>

      <main className="w-full flex flex-col px-6 pt-8 pb-32 max-w-3xl mx-auto z-10">
        {/* Title Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-balance">
            {selectedRecipe.recipe_name}
          </h1>
          <div className="flex gap-4 text-sm text-[var(--color-text-secondary)] font-medium">
            <span className="flex items-center gap-1.5 glass-surface px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)]">schedule</span>
              20 min
            </span>
            <span className="flex items-center gap-1.5 glass-surface px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)]">speed</span>
              {selectedRecipe.steps.length > 5 ? "Intermediate" : "Easy"}
            </span>
          </div>
        </div>

        <div className="space-y-10">
          {/* Ingredients Section */}
          <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">shopping_basket</span>
              Ingredients
            </h2>
            <div className="flex flex-col gap-4">
              
              {/* Available Ingredients */}
              {selectedRecipe.used_ingredients.length > 0 && (
                <div className="glass-surface p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-success)]"></div>
                    <h3 className="text-sm font-semibold text-[var(--color-success)] uppercase tracking-widest">Available</h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {selectedRecipe.used_ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[var(--color-text-tertiary)] text-[18px]">check</span>
                        <span className="text-[15px] font-medium">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Ingredients */}
              {selectedRecipe.missing_ingredients.length > 0 && (
                <div className="glass-surface p-5 rounded-2xl border-[var(--color-error)]/20 bg-[var(--color-error-bg)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-error)]"></div>
                    <h3 className="text-sm font-semibold text-[var(--color-error)] uppercase tracking-widest">Missing</h3>
                  </div>
                  <ul className="flex flex-col gap-4">
                    {selectedRecipe.missing_ingredients.map((ing, idx) => (
                      <li key={`missing-${idx}`} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[var(--color-error)] text-[18px]">add_shopping_cart</span>
                          <span className="text-[15px] font-medium">{ing}</span>
                        </div>
                        {selectedRecipe.substitutions && selectedRecipe.substitutions[idx] && (
                          <div className="ml-7 pl-3 border-l-2 border-[var(--color-error)]/30 text-sm text-[var(--color-text-secondary)]">
                            Sub: {selectedRecipe.substitutions[idx]}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Steps Section */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">list_alt</span>
              Instructions
            </h2>
            <div className="flex flex-col gap-6">
              {selectedRecipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-5 group glass-surface p-5 rounded-2xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-bold border border-[var(--color-primary)]/20">
                    {idx + 1}
                  </div>
                  <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)]/90 pt-1 font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

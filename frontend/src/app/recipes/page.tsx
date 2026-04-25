"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { RecipeCard } from "@/components/cards/RecipeCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORIES = ["All", "Main", "Salads", "Sides", "Desserts", "Rapid"];

export default function RecipesPage() {
  const { recipes } = useProject();
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  return (
    <div className="bg-[#060606] min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Background Cinematic Grain - Inline Fix */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      
      <header className="w-full flex justify-between items-center px-4 py-6 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-lg font-black tracking-widest text-white/90 uppercase italic">Collections</h1>
        </div>
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{recipes.length} matches</span>
      </header>

      <main className="relative z-10 w-full flex flex-col px-4 pt-4 pb-32 gap-6">
        
        {/* Category Scroller - Mobile Optimized */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                  isActive 
                    ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" 
                    : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
                }`}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>

        {/* Vertical Stack List */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => {
                const total = recipe.used_ingredients.length + recipe.missing_ingredients.length;
                const matchPercent = Math.round((recipe.used_ingredients.length / total) * 100);

                return (
                  <motion.div 
                    key={`${recipe.recipe_name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <RecipeCard 
                      id={recipe.recipe_name}
                      title={recipe.recipe_name}
                      match={matchPercent}
                      time={`${recipe.time_minutes || 20} MINS`}
                      difficulty={recipe.steps.length > 5 ? "INTERMEDIATE" : "EASY"}
                      recipeData={recipe}
                    />
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-white/20 text-4xl">search_off</span>
                </div>
                <div>
                  <h3 className="text-xl font-black italic text-white mb-2">No Matches</h3>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-widest leading-relaxed">Synthesis yielded 0 results.</p>
                </div>
                <Link href="/scan" className="w-full">
                  <button className="w-full min-h-[52px] bg-primary text-black rounded-xl font-black text-xs tracking-widest uppercase active:scale-95 transition-all">
                    Initiate Scan
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

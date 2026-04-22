"use client";

import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopPreviewWrapper } from "@/components/layout/DesktopPreviewWrapper";
import { RecipeCard } from "@/components/cards/RecipeCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import Link from "next/link";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const CATEGORIES = ["All", "Main", "Salads", "Sides", "Desserts", "Rapid"];

export default function RecipesPage() {
  const { recipes, ingredients } = useProject();
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <DesktopPreviewWrapper
      title="Curated Collections"
      subtitle="The engine compares your vault constraints with thousands of Michelin-grade combinations to generate your exact matches."
      bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDBpVY2SFfLtOTQv-6_4bvHwh3cHIk_seY-xiCDv6tTBkNIbp1KtvP7hxF7YKrD0hiCY4yPlT_9COWLMwiNLURdJ8RUX49_fHlfDe-vYShvtogO-Iqz1b0Rszg3JCwMASOFOKex5d7MkZwQIV6C3ToqNUGES2l71FkCEeUIYWCohfYicAnp9PijL1Og5-b2cQkgVRXTp1lFLZBawCp74ahFmE06WUywgB3z-Pwx_T8CLk_l0Ynd6A1rOU4fTieWTlKOJX9akek5mIU"
    >
      <div className="bg-[#060606] min-h-screen">
        <TopBar title="THE VAULT" showBack={true} />
      
        <main className="max-w-7xl mx-auto px-6 pt-32 pb-48 w-full min-h-screen space-y-10">
          
          {/* Mobile Category Chips */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
                    isActive 
                      ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" 
                      : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
                  }`}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>

          {/* Section Header (Mobile Optimized) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: CINEMATIC_EASE }}
            className="flex justify-between items-end border-b border-white/5 pb-6"
          >
            <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Match Logic Active</span>
              <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface italic">The Collection<span className="text-primary-variant">.</span></h2>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{recipes.length} Entry Matches</span>
            </div>
          </motion.div>

          {/* Structured List View for Mobile */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {recipes.length > 0 ? (
                recipes.map((recipe, index) => {
                  // Calculate match percentage based on used ingredients
                  const total = recipe.used_ingredients.length + recipe.missing_ingredients.length;
                  const matchPercent = Math.round((recipe.used_ingredients.length / total) * 100);

                  return (
                    <motion.div 
                      key={recipe.recipe_name}
                      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                      transition={{ 
                        duration: 1.2, 
                        ease: CINEMATIC_EASE,
                        delay: index * 0.1 
                      }}
                      layout
                      className="h-full"
                    >
                      <RecipeCard 
                        id={recipe.recipe_name}
                        title={recipe.recipe_name}
                        image={index % 2 === 0 
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCH5c_da_8d1UEWlponTPAa5Ts3LRrcG71nl2XOLT_3Zv51nVc8Fe_0z9E8n_n_0_0_0_0"
                          : "https://lh3.googleusercontent.com/aida-public/AB6AXuDBpVY2SFfLtOTQv-6_4bvHwh3cHIk_seY-xiCDv6tTBkNIbp1KtvP7hxF7YKrD0hiCY4yPlT_9COWLMwiNLURdJ8RUX49_fHlfDe-vYShvtogO-Iqz1b0Rszg3JCwMASOFOKex5d7MkZwQIV6C3ToqNUGES2l71FkCEeUIYWCohfYicAnp9PijL1Og5-b2cQkgVRXTp1lFLZBawCp74ahFmE06WUywgB3z-Pwx_T8CLk_l0Ynd6A1rOU4fTieWTlKOJX9akek5mIU"
                        }
                        match={matchPercent}
                        time="25 MINS"
                        difficulty={recipe.steps.length > 5 ? "INTERMEDIATE" : "EASY"}
                        recipeData={recipe}
                      />
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 flex flex-col items-center gap-6"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-white/20 text-4xl">search_off</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black italic tracking-tighter text-on-surface">No Matches Found</h3>
                    <p className="text-sm text-on-surface-variant opacity-60">The vault is empty. Capture ingredients to synthesize combinations.</p>
                  </div>
                  <Link href="/scan">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-primary text-on-primary rounded-full font-black text-xs tracking-widest uppercase"
                    >
                      Initiate Scan
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </main>

        <BottomNav activeId="vault" />
      </div>
    </DesktopPreviewWrapper>
  );
}

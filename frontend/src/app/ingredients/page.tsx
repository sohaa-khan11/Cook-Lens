"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { getRecipes } from "@/lib/api";
import { useRouter } from "next/navigation";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

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
      const recipes = await getRecipes(ingredients);
      setRecipes(recipes);
      router.push("/recipes");
    } catch (err) {
      console.error(err);
      setError("Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-lg font-black tracking-widest text-white/90 uppercase italic">Vault Archive</h1>
        </div>
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{ingredients.length} items</span>
      </header>

      <main className="relative z-10 w-full flex flex-col px-4 pt-4 pb-32">
        
        {/* Compact Summary */}
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tighter text-white italic mb-2">Detected Objects<span className="text-primary">.</span></h2>
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-[0.2em]">Neural extraction from scan successful</p>
        </div>

        {/* Ingredient Chips Container */}
        <div className="flex flex-wrap gap-2 mb-10">
          <AnimatePresence mode="popLayout">
            {ingredients.map((name) => (
              <motion.div 
                key={name} 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-4 py-2.5 rounded-full bg-neutral-800 border border-white/5 flex items-center gap-2 group active:bg-neutral-700 transition-colors"
              >
                <span className="text-white text-sm font-bold tracking-tight">{name}</span>
                <button 
                  onClick={() => handleRemove(name)}
                  className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/40 active:bg-red-500 active:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty State Prompt */}
          {ingredients.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl">
              <span className="material-symbols-outlined text-white/10 text-4xl mb-3">inventory_2</span>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center">No objects identified</p>
            </div>
          )}
        </div>

        {/* Manual Input - Full Width / 48px min-height */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 mb-10">
          <input 
            type="text" 
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            placeholder="ADD MANUAL ENTRY..."
            className="flex-1 min-h-[48px] bg-transparent border-none outline-none px-4 text-xs font-black tracking-widest uppercase text-white placeholder:text-white/20"
          />
          <button 
            onClick={handleAdd}
            className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Action Button - Touch Optimized */}
        <button 
          onClick={handleSynthesize}
          disabled={ingredients.length === 0 || loading}
          className="w-full min-h-[64px] bg-primary text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(245,158,11,0.2)] disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
            />
          ) : (
            <>
              <span>Synthesize Recipes</span>
              <span className="material-symbols-outlined text-lg">bolt</span>
            </>
          )}
        </button>

      </main>

      <BottomNav activeId="vault" />
    </div>
  );
}

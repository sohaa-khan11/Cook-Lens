import { motion } from "framer-motion";
import Link from "next/link";

import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { Recipe } from "@/lib/api";

interface RecipeCardProps {
  id: string; 
  title: string;
  image?: string; // Kept for compatibility but ignored for now
  match: number;
  time: string;
  difficulty: "EASY" | "INTERMEDIATE" | "ADVANCED";
  recipeData?: Recipe; 
}

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

export function RecipeCard({ title, match, time, difficulty, recipeData }: RecipeCardProps) {
  const { setSelectedRecipe } = useProject();
  const router = useRouter();

  const handleSelect = () => {
    if (recipeData) {
      setSelectedRecipe(recipeData);
      router.push("/recipe-detail");
    }
  };

  const usedCount = recipeData?.used_ingredients.length || 0;
  const missingCount = recipeData?.missing_ingredients.length || 0;
  const ingredientPreview = recipeData?.used_ingredients.slice(0, 3).join(", ");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
      whileHover="hover"
      whileTap="tap"
      variants={{
        hover: { y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" },
        tap: { scale: 0.98 }
      }}
      onClick={handleSelect}
      className="bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] overflow-hidden relative border border-white/5 group cursor-pointer flex flex-col"
    >
      {/* Refined Header - Minimalist Match Badge */}
      <div className="relative h-16 overflow-hidden flex items-center px-6">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-transparent" />
        
        {/* Match Badge - Now more subtle */}
        <div className="bg-primary/10 backdrop-blur-xl px-3 py-1 rounded-full border border-primary/20">
          <span className="text-[9px] font-black text-primary tracking-[0.2em]">{match}% MATCH</span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-white/90 leading-[1.1] group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              {difficulty} • {time}
            </p>
          </div>
          
          <motion.div 
            variants={{ hover: { x: 5 } }}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.div>
        </div>

        {/* Ingredient Insight */}
        <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 italic">Archive Correlation</span>
            <span className="text-[8px] font-bold text-primary/60 uppercase">{usedCount} ARCHIVED</span>
          </div>
          <p className="text-[11px] font-medium text-white/60 leading-relaxed italic">
            Uses: {ingredientPreview}{recipeData?.used_ingredients.length! > 3 ? "..." : ""}
          </p>
        </div>
      </div>

      {/* Interactive Glow */}
      <motion.div 
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/5 to-transparent transition-opacity duration-500" 
      />
    </motion.div>
  );
}

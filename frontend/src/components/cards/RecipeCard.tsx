import { motion } from "framer-motion";
import Link from "next/link";

import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { Recipe } from "@/lib/api";

interface RecipeCardProps {
  id: string; // Used for identifying in context if needed
  title: string;
  image: string;
  match: number;
  time: string;
  difficulty: "EASY" | "INTERMEDIATE" | "ADVANCED";
  recipeData?: Recipe; // The full backend object
}

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

export function RecipeCard({ title, image, match, time, difficulty, recipeData }: RecipeCardProps) {
  const { setSelectedRecipe } = useProject();
  const router = useRouter();

  const handleSelect = () => {
    if (recipeData) {
      setSelectedRecipe(recipeData);
      router.push("/recipe-detail");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
      whileHover="hover"
      whileTap="tap"
      variants={{
        hover: { y: -10, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" },
        tap: { scale: 0.98 }
      }}
      onClick={handleSelect}
      className="recipe-card-glass rounded-[1.5rem] overflow-hidden relative shadow-2xl border border-white/5 group h-full flex flex-col cursor-pointer"
    >
      <div className="relative h-[280px] md:h-[350px] lg:h-[400px] overflow-hidden">
        <motion.img 
          variants={{ hover: { scale: 1.05 }, tap: { scale: 1.02 } }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          alt={title} 
          className="w-full h-full object-cover origin-center" 
          src={image} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent opacity-95"></div>
        {/* Match Badge */}
        <div className="absolute top-6 right-6 bg-primary-container/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <span className="font-label text-xs font-bold text-primary tracking-tighter">{match}% MATCH</span>
        </div>
      </div>
      <div className="p-8 -mt-24 relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-end flex-1">
          <div className="space-y-3">
            <h3 className="text-2xl font-extrabold tracking-tight text-on-surface leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-on-surface-variant font-label text-xs tracking-wide">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">restaurant_menu</span>
                <span>{difficulty}</span>
              </div>
            </div>
          </div>
          <div className="relative shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-on-primary p-4 rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Soft Glow Overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] glow-halo opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
    </motion.div>
  );
}

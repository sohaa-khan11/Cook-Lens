import { motion } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { Recipe } from "@/lib/api";

interface RecipeCardProps {
  id: string; 
  title: string;
  recipeData?: Recipe; 
}

export function RecipeCard({ title, recipeData }: RecipeCardProps) {
  const { setSelectedRecipe } = useProject();
  const router = useRouter();

  const handleSelect = () => {
    if (recipeData) {
      setSelectedRecipe(recipeData);
      router.push("/recipe-detail");
    }
  };

  const missingCount = recipeData?.missing_ingredients.length || 0;
  const ingredientPreview = recipeData?.used_ingredients.slice(0, 3).join(", ");
  const hasMore = (recipeData?.used_ingredients.length || 0) > 3;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className="glass-surface rounded-2xl overflow-hidden relative group cursor-pointer flex flex-col p-6 gap-4 hover:shadow-[var(--shadow-elevated)] hover:border-[var(--color-primary)]/50 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-glow)] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-start gap-4 z-10">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-primary)] transition-colors flex-1">
          {title}
        </h3>
        <motion.div 
          className="w-8 h-8 rounded-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-primary)] shrink-0 opacity-50 group-hover:opacity-100 group-hover:bg-[var(--color-primary)] group-hover:text-[#0f172a] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2 z-10">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-text-tertiary)]">Uses:</span> {ingredientPreview}{hasMore ? "..." : ""}
        </p>
        {(missingCount > 0) && (
          <div className="inline-flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)]" />
            <p className="text-xs font-medium text-[var(--color-error)]">
              Missing {missingCount} ingredient{missingCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

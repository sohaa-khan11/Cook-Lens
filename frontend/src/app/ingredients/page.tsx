"use client";

import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopPreviewWrapper } from "@/components/layout/DesktopPreviewWrapper";
import { motion, Variants, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { getRecipes } from "@/lib/api";
import { useRouter } from "next/navigation";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15, filter: "blur(10px)" },
  show: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: CINEMATIC_EASE } }
};

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
      setError("Synthesis failed. Neural engine offline.");
    } finally {
      setLoading(false);
    }
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 100, mass: 1 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 100, mass: 1 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth - 0.5) * 20); 
      mouseY.set((e.clientY / innerHeight - 0.5) * 20);
    };
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <DesktopPreviewWrapper
      title="Live Ingredient Synthesizer"
      subtitle="Watch as the AI detects and organizes items off the counter. The vault updates in real-time."
      bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuBYZe7Vicq8h-qPPeL2XPE5ZxOtrk38qRDHd6sHlGs8UZvI9iN14dIfOr6qyndCqM1nEFnX5esYwlYue5-5uQqjO7mvC_39UlOltKBaQM4w4sXoLz6V0pxi0f6a4L_JF1V1_57Xa9NfZHZ6SUoysSQSAcLjux5FRjjbOSqTeiSYC0xPM-mUtoqqnE8B52t9k8EwNb5Qv4veAT1hR-z_moR3eg3HBTZIvzJ2bkuqA_KQq6DHlLrYKmv6cpMaBW-4y28wOkSr0hyx_J0"
    >
      <div className="bg-[#060606] min-h-[100dvh] relative overflow-hidden">
        {/* Background Cinematic Grain */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none" />
        
        <TopBar title="THE ARCHIVE" showBack={true} />

        <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center pt-32 pb-48 px-6 min-h-[100dvh]">
          
          {/* Subtle glow background */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
            <motion.div 
              style={{ x: smoothX, y: smoothY }}
              className="w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            
            {/* Header Asset */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: CINEMATIC_EASE }}
              className="relative mb-12"
            >
              <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden p-1.5 bg-neutral-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl ring-4 ring-primary/5">
                <img 
                  alt="Source Image" 
                  className="w-full h-full object-cover rounded-full grayscale-[0.2]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYZe7Vicq8h-qPPeL2XPE5ZxOtrk38qRDHd6sHlGs8UZvI9iN14dIfOr6qyndCqM1nEFnX5esYwlYue5-5uQqjO7mvC_39UlOltKBaQM4w4sXoLz6V0pxi0f6a4L_JF1V1_57Xa9NfZHZ6SUoysSQSAcLjux5FRjjbOSqTeiSYC0xPM-mUtoqqnE8B52t9k8EwNb5Qv4veAT1hR-z_moR3eg3HBTZIvzJ2bkuqA_KQq6DHlLrYKmv6cpMaBW-4y28wOkSr0hyx_J0" 
                />
              </div>
            </motion.div>

            {/* Typography */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.2, ease: CINEMATIC_EASE }}
              className="text-center mb-12 w-full space-y-2"
            >
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] block">Extraction Complete</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-on-surface font-headline italic">The Found Objects<span className="text-primary">.</span></h2>
              <p className="text-on-surface-variant text-sm md:text-base max-w-sm mx-auto font-medium opacity-60">Neural Match has identified {ingredients.length} items from your counter-top scan.</p>
            </motion.div>

            {/* Ingredient Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
            >
              <AnimatePresence mode="popLayout">
                {ingredients.map((name) => (
                  <motion.div 
                    key={name} 
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    className="bg-neutral-900/40 backdrop-blur-3xl shadow-2xl flex items-center justify-between p-4 rounded-[2rem] border border-white/5 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center overflow-hidden border border-white/5">
                        <span className="material-symbols-outlined text-primary/40">restaurant</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight text-on-surface leading-tight">{name}</span>
                        <span className="text-[9px] uppercase font-black tracking-widest text-primary italic opacity-70">Authenticated Match</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(name)}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Manual Entry */}
              <motion.div 
                variants={itemVariants}
                className="bg-transparent backdrop-blur-md flex items-center gap-3 p-2 pl-6 rounded-[2rem] border border-dashed border-white/10 hover:border-primary/60 transition-all group h-[74px]"
              >
                <input 
                  type="text" 
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="ADD MANUAL ENTRY..."
                  className="bg-transparent border-none outline-none text-sm font-black tracking-widest uppercase text-on-surface placeholder:text-white/20 flex-1"
                />
                <button 
                  onClick={handleAdd}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </motion.div>
            </motion.div>

          </div>
        </main>
        
        {/* Synthetic Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5, ease: CINEMATIC_EASE }}
          className="fixed bottom-32 left-0 right-0 z-50 px-6 pointer-events-none flex justify-center"
        >
          <button 
            onClick={handleSynthesize}
            disabled={ingredients.length === 0 || loading}
            className="w-full max-w-sm pointer-events-auto disabled:opacity-50 disabled:grayscale transition-all"
          >
            <motion.div 
              whileTap={{ scale: 0.96 }}
              className="w-full h-20 rounded-[2.5rem] bg-primary text-on-primary font-black text-lg tracking-tight shadow-[0_20px_50px_rgba(255,185,95,0.2)] relative overflow-hidden group flex justify-center items-center gap-3 border border-amber-500/20"
            >
              {loading ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-on-primary/20 border-t-on-primary rounded-full"
                />
              ) : (
                <>
                  <span>Synthesize Vault</span>
                  <span className="material-symbols-outlined font-black">restaurant_menu</span>
                </>
              )}
            </motion.div>
          </button>
        </motion.div>

        <BottomNav activeId="vault" />
      </div>
    </DesktopPreviewWrapper>
  );
}

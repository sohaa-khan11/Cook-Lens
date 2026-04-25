"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { DesktopPreviewWrapper } from "@/components/layout/DesktopPreviewWrapper";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

export default function RecipeDetailPage() {
  const { selectedRecipe } = useProject();
  const router = useRouter();
  
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 50, stiffness: 100, mass: 1 });
  const heroScale = useTransform(smoothProgress, [0, 1], [1.1, 1.3]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0.4]);

  // Redirect if no recipe is selected
  useEffect(() => {
    if (!selectedRecipe) {
      router.push("/recipes");
    }
  }, [selectedRecipe, router]);

  if (!selectedRecipe) return null;

  return (
    <DesktopPreviewWrapper
      title="Editorial Recipe Flow"
      subtitle="A gorgeous, step-by-step reading flow constructed to keep your hands free and your mind entirely on the fire."
    >
      <div className="bg-[#060606] relative overflow-x-hidden min-h-screen">
        {/* Background Cinematic Noise */}
        <div className="fixed inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none z-[1]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        
        {/* Mobile Header Overlays */}
        <div className="fixed top-0 left-0 w-full z-[100] px-6 h-28 flex justify-between items-center pointer-events-none">
          <Link href="/recipes" className="pointer-events-auto">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-3xl rounded-full text-on-surface border border-white/10"
            >
               <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </motion.div>
          </Link>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-3xl rounded-full text-primary border border-primary/20 pointer-events-auto"
          >
             <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
          </motion.button>
        </div>
        
        <main className="relative flex flex-col lg:flex-row w-full min-h-screen">
          
          {/* Editorial Hero Column - Clean Gradient Visual */}
          <div className="lg:fixed lg:top-0 lg:left-0 lg:w-[45vw] lg:h-screen lg:z-0 w-full h-[65vh] relative overflow-hidden bg-gradient-to-br from-neutral-900 via-black to-neutral-900">
            <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="w-full h-full origin-center flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_80%)]" />
              <span className="material-symbols-outlined text-primary/10 text-[180px] lg:text-[240px] italic select-none">
                local_fire_department
              </span>
            </motion.div>
            
            {/* Desktop Gradient Blocker */}
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#060606] to-transparent hidden lg:block opacity-100 z-10"></div>
            {/* Mobile Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent lg:hidden z-10"></div>
          </div>

          {/* Scrolling Content Column */}
          <div className="relative z-20 w-full lg:w-[55vw] px-6 lg:px-24 pt-8 lg:pt-48 pb-64 bg-[#060606] lg:bg-transparent -mt-20 lg:mt-0 rounded-t-[3.5rem] lg:rounded-none shadow-[0_-40px_100px_rgba(0,0,0,1)] lg:shadow-none">
            
            <motion.div 
              initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: CINEMATIC_EASE }}
              className="mb-16 lg:mb-24 space-y-4"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Signature Mastery</span>
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-on-surface leading-[0.95] text-balance uppercase">
                {selectedRecipe.recipe_name}<span className="text-primary NOT-italic">.</span>
              </h1>
            </motion.div>

            {/* Mobile Stats Glass Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-3 gap-0 mb-20 lg:mb-32 rounded-[2.5rem] bg-neutral-900 shadow-2xl overflow-hidden divide-x divide-white/5 border border-white/5"
            >
              {[
                { icon: "schedule", label: "Heat", value: "25M" },
                { icon: "group", label: "Pax", value: "2P" },
                { icon: "energy_savings_leaf", label: "Complexity", value: selectedRecipe.steps.length > 5 ? "High" : "Low" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-6 active:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[24px] text-primary mb-2 opacity-60 italic">{stat.icon}</span>
                  <span className="text-sm font-black text-on-surface italic uppercase tracking-tighter">{stat.value}</span>
                  <span className="text-[8px] uppercase tracking-widest font-black text-on-surface-variant/40">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            <div className="space-y-32">
              {/* Ingredients Section */}
              <section>
                <div className="flex items-center gap-6 mb-12">
                  <h2 className="text-3xl font-black italic tracking-tighter text-on-surface uppercase">The Elements</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                </div>
                <div className="flex flex-col gap-8">
                  {selectedRecipe.used_ingredients.map((ing, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                      className="flex justify-between items-end pb-3 border-b border-white/5 group"
                    >
                      <div>
                        <span className="block text-xl font-black text-on-surface tracking-tight group-active:text-primary transition-colors uppercase">{ing}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">In Your Vault</span>
                      </div>
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    </motion.div>
                  ))}
                  
                  {selectedRecipe.missing_ingredients.map((ing, idx) => (
                    <motion.div 
                      key={`missing-${idx}`} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, delay: idx * 0.1, ease: CINEMATIC_EASE }}
                      className="flex justify-between items-end pb-3 border-b border-white/5 group opacity-60"
                    >
                      <div>
                        <span className="block text-xl font-black text-white/40 tracking-tight uppercase">{ing}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60 italic">Missing Object</span>
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase italic">Sub: {selectedRecipe.substitutions[idx] || "N/A"}</span>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Execution Section */}
              <section>
                <div className="flex items-center gap-6 mb-16">
                  <h2 className="text-3xl font-black italic tracking-tighter text-on-surface uppercase">Execution</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                </div>
                <div className="space-y-24">
                  {selectedRecipe.steps.map((step, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-150px" }}
                      transition={{ duration: 1.2, ease: CINEMATIC_EASE }}
                      className="relative pl-12 border-l border-white/10 group"
                    >
                      <div className="absolute -left-[1.5px] top-0 w-[3px] h-0 bg-primary group-hover:h-full transition-all duration-1000 ease-out" />
                      <div className="absolute -left-[20px] top-0 w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-lg font-black text-primary italic shadow-2xl">
                        {idx + 1}
                      </div>
                      
                      <p className="text-lg leading-relaxed text-on-surface font-medium opacity-90 italic uppercase tracking-tighter pt-1">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Global Ignite Button (Floating Bottom Mobile) */}
        <div className="fixed bottom-12 left-0 right-0 z-[110] px-6 flex justify-center pointer-events-none">
          <Link href="/scan" className="w-full max-w-sm pointer-events-auto">
            <motion.button 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 100, damping: 20 }}
              whileTap={{ scale: 0.95 }}
              className="h-20 w-full flex items-center justify-center gap-4 bg-primary text-on-primary font-black text-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,185,95,0.3)] transition-all uppercase tracking-tighter italic"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              Ignite New Flow
            </motion.button>
          </Link>
        </div>
      </div>
    </DesktopPreviewWrapper>
  );
}

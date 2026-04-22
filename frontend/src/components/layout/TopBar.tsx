"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

export function TopBar({ title = "COOKLENS", showBack = false }: { title?: string, showBack?: boolean }) {
  return (
    <header className="fixed top-0 w-full z-[100] px-6 h-20 flex justify-between items-center bg-neutral-950/40 backdrop-blur-3xl border-b border-white/5 shadow-2xl shadow-black/80 pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        {showBack ? (
          <Link href="/" className="text-on-surface hover:bg-white/5 active:scale-90 transition-all p-2 rounded-full duration-300">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
            className="text-on-surface p-2 rounded-full active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px] opacity-80 hover:opacity-100 italic">menu</span>
          </motion.div>
        )}
      </div>
      
      <motion.h1 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: CINEMATIC_EASE }}
        className="text-lg font-black tracking-[0.2em] text-on-surface flex items-baseline pointer-events-auto"
      >
        {title}<span className="text-primary italic">.</span>
      </motion.h1>
      
      <div className="flex items-center pointer-events-auto">
        {!showBack && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: CINEMATIC_EASE, delay: 0.2 }}
            className="w-9 h-9 rounded-full overflow-hidden border border-white/10 ring-2 ring-primary/20 hover:scale-105 active:scale-90 transition-all cursor-pointer"
          >
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmJapMJ3BFldQ89idAy55xXAFD13d24IQIaY1wTssHibNz93TKbjP6OkiG7v78YprsDdov46JRYxS5A2oAyd_P2-QL9wzZ_D7GWBwTxggkbI9h4oQiSzTLi5JSsq7aWQ-hjOvylPuYD8i2OGt3tQAfXgAHobgvLEkH_s60XQCtcENEd6RkYdsKsTYZqApGSOTK-0_y5MyeTTQ7xjkVQCz5n_LCeKj2-bvNcV7yibKMb0y6umfBix9_7BazXnn4l4OnEXDzjfZi2hI" 
            />
          </motion.div>
        )}
      </div>
    </header>
  );
}

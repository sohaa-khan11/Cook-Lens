"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "home", href: "/" },
  { id: "scan", label: "Scan", icon: "center_focus_strong", href: "/scan" },
  { id: "vault", label: "Vault", icon: "local_library", href: "/ingredients" },
  { id: "profile", label: "Profile", icon: "person", href: "#" },
];

export function BottomNav({ activeId }: { activeId?: string }) {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 pointer-events-none">
      <nav className="max-w-sm mx-auto bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative">
        <AnimatePresence>
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative flex-1 group"
              >
                <div className="flex flex-col items-center justify-center py-2 relative z-10 transition-colors duration-500">
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-x-2 inset-y-0 bg-primary/10 rounded-full border border-primary/20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  <motion.span 
                    animate={isActive ? { scale: 1.1, color: "var(--primary)" } : { scale: 1, color: "rgba(255,255,255,0.4)" }}
                    className="material-symbols-outlined text-[24px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </motion.span>
                  
                  <motion.span 
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 0 }}
                    className={clsx(
                      "text-[9px] font-black uppercase tracking-[0.2em] mt-1 transition-colors",
                      isActive ? "text-primary" : "text-white/40"
                    )}
                  >
                    {item.label}
                  </motion.span>
                </div>
                
                {/* Tap Feedback */}
                <motion.div
                  className="absolute inset-0 bg-white/5 rounded-full opacity-0"
                  whileTap={{ opacity: 1, scale: 0.95 }}
                />
              </Link>
            );
          })}
        </AnimatePresence>
      </nav>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * On desktop: Renders children inside a gorgeous mock device/preview layout
 * On mobile: Renders children normally without bounds
 */
export function DesktopPreviewWrapper({ children, title, subtitle, bgImage }: { children: React.ReactNode, title: string, subtitle: string, bgImage?: string }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevent hydration flash

  return (
    <>
      {/* 
         MOBILE: Standard App Experience 
      */}
      <div className="block lg:hidden h-full">
        {children}
      </div>

      {/* 
         DESKTOP: Premium Cinematic Redirection 
      */}
      <div className="hidden lg:flex fixed inset-0 z-[1000] bg-[#0a0a0a] overflow-hidden items-center justify-center">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 4, ease: "easeOut" }}
            src={bgImage || "/hero.png"} 
            className="w-full h-full object-cover blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center max-w-2xl px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-primary mb-8 block opacity-60">Mobile Exclusive Experience</span>
            <h2 className="text-6xl font-black tracking-tight text-on-surface mb-8 leading-[0.9]">
              {title}<span className="text-primary">.</span>
            </h2>
            <p className="text-lg text-on-surface-variant font-medium mb-12 opacity-80 leading-relaxed">
              Desktop is for inspiration. Action happens in your hands. Scan to continue this culinary journey on your mobile device.
            </p>

            <div className="inline-flex flex-col items-center gap-8 p-10 glass-premium rounded-[3rem]">
              <div className="w-40 h-40 bg-white p-4 rounded-3xl shadow-2xl relative">
                <div className="w-full h-full grid grid-cols-5 gap-1.5 opacity-5">
                   {[...Array(25)].map((_, i) => <div key={i} className="bg-black rounded-[2px]" />)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-black">qr_code_2</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Continue on iOS / Android</span>
                 <Link href="/" className="text-xs font-bold text-primary hover:underline underline-offset-4 transition-all">Back to Story</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

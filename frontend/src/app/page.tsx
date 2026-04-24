"use client";

import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue, useVelocity } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";

// --- Constants ---
const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// --- Magnetic Component ---
function Magnetic({ children, strength = 0.5 }: { children: React.ReactNode, strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.8 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    if (Math.abs(distanceX) < 100 && Math.abs(distanceY) < 100) {
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center pointer-events-none">
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: CINEMATIC_EASE, delay: 0.5 }}
      className="pointer-events-auto"
    >
      <Magnetic strength={0.3}>
        <Link href="/" className="text-2xl font-black tracking-tighter text-on-surface hover:opacity-70 transition-opacity flex items-baseline">
          COOKLENS<span className="text-primary italic">.</span>
        </Link>
      </Magnetic>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: CINEMATIC_EASE, delay: 0.7 }}
      className="hidden md:flex gap-8 items-center pointer-events-auto"
    >
      <div className="h-px w-12 bg-white/10" />
      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-on-surface-variant/50">Redefining Home Culinary</span>
    </motion.div>
  </nav>
);

const HeroSection = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 80, mass: 2 };
  const sx = useSpring(useTransform(mouseX, [-500, 500], [-10, 10]), springConfig);
  const sy = useSpring(useTransform(mouseY, [-500, 500], [-10, 10]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX - innerWidth / 2);
      mouseY.set(e.clientY - innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blurParallax = useTransform(scrollYProgress, [0, 0.5], ["blur(0px)", "blur(10px)"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const headline = "Snap. Cook. Amazing.";
  
  return (
    <section ref={container} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <motion.div style={{ translateY: yParallax, scale: scaleParallax, x: sx, y: sy, filter: blurParallax }} className="absolute inset-0 z-0">
        <img src="/hero.png" alt="Culinary Background" className="w-full h-full object-cover brightness-[0.35]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
      </motion.div>
      
      <motion.div style={{ opacity: contentOpacity }} className="relative z-10 text-center px-4">
        <div className="flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 10, letterSpacing: "1em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.5em" }}
            transition={{ duration: 1.5, ease: CINEMATIC_EASE, delay: 0.2 }}
            className="text-[10px] md:text-xs uppercase font-black text-primary mb-6 block"
          >
            The Future of Cooking
          </motion.span>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tight leading-[0.9] text-on-surface text-balance">
            {headline.split(" ").map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 40, filter: "blur(20px)", scale: 0.95 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                transition={{ 
                  duration: 1.4, 
                  ease: CINEMATIC_EASE, 
                  delay: 0.4 + i * 0.15 
                }}
                className="inline-block mr-[0.25em] last:mr-0"
              >
                {word.split("").map((char, j) => (
                   <span key={j} className={char === "." ? "text-primary" : ""}>{char}</span>
                ))}
              </motion.span>
            ))}
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 2, ease: CINEMATIC_EASE, delay: 1.2 }}
            className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-2xl font-medium tracking-tight text-balance mx-auto italic"
          >
            Intelligent recognition meets curated culinary mastery. 
            The digital cellar, refined.
          </motion.p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 2 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40">Scroll to Explore</span>
        <motion.div 
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3], scaleY: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" 
        />
      </motion.div>
    </section>
  );
};

const VisionSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scrollVelocity = useVelocity(scrollYProgress);
  const scrollSpring = useSpring(scrollYProgress, { damping: 50, stiffness: 100, mass: 1.5 });
  const velocitySpring = useSpring(scrollVelocity, { damping: 100, stiffness: 200 });

  const skewX = useTransform(velocitySpring, [-1, 1], [-10, 10]);
  const xLeft = useTransform(scrollSpring, [0, 1], ["-15%", "10%"]);
  const xRight = useTransform(scrollSpring, [0, 1], ["15%", "-10%"]);
  const opacity = useTransform(scrollSpring, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-24 md:py-32 bg-[#0a0a0a] overflow-hidden relative w-full">
      <div className="flex flex-col gap-4 w-full">
        <motion.h2 
          style={{ x: xLeft, skewX }}
          className="text-8xl md:text-[15rem] font-black tracking-tighter text-white/[0.02] whitespace-nowrap leading-none select-none italic"
        >
          THE DIGITAL CELLAR THE DIGITAL CELLAR
        </motion.h2>
        <motion.div 
          style={{ opacity }}
          className="w-full px-8 md:px-16 relative z-10 -mt-12 md:-mt-32"
        >
          <div className="w-full">
            <Magnetic strength={0.1}>
              <h3 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-8 leading-tight">
                A private archive for your <br />
                <span className="text-primary italic">culinary legacy.</span>
              </h3>
            </Magnetic>
            <p className="text-xl md:text-2xl text-on-surface-variant leading-relaxed w-full md:max-w-4xl font-medium">
              CookLens understands the soul of your ingredients, 
              curating a journey from raw counter-top basics to five-star outcomes.
            </p>
          </div>
        </motion.div>
        <motion.h2 
          style={{ x: xRight, skewX }}
          className="text-8xl md:text-[15rem] font-black tracking-tighter text-white/[0.02] whitespace-nowrap leading-none select-none text-right"
        >
          UNPARALLELED INTELLIGENCE UNPARALLELED
        </motion.h2>
      </div>
    </section>
  );
};

const FeatureItem = ({ title, description, image, index }: { title: string, description: string, image: string, index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-150px" });

  return (
    <div ref={ref} className="flex flex-col md:flex-row items-center gap-12 md:gap-24 py-16 md:py-24 border-b border-white/5 last:border-0 relative group">
      <div className={`flex-1 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
        <motion.div
           initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60, filter: "blur(10px)" }}
           animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
           transition={{ duration: 1.6, ease: CINEMATIC_EASE }}
        >
          <span className="text-primary font-black text-xs tracking-widest uppercase mb-4 block opacity-60">Volume 0{index + 1}</span>
          <Magnetic strength={0.2}>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface mb-6 leading-none group-hover:italic transition-all duration-700">{title}</h3>
          </Magnetic>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-medium opacity-80 max-w-md">
            {description}
          </p>
        </motion.div>
      </div>
      <div className="flex-1 w-full aspect-video md:aspect-square relative rounded-[3rem] overflow-hidden">
        <motion.div 
          initial={{ clipPath: "inset(10% 10% 10% 10% round 3rem)", scale: 0.9 }}
          animate={isInView ? { clipPath: "inset(0% 0% 0% 0% round 3rem)", scale: 1 } : {}}
          transition={{ duration: 1.8, ease: CINEMATIC_EASE, delay: 0.2 }}
          className="w-full h-full"
        >
           <motion.img 
            initial={{ scale: 1.3, filter: "blur(20px)" }}
            animate={isInView ? { scale: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 2.2, ease: CINEMATIC_EASE }}
            src={image} 
            alt={title} 
            className="w-full h-full object-cover brightness-[0.7] group-hover:scale-105 transition-transform duration-[4s] ease-out" 
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>
    </div>
  );
};

const ExperienceSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="py-32 bg-[#0a0a0a] relative group/section">
      <motion.div 
        style={{ 
          x: useSpring(useTransform(mouseX, [0, 1400], [-150, 150]), { damping: 100 }),
          y: useSpring(useTransform(mouseY, [0, 800], [-150, 150]), { damping: 100 })
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 blur-[180px] pointer-events-none -z-10 group-hover/section:bg-primary/10 transition-colors duration-1000"
      />

      <div className="w-full px-8 md:px-16">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.98, letterSpacing: "-0.05em" }}
            whileInView={{ opacity: 1, scale: 1, letterSpacing: "-0.02em" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: CINEMATIC_EASE }}
            className="text-5xl md:text-8xl font-black tracking-tight text-on-surface mb-8 text-balance"
          >
            The Flow Experience<span className="text-primary italic">.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl text-on-surface-variant w-full md:max-w-4xl mx-auto font-medium"
          >
            A three-act journey into culinary liberation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Capture", desc: "Briefly scan your pantry layout. Our vision engine does the heavy lifting." },
            { step: "02", title: "Refine", desc: "AI-driven logic filters for waste reduction and perfect beverage pairings." },
            { step: "03", title: "Master", desc: "Follow instructions designed for absolute focus and fluidity." }
          ].map((item, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
               whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
               viewport={{ once: true }}
               transition={{ duration: 1.2, ease: CINEMATIC_EASE, delay: i * 0.25 }}
               className="p-12 glass-premium rounded-[3.5rem] flex flex-col gap-6 relative overflow-hidden group/card w-full"
            >
              <motion.div 
                 style={{ 
                   left: mouseX, 
                   top: mouseY,
                   translate: "-50% -50%"
                 }}
                 className="absolute w-80 h-80 bg-primary/15 blur-[100px] pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000"
              />
              
              <span className="text-7xl font-black text-primary/10 italic z-10 block transform group-hover:-translate-y-2 transition-transform duration-1000">{item.step}</span>
              <h4 className="text-2xl font-bold text-on-surface z-10 tracking-tight">{item.title}</h4>
              <p className="text-on-surface-variant font-medium text-sm leading-relaxed z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ClosingSection = () => {
  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a] flex flex-col items-center text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: CINEMATIC_EASE }}
        className="max-w-3xl px-8"
      >
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface mb-8">
          Culinary mastery, <br />
          <motion.span 
            initial={{ letterSpacing: "0.4em", opacity: 0, filter: "blur(10px)" }}
            whileInView={{ letterSpacing: "0em", opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.5, ease: CINEMATIC_EASE, delay: 0.5 }}
            className="text-primary italic font-serif"
          >
            refined.
          </motion.span>
        </h2>
        
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 2, ease: CINEMATIC_EASE, delay: 1 }}
            className="w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-2" 
          />
          <p className="text-on-surface-variant font-medium text-xs tracking-[0.4em] uppercase opacity-40">
            Designed for your kitchen. Built for your phone.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

// --- Mobile App Dashboard ---

const MobileLanding = () => {
  // Calculate greeting during render to avoid useEffect overhead
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="min-h-screen bg-[#060606] text-on-surface pb-32">
      {/* Background Cinematic Noise & Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay z-0" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
      </div>

      <header className="relative z-20 px-6 pt-12 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black tracking-tighter italic">COOKLENS<span className="text-primary">.</span></h1>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">{greeting}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-white/40 text-lg">account_circle</span>
        </div>
      </header>

      <main className="relative z-10 px-4 space-y-8">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/scan" className="col-span-2">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="relative h-48 rounded-3xl overflow-hidden group border border-white/5 shadow-2xl"
            >
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" alt="Scan" className="w-full h-full object-cover brightness-[0.4]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 mb-1">
                   <span className="material-symbols-outlined text-primary text-sm">center_focus_strong</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Lens</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">Initiate Scan</h3>
              </div>
            </motion.div>
          </Link>

          <Link href="/ingredients">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="relative h-40 rounded-3xl overflow-hidden group border border-white/5 bg-neutral-900/40 backdrop-blur-xl"
            >
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                   <span className="material-symbols-outlined text-primary">inventory_2</span>
                 </div>
                 <h3 className="text-xs font-black tracking-widest text-white uppercase">Vault</h3>
                 <span className="text-[9px] font-bold text-white/30 uppercase mt-1">Archive</span>
              </div>
            </motion.div>
          </Link>

          <Link href="/recipes">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="relative h-40 rounded-3xl overflow-hidden group border border-white/5 bg-neutral-900/40 backdrop-blur-xl"
            >
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                   <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                 </div>
                 <h3 className="text-xs font-black tracking-widest text-white uppercase">Recipes</h3>
                 <span className="text-[9px] font-bold text-white/30 uppercase mt-1">Explore</span>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Minimal Inspiration Scroller */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Trending Now</h4>
             <span className="text-[9px] font-bold text-primary uppercase tracking-widest">More</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
             {[
               { title: "Miso Salmon", time: "25M", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop" },
               { title: "Truffle Pasta", time: "45M", img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1000&auto=format&fit=crop" },
               { title: "Garden Salad", time: "15M", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop" }
             ].map((item, i) => (
               <motion.div 
                 key={i} 
                 whileTap={{ scale: 0.95 }}
                 className="flex-shrink-0 w-40 h-56 rounded-3xl overflow-hidden relative border border-white/5 shadow-xl"
               >
                 <img src={item.img} alt={item.title} className="w-full h-full object-cover brightness-[0.5]" />
                 <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h5 className="text-sm font-black text-white uppercase italic leading-tight mb-1">{item.title}</h5>
                    <div className="flex items-center gap-1.5 text-white/40 text-[9px] font-bold uppercase tracking-widest">
                       <span className="material-symbols-outlined text-[12px]">schedule</span>
                       <span>{item.time}</span>
                    </div>
                 </div>
               </motion.div>
             ))}
          </div>
        </section>

        {/* Compact Status Card */}
        <div className="p-6 bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 flex items-center gap-5">
           <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin duration-[4s]" />
              <span className="text-sm font-black text-primary">12</span>
           </div>
           <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest italic">System Active</h4>
              <p className="text-[10px] text-white/40 font-medium tracking-tight">AI Archive synced with cloud vault.</p>
           </div>
        </div>
      </main>

      <BottomNav activeId="home" />
    </div>
  );
};

// --- Main Page Export ---

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) return <MobileLanding />;

  return (
    <div className="relative bg-[#0a0a0a] text-on-surface font-body selection:bg-primary/30 antialiased overflow-x-hidden cinematic-noise">
      <Navbar />
      <main>
        <HeroSection />
        <VisionSection />
        
        <section className="w-full px-8 md:px-16 relative z-10">
          <FeatureItem 
            index={0}
            title="AI-Driven Sommelier Pairing"
            description="Our Intelligence Layer understands flavor synergy. Get perfect beverage recommendations for every combination."
            image="/sommelier.png"
          />
          <FeatureItem 
            index={1}
            title="Culinary Vision Control"
            description="Computer vision identifies ingredients instantly. A second set of eyes for your kitchen."
            image="/vision.png"
          />
          <FeatureItem 
            index={2}
            title="Zero Waste Logic"
            description="Intelligence that prioritizes expiring items, keeping your kitchen efficient and your palate excited."
            image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"
          />
        </section>

        <ExperienceSection />
        <ClosingSection />

        <footer className="py-12 border-t border-white/5 bg-[#080808] w-full">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="w-full px-8 md:px-16 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-on-surface-variant/20 text-center md:text-left"
          >
            <span>© 2024 CookLens</span>
            <div className="hidden md:flex gap-8">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
            <span>Designed for Mastery</span>
          </motion.div>
        </footer>
      </main>
    </div>
  );
}

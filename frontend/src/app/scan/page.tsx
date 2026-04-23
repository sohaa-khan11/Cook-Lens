"use client";

import { DesktopPreviewWrapper } from "@/components/layout/DesktopPreviewWrapper";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useProject } from "@/context/ProjectContext";
import { detectIngredients } from "@/lib/api";
import { useRouter } from "next/navigation";

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

export default function ScanPage() {
  const { setIngredients, setLoading, loading, setError } = useProject();
  const router = useRouter();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log("Requesting camera with constraints:", constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Stream obtained:", newStream.id);
      
      setStream(newStream);
      setIsCameraActive(true);
      // Assignment now happens in useEffect below to avoid race condition with mounting
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access denied. Please enable permissions in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Camera not available. Please use upload instead.");
      }
    }
  };

  // Fix: Handle stream assignment after video elements are mounted
  useEffect(() => {
    if (isCameraActive && stream) {
      console.log("Assigning stream to video elements...");
      
      const assignStream = async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
            console.log("HUD Video playing");
          } catch (e) {
            console.error("HUD Video play error:", e);
          }
        }
        
        if (bgVideoRef.current) {
          bgVideoRef.current.srcObject = stream;
          try {
            await bgVideoRef.current.play();
            console.log("Background Video playing");
          } catch (e) {
            console.error("Background Video play error:", e);
          }
        }
      };
      
      assignStream();
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const detected = await detectIngredients(file);
      setIngredients(detected);
      stopCamera();
      router.push("/ingredients");
    } catch (err) {
      console.error(err);
      setError("Neural analysis failed. Unable to parse upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Match canvas size to video feed
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and send to API
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
        
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          const detected = await detectIngredients(file);
          setIngredients(detected);
          stopCamera();
          router.push("/ingredients");
        } else {
          throw new Error("Failed to capture image from lens.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Optical mismatch. Unable to parse neural feed.");
    } finally {
      setLoading(false);
    }
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth - 0.5) * 30); 
      mouseY.set((e.clientY / innerHeight - 0.5) * 30);
    };
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <DesktopPreviewWrapper
      title="Cinematic Optical Processing"
      subtitle="The camera view is active. Your phone's lens feeds directly into our neural net to parse ingredients instantly."
      bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuArktJU2_uYJKTFtDcdQKmNmC2Z2B5PbQ8kzSOOhXvot4ayNeiZam3TP3Ei7NnMTkPSK38cX9tCiKEQZ7LrzmtYo5F4Dp-Fr2uXCvP0m2nSdEOAwaeLf_wYuR0GZMY4ufODeJOtmyxOg1ZGVrjpK2jv0hEpPqiji2OoJov9bXl6d0gHM1i1lyV7y5xXwp5-OrWEe-WK1sU2lIqoC8NZt4Dh30mwflDeYiLFT9w9P6DMFa7hc0Im--SOKWc6uVH26C06a8Mr9hUkB3A"
    >
      <div className="bg-[#0a0a0a] min-h-screen relative overflow-hidden selection:bg-none">
      
      {/* 
        Ultra Cinematic Viewport Camera
      */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          style={{ x: smoothX, y: smoothY }}
          className="relative w-[110vw] h-[110vh]"
        >
          {isCameraActive ? (
            <video
              ref={bgVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover grayscale-[0.3]"
              style={{ filter: "blur(10px)" }} // Keeping the cinematic blur as requested by UI style
            />
          ) : (
            <motion.img 
              initial={{ scale: 1.3, filter: "blur(40px)" }}
              animate={{ scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 2.5, ease: CINEMATIC_EASE }}
              alt="Lens Feed" 
              className="w-full h-full object-cover grayscale-[0.3]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArktJU2_uYJKTFtDcdQKmNmC2Z2B5PbQ8kzSOOhXvot4ayNeiZam3TP3Ei7NnMTkPSK38cX9tCiKEQZ7LrzmtYo5F4Dp-Fr2uXCvP0m2nSdEOAwaeLf_wYuR0GZMY4ufODeJOtmyxOg1ZGVrjpK2jv0hEpPqiji2OoJov9bXl6d0gHM1i1lyV7y5xXwp5-OrWEe-WK1sU2lIqoC8NZt4Dh30mwflDeYiLFT9w9P6DMFa7hc0Im--SOKWc6uVH26C06a8Mr9hUkB3A" 
            />
          )}
        </motion.div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_#050505_95%)] opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <header className="fixed top-0 w-full z-[100] flex justify-between items-center px-8 lg:px-16 h-28 pointer-events-none">
        <div className="flex items-center gap-6">
          <Link href="/" className="pointer-events-auto flex items-center justify-center w-12 h-12 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 active:scale-90 transition-all shadow-2xl">
            <span className="material-symbols-outlined text-white text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-[0.2em] text-white/90 italic">OPTIC<span className="text-primary italic">.</span></h1>
            <span className="text-[8px] font-black tracking-[0.4em] text-primary uppercase">{isCameraActive ? "Sensor Active" : "Sensor Offline"}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ opacity: isCameraActive ? [1, 0.4, 1] : 0.2 }} 
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${isCameraActive ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-white/20"}`}></div>
            <span className={`uppercase text-[8px] tracking-[0.3em] font-black ${isCameraActive ? "text-red-500" : "text-white/20"}`}>Live</span>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 w-full h-[100dvh] flex flex-col items-center justify-center pt-20">
        
        <div className="relative w-[320px] h-[480px] md:w-[480px] md:h-[600px] flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: CINEMATIC_EASE }}
            className="w-full h-full relative"
          >
            <div className="absolute inset-0 bg-[#000]/10 backdrop-blur-[1px] shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] border border-white/5 rounded-3xl overflow-hidden">
               {/* Real Camera Feed inside HUD */}
               {isCameraActive && (
                 <video
                   ref={videoRef}
                   autoPlay
                   playsInline
                   muted
                   className="w-full h-full object-cover"
                 />
               )}
               
               {/* Scanning Line */}
               {isCameraActive && (
                 <motion.div 
                   animate={{ top: ["0%", "100%", "0%"] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_0_15px_rgba(245,158,11,1)] z-10"
                 />
               )}

               {/* Camera Error or Start Prompt */}
               {!isCameraActive && !loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a]/60 backdrop-blur-md">
                   {cameraError ? (
                     <>
                       <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
                       <p className="text-white text-sm font-bold mb-2">CRITICAL ERROR</p>
                       <p className="text-white/60 text-xs leading-relaxed">{cameraError}</p>
                       <button 
                         onClick={startCamera}
                         className="mt-6 px-6 py-2 bg-primary/20 border border-primary/40 rounded-full text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/30 transition-all"
                       >
                         Retry Initialization
                       </button>
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="mt-4 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all"
                       >
                         Or upload from storage
                       </button>
                     </>
                   ) : (
                     <>
                       <span className="material-symbols-outlined text-primary/60 text-5xl mb-6 animate-pulse">videocam</span>
                       <p className="text-white/80 text-xs font-black uppercase tracking-[0.3em] mb-8">Ready for Optical Scan</p>
                       <div className="flex flex-col gap-4 items-center">
                         <button 
                           onClick={startCamera}
                           className="px-10 py-4 bg-primary text-black rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(245,158,11,0.3)] active:scale-95 transition-all"
                         >
                           Initialize Sensor
                         </button>
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2"
                         >
                           <span className="material-symbols-outlined text-sm">upload</span>
                           Upload from Gallery
                         </button>
                       </div>
                     </>
                   )}
                 </div>
               )}
            </div>

            {[
              "top-6 left-6 border-t-[3px] border-l-[3px]",
              "top-6 right-6 border-t-[3px] border-r-[3px]",
              "bottom-6 left-6 border-b-[3px] border-l-[3px]",
              "bottom-6 right-6 border-b-[3px] border-r-[3px]"
            ].map((classes, i) => (
              <motion.div 
                key={i}
                animate={{ opacity: isCameraActive ? [0.6, 1, 0.6] : 0.2 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                className={`absolute w-10 h-10 border-primary/60 rounded-sm ${classes}`}
              />
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: CINEMATIC_EASE }}
            className="absolute -bottom-16 w-full flex flex-col items-center gap-4"
          >
            <div className="h-px w-8 bg-primary/30" />
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em] italic">
              {isCameraActive ? "Tracking Locked" : "Awaiting Feed"}
            </p>
          </motion.div>

          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-3xl flex flex-col items-center justify-center rounded-3xl overflow-hidden"
              >
                <div className="relative flex flex-col items-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full mb-6"
                  />
                  <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] italic animate-pulse">Neural Processing</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 1, ease: CINEMATIC_EASE }}
          className="absolute right-8 bottom-32 flex flex-col gap-6 items-center z-[100] pointer-events-auto"
        >
          {[
            { icon: "upload", label: "Upload", action: () => fileInputRef.current?.click(), active: true },
            { icon: "flash_on", label: "Flash", active: isCameraActive }, 
            { icon: "grid_on", label: "Grid", active: isCameraActive }, 
          ].map((item) => (
            <motion.button 
              key={item.label}
              whileTap={{ scale: 0.9 }}
              disabled={!item.active}
              onClick={item.action}
              className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white/50 active:text-primary active:border-primary/40 transition-all shadow-2xl disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            </motion.button>
          ))}
        </motion.div>
      </main>

      <div className="absolute bottom-12 left-0 right-0 z-[110] flex flex-col items-center pointer-events-none">
        <button 
          onClick={handleCapture}
          disabled={loading || !isCameraActive}
          className="pointer-events-auto group disabled:opacity-50 disabled:pointer-events-none"
        >
          <motion.div 
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 20 }}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <motion.div 
               animate={{ scale: isCameraActive ? [1, 1.1, 1] : 1, opacity: isCameraActive ? [0.2, 0.4, 0.2] : 0.1 }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 ring-4 ring-primary opacity-20 rounded-full"
            />
            
            <div className="w-16 h-16 rounded-full border-[3px] border-primary/40 flex items-center justify-center bg-primary/5 group-active:bg-primary/20 transition-all duration-500">
              <div className={`w-10 h-10 rounded-full bg-primary ${isCameraActive ? "shadow-[0_0_30px_rgba(245,158,11,0.6)]" : "opacity-30"}`}></div>
            </div>
          </motion.div>
        </button>
      </div>

      {/* Hidden inputs and canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        accept="image/*" 
        className="hidden" 
      />
      
      </div>
    </DesktopPreviewWrapper>
  );
}

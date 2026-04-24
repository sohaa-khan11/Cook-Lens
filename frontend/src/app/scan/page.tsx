"use client";

import { motion, AnimatePresence } from "framer-motion";
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
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access denied. Please enable permissions.");
      } else {
        setCameraError("Camera not available. Please use upload.");
      }
    }
  };

  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    return () => {
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
      const detected = await detectIngredients(file);
      setIngredients(detected);
      stopCamera();
      router.push("/ingredients");
    } catch (err) {
      setError("Neural analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

    try {
      setLoading(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
        
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          const detected = await detectIngredients(file);
          setIngredients(detected);
          stopCamera();
          router.push("/ingredients");
        }
      }
    } catch (err) {
      setError("Optical mismatch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen w-full flex flex-col relative overflow-hidden selection:bg-none">
      
      {/* Full Screen Camera Feed */}
      <div className="absolute inset-0 z-0">
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-neutral-900 flex items-center justify-center">
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              alt="Lens Feed" 
              className="absolute inset-0 w-full h-full object-cover z-0" 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" 
            />
          </div>
        )}
        
        {/* Scrims and Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-[1]" />
        
        {/* Scanning Line */}
        {isCameraActive && (
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_0_15px_rgba(245,158,11,1)] z-[2]"
          />
        )}
      </div>

      <header className="fixed top-0 w-full z-20 flex justify-between items-center px-4 h-20 pointer-events-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="pointer-events-auto flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-white text-[20px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-[0.2em] text-white/90 italic">OPTIC<span className="text-primary">.</span></h1>
            <span className="text-[7px] font-black tracking-[0.4em] text-primary uppercase">{isCameraActive ? "Sensor Active" : "Sensor Offline"}</span>
          </div>
        </div>
        
        <motion.div 
          animate={{ opacity: isCameraActive ? [1, 0.4, 1] : 0.2 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
          className={`flex items-center gap-2 px-3 py-1 border rounded-full ${isCameraActive ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}
        >
          <div className={`w-1 h-1 rounded-full ${isCameraActive ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-white/20"}`}></div>
          <span className={`uppercase text-[7px] tracking-[0.3em] font-black ${isCameraActive ? "text-red-500" : "text-white/20"}`}>Live</span>
        </motion.div>
      </header>

      {/* Main UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-3xl flex flex-col items-center justify-center"
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

        {/* HUD Corners */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            "top-20 left-4 border-t-[2px] border-l-[2px]",
            "top-20 right-4 border-t-[2px] border-r-[2px]",
            "bottom-40 left-4 border-b-[2px] border-l-[2px]",
            "bottom-40 right-4 border-b-[2px] border-r-[2px]"
          ].map((classes, i) => (
            <motion.div 
              key={i}
              animate={{ opacity: isCameraActive ? [0.4, 0.8, 0.4] : 0.1 }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              className={`absolute w-8 h-8 border-primary/40 rounded-sm ${classes}`}
            />
          ))}
        </div>

        {/* Bottom Controls Overlay */}
        <div className="mt-auto pointer-events-auto absolute bottom-0 left-0 right-0 px-4 pb-6 flex flex-col gap-3">
          
          {/* Offline State */}
          {!isCameraActive && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center mb-4"
            >
              <span className="material-symbols-outlined text-primary/60 text-4xl mb-4 animate-pulse">
                {cameraError ? "error" : "videocam"}
              </span>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                {cameraError ? "Hardware Alert" : "Neural Link Ready"}
              </p>
              {cameraError && (
                <p className="text-red-500/80 text-[10px] font-medium mb-6 px-4">
                  {cameraError}
                </p>
              )}
              {!cameraError && (
                <p className="text-white/40 text-[10px] font-medium mb-6 px-4">
                  Align ingredients within the frame for optimal identification.
                </p>
              )}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={startCamera}
                  className="w-full min-h-[52px] bg-primary text-black rounded-xl text-[14px] font-black uppercase tracking-[0.1em] active:scale-95 transition-all"
                >
                  {cameraError ? "Retry Connection" : "Initialize Lens"}
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[52px] text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Gallery Access
                </button>
              </div>
            </motion.div>
          )}

          {/* Active Controls */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[52px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/60 active:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined">upload</span>
            </button>
            
            <button 
              onClick={handleCapture}
              disabled={!isCameraActive || loading}
              className="flex-[3] min-h-[52px] bg-primary text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
            >
              <span>Capture Frame</span>
            </button>

            <button 
              className="flex-1 min-h-[52px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/60 active:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined">grid_on</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}

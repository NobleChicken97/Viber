"use client";

import * as React from "react";
import { Camera, X } from "lucide-react";
import { createTimeline } from "animejs";
import { cn } from "@/lib/utils";
import type { Mood } from "@/lib/moodTheme";
import { useFaceApi } from "@/hooks/useFaceApi";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodDetected: (mood: Mood) => void;
}

export function CameraModal({ isOpen, onClose, onMoodDetected }: CameraModalProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [permission, setPermission] = React.useState<"idle" | "granted" | "denied">("idle");
  const [scanning, setScanning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [feedback, setFeedback] = React.useState("Initializing...");
  
  const detectedMoodsRef = React.useRef<Mood[]>([]);
  
  const { mlState, detectMood } = useFaceApi();

  const stopCamera = React.useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const finish = React.useCallback(
    (mood: Mood) => {
      stopCamera();
      onMoodDetected(mood);
    },
    [onMoodDetected, stopCamera]
  );

  const startScanning = React.useCallback(() => {
    setScanning(true);
    setFeedback("ALIGNING FACE");
    detectedMoodsRef.current = []; 

    const captureAndDetect = () => {
      try {
        setFeedback("ANALYZING...");
        const moods = detectedMoodsRef.current;
        console.log("All polled moods:", moods);
        
        let finalMood: Mood;
        if (moods.length > 0) {
          const counts = moods.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          finalMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as Mood;
        } else {
          console.warn("No faces detected during scanning, falling back to random.");
          const moodList: Mood[] = ["sad", "calm", "romantic", "happy", "energetic"];
          finalMood = moodList[Math.floor(Math.random() * moodList.length)];
        }

        setFeedback(`DETECTED: ${finalMood.toUpperCase()}`);
        setTimeout(() => finish(finalMood), 500);
      } catch (error) {
        console.error(error);
        const moodList: Mood[] = ["sad", "calm", "romantic", "happy", "energetic"];
        finish(moodList[Math.floor(Math.random() * moodList.length)]);
      }
    };

    const tl = createTimeline({
      onUpdate: (t) => setProgress(Math.round(t.progress * 100)),
    });

    tl.add({
      duration: 1000,
      onBegin: () => setFeedback("SENSING VIBE"),
    })
      .add({
        duration: 1500,
        onBegin: () => setFeedback("CAPTURING..."),
      })
      .add({
        duration: 500,
        onComplete: () => {
          captureAndDetect();
        },
      });
  }, [finish]);

  const requestCamera = React.useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not available. Make sure you are using localhost or HTTPS.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setPermission("granted");
        setTimeout(() => {
          startScanning();
        }, 500);
      }
    } catch (err: unknown) {
      console.error(err);
      alert("Camera Error: " + (err instanceof Error ? err.message : String(err)));
      setPermission("denied");
    }
  }, [startScanning]);

  React.useEffect(() => {
    if (isOpen) {
      setPermission("idle");
      setScanning(false);
      setProgress(0);
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (scanning && permission === "granted") {
      intervalId = setInterval(async () => {
        if (videoRef.current) {
          const result = await detectMood(videoRef.current);
          if (result) {
            detectedMoodsRef.current.push(result);
          }
        }
      }, 200); 
    }
    return () => clearInterval(intervalId);
  }, [scanning, permission, detectMood]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className={cn(
          "relative flex w-full max-w-md flex-col items-center overflow-hidden border-2 border-white bg-black shadow-2xl",
          "transition-all duration-500"
        )}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black text-white hover:bg-white hover:text-black border border-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative aspect-3/4 w-full bg-black">
          {permission === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500 text-white">
              <div className="mb-6 p-4 border border-white rounded-full">
                <Camera size={32} />
              </div>
              <h3 className="mb-3 text-xl font-black uppercase tracking-widest">Enable Camera</h3>
              <p className="mb-8 text-sm font-mono opacity-70 leading-relaxed">
                We need 3 seconds of video to sense your vibe. <br/>
                <span className="opacity-50 mt-2 block text-xs">Privacy first. No data saved.</span>
              </p>
              
              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={requestCamera} 
                  disabled={mlState === 'loading' || mlState === 'idle'}
                  className={cn(
                    "w-full bg-white text-black font-black uppercase py-4 transition-all",
                    (mlState === 'loading' || mlState === 'idle') ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 hover:scale-[1.02]"
                  )}
                >
                  {mlState === 'loading' ? `Loading ML Model...` : 'Allow Camera'}
                </button>
                <button 
                  onClick={handleClose}
                  className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                  Skip, pick manually
                </button>
              </div>
            </div>
          )}

          {permission === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white animate-in zoom-in-95">
               <Camera size={48} className="mb-4 opacity-20" />
               <p className="mb-6 font-mono">Permission denied.</p>
               <button 
                 onClick={handleClose}
                 className="px-6 py-3 bg-white text-black font-bold uppercase"
               >
                 Pick Mood Manually
               </button>
            </div>
          )}

          <div className={cn("absolute inset-0 transition-opacity duration-300", permission === "granted" ? "opacity-100" : "opacity-0 pointer-events-none")}>
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               className={cn("w-full h-full object-cover mirror grayscale contrast-125", scanning ? "opacity-100" : "opacity-50")}
               style={{ transform: "scaleX(-1)" }}
             />
             
             <canvas ref={canvasRef} className="hidden" />
             
             {scanning && (
               <div className="absolute inset-0 flex flex-col items-center justify-between py-12 pointer-events-none z-10">
                  <div 
                    className="w-64 h-64 border-2 border-white rounded-full transition-all duration-700"
                    style={{
                       boxShadow: `0 0 ${20 + progress/3}px rgba(255,255,255,0.5)`
                    }}
                  />
                  
                  <div className="flex flex-col items-center gap-3 w-full px-12">
                    <div className="text-sm font-black tracking-widest text-white uppercase bg-black/50 px-2 py-1">
                      {feedback}
                    </div>
                    
                    <div className="w-full h-2 bg-white/20 overflow-hidden">
                       <div 
                         className="h-full bg-white transition-all duration-100 ease-linear"
                         style={{ width: `${progress}%` }}
                       />
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
        
        <div className="w-full bg-black text-white p-4 text-center border-t border-white/20">
          <p className="text-[10px] uppercase tracking-widest opacity-50">
            On-Device Analysis • Secure
          </p>
        </div>
      </div>
    </div>
  );
}

// made by arpan

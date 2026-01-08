"use client";

import * as React from "react";
import { Camera, X } from "lucide-react";
import { createTimeline } from "animejs";
import { MoodButton } from "@/components/ui/MoodButton";
import { cn } from "@/lib/utils";
import type { Mood } from "@/lib/moodTheme";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodDetected: (mood: Mood) => void;
}

export function CameraModal({ isOpen, onClose, onMoodDetected }: CameraModalProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [permission, setPermission] = React.useState<"idle" | "granted" | "denied">("idle");
  const [scanning, setScanning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [feedback, setFeedback] = React.useState("Initializing camera...");

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
    setFeedback("Aligning face...");

    const moodList: Mood[] = ["sad", "calm", "romantic", "happy", "energetic"];

    const tl = createTimeline({
      onUpdate: (t) => setProgress(Math.round(t.progress * 100)),
    });

    tl.add({
      duration: 1000,
      onBegin: () => setFeedback("Sensing vibe..."),
    })
      .add({
        duration: 2000,
        onBegin: () => setFeedback("Analyzing expressions..."),
      })
      .add({
        duration: 1000,
        onBegin: () => setFeedback("Syncing with music..."),
        onComplete: () => {
          const randomMood = moodList[Math.floor(Math.random() * moodList.length)];
          finish(randomMood);
        },
      });
  }, [finish]);

  const requestCamera = React.useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setPermission("granted");
        startScanning();
      }
    } catch (err) {
      console.error(err);
      setPermission("denied");
    }
  }, [startScanning]);

  React.useEffect(() => {
    // Reset permission state when modal opens
    if (isOpen) {
      setPermission("idle");
      setScanning(false);
      setProgress(0);
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className={cn(
          "relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-background shadow-2xl",
          "transition-all duration-500"
        )}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white/50 hover:bg-black/60 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Content Area */}
        <div className="relative aspect-[3/4] w-full bg-black/90">
          
          {permission === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
              <div className="mb-6 rounded-full bg-white/5 p-4 text-foreground/80">
                <Camera size={32} />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Enable Camera</h3>
              <p className="mb-6 text-sm text-foreground/60 leading-relaxed">
                Viber needs 3–5 seconds of camera access to sense your mood. <br/>
                <span className="text-foreground/40 mt-2 block text-xs">No photos are saved. Everything happens on your device.</span>
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <MoodButton onClick={requestCamera} className="w-full">
                  Allow Camera
                </MoodButton>
                <button 
                  onClick={handleClose}
                  className="text-xs uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                >
                  Skip, pick manually
                </button>
              </div>
            </div>
          )}

          {permission === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-foreground/60 animate-in zoom-in-95">
               <Camera size={48} className="mb-4 opacity-20" />
               <p className="mb-6">Permission denied or unavailable.</p>
               <MoodButton onClick={handleClose}>Pick Mood Manually</MoodButton>
            </div>
          )}

          <div className={cn("absolute inset-0", permission === "granted" ? "opacity-100" : "opacity-0")}>
             <video 
               ref={videoRef}
               autoPlay 
               playsInline 
               muted 
               className={cn("w-full h-full object-cover mirror", scanning ? "opacity-100" : "opacity-0")}
               style={{ transform: "scaleX(-1)" }}
             />
             
             {/* Scanning Overlay */}
             {scanning && (
               <div className="absolute inset-0 flex flex-col items-center justify-between py-12 pointer-events-none z-10">
                  {/* Face Guide Frame */}
                  <div 
                    className={cn(
                      "w-64 h-64 border-2 border-white/20 rounded-full transition-all duration-700 backdrop-blur-[2px]",
                      "border-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))]"
                    )} 
                    style={{
                       boxShadow: `0 0 ${20 + progress/3}px hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))`
                    }}
                  />
                  
                  {/* Status Text & Progress */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-sm font-medium tracking-wide text-white/90 uppercase drop-shadow-md">
                      {feedback}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                       <div 
                         className="h-full bg-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] transition-all duration-100 ease-linear shadow-[0_0_10px_currentColor]"
                         style={{ width: `${progress}%` }}
                       />
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
        
        {/* Privacy Note */}
        <div className="w-full bg-white/5 p-4 text-center border-t border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-foreground/40">
            Privacy First • On-Device Only • No Storage
          </p>
        </div>
      </div>
    </div>
  );
}

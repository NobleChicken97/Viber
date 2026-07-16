'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFaceApi } from '@/hooks/useFaceApi';
import { MoodThemeProvider } from '@/components/MoodThemeProvider';
import type { Mood } from '@/lib/moodTheme';
import { Disc3, Music2, AudioWaveform, Headphones, Camera } from 'lucide-react';

const MOODS: Array<{ id: Mood; label: string; emoji: string }> = [
  { id: 'happy', label: 'Happy', emoji: '☀️' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'calm', label: 'Peaceful', emoji: '🌿' },
  { id: 'sad', label: 'Melancholic', emoji: '💙' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
];

export default function Home() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [cameraState, setCameraState] = useState<"idle" | "granted" | "denied" | "scanning">("idle");
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const detectedMoodsRef = useRef<Mood[]>([]);
  const { mlState, detectMood } = useFaceApi();

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const finish = useCallback((mood: Mood) => {
    stopCamera();
    router.push(`/player?mood=${mood}`);
  }, [router, stopCamera]);

  const startScanning = useCallback(() => {
    setCameraState("scanning");
    setFeedback("SENSING VIBE");
    detectedMoodsRef.current = [];

    let p = 0;
    const interval = setInterval(() => {
      p += 2; 
      setProgress(p);
      
      if (p === 30) setFeedback("CAPTURING...");
      if (p === 70) setFeedback("ANALYZING...");
      
      if (p >= 100) {
        clearInterval(interval);
        
        const moods = detectedMoodsRef.current;
        let finalMood: Mood | null = null;
        if (moods.length > 0) {
          const counts = moods.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          finalMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as Mood;
        }

        if (finalMood) {
          setFeedback(`DETECTED: ${finalMood.toUpperCase()}`);
          setTimeout(() => finish(finalMood as Mood), 600);
        } else {
          setFeedback(`NO FACE DETECTED.`);
          setTimeout(() => setCameraState("idle"), 1500);
        }
      }
    }, 60);

  }, [finish]);

  const requestCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not available.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraState("granted");
        setTimeout(() => startScanning(), 500);
      }
    } catch (err: unknown) {
      console.error(err);
      setCameraState("denied");
    }
  }, [startScanning]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (cameraState === "scanning") {
      intervalId = setInterval(async () => {
        if (videoRef.current) {
          const result = await detectMood(videoRef.current);
          if (result) detectedMoodsRef.current.push(result);
        }
      }, 200);
    }
    return () => clearInterval(intervalId);
  }, [cameraState, detectMood]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-background text-foreground overflow-hidden relative selection:bg-[var(--accent)] selection:text-white">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />
      
      {}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 opacity-[0.03] animate-[spin_40s_linear_infinite]">
          <Disc3 size={400} strokeWidth={0.5} />
        </div>
        <div className="absolute -bottom-20 -right-20 opacity-[0.02] animate-[spin_60s_linear_infinite]">
          <Disc3 size={600} strokeWidth={0.5} />
        </div>
        <div className="absolute top-20 right-1/4 opacity-[0.05] animate-pulse">
          <AudioWaveform size={200} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-1/4 left-10 opacity-[0.04]">
          <Music2 size={150} strokeWidth={0.5} />
        </div>
        <div className="absolute top-1/2 right-10 opacity-[0.03]">
          <Headphones size={250} strokeWidth={0.5} />
        </div>
        
        {}
        <div className="absolute inset-0 bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] mask-image:linear-gradient(to_bottom,white,transparent)" />
      </div>
      
      {}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />

      {}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-foreground/5 z-10 bg-background/60 backdrop-blur-3xl shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]">
        
        <div className="flex flex-col gap-2">
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-mono flex items-center gap-4">
            <span>Viber OS 0.1.0</span> 
            <div className="h-[1px] w-8 bg-foreground/30" />
            <AudioWaveform size={14} className="text-[var(--accent)]" />
          </div>
        </div>

        <div className="flex flex-col gap-4 my-auto">
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8" style={{ fontFamily: '"Syne", sans-serif' }}>
            V I <br /> B E R
          </h1>
          
          <div className="flex flex-col gap-6 max-w-sm">
            <p className="text-sm tracking-[0.2em] uppercase font-bold text-foreground/80 leading-relaxed">
              Music that feels what you feel.
            </p>
            <div className="h-[1px] w-12 bg-foreground/30" />
            <div className="text-xs font-mono tracking-widest text-foreground/50 flex flex-col gap-4">
              <p>VIBER OS IS AN EXPERIMENTAL AI INTERFACE THAT READS YOUR FACIAL EXPRESSIONS ENTIRELY ON-DEVICE TO CURATE A PERSONALIZED 12-SONG MOOD JOURNEY.</p>
            </div>
          </div>
        </div>

        {}
        <div className="flex flex-wrap items-center gap-6 text-[10px] tracking-[0.3em] uppercase font-bold text-foreground/40">
          <button onClick={() => router.push('/settings')} className="hover:text-foreground transition-colors">SETTINGS</button>
        </div>
      </div>

      {}
      <div className="flex-1 relative flex flex-col z-10 bg-background/40 backdrop-blur-xl">
        
        {}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover mirror grayscale contrast-[1.2] transition-opacity duration-1000 ${cameraState === "idle" || cameraState === "denied" ? "opacity-0" : "opacity-30"}`}
          style={{ transform: "scaleX(-1)", mixBlendMode: "luminosity" }}
        />
        
        <div className="relative z-20 w-full h-full flex flex-col justify-center items-center p-8 md:p-16">
          
          {cameraState === "idle" && (
            <div className="flex flex-col w-full max-w-md gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase text-foreground/40 mb-2 border-b border-foreground/10 pb-4">
                  <Camera size={12} /> Option 01 
                </div>
                <button 
                  onClick={requestCamera}
                  disabled={mlState === 'loading' || mlState === 'idle'}
                  className={`w-full group relative flex flex-col md:flex-row items-start md:items-center justify-between p-8 border border-foreground/10 bg-background/50 hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-all duration-500 rounded-xl overflow-hidden ${(mlState === 'loading' || mlState === 'idle') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-2xl font-bold tracking-widest uppercase relative z-10">
                    {mlState === 'loading' ? 'LOADING ML...' : 'SENSE VIBE'}
                  </span>
                  <span className="text-xs font-mono opacity-50 group-hover:opacity-100 relative z-10 mt-2 md:mt-0 tracking-[0.2em]">[ ALLOW CAMERA ]</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase text-foreground/40 mb-2 border-b border-foreground/10 pb-4">
                  <Music2 size={12} /> Option 02 
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => router.push(`/player?mood=${mood.id}`)}
                      className="w-full flex items-center justify-between py-4 px-6 border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/5 hover:border-foreground/20 text-foreground/70 hover:text-foreground transition-all duration-300 rounded-lg group"
                    >
                      <span className="text-xs tracking-[0.3em] uppercase font-bold">{mood.label}</span>
                      <span className="text-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-sm">
                        {mood.emoji}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {(cameraState === "granted" || cameraState === "scanning") && (
            <div className="flex flex-col w-full max-w-md gap-8 animate-in zoom-in-95 duration-1000">
              <div className="text-center font-mono text-xs tracking-[0.5em] text-foreground/80 bg-background/60 py-4 border border-foreground/10 backdrop-blur-sm rounded-lg flex items-center justify-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                {feedback}
              </div>
              <div className="w-full h-1 bg-foreground/10 overflow-hidden rounded-full">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-100 ease-linear shadow-[0_0_15px_var(--accent)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {cameraState === "denied" && (
            <div className="text-center flex flex-col items-center p-8 border border-red-500/20 bg-red-500/5 rounded-xl backdrop-blur-sm animate-in fade-in">
              <span className="text-sm font-mono tracking-widest text-red-500 mb-6">
                CAMERA ACCESS DENIED. <br /> PLEASE SELECT MOOD MANUALLY.
              </span>
              <button 
                onClick={() => setCameraState("idle")} 
                className="w-full py-4 text-xs font-bold tracking-[0.3em] uppercase border border-foreground/20 hover:bg-foreground/5 transition-colors rounded-lg"
              >
                GO BACK
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

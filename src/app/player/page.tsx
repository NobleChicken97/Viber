"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, Play, Pause, SkipForward, Volume2, Settings, MoreHorizontal } from "lucide-react";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodSlider } from "@/components/ui/MoodSlider";
import { MoodButton } from "@/components/ui/MoodButton";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { SessionPlayer, useSessionPlayerControls } from "@/components/SessionPlayer";
import type { Mood } from "@/lib/moodTheme";

function PlayerContent() {
  const params = useSearchParams();
  const router = useRouter();
  const startMood = (params.get("mood") as Mood) || "calm";
  const upliftEnabled = params.get("uplift") === "true";
  
  const { state, dispatch } = useSession();
  const controls = useSessionPlayerControls();
  const currentSong = state.queue[state.currentIndex];

  // Initialize session on mount
  useEffect(() => {
    if (state.queue.length === 0) {
      dispatch({ type: "INITIALIZE", payload: { startMood, upliftEnabled } });
    }
  }, [dispatch, startMood, upliftEnabled, state.queue.length]);

  if (!currentSong) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/50">Loading your vibe session...</p>
      </div>
    );
  }

  const nextSongs = state.queue.slice(state.currentIndex + 1, state.currentIndex + 4);

  return (
    <>
      <SessionPlayer />
      <MoodThemeProvider 
        startMood={startMood} 
        upliftEnabled={upliftEnabled} 
        countedSongIndex={state.countedSongs}
        songLimit={12}
      />

      <div className="min-h-screen flex flex-col p-6 sm:px-8 sm:py-10 max-w-lg mx-auto h-full animate-in fade-in duration-1000">
        
        {/* Header */}
        <div className="flex justify-between items-center text-foreground/50 mb-6 sm:mb-8">
           <button onClick={() => router.push('/')} className="hover:text-foreground transition-colors">
             <span className="text-xs uppercase tracking-widest">Exit Session</span>
           </button>
           <div className="flex items-center gap-4">
             <button
               onClick={() => router.push(`/camera?mood=${startMood}`)}
               className="hover:text-foreground transition-colors"
               aria-label="Re-detect vibe"
               title="Re-detect vibe"
             >
               <Camera size={20} />
             </button>
             <button onClick={() => router.push('/settings')} className="hover:text-foreground transition-colors" aria-label="Settings">
               <Settings size={20} />
             </button>
           </div>
        </div>

        {/* Album Art Area - Mood Visualizer with Hidden YouTube Player */}
        <div className="flex-1 flex items-center justify-center mb-10 w-full min-h-[300px]">
           <div className="relative w-full aspect-square max-w-[320px] sm:max-w-sm rounded-[3rem] overflow-hidden shadow-2xl bg-black/20 ring-1 ring-white/10 group">
              {/* Animated Gradients */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent z-10" />
              
              <div 
                className="absolute inset-0 opacity-70 mix-blend-overlay animate-[spin_12s_linear_infinite]"
                style={{
                  background: `conic-gradient(from 0deg, transparent, hsl(var(--mood-accent-h) var(--mood-accent-s) var(--mood-accent-l)), transparent)`,
                  filter: 'blur(60px)'
                }}
              />
              <div 
                 className="absolute inset-0 opacity-50 mix-blend-color-dodge animate-[pulse_6s_ease-in-out_infinite]"
                 style={{
                    backgroundColor: `hsl(var(--mood-accent-h) var(--mood-accent-s) var(--mood-accent-l))`,
                 }}
              />

              <div className="absolute bottom-8 left-8 z-20">
                 <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 ring-1 ring-white/20">
                    <span className="text-xl animate-bounce duration-[3000ms]">🎵</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Info & Controls */}
        <div className="flex flex-col gap-6">
           
           <div className="flex justify-between items-end">
              <div className="flex-1 mr-4">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 truncate">
                   {currentSong.title}
                </h2>
                <p className="text-lg text-foreground/60 mt-1 truncate">
                   {currentSong.artist}
                </p>
              </div>
              <button className="p-2 text-foreground/40 hover:text-foreground transition-colors">
                 <MoreHorizontal size={24} />
              </button>
           </div>

           {/* Progress Bar */}
           <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
             <div 
               className="h-full bg-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] shadow-[0_0_10px_hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] transition-all duration-200"
               style={{ width: `${(state.listenProgress[state.currentIndex] || 0) * 100}%` }}
             />
           </div>

           {/* Main Controls */}
           <div className="flex items-center justify-between px-2 sm:px-4 py-2">
              <div className="flex items-center gap-3 w-28 text-foreground/50">
                 <Volume2 size={16} />
                 <MoodSlider value={state.volume} onChange={controls.setVolume} className="w-full" />
              </div>

              <div className="flex items-center gap-6">
                 <MoodButton 
                   size="lg" 
                   variant="primary" 
                   onClick={() => state.isPlaying ? controls.pause() : controls.play()}
                   className="h-16 w-16"
                 >
                   {state.isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                 </MoodButton>
                 
                 <button 
                    onClick={controls.skip}
                    disabled={state.countedSongs >= 12}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                    <SkipForward size={24} className="fill-foreground/20" />
                 </button>
              </div>
           </div>
           
           {/* Up Next Preview */}
           <div className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-widest text-foreground/30 mb-3">Up Next</div>
              <div className="space-y-3">
                 {nextSongs.map((song, i) => (
                    <div key={i} className="flex items-center justify-between text-sm opacity-60">
                       <span className="truncate flex-1 font-medium">{song.title}</span>
                       <span className="text-foreground/40 truncate max-w-[100px] text-right">{song.artist}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Session Progress Dots */}
           <div className="flex justify-center gap-1.5 mt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                 <div 
                   key={i}
                   className={`
                      w-1.5 h-1.5 rounded-full transition-all duration-700
                      ${i < state.countedSongs ? 'bg-foreground/40' : i === state.countedSongs ? 'bg-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] scale-150 shadow-[0_0_8px_currentColor]' : 'bg-foreground/10'}
                   `}
                 />
              ))}
           </div>
        </div>

      </div>
    </>
  );
}

export default function PlayerPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Vibes...</div>}>
        <PlayerContent />
      </Suspense>
    </SessionProvider>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Wand2 } from "lucide-react";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodSwitch } from "@/components/ui/MoodSwitch";
import { MoodCard } from "@/components/ui/MoodCard";
import type { Mood } from "@/lib/moodTheme";

export default function SettingsPage() {
  const router = useRouter();
  
  const [uplift, setUplift] = useState(true);

   const moods: Array<{ id: Mood; label: string; glyph: string }> = [
      { id: "sad", label: "Sad", glyph: "499" },
      { id: "calm", label: "Calm", glyph: "33f" },
      { id: "romantic", label: "Romantic", glyph: "495" },
      { id: "happy", label: "Happy", glyph: "31e" },
      { id: "energetic", label: "Energetic", glyph: "4a1" },
   ];
  
  return (
      <div className="relative min-h-screen bg-background text-foreground">
         <MoodThemeProvider startMood="calm" upliftEnabled={uplift} />

      <div className="min-h-screen p-6 sm:p-24 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
       <button 
         onClick={() => router.back()} 
         className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors mb-8 group"
       >
         <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
         Back
       </button>

       <h1 className="text-4xl font-bold mb-2">Settings</h1>
       <p className="text-foreground/60 mb-12 text-lg">Customize your vibe journey.</p>

       <div className="flex flex-col gap-6">
          
          <MoodCard className="flex items-center justify-between">
             <div className="flex gap-4 items-center">
                <div className="p-3 rounded-full bg-white/5 text-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))]">
                   <Wand2 size={24} />
                </div>
                <div>
                   <h3 className="font-semibold text-lg">Mood Uplift</h3>
                   <p className="text-sm text-foreground/50">Gradually shift to happier vibes during session</p>
                </div>
             </div>
             <MoodSwitch checked={uplift} onCheckedChange={setUplift} />
          </MoodCard>

               <MoodCard className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                     <div className="p-3 rounded-full bg-white/5 text-foreground/70">
                        <Camera size={24} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-lg">Re-detect vibe</h3>
                        <p className="text-sm text-foreground/50">Run a quick 3–5 second scan again</p>
                     </div>
                  </div>
                  <button
                     onClick={() => router.push("/camera")}
                     className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-foreground/60 hover:bg-white/10 hover:text-foreground"
                  >
                     Scan
                  </button>
               </MoodCard>

               <MoodCard className="p-6">
                  <div className="mb-4">
                     <h3 className="font-semibold text-lg">Manual mood override</h3>
                     <p className="text-sm text-foreground/50">Skip the scan and pick a vibe directly</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                     {moods.map((m) => (
                        <button
                           key={m.id}
                           onClick={() => router.push(`/player?mood=${m.id}`)}
                           className="group rounded-3xl border border-white/5 bg-white/5 p-5 text-left backdrop-blur-xl transition-all duration-500 hover:bg-white/10 active:scale-[0.99]"
                        >
                           <div className="flex items-center justify-between">
                              <div className="text-2xl grayscale transition-all duration-500 group-hover:grayscale-0">
                                 {m.glyph}
                              </div>
                              <div className="h-8 w-8 rounded-full bg-foreground/5" />
                           </div>
                           <div className="mt-4 text-sm font-medium text-foreground/80 group-hover:text-foreground">
                              {m.label}
                           </div>
                        </button>
                     ))}
                  </div>
               </MoodCard>
          
          <div className="mt-8 pt-8 border-t border-white/5">
             <h3 className="text-sm font-medium text-foreground/40 uppercase tracking-widest mb-4">About</h3>
             <div className="space-y-4 text-sm text-foreground/60">
                <div className="flex justify-between">
                   <span>Version</span>
                   <span>1.0.0 (MVP)</span>
                </div>
                <div className="flex justify-between">
                   <span>Privacy Policy</span>
                            <button onClick={() => router.push("/privacy")} className="hover:text-foreground underline">
                               Read
                            </button>
                </div>
             </div>
          </div>

       </div>
         </div>
      </div>
  );
}

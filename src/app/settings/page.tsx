"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wand2 } from "lucide-react";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodSwitch } from "@/components/ui/MoodSwitch";
import { useSettings } from "@/lib/settings";
export default function SettingsPage() {
  const router = useRouter();
  const { settings, setSettings, mounted } = useSettings();



  if (!mounted) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden relative">
      <MoodThemeProvider startMood="calm" upliftEnabled={settings.upliftEnabled} />

      {}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-foreground/10 z-10 bg-background/50 backdrop-blur-md">
        
        <div className="flex flex-col gap-2">
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-mono">
            Viber OS 
          </div>
        </div>

        <div className="flex flex-col gap-4 my-auto">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-8" style={{ fontFamily: '"Syne", sans-serif' }}>
            S Y S <br /> T E M
          </h1>
          
          <div className="flex flex-col gap-6 max-w-sm">
            <p className="text-sm tracking-[0.2em] uppercase font-bold text-foreground/80 leading-relaxed">
              Configure your vibe engine.
            </p>
            <div className="h-[1px] w-12 bg-foreground/30" />
            <div className="text-xs font-mono tracking-widest text-foreground/50 flex flex-col gap-4">
              <p>ADJUST THE CORE PARAMETERS OF YOUR MOOD JOURNEYS AND APPLICATION PREFERENCES.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase font-bold text-foreground/50 hover:text-foreground transition-colors group w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </button>
      </div>

      {}
      <div className="flex-1 relative flex flex-col bg-background/20 backdrop-blur-sm z-0 p-8 md:p-16 overflow-y-auto">
        
        {}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 flex flex-col w-full max-w-xl gap-16 mt-8 md:mt-0">
          
          <div className="flex flex-col gap-8">
            <div className="text-[10px] tracking-[0.3em] uppercase text-foreground/40 border-b border-foreground/10 pb-4">
              Configuration 
            </div>

            <div className="flex items-center justify-between p-8 border border-foreground/20 bg-foreground/5">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-foreground/10 text-foreground">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold tracking-[0.2em] uppercase">Mood Uplift</h3>
                  <p className="text-xs font-mono tracking-widest text-foreground/50 mt-1">
                    Gradually shift to happier vibes
                  </p>
                </div>
              </div>
              <MoodSwitch 
                checked={settings.upliftEnabled} 
                onCheckedChange={(v) => setSettings({ upliftEnabled: v })} 
              />
            </div>

            <div className="text-[10px] tracking-[0.3em] uppercase text-foreground/40 border-b border-foreground/10 pb-4 mt-8">
              Configuration 
            </div>

            <div className="flex flex-col gap-4 p-8 border border-foreground/20 bg-foreground/5 text-xs font-mono tracking-widest uppercase">
              <div className="flex justify-between text-foreground/60">
                <span>Version</span>
                <span className="text-foreground">1.0.0 (MVP)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

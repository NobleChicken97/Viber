"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTimeline, stagger } from "animejs";
import { Camera, Music2 } from "lucide-react";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodButton } from "@/components/ui/MoodButton";
import type { Mood } from "@/lib/moodTheme";

export default function Home() {
  const router = useRouter();

  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const moods = useMemo(
    () =>
      [
        { id: "sad" as const, label: "Sad", glyph: "💙" },
        { id: "calm" as const, label: "Calm", glyph: "🌿" },
        { id: "romantic" as const, label: "Romantic", glyph: "💕" },
        { id: "happy" as const, label: "Happy", glyph: "☀️" },
        { id: "energetic" as const, label: "Energetic", glyph: "⚡" },
      ],
    []
  );

  useEffect(() => {
    const heroChildren = heroRef.current ? Array.from(heroRef.current.children) : [];
    const gridChildren = gridRef.current ? Array.from(gridRef.current.children) : [];

    const tl = createTimeline();
    tl.add(heroChildren, {
      translateY: [18, 0],
      opacity: [0, 1],
      delay: stagger(90),
      duration: 1100,
      ease: "outExpo",
    });
    tl.add(
      gridChildren,
      {
        translateY: [12, 0],
        opacity: [0, 1],
        delay: stagger(55),
        duration: 700,
        ease: "outExpo",
      },
      "-=650"
    );
  }, []);

  const goPlayer = (mood: Mood) => {
    router.push(`/player?mood=${mood}`);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div ref={heroRef} className="flex w-full max-w-3xl flex-col items-center gap-6 text-center opacity-100">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-foreground/60 backdrop-blur-sm">
            <Music2 size={12} />
            <span>Viber</span>
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            Music that feels what you feel.
          </h1>

          <p className="max-w-xl text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
            A mood-adaptive music journey that evolves with you. Scan for 3–5 seconds, then let the session breathe.
          </p>

          <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <MoodButton size="lg" onClick={() => router.push("/camera")} className="w-full sm:w-auto shadow-lg shadow-accent/10">
              <Camera className="mr-2 h-5 w-5" />
              Start Vibing
            </MoodButton>
            <MoodButton
              variant="outline"
              size="lg"
              onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto"
            >
              Pick Manually
            </MoodButton>
          </div>

          <div className="mt-4 text-[10px] uppercase tracking-widest text-foreground/30">
            Privacy-first • On-device only • No storage
          </div>
        </div>

        <div className="mt-12 w-full max-w-2xl">
          <div className="mb-4 text-center text-xs uppercase tracking-widest text-foreground/40">
            Manual vibe
          </div>

          <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => goPlayer(m.id)}
                className="group rounded-3xl border border-white/5 bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-500 hover:bg-white/10 active:scale-[0.99]"
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
        </div>

        <div className="mt-10 text-center text-xs uppercase tracking-widest text-foreground/30">
          <button onClick={() => router.push("/privacy")} className="hover:text-foreground">
            Privacy
          </button>
          <span className="mx-2">·</span>
          <span>Built with 3b5</span>
        </div>
      </div>
    </div>
  );
}

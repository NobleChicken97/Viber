"use client";

import { useRouter } from "next/navigation";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodButton } from "@/components/ui/MoodButton";
import { MoodCard } from "@/components/ui/MoodCard";

export default function HowPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-14 sm:px-12">
        <button
          onClick={() => router.push("/")}
          className="mb-10 text-xs uppercase tracking-widest text-foreground/50 hover:text-foreground"
        >
          Back
        </button>

        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">How Viber works</h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-foreground/65 sm:text-lg">
          Viber is designed to feel effortless. No accounts, no noise—just a session that adapts.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <MoodCard className="p-6">
            <div className="text-sm font-semibold">1. Detect your vibe</div>
            <div className="mt-2 text-sm text-foreground/60">
              We use your camera for a few seconds to sense your mood. Everything happens on your device—nothing is stored
              or uploaded.
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">2. Build your music path</div>
            <div className="mt-2 text-sm text-foreground/60">
              Based on your vibe, we create a unique session path. No two sessions are exactly the same.
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">3. Evolve together</div>
            <div className="mt-2 text-sm text-foreground/60">
              As you listen, the experience can gently shift upward—or stay exactly where you are. You’re always in
              control.
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">4. Feel, don’t think</div>
            <div className="mt-2 text-sm text-foreground/60">
              Colors shift. Animations breathe. You won’t notice it happening moment-to-moment—but you’ll feel it.
            </div>
          </MoodCard>
        </div>

        <div className="mt-10">
          <MoodButton size="lg" onClick={() => router.push("/camera")}>
            Start Vibing
          </MoodButton>
        </div>

        <div className="mt-auto pt-10 text-xs uppercase tracking-widest text-foreground/30">
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

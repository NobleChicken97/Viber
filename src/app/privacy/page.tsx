"use client";

import { useRouter } from "next/navigation";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodCard } from "@/components/ui/MoodCard";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-14 sm:px-12">
        <button
          onClick={() => router.back()}
          className="mb-10 text-xs uppercase tracking-widest text-foreground/50 hover:text-foreground"
        >
          Back
        </button>

        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">Privacy</h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-foreground/65 sm:text-lg">
          Viber is privacy-first by design. The goal is simple: sense your vibe without capturing you.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <MoodCard className="p-6">
            <div className="text-sm font-semibold">Camera processing is on-device</div>
            <div className="mt-2 text-sm text-foreground/60">
              If you choose to scan, camera data is processed locally in your browser. Nothing is uploaded.
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">No images or video stored</div>
            <div className="mt-2 text-sm text-foreground/60">
              Viber does not store photos, video, or raw frames. The preview exists only while scanning.
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">Only derived session metadata</div>
            <div className="mt-2 text-sm text-foreground/60">
              At most, the app may keep derived metadata like a selected vibe and session interactions (play/skip).
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">No personal identifiers</div>
            <div className="mt-2 text-sm text-foreground/60">
              No accounts. No emails. No advertising IDs.
            </div>
          </MoodCard>

          <MoodCard className="p-6">
            <div className="text-sm font-semibold">Not intended for children under 13</div>
            <div className="mt-2 text-sm text-foreground/60">
              This experience is not designed for children.
            </div>
          </MoodCard>
        </div>

        <div className="mt-10 text-sm text-foreground/50">
          This is an MVP policy summary and may evolve as features ship.
        </div>

        <div className="mt-auto pt-10 text-xs uppercase tracking-widest text-foreground/30">
          <button onClick={() => router.push("/")} className="hover:text-foreground">
            Home
          </button>
          <span className="mx-2">·</span>
          <button onClick={() => router.push("/how")} className="hover:text-foreground">
            How it works
          </button>
        </div>
      </div>
    </div>
  );
}

// made by arpan

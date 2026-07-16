"use client";

import { useRouter } from "next/navigation";
import { CameraModal } from "@/components/CameraModal";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import type { Mood } from "@/lib/moodTheme";

export default function CameraPage() {
  const router = useRouter();

  const goPlayer = (mood: Mood) => {
    router.push(`/player?mood=${mood}`);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />

      <CameraModal
        isOpen={true}
        onClose={() => router.push("/")}
        onMoodDetected={(mood) => goPlayer(mood)}
      />
    </div>
  );
}

// made by arpan

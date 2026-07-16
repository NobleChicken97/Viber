"use client";

import { useTheme } from "next-themes";

import { useEffect, useRef } from "react";
import {
  computeMoodThemeTarget,
  defaultMood,
  type Mood,
  type MoodThemeTarget,
} from "@/lib/moodTheme";
import {
  distributeMoodPath,
  distributeMoodPathBySongs,
  generateMoodPath,
  moodAtCountedSongIndex,
  moodAtProgress,
  sessionProgress01,
} from "@/lib/moodPath";

type Props = {
  startMood?: Mood;
  upliftEnabled?: boolean;
  songLimit?: number;
  countedSongIndex?: number;
  seed?: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function setCssVars(target: MoodThemeTarget) {
  const root = document.documentElement;

  root.style.setProperty("--mood-bg-h", target.bgH.toFixed(2));
  root.style.setProperty("--mood-bg-s", `${target.bgS.toFixed(2)}%`);
  root.style.setProperty("--mood-bg-l", `${target.bgL.toFixed(2)}%`);

  root.style.setProperty("--mood-fg-h", target.fgH.toFixed(2));
  root.style.setProperty("--mood-fg-s", `${target.fgS.toFixed(2)}%`);
  root.style.setProperty("--mood-fg-l", `${target.fgL.toFixed(2)}%`);

  root.style.setProperty("--mood-accent-h", target.accentH.toFixed(2));
  root.style.setProperty("--mood-accent-s", `${target.accentS.toFixed(2)}%`);
  root.style.setProperty("--mood-accent-l", `${target.accentL.toFixed(2)}%`);

  root.style.setProperty("--mood-contrast", target.contrast.toFixed(3));
  root.style.setProperty("--mood-pulse", target.pulse.toFixed(3));
  root.style.setProperty("--mood-blob", target.blob.toFixed(3));
  root.style.setProperty("--mood-motion", target.motion.toFixed(3));
  const pulseMs = lerp(18000, 7000, target.pulse);
  root.style.setProperty("--mood-pulse-ms", `${pulseMs.toFixed(0)}ms`);

  const ease = target.motion < 0.55 ? "cubic-bezier(0.2, 0.9, 0.2, 1)" : "cubic-bezier(0.1, 0.9, 0.1, 1)";
  root.style.setProperty("--mood-ease", ease);
}

export function MoodThemeProvider({
  startMood = defaultMood,
  upliftEnabled = false,
  songLimit = 12,
  countedSongIndex,
  seed = 1337,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isLightMode = resolvedTheme === 'light';

  const rafId = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const current = useRef<MoodThemeTarget | null>(null);
  const moodSegmentsRef = useRef<ReturnType<typeof distributeMoodPath> | null>(null);
  const moodBucketsRef = useRef<ReturnType<typeof distributeMoodPathBySongs> | null>(null);
  const isLightModeRef = useRef(isLightMode);

  useEffect(() => {
    isLightModeRef.current = isLightMode;
  }, [isLightMode]);

  useEffect(() => {
    const path = generateMoodPath({ startMood, upliftEnabled, seed });
    moodSegmentsRef.current = distributeMoodPath(path);
    moodBucketsRef.current = distributeMoodPathBySongs(path, songLimit);

    const tick = (now: number) => {
      if (start.current == null) start.current = now;
      const elapsed = now - start.current;

      const progress01 = sessionProgress01({ countedSongIndex, countedSongLimit: songLimit });
      const drift01 = (Math.sin(elapsed / 60000) + 1) / 2; // ~1 min cycle
      let mood: typeof startMood;
      if (countedSongIndex != null) {
        const buckets =
          moodBucketsRef.current ??
          distributeMoodPathBySongs([startMood], songLimit);
        mood = moodAtCountedSongIndex(buckets, countedSongIndex);
      } else {
        const segments = moodSegmentsRef.current ?? [{ mood: startMood, start01: 0, end01: 1 }];
        mood = moodAtProgress(segments, progress01);
      }

      const target = computeMoodThemeTarget({
        mood,
        progress01,
        uplift01: upliftEnabled ? 1 : 0,
        drift01,
        isLightMode: isLightModeRef.current,
      });
      const dt = 16; // approx; good enough for smoothing
      const tau = 8000; // ms
      const alpha = 1 - Math.exp(-dt / tau);
      const alphaLightness = 1 - Math.exp(-dt / 300); // 300ms for theme toggles

      if (current.current == null) {
        current.current = target;
      } else {
        current.current = {
          ...current.current,
          bgH: lerp(current.current.bgH, target.bgH, alpha),
          bgS: lerp(current.current.bgS, target.bgS, alpha),
          bgL: lerp(current.current.bgL, target.bgL, alphaLightness),
          fgH: lerp(current.current.fgH, target.fgH, alpha),
          fgS: lerp(current.current.fgS, target.fgS, alpha),
          fgL: lerp(current.current.fgL, target.fgL, alphaLightness),
          accentH: lerp(current.current.accentH, target.accentH, alpha),
          accentS: lerp(current.current.accentS, target.accentS, alpha),
          accentL: lerp(current.current.accentL, target.accentL, alpha),
          contrast: lerp(current.current.contrast, target.contrast, alpha),
          pulse: lerp(current.current.pulse, target.pulse, alpha),
          blob: lerp(current.current.blob, target.blob, alpha),
          motion: lerp(current.current.motion, target.motion, alpha),
        };
      }

      setCssVars(current.current);
      document.documentElement.dataset.mood = mood;

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      start.current = null;
      current.current = null;
      moodSegmentsRef.current = null;
      moodBucketsRef.current = null;
    };
  }, [startMood, upliftEnabled, countedSongIndex, songLimit, seed]);

  return null;
}

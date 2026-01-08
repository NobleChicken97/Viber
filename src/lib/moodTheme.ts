export type Mood = "sad" | "calm" | "romantic" | "happy" | "energetic";

export type MoodThemeTarget = {
  bgH: number;
  bgS: number;
  bgL: number;
  fgH: number;
  fgS: number;
  fgL: number;
  accentH: number;
  accentS: number;
  accentL: number;
  contrast: number; // 0..1
  pulse: number; // 0..1
  blob: number; // 0..1
  motion: number; // 0..1 (snappiness)
};

type ComputeThemeInput = {
  mood: Mood;
  progress01: number; // 0..1, e.g. elapsed/10min
  uplift01: number; // 0..1
  drift01: number; // 0..1 cyclic drift (e.g. sine mapped)
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Shortest-path hue interpolation in degrees.
const lerpHue = (a: number, b: number, t: number) => {
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta * t + 360) % 360;
};

const moodBase: Record<Mood, Omit<MoodThemeTarget, "contrast" | "pulse" | "blob" | "motion">> = {
  sad: {
    bgH: 220,
    bgS: 18,
    bgL: 10,
    fgH: 0,
    fgS: 0,
    fgL: 92,
    accentH: 220,
    accentS: 55,
    accentL: 60,
  },
  calm: {
    bgH: 200,
    bgS: 18,
    bgL: 11,
    fgH: 0,
    fgS: 0,
    fgL: 93,
    accentH: 190,
    accentS: 55,
    accentL: 60,
  },
  romantic: {
    bgH: 330,
    bgS: 16,
    bgL: 11,
    fgH: 0,
    fgS: 0,
    fgL: 93,
    accentH: 338,
    accentS: 60,
    accentL: 62,
  },
  happy: {
    bgH: 45,
    bgS: 16,
    bgL: 12,
    fgH: 0,
    fgS: 0,
    fgL: 93,
    accentH: 46,
    accentS: 70,
    accentL: 60,
  },
  energetic: {
    bgH: 18,
    bgS: 16,
    bgL: 12,
    fgH: 0,
    fgS: 0,
    fgL: 93,
    accentH: 14,
    accentS: 78,
    accentL: 60,
  },
};

const happyishAccent: Pick<MoodThemeTarget, "accentH" | "accentS" | "accentL"> = {
  accentH: moodBase.happy.accentH,
  accentS: moodBase.happy.accentS,
  accentL: moodBase.happy.accentL,
};

export function computeMoodThemeTarget(input: ComputeThemeInput): MoodThemeTarget {
  const progress01 = clamp01(input.progress01);
  const uplift01 = clamp01(input.uplift01);
  const drift01 = clamp01(input.drift01);

  const base = moodBase[input.mood];

  // Long-horizon drift: subtle but noticeable after ~10min.
  // - Increase contrast + saturation slightly
  // - Lift background lightness slightly (more "alive")
  const bgL = base.bgL + lerp(0, 7, progress01);
  const bgS = base.bgS + lerp(0, 6, progress01);

  // Micro drift (cyclic): tiny hue wobble + pulse modulation.
  const hueWobble = lerp(-2, 2, drift01);

  // Optional uplift influences accent hue/sat only (keeps mood subtle, avoids hard jumps).
  const accentH = lerpHue(
    base.accentH + hueWobble,
    happyishAccent.accentH + hueWobble,
    uplift01 * progress01
  );
  const accentS = lerp(base.accentS, happyishAccent.accentS, uplift01 * progress01);
  const accentL = lerp(base.accentL, happyishAccent.accentL, uplift01 * progress01);

  // Snappiness curve: as time passes, interactions feel a bit tighter.
  const motion = lerp(0.35, 0.85, progress01);

  // Background atmosphere controls.
  const contrast = lerp(0.35, 0.65, progress01);
  const pulse = lerp(0.15, 0.55, progress01);
  const blob = lerp(0.35, 0.9, progress01);

  return {
    bgH: (base.bgH + hueWobble + 360) % 360,
    bgS,
    bgL,
    fgH: base.fgH,
    fgS: base.fgS,
    fgL: base.fgL,
    accentH,
    accentS,
    accentL,
    contrast,
    pulse,
    blob,
    motion,
  };
}

export const defaultMood: Mood = "calm";

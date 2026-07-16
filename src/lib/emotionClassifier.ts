import type { Mood } from "@/lib/moodTheme";

/**
 * Simplified emotion classifier for MediaPipe FaceLandmarker.
 *
 * We detect 3 BASE emotions from blendshapes:
 *   - Happy (smiling)
 *   - Sad (frowning, brow raised)
 *   - Calm (neutral / everything else)
 *
 * Then we randomly assign the final Mood:
 *   - Happy  → "happy" or "energetic" (50/50)
 *   - Sad    → "sad" or "romantic"    (50/50)
 *   - Calm   → "calm"
 *
 * This approach is realistic for webcam-based detection where subtle
 * differences between e.g. "sad" and "romantic" aren't reliably detectable.
 */

export interface BlendshapeMap {
  [key: string]: number;
}

type BaseEmotion = "happy" | "sad" | "calm";

/** Convert MediaPipe Categories array to a simple key→value map. */
export function categoriesToMap(
  categories: Array<{ categoryName: string; score: number }>
): BlendshapeMap {
  const map: BlendshapeMap = {};
  for (const c of categories) {
    map[c.categoryName] = c.score;
  }
  return map;
}

/** Safely read a blendshape value, defaulting to 0. */
function bs(map: BlendshapeMap, name: string): number {
  return map[name] ?? 0;
}

/**
 * Score each base emotion from blendshape data.
 */
function scoreBaseEmotions(b: BlendshapeMap): Record<BaseEmotion, number> {
  // ── Happy ──────────────────────────────────────────────────────
  // Smile (mouth corners up). Most reliable facial signal.
  const smileL = bs(b, "mouthSmileLeft");
  const smileR = bs(b, "mouthSmileRight");
  const smile = (smileL + smileR) / 2;
  const cheekSquint = (bs(b, "cheekSquintLeft") + bs(b, "cheekSquintRight")) / 2;
  const happy = smile * 0.75 + cheekSquint * 0.25;

  // ── Sad ────────────────────────────────────────────────────────
  // Strategy: Sad is HARD to detect from specific blendshapes alone.
  // Instead, we use a composite of ALL "non-happy tension" signals:
  //   - Brow inner raise (worry/concern)
  //   - Mouth frown (corners down)
  //   - Mouth press/pucker (lip tension)
  //   - Brow down (concentrated distress)
  //   - Eye look down
  //   - Mouth stretch (grimace)
  // CRITICALLY: we suppress sad when smile is high (you can't be
  // smiling and sad at the same time for our purposes).
  const browInnerUp = bs(b, "browInnerUp");
  const frown = (bs(b, "mouthFrownLeft") + bs(b, "mouthFrownRight")) / 2;
  const mouthPress = (bs(b, "mouthPressLeft") + bs(b, "mouthPressRight")) / 2;
  const mouthPucker = bs(b, "mouthPucker");
  const browDown = (bs(b, "browDownLeft") + bs(b, "browDownRight")) / 2;
  const mouthStretch = (bs(b, "mouthStretchLeft") + bs(b, "mouthStretchRight")) / 2;
  const mouthRollLower = bs(b, "mouthRollLower");
  const mouthShrugLower = bs(b, "mouthShrugLower");
  const eyeLookDown = (bs(b, "eyeLookDownLeft") + bs(b, "eyeLookDownRight")) / 2;

  // Sum up ALL tension indicators
  const rawSum =
    browInnerUp * 0.20 +
    frown * 0.20 +
    mouthPress * 0.15 +
    mouthPucker * 0.10 +
    browDown * 0.10 +
    mouthStretch * 0.05 +
    mouthRollLower * 0.05 +
    mouthShrugLower * 0.05 +
    eyeLookDown * 0.10;

  // Deadzone: natural resting faces often have a raw sum of ~0.05 to 0.10.
  // We subtract this baseline so only *intentional* tension registers.
  const tensionRaw = Math.max(0, rawSum - 0.08);

  // Amplify 4x (since we removed the baseline) and suppress if smiling
  const smileSuppression = Math.max(0, 1 - smile * 3); // drops to 0 at smile=0.33
  const sad = Math.min(1, tensionRaw * 4.0 * smileSuppression);

  // ── Calm ───────────────────────────────────────────────────────
  // Calm only wins when the face is truly relaxed (no smile, no tension).
  const calm = 0.06;

  if (process.env.NODE_ENV === 'development') {
    // Log scores every ~1s (buffer size controls this)
    if (emotionBuffer.length === 0 || emotionBuffer.length === BUFFER_SIZE - 1) {
      console.log(
        `[Emotion Scores] happy: ${happy.toFixed(3)}, sad: ${sad.toFixed(3)}, calm: ${calm.toFixed(3)} | ` +
        `smile: ${smile.toFixed(2)}, frown: ${frown.toFixed(2)}, browUp: ${browInnerUp.toFixed(2)}, tension: ${tensionRaw.toFixed(3)}`
      );
    }
  }

  return { happy, sad, calm };
}

// ── Smoothing buffer ──────────────────────────────────────────────
const BUFFER_SIZE = 5;
const emotionBuffer: BaseEmotion[] = [];

/**
 * Classify blendshapes into a final Mood.
 *
 * Steps:
 * 1. Score happy/sad from blendshapes.
 * 2. Pick base emotion (happy/sad/calm).
 * 3. Smooth over last BUFFER_SIZE readings (majority vote).
 * 4. Randomly branch to final Mood.
 */
export function classifyEmotion(
  categories: Array<{ categoryName: string; score: number }>
): Mood {
  const map = categoriesToMap(categories);
  const scores = scoreBaseEmotions(map);

  // Determine the winning base emotion
  // A base emotion needs to exceed a minimum threshold to win.
  const THRESHOLD = 0.15;
  let base: BaseEmotion = "calm";

  if (scores.happy > THRESHOLD && scores.happy > scores.sad) {
    base = "happy";
  } else if (scores.sad > THRESHOLD && scores.sad > scores.happy) {
    base = "sad";
  }

  // Push into smoothing buffer
  emotionBuffer.push(base);
  if (emotionBuffer.length > BUFFER_SIZE) {
    emotionBuffer.shift();
  }

  // Majority vote over the buffer
  const counts: Record<BaseEmotion, number> = { happy: 0, sad: 0, calm: 0 };
  for (const e of emotionBuffer) {
    counts[e]++;
  }
  let smoothedBase: BaseEmotion = "calm";
  let maxCount = 0;
  for (const [emotion, count] of Object.entries(counts) as [BaseEmotion, number][]) {
    if (count > maxCount) {
      maxCount = count;
      smoothedBase = emotion;
    }
  }

  // Randomly branch to final Mood
  return baseToMood(smoothedBase);
}

/**
 * Map a base emotion to a final Mood with random branching.
 */
function baseToMood(base: BaseEmotion): Mood {
  switch (base) {
    case "happy":
      return Math.random() < 0.5 ? "happy" : "energetic";
    case "sad":
      return Math.random() < 0.5 ? "sad" : "romantic";
    case "calm":
    default:
      return "calm";
  }
}

/**
 * Reset the smoothing buffer (e.g., when starting a new scan session).
 */
export function resetEmotionBuffer(): void {
  emotionBuffer.length = 0;
}

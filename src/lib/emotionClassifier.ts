import type { Mood } from "@/lib/moodTheme";


export interface BlendshapeMap {
  [key: string]: number;
}

type BaseEmotion = "happy" | "sad" | "calm";

export function categoriesToMap(
  categories: Array<{ categoryName: string; score: number }>
): BlendshapeMap {
  const map: BlendshapeMap = {};
  for (const c of categories) {
    map[c.categoryName] = c.score;
  }
  return map;
}

function bs(map: BlendshapeMap, name: string): number {
  return map[name] ?? 0;
}

function scoreBaseEmotions(b: BlendshapeMap): Record<BaseEmotion, number> {
  
  
  const smileL = bs(b, "mouthSmileLeft");
  const smileR = bs(b, "mouthSmileRight");
  const smile = (smileL + smileR) / 2;
  const cheekSquint = (bs(b, "cheekSquintLeft") + bs(b, "cheekSquintRight")) / 2;
  const happy = smile * 0.75 + cheekSquint * 0.25;

  
  
  
  
  
  
  
  
  
  
  
  const browInnerUp = bs(b, "browInnerUp");
  const frown = (bs(b, "mouthFrownLeft") + bs(b, "mouthFrownRight")) / 2;
  const mouthPress = (bs(b, "mouthPressLeft") + bs(b, "mouthPressRight")) / 2;
  const mouthPucker = bs(b, "mouthPucker");
  const browDown = (bs(b, "browDownLeft") + bs(b, "browDownRight")) / 2;
  const mouthStretch = (bs(b, "mouthStretchLeft") + bs(b, "mouthStretchRight")) / 2;
  const mouthRollLower = bs(b, "mouthRollLower");
  const mouthShrugLower = bs(b, "mouthShrugLower");
  const eyeLookDown = (bs(b, "eyeLookDownLeft") + bs(b, "eyeLookDownRight")) / 2;

  
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

  
  
  const tensionRaw = Math.max(0, rawSum - 0.08);

  
  const smileSuppression = Math.max(0, 1 - smile * 3); 
  const sad = Math.min(1, tensionRaw * 4.0 * smileSuppression);

  
  
  const calm = 0.06;

  if (process.env.NODE_ENV === 'development') {
    
    if (emotionBuffer.length === 0 || emotionBuffer.length === BUFFER_SIZE - 1) {
      console.log(
        `[Emotion Scores] happy: ${happy.toFixed(3)}, sad: ${sad.toFixed(3)}, calm: ${calm.toFixed(3)} | ` +
        `smile: ${smile.toFixed(2)}, frown: ${frown.toFixed(2)}, browUp: ${browInnerUp.toFixed(2)}, tension: ${tensionRaw.toFixed(3)}`
      );
    }
  }

  return { happy, sad, calm };
}


const BUFFER_SIZE = 5;
const emotionBuffer: BaseEmotion[] = [];

export function classifyEmotion(
  categories: Array<{ categoryName: string; score: number }>
): Mood {
  const map = categoriesToMap(categories);
  const scores = scoreBaseEmotions(map);

  
  
  const THRESHOLD = 0.15;
  let base: BaseEmotion = "calm";

  if (scores.happy > THRESHOLD && scores.happy > scores.sad) {
    base = "happy";
  } else if (scores.sad > THRESHOLD && scores.sad > scores.happy) {
    base = "sad";
  }

  
  emotionBuffer.push(base);
  if (emotionBuffer.length > BUFFER_SIZE) {
    emotionBuffer.shift();
  }

  
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

  
  return baseToMood(smoothedBase);
}

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

export function resetEmotionBuffer(): void {
  emotionBuffer.length = 0;
}

// made by arpan

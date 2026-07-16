import type { Mood } from "@/lib/moodTheme";

export type MoodPathSegment = {
  mood: Mood;
  start01: number;
  end01: number;
};

export type MoodSongBucket = {
  mood: Mood;
  startSong: number; 
  endSong: number; 
  targetSongs: number;
};

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function isListenedSong(listenedFraction01: number, threshold01 = 0.25): boolean {
  return listenedFraction01 >= threshold01;
}
export function generateMoodPath(options: {
  startMood: Mood;
  upliftEnabled: boolean;
  seed?: number;
}): Mood[] {
  const { startMood, upliftEnabled } = options;
  const rng = mulberry32(options.seed ?? 1337);

  if (!upliftEnabled) return [startMood];

  switch (startMood) {
    case "sad": {
      const roll = rng();
      if (roll < 0.25) return ["sad", "calm", "romantic"]; 
      if (roll < 0.55) return ["sad", "calm", "happy"]; 
      return ["sad", "calm", "happy", "energetic"]; 
    }
    case "calm": {
      const roll = rng();
      if (roll < 0.25) return ["calm", "romantic"]; 
      if (roll < 0.55) return ["calm", "happy"]; 
      return ["calm", "happy", "energetic"]; 
    }
    case "romantic": {
      const roll = rng();
      if (roll < 0.3) return ["romantic", "calm"]; 
      return ["romantic", "happy"]; 
    }
    case "happy": {
      const roll = rng();
      if (roll < 0.35) return ["happy"]; 
      return ["happy", "energetic"]; 
    }
    case "energetic": {
      const roll = rng();
      if (roll < 0.1) return ["energetic", "happy"]; 
      return ["energetic"];
    }
    default:
      return [startMood];
  }
}
export function distributeMoodPath(path: Mood[]): MoodPathSegment[] {
  if (path.length === 0) return [];
  if (path.length === 1) return [{ mood: path[0], start01: 0, end01: 1 }];

  const n = path.length;
  const weights = Array.from({ length: n }, (_, i) => {
    const k = n - i;
    return k * k;
  });
  const total = weights.reduce((a, b) => a + b, 0);

  const segments: MoodPathSegment[] = [];
  let cursor = 0;
  for (let i = 0; i < n; i++) {
    const w = weights[i] / total;
    const start01 = cursor;
    const end01 = i === n - 1 ? 1 : cursor + w;
    segments.push({ mood: path[i], start01: clamp01(start01), end01: clamp01(end01) });
    cursor = end01;
  }

  return segments;
}
export function distributeMoodPathBySongs(path: Mood[], countedSongLimit: number): MoodSongBucket[] {
  if (path.length === 0) return [];
  if (countedSongLimit <= 0) {
    return [{ mood: path[0], startSong: 0, endSong: 0, targetSongs: 0 }];
  }
  if (path.length === 1) {
    return [{ mood: path[0], startSong: 0, endSong: countedSongLimit, targetSongs: countedSongLimit }];
  }

  const stages = path.length;
  const base = Math.floor(countedSongLimit / stages);
  const remainder = countedSongLimit % stages;

  const targetSongs = Array.from({ length: stages }, (_, i) => base + (i < remainder ? 1 : 0));

  const buckets: MoodSongBucket[] = [];
  let cursor = 0;
  for (let i = 0; i < stages; i++) {
    const startSong = cursor;
    const endSong = cursor + targetSongs[i];
    buckets.push({ mood: path[i], startSong, endSong, targetSongs: targetSongs[i] });
    cursor = endSong;
  }
  return buckets;
}

export function moodAtCountedSongIndex(buckets: MoodSongBucket[], countedSongIndex0: number): Mood {
  if (!buckets.length) return "calm";
  const idx = Math.max(0, countedSongIndex0);
  for (const b of buckets) {
    if (idx >= b.startSong && idx < b.endSong) return b.mood;
  }
  return buckets[buckets.length - 1].mood;
}

export function moodAtProgress(segments: MoodPathSegment[], progress01: number): Mood {
  const p = clamp01(progress01);
  for (const seg of segments) {
    if (p >= seg.start01 && p <= seg.end01) return seg.mood;
  }
  return segments.length ? segments[segments.length - 1].mood : "calm";
}

export function sessionProgress01(input: {
  countedSongIndex?: number; 
  countedSongLimit: number;
}): number {
  if (input.countedSongLimit <= 0) return 0;
  if (input.countedSongIndex == null) return 0;
  return clamp01((input.countedSongIndex + 1) / input.countedSongLimit);
}

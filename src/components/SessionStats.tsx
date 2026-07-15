
"use client";

import * as React from "react";
import { Music2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mood } from "@/lib/moodTheme";

interface SessionStatsProps {
  countedSongs: number;
  totalSongs: number;
  currentMood: Mood;
  moodPath: Mood[];
  className?: string;
}

const MOOD_LABELS: Record<Mood, string> = {
  sad: "Sad",
  calm: "Calm",
  romantic: "Romantic",
  happy: "Happy",
  energetic: "Energetic"
};

const MOOD_EMOJIS: Record<Mood, string> = {
  sad: "💙",
  calm: "🌿",
  romantic: "💕",
  happy: "☀️",
  energetic: "⚡"
};

export function SessionStats({ 
  countedSongs, 
  totalSongs, 
  currentMood, 
  moodPath,
  className 
}: SessionStatsProps) {
  const progress = (countedSongs / totalSongs) * 100;
  const moodCounts = moodPath.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<Mood, number>);

  const sortedMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Top 3 moods

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-foreground/70">
            <Music2 size={16} />
            <span>Session Progress</span>
          </div>
          <span className="text-foreground/90 font-medium">
            {countedSongs} / {totalSongs}
          </span>
        </div>
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[hsl(var(--mood-accent-h),var(--mood-accent-s),var(--mood-accent-l))] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Mood */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 border border-foreground/10">
        <div className="text-2xl">{MOOD_EMOJIS[currentMood]}</div>
        <div>
          <div className="text-xs text-foreground/60 uppercase tracking-wider">Current Vibe</div>
          <div className="text-sm font-medium text-foreground/90">{MOOD_LABELS[currentMood]}</div>
        </div>
      </div>

      {/* Mood Journey */}
      {sortedMoods.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground/60 uppercase tracking-wider">
            <TrendingUp size={14} />
            <span>Your Journey</span>
          </div>
          <div className="space-y-1.5">
            {sortedMoods.map(([mood, count]) => {
              const percentage = ((count / moodPath.length) * 100).toFixed(0);
              return (
                <div key={mood} className="flex items-center gap-2">
                  <span className="text-lg">{MOOD_EMOJIS[mood as Mood]}</span>
                  <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground/30 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/60 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { History, TrendingUp, Clock, Music, Trash2 } from "lucide-react";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { MoodButton } from "@/components/ui/MoodButton";
import { MoodCard } from "@/components/ui/MoodCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getSessionHistory, getSessionStats, clearHistory, type SessionHistory } from "@/lib/sessionPersistence";
import type { Mood } from "@/lib/moodTheme";

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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  
  if (hours > 0) {
    return `${hours}h ${mins % 60}m`;
  }
  return `${mins}m`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function HistoryPageContent() {
  const router = useRouter();
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getSessionStats> | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getSessionHistory());
    setStats(getSessionStats());
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setStats(getSessionStats());
    setShowClearConfirm(false);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-14 sm:px-12">
        {/* Header */}
        <button
          onClick={() => router.push("/")}
          className="mb-10 text-xs uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl flex items-center gap-3">
            <History size={36} />
            Session History
          </h1>
          
          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-foreground/40 hover:text-foreground/70 transition-colors flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Clear
            </button>
          )}
        </div>

        {/* Statistics Summary */}
        {stats && stats.totalSessions > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <MoodCard className="p-4">
              <div className="text-foreground/60 text-xs uppercase tracking-wider mb-1">Sessions</div>
              <div className="text-2xl font-semibold">{stats.totalSessions}</div>
            </MoodCard>
            
            <MoodCard className="p-4">
              <div className="text-foreground/60 text-xs uppercase tracking-wider mb-1">Songs</div>
              <div className="text-2xl font-semibold">{stats.totalSongs}</div>
            </MoodCard>
            
            <MoodCard className="p-4">
              <div className="text-foreground/60 text-xs uppercase tracking-wider mb-1">Time</div>
              <div className="text-2xl font-semibold">{formatDuration(stats.totalTime)}</div>
            </MoodCard>
            
            <MoodCard className="p-4">
              <div className="text-foreground/60 text-xs uppercase tracking-wider mb-1">Top Vibe</div>
              <div className="text-2xl font-semibold">
                {stats.favoriteMood ? MOOD_EMOJIS[stats.favoriteMood] : '—'}
              </div>
            </MoodCard>
          </div>
        )}

        {/* Session List */}
        {history.length === 0 ? (
          <MoodCard className="p-12 text-center">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
            <p className="text-foreground/60 text-sm mb-6">
              Your completed sessions will appear here
            </p>
            <MoodButton onClick={() => router.push("/")}>
              Start Your First Session
            </MoodButton>
          </MoodCard>
        ) : (
          <div className="space-y-4">
            {history.map((session) => (
              <MoodCard key={session.id} className="p-6 hover:bg-white/8 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{MOOD_EMOJIS[session.startMood]}</div>
                    <div>
                      <div className="font-medium">
                        {MOOD_LABELS[session.startMood]}
                        {session.finalMood !== session.startMood && (
                          <>
                            {' → '}
                            <span className="opacity-70">{MOOD_LABELS[session.finalMood]}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {formatDate(session.startTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-foreground/60">
                    <div className="flex items-center gap-1 mb-1">
                      <Music size={14} />
                      <span>{session.songsCompleted} songs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDuration(session.totalDuration)}</span>
                    </div>
                  </div>
                </div>

                {/* Mood Journey */}
                <div className="flex items-center gap-1">
                  {session.moodPath.slice(0, 12).map((mood, idx) => (
                    <div 
                      key={idx}
                      className="h-1.5 flex-1 rounded-full bg-foreground/20"
                      title={MOOD_LABELS[mood]}
                    />
                  ))}
                </div>
              </MoodCard>
            ))}
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <MoodCard className="p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Clear all history?</h3>
              <p className="text-sm text-foreground/60 mb-6">
                This will permanently delete all session records. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <MoodButton
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </MoodButton>
                <MoodButton
                  onClick={handleClearHistory}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30"
                >
                  Clear All
                </MoodButton>
              </div>
            </MoodCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ErrorBoundary fallbackTitle="History Loading Error">
      <HistoryPageContent />
    </ErrorBoundary>
  );
}

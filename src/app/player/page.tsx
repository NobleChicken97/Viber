"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Camera, Play, Pause, SkipForward, SkipBack, Volume2, Home, 
  ListMusic, ChevronRight, Menu
} from "lucide-react";
import { useYouTubePlayer } from "@/components/YouTubePlayer";
import { generateMoodPath, distributeMoodPathBySongs } from "@/lib/moodPath";
import { buildSessionQueue, Track } from "@/lib/playlists";
import { useLyrics } from "@/hooks/useLyrics";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { LyricsPanel, LyricsToggle } from "@/components/LyricsPanel";
import type { Mood } from "@/lib/moodTheme";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { completeSession } from "@/lib/sessionPersistence";
import { useRef } from "react";
import { Sidebar } from "@/components/player_ui/Sidebar";
import { MainArea } from "@/components/player_ui/MainArea";
import { BottomBar } from "@/components/player_ui/BottomBar";
import { moodPacks, Song } from "@/components/player_ui/MoodPacks";
import { MoodSelector } from "@/components/player_ui/MoodSelector";

const MOOD_COLORS: Record<Mood, { bg: string; accent: string; emoji: string }> = {
  sad: { bg: "from-blue-950 via-slate-900 to-gray-950", accent: "text-blue-400", emoji: "💙" },
  calm: { bg: "from-emerald-950 via-slate-900 to-gray-950", accent: "text-emerald-400", emoji: "🌿" },
  romantic: { bg: "from-pink-950 via-slate-900 to-gray-950", accent: "text-pink-400", emoji: "💕" },
  happy: { bg: "from-amber-950 via-slate-900 to-gray-950", accent: "text-amber-400", emoji: "☀️" },
  energetic: { bg: "from-orange-950 via-slate-900 to-gray-950", accent: "text-orange-400", emoji: "⚡" },
};

const MOOD_THEME: Record<Mood, { accentHex: string; headingFont: string; textColor: string; textMuted: string }> = {
  sad: { accentHex: "#58a6ff", headingFont: '"Playfair Display", serif', textColor: "#c9d1d9", textMuted: "#6e7681" },
  calm: { accentHex: "#7c9a6e", headingFont: '"DM Sans", sans-serif', textColor: "#d4e6d4", textMuted: "#8aaa8a" },
  romantic: { accentHex: "#c4547a", headingFont: '"Cormorant Garamond", serif', textColor: "#e8c8d4", textMuted: "#9a7a8a" },
  happy: { accentHex: "#ffb300", headingFont: '"Bebas Neue", sans-serif', textColor: "#fff3d0", textMuted: "#b8a060" },
  energetic: { accentHex: "#ccff00", headingFont: '"Syne", sans-serif', textColor: "#e0e0e0", textMuted: "#666666" },
};

const MOOD_LABELS: Record<Mood, string> = {
  sad: "Melancholic",
  calm: "Peaceful",
  romantic: "Romantic",
  happy: "Happy",
  energetic: "Energetic",
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function PlayerContent() {
  const params = useSearchParams();
  const router = useRouter();
  const startMood = (params.get("mood") as Mood) || "calm";
  const [sessionStartTime] = useState(() => Date.now());
  const [seed] = useState(() => Date.now());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { queue, moodPath, distribution } = useMemo(() => {
    const path = generateMoodPath({ startMood, upliftEnabled: true, seed });
    const buckets = distributeMoodPathBySongs(path, 12);
    const dist = buckets.map(b => b.targetSongs);
    const q = buildSessionQueue(path, dist);
    return { queue: q, moodPath: path, distribution: dist };
  }, [startMood, seed]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [prevVolume, setPrevVolume] = useState(80);

  const currentSong = queue[currentIndex];
  const getCurrentMood = useCallback((): Mood => {
    let songCount = 0;
    for (let i = 0; i < moodPath.length; i++) {
      songCount += distribution[i];
      if (currentIndex < songCount) return moodPath[i];
    }
    return moodPath[moodPath.length - 1];
  }, [currentIndex, moodPath, distribution]);

  const currentMood = getCurrentMood();
  const colors = MOOD_COLORS[currentMood];

  const handleNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeSession({
        startMood,
        finalMood: currentMood,
        songsCompleted: queue.length,
        totalDuration: Math.floor((Date.now() - sessionStartTime) / 1000),
        moodPath,
      });
      router.push('/history');
    }
  }, [currentIndex, queue.length, currentMood, startMood, moodPath, router, sessionStartTime]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const { 
    containerRef, 
    play, 
    pause, 
    loadVideo,
    setVolume: setPlayerVolume,
    isReady: playerReady,
    seekTo
  } = useYouTubePlayer({
    videoId: currentSong?.id || "",
    autoplay: false,
    volume,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnd: handleNext,
    onError: (errorCode) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Video failed (Error ${errorCode}). Skipping...`);
      }
      setTimeout(handleNext, 500);
    },
    onProgress: (p, d) => {
      setProgress(p);
      setDuration(d);
    }
  });
  useEffect(() => {
    if (playerReady && currentSong?.id) {
      const timer = setTimeout(() => {
        loadVideo(currentSong.id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentSong?.id, playerReady, loadVideo]);
  useEffect(() => {
    setPlayerVolume(volume);
  }, [volume, setPlayerVolume]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSongSelect = (index: number) => {
    setCurrentIndex(index);
  };
  useKeyboardControls({
    onPlayPause: handlePlayPause,
    onNextTrack: handleNext,
    onPrevTrack: handlePrev,
    onVolumeUp: useCallback(() => setVolume(v => Math.min(v + 10, 100)), []),
    onVolumeDown: useCallback(() => setVolume(v => Math.max(v - 10, 0)), []),
    onToggleMute: useCallback(() => {
      setVolume(v => {
        if (v > 0) {
          setPrevVolume(v);
          return 0;
        } else {
          return prevVolume || 80;
        }
      });
    }, [prevVolume]),
  });

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const [showLyrics, setShowLyrics] = useState(false);
  const { lyrics, loading: lyricsLoading, error: lyricsError } = useLyrics(
    currentSong?.title,
    currentSong?.artist
  );
  const songsByMood = useMemo(() => {
    const groups: Array<{ mood: Mood; songs: Array<Track & { globalIndex: number }> }> = [];
    let globalIdx = 0;
    
    for (let i = 0; i < moodPath.length; i++) {
      const count = distribution[i];
      const songs = queue.slice(globalIdx, globalIdx + count).map((s, j) => ({
        ...s,
        globalIndex: globalIdx + j
      }));
      groups.push({ mood: moodPath[i], songs });
      globalIdx += count;
    }
    
    return groups;
  }, [queue, moodPath, distribution]);

  if (!currentSong) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400">Loading your vibe session...</p>
      </div>
    );
  }

  const currentMoodPack = {
    ...moodPacks[currentMood],
    songs: queue.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      duration: t.duration || "0:00"
    })) as Song[]
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white selection:bg-white/30 transition-colors duration-1000 w-full relative">
      <MoodThemeProvider startMood={startMood} upliftEnabled={true} countedSongIndex={currentIndex} songLimit={12} />
      
      {/* Hidden YouTube Player */}
      <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
        <div ref={containerRef} />
      </div>

      <div className="flex flex-1 overflow-hidden relative w-full h-full">
        <MoodSelector
          currentMood={currentMood}
          onMoodChange={(mood) => router.push(`/player?mood=${mood}`)}
        />
        
        <MainArea 
          mood={currentMoodPack}
          currentSong={currentMoodPack.songs[currentIndex]}
          showLyrics={showLyrics}
          lyricsPlain={lyrics?.plainLyrics}
          lyricsSynced={lyrics?.syncedLyrics}
          lyricsLoading={lyricsLoading}
          lyricsError={lyricsError}
          currentTime={progress}
        />

        <div className={`transition-all duration-700 ease-in-out h-full z-30 overflow-hidden shrink-0 ${isSidebarOpen ? 'w-[100vw] lg:w-[320px] opacity-100' : 'w-0 opacity-0'}`}>
          <div className="w-[100vw] lg:w-[320px] h-full">
            <Sidebar 
              mood={currentMoodPack} 
              currentSongId={currentSong.id}
              isPlaying={isPlaying}
              onSongSelect={(song) => {
                const idx = queue.findIndex(t => t.id === song.id);
                if (idx !== -1) handleSongSelect(idx);
              }}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </div>
        </div>

        {/* Floating Menu Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-8 right-8 z-40 hover:scale-110 transition-colors transition-transform duration-500 ${isSidebarOpen ? 'text-black' : 'text-white'}`}
          aria-label="Toggle Playlist Sidebar"
        >
          <Menu size={32} strokeWidth={2.5} />
        </button>
      </div>

      <BottomBar 
        mood={currentMoodPack}
        currentSong={currentMoodPack.songs[currentIndex]}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={seekTo}
        onVolumeChange={setVolume}
        progress={progress}
        duration={duration}
        volume={volume}
        showLyrics={showLyrics}
        onLyricsToggle={() => setShowLyrics(!showLyrics)}
        lyricsLoading={lyricsLoading}
      />
    </div>
  );
}

export default function PlayerPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-gray-400">Building your vibe session...</p>
      </div>
    </div>
  );

  if (!mounted) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      <PlayerContent />
    </Suspense>
  );
}

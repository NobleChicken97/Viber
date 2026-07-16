"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Menu, ArrowLeft, Wand2 } from "lucide-react";
import { useYouTubePlayer } from "@/components/YouTubePlayer";
import { generateMoodPath, distributeMoodPathBySongs } from "@/lib/moodPath";
import { buildSessionQueue } from "@/lib/playlists";
import { useLyrics } from "@/hooks/useLyrics";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import type { Mood } from "@/lib/moodTheme";
import { MoodThemeProvider } from "@/components/MoodThemeProvider";
import { useSettings } from "@/lib/settings";
import { Sidebar } from "@/components/player_ui/Sidebar";
import { MainArea } from "@/components/player_ui/MainArea";
import { BottomBar } from "@/components/player_ui/BottomBar";
import { moodPacks, Song } from "@/components/player_ui/MoodPacks";
import { MoodSelector } from "@/components/player_ui/MoodSelector";





function PlayerContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { settings, setSettings, mounted } = useSettings();
  const startMood = (params.get("mood") as Mood) || settings.lastMood || "calm";

  useEffect(() => {
    if (mounted) {
      const urlMood = params.get("mood") as Mood | null;
      if (urlMood) {
        const currentHistory = settings.moodHistory || [];
        if (currentHistory[0] !== urlMood) {
          const newHistory = [urlMood, ...currentHistory.filter(m => m !== urlMood)].slice(0, 10);
          setSettings({ lastMood: urlMood, moodHistory: newHistory });
        } else if (settings.lastMood !== urlMood) {
          setSettings({ lastMood: urlMood });
        }
      }
    }

  }, [params, mounted]);
  const [seed] = useState(() => Date.now());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoodSelectorOpen, setIsMoodSelectorOpen] = useState(false);
  const { queue, moodPath, distribution } = useMemo(() => {
    const path = generateMoodPath({ startMood, upliftEnabled: settings.upliftEnabled, seed });
    const buckets = distributeMoodPathBySongs(path, 12);
    const dist = buckets.map(b => b.targetSongs);
    const q = buildSessionQueue(path, dist);
    return { queue: q, moodPath: path, distribution: dist };
  }, [startMood, seed, settings.upliftEnabled]);
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

  const handleNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      router.push('/');
    }
  }, [currentIndex, queue.length, router]);

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
    autoplay: true,
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

  const [showLyrics, setShowLyrics] = useState(false);
  const { lyrics, loading: lyricsLoading, error: lyricsError } = useLyrics(
    currentSong?.title,
    currentSong?.artist
  );

  if (!currentSong) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-foreground/60">Loading your vibe session...</p>
      </main>
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
    <main className="flex flex-col h-screen overflow-hidden bg-background text-foreground selection:bg-foreground/30 transition-colors duration-1000 w-full relative">
      <MoodThemeProvider startMood={startMood} upliftEnabled={settings.upliftEnabled} countedSongIndex={currentIndex} songLimit={12} />

      { }
      <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
        <div ref={containerRef} />
      </div>

      <div className="flex flex-1 overflow-hidden relative w-full h-full">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 text-white mix-blend-difference">
          <button onClick={() => router.push('/')} className="hover:scale-110 transition-transform duration-500" aria-label="Back to Home">
            <ArrowLeft size={32} strokeWidth={2.5} />
          </button>
          <button onClick={() => setIsMoodSelectorOpen(!isMoodSelectorOpen)} className="hover:scale-110 transition-transform duration-500" aria-label="Toggle Mood Selector">
            <Wand2 size={32} strokeWidth={2.5} />
          </button>
        </div>

        <div className={`transition-all duration-700 ease-in-out h-full z-40 overflow-hidden shrink-0 ${isMoodSelectorOpen ? 'w-[100vw] lg:w-60 opacity-100' : 'w-0 opacity-0'}`}>
          <MoodSelector
            currentMood={currentMood}
            onMoodChange={(mood) => {
              const currentHistory = settings.moodHistory || [];
              const newHistory = [mood, ...currentHistory.filter(m => m !== mood)].slice(0, 10);
              setSettings({ lastMood: mood, moodHistory: newHistory });
              router.push(`/player?mood=${mood}`);

              if (window.innerWidth < 1024) {
                setIsMoodSelectorOpen(false);
              }
            }}
          />
        </div>

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

        { }
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-8 right-8 z-40 hover:scale-110 transition-transform duration-500 text-white mix-blend-difference`}
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
    </main>
  );
}

export default function PlayerPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {

    setMounted(true);
  }, []);

  const fallback = (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <p className="text-foreground/60">Building your vibe session...</p>
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

// made by arpan

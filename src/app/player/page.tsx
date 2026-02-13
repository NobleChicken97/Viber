"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Camera, Play, Pause, SkipForward, SkipBack, Volume2, Home, 
  Music, ListMusic, ChevronRight
} from "lucide-react";
import { useYouTubePlayer } from "@/components/YouTubePlayer";
import { generateMoodPath, distributeMoodPathBySongs } from "@/lib/moodPath";
import { buildSessionQueue, Track, MOOD_PLAYLISTS } from "@/lib/playlists";
import { useLyrics } from "@/hooks/useLyrics";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { LyricsPanel, LyricsToggle } from "@/components/LyricsPanel";
import type { Mood } from "@/lib/moodTheme";

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
  
  // Build the session queue with mood transitions
  const { queue, moodPath, distribution } = useMemo(() => {
    const path = generateMoodPath({ startMood, upliftEnabled: true, seed: Date.now() });
    const buckets = distributeMoodPathBySongs(path, 12);
    const dist = buckets.map(b => b.targetSongs);
    const q = buildSessionQueue(path, dist);
    return { queue: q, moodPath: path, distribution: dist };
  }, [startMood]);

  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);

  const currentSong = queue[currentIndex];

  // Find which mood the current song belongs to
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
      // Session complete - could loop or end
      setCurrentIndex(0);
    }
  }, [currentIndex, queue.length]);

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
    seekTo,
    setVolume: setPlayerVolume,
    isReady: playerReady
  } = useYouTubePlayer({
    videoId: currentSong?.id || "",
    autoplay: false,
    volume,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnd: handleNext,
    onError: (errorCode) => {
      console.warn(`Video failed (Error ${errorCode}). Skipping...`);
      setTimeout(handleNext, 500);
    },
    onProgress: (p, d) => {
      setProgress(p);
      setDuration(d);
    }
  });

  // Load video when song changes
  useEffect(() => {
    if (playerReady && currentSong?.id) {
      const timer = setTimeout(() => {
        loadVideo(currentSong.id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentSong?.id, playerReady, loadVideo]);

  // Volume sync
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

  const handleSeek = useCallback((time: number) => {
    seekTo(time);
    setProgress(time);
  }, [seekTo]);

  // Keyboard controls: Space = play/pause, Arrow keys = seek ±5s
  useKeyboardControls({
    onPlayPause: handlePlayPause,
    onSeekForward: useCallback(() => handleSeek(Math.min(progress + 5, duration)), [progress, duration, handleSeek]),
    onSeekBackward: useCallback(() => handleSeek(Math.max(progress - 5, 0)), [progress, handleSeek]),
  });

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Lyrics
  const [showLyrics, setShowLyrics] = useState(false);
  const { lyrics, loading: lyricsLoading, error: lyricsError } = useLyrics(
    currentSong?.title,
    currentSong?.artist
  );

  // Group songs by mood for sidebar display
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

  return (
    <div className={`min-h-screen bg-linear-to-br ${colors.bg} text-white`}>
      
      {/* Hidden YouTube Player */}
      <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
        <div ref={containerRef} />
      </div>

      <div className="flex h-screen">
        
        {/* Main Player Area */}
        <div className="flex-1 flex flex-col p-6 lg:p-10">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home size={20} />
              <span className="text-sm">Exit</span>
            </button>
            
            <div className={`flex items-center gap-2 ${colors.accent}`}>
              <span className="text-xl">{colors.emoji}</span>
              <span className="text-sm font-medium">{MOOD_LABELS[currentMood]}</span>
            </div>
            
            <button 
              onClick={() => router.push('/camera')} 
              className="text-gray-400 hover:text-white transition-colors"
              title="Re-detect vibe"
            >
              <Camera size={20} />
            </button>
          </div>

          {/* Album Art / Lyrics */}
          <div className="flex-1 flex items-center justify-center">
            {showLyrics ? (
              <div className="relative w-full max-w-lg h-full max-h-100 rounded-2xl border border-white/5 backdrop-blur-sm"
                style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.8) 100%)` }}>
                <LyricsPanel
                  plainLyrics={lyrics?.plainLyrics || null}
                  syncedLyrics={lyrics?.syncedLyrics || null}
                  currentTime={progress}
                  loading={lyricsLoading}
                  error={lyricsError}
                  accentColor={MOOD_THEME[currentMood].accentHex}
                  headingFont={MOOD_THEME[currentMood].headingFont}
                  textColor={MOOD_THEME[currentMood].textColor}
                  textMuted={MOOD_THEME[currentMood].textMuted}
                />
              </div>
            ) : (
              <div className="relative w-full max-w-sm aspect-square">
                {/* Glow effect */}
                <div 
                  className={`absolute inset-0 rounded-3xl blur-3xl opacity-30 ${
                    currentMood === 'sad' ? 'bg-blue-500' :
                    currentMood === 'calm' ? 'bg-emerald-500' :
                    currentMood === 'romantic' ? 'bg-pink-500' :
                    currentMood === 'happy' ? 'bg-amber-500' : 'bg-orange-500'
                  }`}
                />
                
                {/* Album container */}
                <div className="relative w-full h-full rounded-3xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 bg-linear-to-br ${colors.bg} opacity-50`} />
                  
                  {/* YouTube Thumbnail */}
                  {currentSong?.id ? (
                    <img
                      src={`https://img.youtube.com/vi/${currentSong.id}/hqdefault.jpg`}
                      alt={currentSong.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Music size={120} className="text-white/20 relative z-10" />
                  )}
                  
                  {/* Now playing indicator */}
                  {isPlaying && (
                    <div className="absolute bottom-6 left-6 flex items-center gap-1.5 z-20">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 bg-white/60 rounded-full animate-pulse`}
                          style={{
                            height: `${12 + Math.random() * 12}px`,
                            animationDelay: `${i * 150}ms`,
                            animationDuration: '0.5s'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold truncate px-4">
              {currentSong.title}
            </h2>
            <p className="text-gray-400 text-lg mt-2 truncate">
              {currentSong.artist}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-200 ${
                  currentMood === 'sad' ? 'bg-blue-500' :
                  currentMood === 'calm' ? 'bg-emerald-500' :
                  currentMood === 'romantic' ? 'bg-pink-500' :
                  currentMood === 'happy' ? 'bg-amber-500' : 'bg-orange-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-8">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack size={28} />
            </button>
            
            <button 
              onClick={handlePlayPause}
              className={`p-5 rounded-full ${
                currentMood === 'sad' ? 'bg-blue-500 hover:bg-blue-400' :
                currentMood === 'calm' ? 'bg-emerald-500 hover:bg-emerald-400' :
                currentMood === 'romantic' ? 'bg-pink-500 hover:bg-pink-400' :
                currentMood === 'happy' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-orange-500 hover:bg-orange-400'
              } transition-colors shadow-lg`}
            >
              {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
            </button>
            
            <button 
              onClick={handleNext}
              disabled={currentIndex === queue.length - 1}
              className="p-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward size={28} />
            </button>
          </div>

          {/* Volume + Lyrics Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3 text-gray-400">
            <Volume2 size={18} />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="ml-4">
              <LyricsToggle
                showLyrics={showLyrics}
                onToggle={() => setShowLyrics(!showLyrics)}
                loading={lyricsLoading}
                accentColor={MOOD_THEME[currentMood].accentHex}
              />
            </div>
          </div>

          {/* Session Progress */}
          <div className="mt-6 flex justify-center gap-1.5">
            {queue.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                  i === currentIndex 
                    ? `scale-125 ${
                        currentMood === 'sad' ? 'bg-blue-400' :
                        currentMood === 'calm' ? 'bg-emerald-400' :
                        currentMood === 'romantic' ? 'bg-pink-400' :
                        currentMood === 'happy' ? 'bg-amber-400' : 'bg-orange-400'
                      } shadow-[0_0_8px_currentColor]`
                    : i < currentIndex 
                      ? 'bg-white/40' 
                      : 'bg-white/15'
                }`}
                onClick={() => handleSongSelect(i)}
              />
            ))}
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="hidden lg:flex w-80 xl:w-96 flex-col bg-black/30 border-l border-white/5">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 text-white/70">
              <ListMusic size={20} />
              <span className="font-medium">Your Session</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {moodPath.map(m => MOOD_LABELS[m]).join(' → ')}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {songsByMood.map((group, groupIdx) => (
              <div key={groupIdx} className="border-b border-white/5">
                <div className="px-6 py-3 flex items-center gap-2 bg-white/5">
                  <span>{MOOD_COLORS[group.mood].emoji}</span>
                  <span className={`text-sm font-medium ${MOOD_COLORS[group.mood].accent}`}>
                    {MOOD_LABELS[group.mood]}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {group.songs.length} songs
                  </span>
                </div>
                
                {group.songs.map((song) => (
                  <button
                    key={song.globalIndex}
                    onClick={() => handleSongSelect(song.globalIndex)}
                    className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                      song.globalIndex === currentIndex ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                      {song.globalIndex === currentIndex && isPlaying ? (
                        <div className="flex items-center gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-0.5 ${MOOD_COLORS[currentMood].accent.replace('text-', 'bg-')} rounded-full animate-pulse`}
                              style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 100}ms` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{song.globalIndex + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${song.globalIndex === currentIndex ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                    
                    {song.globalIndex === currentIndex && (
                      <ChevronRight size={16} className={MOOD_COLORS[currentMood].accent} />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400">Building your vibe session...</p>
        </div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}

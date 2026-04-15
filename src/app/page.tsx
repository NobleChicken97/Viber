'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MoodSelector } from '@/components/player_ui/MoodSelector';
import { MainArea } from '@/components/player_ui/MainArea';
import { Sidebar } from '@/components/player_ui/Sidebar';
import { BottomBar } from '@/components/player_ui/BottomBar';
import { moodPacks, MoodType, Song, sampleSongs } from '@/components/player_ui/MoodPacks';
import { useYouTubePlayer } from '@/components/YouTubePlayer';
import { useLyrics } from '@/hooks/useLyrics';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

// Mood transition paths - each starting mood leads to a progression
const MOOD_PATHS: Record<MoodType, MoodType[]> = {
  sad: ['sad', 'calm', 'happy', 'energetic'],
  calm: ['calm', 'happy', 'energetic'],
  romantic: ['romantic', 'happy'],
  happy: ['happy', 'energetic'],
  energetic: ['energetic'],
};

// Distribute 12 songs across the mood path
function distributeSongs(path: MoodType[]): number[] {
  const total = 12;
  const stages = path.length;
  
  if (stages === 1) return [total];
  if (stages === 2) return [7, 5];
  if (stages === 3) return [5, 4, 3];
  if (stages === 4) return [4, 3, 3, 2];
  
  // Fallback for any other case
  const base = Math.floor(total / stages);
  const remainder = total % stages;
  return Array.from({ length: stages }, (_, i) => base + (i < remainder ? 1 : 0));
}

export interface TransitionSong extends Song {
  mood: MoodType;
}

// Build playlist for a given mood (deterministic function, randomness inside)
function buildPlaylist(startMood: MoodType): { songs: TransitionSong[]; moodPath: MoodType[] } {
  const path = MOOD_PATHS[startMood];
  const distribution = distributeSongs(path);
  
  const allSongs: TransitionSong[] = [];
  const usedIds = new Set<string>();
  
  for (let i = 0; i < path.length; i++) {
    const mood = path[i];
    const count = distribution[i];
    const pack = moodPacks[mood];
    
    const available = pack.songPool.filter(s => !usedIds.has(s.id));
    const sampled = sampleSongs(available, count);
    
    sampled.forEach(song => {
      usedIds.add(song.id);
      allSongs.push({ ...song, mood });
    });
  }
  
  return { songs: allSongs, moodPath: path };
}

export default function Home() {
  const [startMood, setStartMood] = useState<MoodType>('energetic');
  const [songs, setSongs] = useState<TransitionSong[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Generate playlist only on client to avoid hydration mismatch
  useEffect(() => {
    const playlist = buildPlaylist(startMood);
    
    // Defer state updates to avoid synchronous cascading renders
    setTimeout(() => {
      setIsClient(true);
      setSongs(playlist.songs);
    }, 0);
  }, [startMood]);
  
  // Player State
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [prevVolume, setPrevVolume] = useState(80);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const currentSong = songs[currentSongIndex];
  
  // Lyrics
  const { lyrics, loading: lyricsLoading, error: lyricsError } = useLyrics(
    currentSong?.title,
    currentSong?.artist
  );
  
  // Get the mood pack for theming based on current song's mood
  const activeMoodForTheme = currentSong?.mood || startMood;
  const basePack = moodPacks[activeMoodForTheme];
  const themePack = {
    ...basePack,
    songs: songs,
    playlistName: basePack.playlistName,
  };
  
  const { 
    containerRef, 
    play, 
    pause, 
    loadVideo,
    seekTo,
    setVolume: setPlayerVolume,
    isReady: playerReady
  } = useYouTubePlayer({
    videoId: '',
    autoplay: false,
    volume: volume,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnd: () => handleNext(),
    onError: (errorCode) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Video ${currentSong?.id} failed (Error ${errorCode}). Skipping...`);
      }
      setTimeout(() => handleNext(), 500);
    },
    onProgress: (p, d) => {
      setProgress(p);
      setDuration(d);
    }
  });

  // Load video when song changes and player is ready
  useEffect(() => {
    if (playerReady && currentSong?.id) {
      loadVideo(currentSong.id);
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading video:', currentSong.id, currentSong.title);
      }
    }
  }, [currentSong?.id, currentSong?.title, playerReady, loadVideo]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (time: number) => {
    seekTo(time);
    setProgress(time);
  };

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setPlayerVolume(newVolume);
  }, [setPlayerVolume]);

  const handleNext = () => {
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
  };

  // Keyboard controls: Space = play/pause, Arrow keys = next/prev, Up/Down = volume, M = mute
  useKeyboardControls({
    onPlayPause: handlePlayPause,
    onNextTrack: handleNext,
    onPrevTrack: handlePrev,
    onVolumeUp: useCallback(() => handleVolumeChange(Math.min(volume + 10, 100)), [volume, handleVolumeChange]),
    onVolumeDown: useCallback(() => handleVolumeChange(Math.max(volume - 10, 0)), [volume, handleVolumeChange]),
    onToggleMute: useCallback(() => {
      if (volume > 0) {
        setPrevVolume(volume);
        handleVolumeChange(0);
      } else {
        handleVolumeChange(prevVolume || 80);
      }
    }, [volume, prevVolume, handleVolumeChange]),
  });
  
  const handleSongSelect = (song: Song) => {
    const index = songs.findIndex(s => s.id === song.id);
    if (index !== -1) {
      setCurrentSongIndex(index);
    }
  };

  // Show loading state during SSR and initial client render
  if (!isClient || songs.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-[0.3em] uppercase mb-4">VIBER</h1>
          <p className="text-sm tracking-widest uppercase opacity-60">Loading your vibe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden font-sans text-white select-none">
      
      {/* Hidden YouTube Player - positioned off-screen but still rendered */}
      <div className="fixed -left-[9999px] -top-[9999px] w-[200px] h-[200px]">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mood Selector Sidebar (Left) */}
        <MoodSelector 
          currentMood={startMood} 
          onMoodChange={(mood) => {
            setStartMood(mood);
            setCurrentSongIndex(0);
          }} 
        />

        {/* Main Content Area (Middle) */}
        <MainArea 
          mood={themePack} 
          currentSong={currentSong}
          showLyrics={showLyrics}
          lyricsPlain={lyrics?.plainLyrics}
          lyricsSynced={lyrics?.syncedLyrics}
          lyricsLoading={lyricsLoading}
          lyricsError={lyricsError}
          currentTime={progress}
        />

        {/* Playlist Sidebar (Right) */}
        <Sidebar 
          mood={themePack}
          songs={songs}
          currentSongId={currentSong?.id || ''}
          isPlaying={isPlaying}
          onSongSelect={handleSongSelect}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>

      {/* Bottom Bar */}
      <BottomBar 
        mood={themePack} 
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
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

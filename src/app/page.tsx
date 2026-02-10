'use client';

import React, { useState, useEffect } from 'react';
import { MoodSelector } from '@/components/player_ui/MoodSelector';
import { MainArea } from '@/components/player_ui/MainArea';
import { Sidebar } from '@/components/player_ui/Sidebar';
import { BottomBar } from '@/components/player_ui/BottomBar';
import { moodPacks, MoodType, Song } from '@/components/player_ui/MoodPacks';
import { useYouTubePlayer } from '@/components/YouTubePlayer';

export default function Home() {
  const [currentMood, setCurrentMood] = useState<MoodType>('energetic');
  const activePack = moodPacks[currentMood];
  
  // Music Player State
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const currentSong = activePack.songs[currentSongIndex];
  
  const { 
    containerRef, 
    play, 
    pause, 
    loadVideo,
    isReady: playerReady
  } = useYouTubePlayer({
    videoId: currentSong.id,
    autoplay: false,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnd: () => handleNext(),
    onError: (errorCode) => {
      // Auto-skip videos that can't be played (embedding disabled, not found, etc.)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Video ${currentSong.id} failed (Error ${errorCode}). Skipping...`);
      }
      // Wait a moment then skip to next song
      setTimeout(() => handleNext(), 500);
    },
    onProgress: (p, d) => {
      setProgress(p);
      setDuration(d);
    }
  });

  // Sync isReady logic if needed in future
  
  // When song index changes, load the new video
  useEffect(() => {
    if (playerReady && currentSong.id) {
        // Small delay to ensure player is fully ready
        const timer = setTimeout(() => {
          loadVideo(currentSong.id);
        }, 100);
        
        return () => clearTimeout(timer);
    }
  }, [currentSong.id, playerReady, loadVideo]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleNext = () => {
    const nextIndex = (currentSongIndex + 1) % activePack.songs.length;
    setCurrentSongIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = currentSongIndex === 0 
      ? activePack.songs.length - 1 
      : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
  };
  
  const handleSongSelect = (song: Song) => {
    const index = activePack.songs.findIndex(s => s.id === song.id);
    if (index !== -1) {
      setCurrentSongIndex(index);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden font-sans text-white select-none">
      
      {/* Hidden Player for Logic - Positioned absolute to not break layout but kept in DOM */}
      <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none -z-50 overflow-hidden">
        <div ref={containerRef} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mood Selector Sidebar (Left) */}
        <MoodSelector 
          currentMood={currentMood} 
          onMoodChange={(mood) => {
            setCurrentMood(mood);
            setCurrentSongIndex(0);
          }} 
        />

        {/* Main Content Area (Middle) */}
        <MainArea 
          mood={activePack} 
          currentSong={currentSong}
        />

        {/* Playlist Sidebar (Right) */}
        <Sidebar 
          mood={activePack} 
          currentSongId={currentSong.id}
          isPlaying={isPlaying}
          onSongSelect={handleSongSelect}
        />
      </div>

      {/* Persistent Bottom Bar */}
      <BottomBar 
        mood={activePack} 
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        progress={progress}
        duration={duration}
      />
    </div>
  );
}

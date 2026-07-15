import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';
import { MoodPack, Song } from './MoodPacks';

interface BottomBarProps {
  mood: MoodPack;
  currentSong: Song | undefined;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  progress: number;
  duration: number;
  volume: number;
  showLyrics?: boolean;
  onLyricsToggle?: () => void;
  lyricsLoading?: boolean;
}
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function BottomBar({ 
  mood, 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrev,
  onSeek,
  onVolumeChange,
  progress,
  duration,
  volume,
  showLyrics,
  onLyricsToggle,
  lyricsLoading
}: BottomBarProps) {
  const [showVolume, setShowVolume] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percent = duration > 0 ? (progress / duration) * 100 : 0;
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    onSeek(seekTime);
  };
  const currentIndex = mood.songs.findIndex(s => s.id === currentSong?.id);
  const prevSong = currentIndex > 0 ? mood.songs[currentIndex - 1] : mood.songs[mood.songs.length - 1];
  const nextSong = currentIndex < mood.songs.length - 1 ? mood.songs[currentIndex + 1] : mood.songs[0];

  return (
    <div
      className="h-[140px] w-full bg-[#050505] text-white border-t border-white/10 flex flex-col relative z-40 transition-colors duration-500"
      style={{
        fontFamily: mood.headingFont
      }}>

      {/* Progress Bar - Clickable */}
      <div 
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="w-full h-[6px] bg-white/10 relative cursor-pointer group hover:h-[8px] transition-all">
        <div
          className="h-full relative"
          style={{
            width: `${percent}%`,
            backgroundColor: mood.accent
          }}>

          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{
              backgroundColor: mood.accent
            }} />

        </div>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between px-4 py-2 text-xs font-mono font-bold text-gray-400">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls Grid */}
      <div className="flex-1 grid grid-cols-3 items-center pb-4">
        {/* PREV */}
        <div 
          onClick={onPrev}
          className="flex flex-col items-start pl-12 cursor-pointer group select-none">
          <span className="text-4xl font-black uppercase tracking-tight group-hover:text-gray-300 transition-colors flex items-center gap-2">
             PREV
          </span>
          <span className="text-xs font-mono text-gray-500 uppercase mt-1 group-hover:text-gray-400 w-32 truncate">
            {prevSong?.title || "Previous"}
          </span>
        </div>

        {/* PLAY/PAUSE */}
        <div 
          onClick={onPlayPause}
          className="flex flex-col items-center justify-center cursor-pointer group select-none">
          <div className="mb-2 transition-transform group-hover:scale-110">
            {isPlaying ? (
               <Pause
               size={48}
               fill="transparent"
               strokeWidth={1.5}
               style={{
                 stroke: mood.accent,
                 fill: mood.accent
               }} />
            ) : (
              <Play
              size={48}
              fill="transparent"
              strokeWidth={1.5}
              style={{
                stroke: mood.accent
              }} />
            )}
          </div>
          <span className="text-sm font-bold tracking-[0.3em] uppercase">
            {isPlaying ? "PAUSE" : "PLAY"}
          </span>
        </div>

        {/* NEXT + Volume */}
        <div className="flex items-center justify-end pr-12 gap-6">
          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button 
              onClick={() => onVolumeChange(volume > 0 ? 0 : 80)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {volume > 0 ? (
                <Volume2 size={24} className="text-gray-400 hover:text-white" />
              ) : (
                <VolumeX size={24} className="text-gray-400 hover:text-white" />
              )}
            </button>
            
            {/* Volume Slider - with padding to maintain hover area */}
            {showVolume && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-2">
                <div className="bg-[#1a1a1a] p-3 rounded-lg shadow-xl">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    className="w-24 h-2 accent-current cursor-pointer"
                    style={{ accentColor: mood.accent }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lyrics Toggle */}
          {onLyricsToggle && (
            <button
              onClick={onLyricsToggle}
              className={`p-2 rounded-full transition-all ${lyricsLoading ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: showLyrics ? `${mood.accent}30` : 'transparent',
                color: showLyrics ? mood.accent : '#9ca3af',
              }}
              title={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
            >
              <Mic size={22} />
            </button>
          )}
          
          {/* NEXT */}
          <div 
            onClick={onNext}
            className="flex flex-col items-end cursor-pointer group select-none">
            <span className="text-4xl font-black uppercase tracking-tight group-hover:text-gray-300 transition-colors flex items-center gap-2">
              NEXT 
            </span>
            <span className="text-xs font-mono text-gray-500 uppercase mt-1 group-hover:text-gray-400 w-32 truncate text-right">
              {nextSong?.title || "Next"}
            </span>
          </div>
        </div>
      </div>
    </div>);
}

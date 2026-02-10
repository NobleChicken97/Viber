import React from 'react';
import { Play, Pause } from 'lucide-react';
import { MoodPack, Song } from './MoodPacks';

interface BottomBarProps {
  mood: MoodPack;
  currentSong: Song | undefined;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
}

// Helper to format 90 -> 1:30
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
  progress,
  duration
}: BottomBarProps) {
  
  // Calculate percentage
  const percent = duration > 0 ? (progress / duration) * 100 : 0;
  
  // Find current index to know next/prev names? 
  // Ideally passed from parent, but we can compute or show generic NEXT
  const currentIndex = mood.songs.findIndex(s => s.id === currentSong?.id);
  const prevSong = currentIndex > 0 ? mood.songs[currentIndex - 1] : mood.songs[mood.songs.length - 1];
  const nextSong = currentIndex < mood.songs.length - 1 ? mood.songs[currentIndex + 1] : mood.songs[0];

  return (
    <div
      className="h-[140px] w-full bg-[#050505] text-white border-t border-white/10 flex flex-col relative z-40 transition-colors duration-500"
      style={{
        fontFamily: mood.headingFont
      }}>

      {/* Progress Bar */}
      <div className="w-full h-[4px] bg-white/10 relative cursor-pointer group">
        <div
          className="h-full relative transition-all duration-300 ease-linear"
          style={{
            width: `${percent}%`,
            backgroundColor: mood.accent
          }}>

          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* NEXT */}
        <div 
          onClick={onNext}
          className="flex flex-col items-end pr-12 cursor-pointer group select-none">
          <span className="text-4xl font-black uppercase tracking-tight group-hover:text-gray-300 transition-colors flex items-center gap-2">
            NEXT 
          </span>
          <span className="text-xs font-mono text-gray-500 uppercase mt-1 group-hover:text-gray-400 w-32 truncate text-right">
            {nextSong?.title || "Next"}
          </span>
        </div>
      </div>
    </div>);
}

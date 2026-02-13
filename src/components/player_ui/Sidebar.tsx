import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { MoodPack, Song } from './MoodPacks';

interface SidebarProps {
  mood: MoodPack;
  songs?: Song[];
  currentSongId: string;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
}

export function Sidebar({ mood, songs, currentSongId, isPlaying, onSongSelect }: SidebarProps) {
  const textColor = '#000000';

  return (
    <div
      className="w-full lg:w-[320px] h-full flex flex-col relative transition-colors duration-500 z-30"
      style={{
        backgroundColor: mood.accent,
        color: textColor
      }}>

      {/* Header */}
      <div className="p-8 flex justify-end">
        <Menu
          size={32}
          strokeWidth={2.5}
          className="cursor-pointer hover:scale-110 transition-transform" />
      </div>

      {/* Playlist Title */}
      <div className="px-8 mb-6">
        <h2
          className="text-2xl font-black uppercase leading-none tracking-tight"
          style={{ fontFamily: mood.headingFont }}>
          {mood.playlistName}
        </h2>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
        <div className="space-y-0">
          {(songs || mood.songs).map((song, index) => {
            const isActive = song.id === currentSongId;
            return (
              <motion.div
                key={song.id}
                onClick={() => onSongSelect(song)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group py-3 border-b border-black/10 flex items-center justify-between cursor-pointer hover:bg-black/5 -mx-4 px-4 transition-colors ${isActive ? 'bg-white/30' : ''}`}>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold uppercase text-sm tracking-wide truncate">
                    {song.title}
                  </span>
                  <span className="text-xs opacity-60 font-mono truncate">
                    {song.artist}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold ml-2 shrink-0">
                  {isActive && isPlaying ? (
                    <Play size={16} fill="currentColor" className="animate-pulse" />
                  ) : isActive ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    song.duration
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Area */}
      <div className="p-8 mt-auto flex justify-between items-end">
        <div className="flex gap-8">
          <ChevronLeft
            size={40}
            strokeWidth={1.5}
            className="cursor-pointer hover:scale-110 transition-transform" />

          <ChevronRight
            size={40}
            strokeWidth={1.5}
            className="cursor-pointer hover:scale-110 transition-transform" />

        </div>

        {/* Mini Artist Thumbnail */}
        <div className="flex items-end gap-2">
          <div className="writing-vertical-rl text-[10px] font-bold tracking-widest uppercase rotate-180 h-16">
            {/* Show artist of currently playing song if possible, or just the mood default */}
            {mood.songs.find(s => s.id === currentSongId)?.artist || mood.songs[0].artist}
          </div>
          <div className="w-16 h-20 bg-black grayscale overflow-hidden">
            <div
              className="w-full h-full opacity-80"
              style={{
                background: mood.albumGradient
              }} />

          </div>
        </div>
      </div>
    </div>);
}

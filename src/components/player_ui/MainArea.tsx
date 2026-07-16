import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MoodPack, Song } from './MoodPacks';
import { LyricsPanel } from '@/components/LyricsPanel';
import type { SyncedLine } from '@/hooks/useLyrics';

interface MainAreaProps {
  mood: MoodPack;
  currentSong: Song | undefined;
  showLyrics?: boolean;
  lyricsPlain?: string | null;
  lyricsSynced?: SyncedLine[] | null;
  lyricsLoading?: boolean;
  lyricsError?: string | null;
  currentTime?: number;
}

export function MainArea({ mood, currentSong, showLyrics, lyricsPlain, lyricsSynced, lyricsLoading, lyricsError, currentTime }: MainAreaProps) {
  const displayTitle = currentSong?.title || mood.playlistName;
  
  return (
    <div
      className="relative flex-1 h-full flex flex-col overflow-hidden bg-noise transition-colors duration-700"
      style={{
        backgroundColor: '#050505',
        color: '#ffffff'
      }}>

      {}
      <div className="flex justify-between items-center p-8 z-20">

        <span className="text-sm font-bold tracking-[0.2em] uppercase opacity-80">
          {currentSong?.artist || mood.name}
        </span>

      </div>

      {}
      <div className="flex-1 flex items-center justify-center relative z-10 px-12">
        {}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
          <span className="text-xs font-bold tracking-[0.8em] uppercase opacity-60">
            {mood.name.split('').join(' ')}
          </span>
        </div>

        {/* Right Vertical Text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 origin-center whitespace-nowrap">
          <span className="text-xs font-bold tracking-[0.8em] uppercase opacity-60">
            {currentSong ? "NOW PLAYING" : "T Y P O G R A P H Y"}
          </span>
        </div>

        {/* Main Visual Split */}
        <div className="flex w-full max-w-6xl items-center gap-8">
          {/* Album Art or Lyrics */}
          {showLyrics ? (
            <motion.div
              key="lyrics"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-1/2 aspect-square relative overflow-hidden border"
              style={{
                background: mood.albumGradient,
                borderRadius: mood.borderRadius,
                borderColor: `${mood.accent}15`,
              }}>
              <LyricsPanel
                plainLyrics={lyricsPlain || null}
                syncedLyrics={lyricsSynced || null}
                currentTime={currentTime || 0}
                loading={lyricsLoading || false}
                error={lyricsError || null}
                accentColor={mood.accent}
                headingFont={mood.headingFont}
                textColor={mood.text}
                textMuted={mood.textMuted}
              />
            </motion.div>
          ) : (
          <motion.div
            key={mood.name + (currentSong?.id || '')} // Re-animate on change
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              duration: 0.8
            }}
            className="w-1/2 aspect-square relative overflow-hidden transition-all duration-700"
            style={{
              background: mood.albumGradient
            }}>

            {/* Song Thumbnail */}
            {currentSong?.id ? (
              <Image
                src={`https://img.youtube.com/vi/${currentSong.id}/hqdefault.jpg`}
                alt={currentSong.title || 'Album art'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="absolute inset-0 object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl filter drop-shadow-2xl">
                  {mood.emoji}
                </span>
              </div>
            )}

            {}
            <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay"></div>
          </motion.div>
          )}

          {}
          <div className="w-1/2 h-full flex flex-col justify-center relative overflow-hidden">
            <motion.div
              key={displayTitle}
              initial={{
                x: 100,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              transition={{
                duration: 0.8,
                delay: 0.2
              }}
              className="flex flex-col leading-[0.8]"
              style={{
                fontFamily: mood.headingFont
              }}>

              {displayTitle.split(' ').slice(0, 4).map((word, i) => 
              <span
                key={i}
                className="text-7xl md:text-8xl lg:text-9xl font-bold uppercase opacity-40 tracking-tighter mix-blend-overlay break-all"
                style={{
                  marginLeft: i % 2 === 0 ? '0' : '10%',
                  transform: `rotate(${i % 2 === 0 ? '-2deg' : '2deg'})`
                }}>

                  {word}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>);
}

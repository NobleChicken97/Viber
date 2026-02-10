import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MoodPack, Song } from './MoodPacks';

interface MainAreaProps {
  mood: MoodPack;
  currentSong: Song | undefined;
}

export function MainArea({ mood, currentSong }: MainAreaProps) {
  // If no song is selected yet, fall back to something
  const displayTitle = currentSong?.title || mood.playlistName;
  
  return (
    <div
      className="relative flex-1 h-full flex flex-col overflow-hidden bg-noise transition-colors duration-700"
      style={{
        backgroundColor: '#050505',
        color: '#ffffff'
      }}>

      {/* Top Bar */}
      <div className="flex justify-between items-center p-8 z-20">
        <ArrowLeft
          size={32}
          strokeWidth={1.5}
          className="cursor-pointer hover:opacity-70 transition-opacity" />

        <span className="text-sm font-bold tracking-[0.2em] uppercase opacity-80">
          {currentSong?.artist || mood.name}
        </span>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
          <span className="text-sm font-bold tracking-widest uppercase">
            SHARE
          </span>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-12">
        {/* Left Vertical Text */}
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
          {/* Album Art */}
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
            className="w-1/2 aspect-square relative overflow-hidden grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
            style={{
              background: mood.albumGradient
            }}>

            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>

            {/* Center Emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl filter drop-shadow-2xl">
                {mood.emoji}
              </span>
            </div>

            {/* Abstract Shapes based on mood */}
            <div className="absolute inset-0 opacity-30 mix-blend-difference">
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full animate-pulse">

                <path
                  fill="#FFF"
                  d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,89.1,-6.6C88.1,7.2,83.4,20.5,75.4,32C67.4,43.5,56.1,53.2,43.9,61.9C31.7,70.6,18.6,78.3,4.4,70.7C-9.8,63.1,-25.1,40.2,-38.6,22.8C-52.1,5.4,-63.8,-6.5,-66.1,-21.3C-68.4,-36.1,-61.3,-53.8,-48.6,-61.6C-35.9,-69.4,-17.9,-67.3,-0.7,-66.1C16.5,-64.9,33,-64.6,44.7,-76.4Z"
                  transform="translate(100 100)" />

              </svg>
            </div>
          </motion.div>

          {/* Deconstructed Typography */}
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

              {displayTitle.split(' ').slice(0, 4).map((word, i) => // Limit to 4 words to avoid overflow
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

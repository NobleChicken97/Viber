import React from 'react';
import { motion } from 'framer-motion';
import { MoodType, moodPacks } from './MoodPacks';

interface MoodSelectorProps {
  currentMood: MoodType;
  onMoodChange: (mood: MoodType) => void;
}

export function MoodSelector({ currentMood, onMoodChange }: MoodSelectorProps) {
  const activePack = moodPacks[currentMood];
  
  return (
    <div
      className="hidden md:flex flex-col h-full w-60 py-8 px-6 gap-4 overflow-y-auto no-scrollbar border-r transition-colors duration-500 z-50 relative"
      style={{
        backgroundColor: activePack.bg,
        borderColor: activePack.border
      }}>

      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4" style={{ color: activePack.text }}>
          Select Mood
        </h3>
      </div>
      
      {Object.values(moodPacks).map((pack) => {
        const isActive = currentMood === pack.id;
        return (
          <motion.button
            key={pack.id}
            onClick={() => onMoodChange(pack.id)}
            whileHover={{
              scale: 1.02,
              x: 5
            }}
            whileTap={{
              scale: 0.98
            }}
            className={`
              flex items-center gap-3 px-4 py-3 transition-all duration-300 w-full text-left
            `}
            style={{
              backgroundColor: isActive ? pack.accent : 'transparent',
              color: isActive ?
              pack.id === 'happy' || pack.id === 'calm' ?
              '#000' :
              '#fff' :
              pack.textMuted,
              borderRadius: activePack.borderRadius,
              border: `1px solid ${isActive ? 'transparent' : pack.border}`,
              fontFamily: activePack.bodyFont,
              fontWeight: isActive ? 700 : 500
            }}>

            <span className="text-xl">{pack.emoji}</span>
            <span className="uppercase tracking-wide text-sm">{pack.name}</span>
          </motion.button>);

      })}
    </div>);
}

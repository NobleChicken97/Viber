'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Music, ChevronRight, Clock, Settings, Sparkles } from 'lucide-react';
import { MoodThemeProvider } from '@/components/MoodThemeProvider';
import { CameraModal } from '@/components/CameraModal';
import type { Mood } from '@/lib/moodTheme';

const MOODS: Array<{ id: Mood; label: string; emoji: string; desc: string }> = [
  { id: 'sad', label: 'Sad', emoji: '💙', desc: 'Melancholic & reflective' },
  { id: 'calm', label: 'Calm', emoji: '🌿', desc: 'Peaceful & ambient' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', desc: 'Warm & intimate' },
  { id: 'happy', label: 'Happy', emoji: '☀️', desc: 'Bright & uplifting' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', desc: 'High energy & intense' },
];

export default function Home() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const handleMoodDetected = (mood: Mood) => {
    setShowCamera(false);
    router.push(`/player?mood=${mood}`);
  };

  const handleMoodSelect = (mood: Mood) => {
    router.push(`/player?mood=${mood}`);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <MoodThemeProvider startMood="calm" upliftEnabled={false} />

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onMoodDetected={handleMoodDetected}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 sm:px-12 py-6">
          <div className="flex items-center gap-2">
            <Music size={20} className="opacity-60" />
            <span className="text-sm font-bold tracking-[0.3em] uppercase opacity-80">Viber</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/history')}
              className="p-2 text-foreground/40 hover:text-foreground/80 transition-colors"
              title="Session History"
            >
              <Clock size={18} />
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 text-foreground/40 hover:text-foreground/80 transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 pb-12">
          <div className="max-w-2xl w-full text-center">
            
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-6xl sm:text-8xl font-black tracking-[0.2em] uppercase mb-4 bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
                VIBER
              </h1>
              <p className="text-lg sm:text-xl text-foreground/60 font-light tracking-wide">
                Music that feels what you feel
              </p>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col items-center gap-4 mb-12">
              <button
                onClick={() => setShowCamera(true)}
                className="group relative flex items-center gap-3 px-8 py-4 bg-foreground/10 hover:bg-foreground/15 border border-foreground/10 hover:border-foreground/20 rounded-full transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera size={20} className="text-foreground/70" />
                <span className="text-base font-semibold tracking-widest uppercase">
                  Start Vibing
                </span>
                <ChevronRight size={16} className="text-foreground/40 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowMoodPicker(!showMoodPicker)}
                className="text-xs tracking-[0.2em] uppercase text-foreground/40 hover:text-foreground/70 transition-colors py-2"
              >
                Skip camera, choose mood
              </button>
            </div>

            {/* Manual Mood Picker (expandable) */}
            {showMoodPicker && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-foreground/5 bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">
                      {mood.emoji}
                    </span>
                    <span className="text-xs font-semibold tracking-wider uppercase text-foreground/70 group-hover:text-foreground">
                      {mood.label}
                    </span>
                    <span className="text-[10px] text-foreground/30 hidden sm:block">
                      {mood.desc}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* How it works teaser */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-foreground/30">
              <div className="flex items-center gap-2">
                <Sparkles size={14} />
                <span className="text-xs tracking-wider">12-song mood journey</span>
              </div>
              <span className="hidden sm:block">·</span>
              <div className="flex items-center gap-2">
                <Camera size={14} />
                <span className="text-xs tracking-wider">On-device AI detection</span>
              </div>
              <span className="hidden sm:block">·</span>
              <div className="flex items-center gap-2">
                <Music size={14} />
                <span className="text-xs tracking-wider">No two sessions alike</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-12 py-6 flex items-center justify-between text-foreground/30">
          <div className="flex items-center gap-4 text-xs tracking-wider">
            <button
              onClick={() => router.push('/how')}
              className="hover:text-foreground/60 transition-colors"
            >
              How It Works
            </button>
            <span>·</span>
            <button
              onClick={() => router.push('/privacy')}
              className="hover:text-foreground/60 transition-colors"
            >
              Privacy
            </button>
          </div>
          <span className="text-xs tracking-wider">
            Built with 🎵 by Arpan
          </span>
        </footer>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Home, Music } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* 404 Visual */}
        <div className="relative">
          <div className="text-[120px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 leading-none">
            404
          </div>
          <Music className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-purple-500/20" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">
            This Vibe Doesn&apos;t Exist
          </h1>
          <p className="text-gray-400 text-sm">
            The page you&apos;re looking for has wandered off the playlist. 
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all transform hover:scale-105 font-medium"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link 
            href="/player"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm font-medium"
          >
            <Music className="w-5 h-5" />
            Start Vibing
          </Link>
        </div>

        {/* Subtle Animation */}
        <div className="pt-8">
          <div className="inline-block animate-bounce text-purple-400">
            ♪ ♫ ♪
          </div>
        </div>
      </div>
    </div>
  );
}

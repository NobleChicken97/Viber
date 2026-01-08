"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";

/**
 * YouTube IFrame Player API Types
 */

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  loadVideoById(videoId: string): void;
  destroy(): void;
}

export interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    fs?: 0 | 1;
    iv_load_policy?: 1 | 3;
    modestbranding?: 0 | 1;
    origin?: string;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { target: YTPlayer; data: number }) => void;
    onError?: (event: { target: YTPlayer; data: number }) => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, config: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (error: number) => void;
  onProgress?: (elapsed: number, duration: number) => void;
  autoplay?: boolean;
  volume?: number;
  className?: string;
}

export interface YouTubePlayerControls {
  containerRef: RefObject<HTMLDivElement | null>;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideo: (videoId: string) => void;
  isReady: boolean;
  isPlaying: boolean;
}

export function useYouTubePlayer({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onError,
  onProgress,
  autoplay = false,
  volume = 80,
}: Omit<YouTubePlayerProps, "className">): YouTubePlayerControls {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube IFrame API script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      return;
    }

    // Load script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Wait for API to be ready
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API ready");
    };
  }, []);

  // Initialize player
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const elapsed = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        onProgress?.(elapsed, duration);
      }
    }, 500);
  }, [onProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.YT || !window.YT.Player || !containerRef.current) {
      return;
    }

    const containerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.id = containerId;

    playerRef.current = new window.YT.Player(containerId, {
      height: "100%",
      width: "100%",
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        origin: window.location.origin,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          event.target.setVolume(volume);
          onReady?.();
        },
        onStateChange: (event) => {
          const state = event.data;
          const YT = window.YT;
          if (!YT) return;

          if (state === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            onPlay?.();
            startProgressTracking();
          } else if (state === YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            onPause?.();
            stopProgressTracking();
          } else if (state === YT.PlayerState.ENDED) {
            setIsPlaying(false);
            onEnd?.();
            stopProgressTracking();
          }
        },
        onError: (event) => {
          console.error("YouTube Player Error:", event.data);
          onError?.(event.data);
        },
      },
    });

    return () => {
      stopProgressTracking();
      playerRef.current?.destroy();
    };
  }, [videoId, autoplay, volume, onReady, onPlay, onPause, onEnd, onError, startProgressTracking, stopProgressTracking]);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    playerRef.current?.setVolume(level);
  }, []);

  const getCurrentTime = useCallback(() => {
    return playerRef.current?.getCurrentTime() || 0;
  }, []);

  const getDuration = useCallback(() => {
    return playerRef.current?.getDuration() || 0;
  }, []);

  const loadVideo = useCallback((newVideoId: string) => {
    playerRef.current?.loadVideoById(newVideoId);
  }, []);

  return {
    containerRef,
    isReady,
    isPlaying,
    play,
    pause,
    setVolume: setVolumeLevel,
    getCurrentTime,
    getDuration,
    loadVideo,
  };
}

export function YouTubePlayer({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onError,
  onProgress,
  autoplay = false,
  volume = 80,
  className = "",
}: YouTubePlayerProps) {
  const { containerRef } = useYouTubePlayer({
    videoId,
    onReady,
    onPlay,
    onPause,
    onEnd,
    onError,
    onProgress,
    autoplay,
    volume,
  });

  return <div ref={containerRef} className={className} />;
}

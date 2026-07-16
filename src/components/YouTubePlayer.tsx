"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";
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
  seekTo: (seconds: number) => void;
  isReady: boolean;
  isPlaying: boolean;
}

export function useYouTubePlayer({
  onReady,
  onPlay,
  onPause,
  onEnd,
  onError,
  onProgress,
  volume = 80,
}: Omit<YouTubePlayerProps, "className">): YouTubePlayerControls {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [containerMounted, setContainerMounted] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onReadyRef = useRef(onReady);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    const checkContainer = () => {
      if (containerRef.current && !containerMounted) {
        setContainerMounted(true);
      }
    };
    checkContainer();
    const interval = setInterval(checkContainer, 50);
    const timeout = setTimeout(() => clearInterval(interval), 1000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [containerMounted]);
  useEffect(() => {
    onReadyRef.current = onReady;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onEndRef.current = onEnd;
    onErrorRef.current = onError;
    onProgressRef.current = onProgress;
  }, [onReady, onPlay, onPause, onEnd, onError, onProgress]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApiLoaded(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      if (process.env.NODE_ENV === 'development') {
        console.log("YouTube IFrame API ready");
      }
      setApiLoaded(true);
    };
    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setApiLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);
    
    return () => clearInterval(checkInterval);
  }, []);
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const elapsed = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        onProgressRef.current?.(elapsed, duration);
      }
    }, 500);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (!apiLoaded || !window.YT || !window.YT.Player) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Waiting for YT API...', { apiLoaded, hasYT: !!window.YT });
      }
      return;
    }
    
    if (!containerRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Container ref not available yet');
      }
      return;
    }
    if (playerRef.current) {
      return;
    }

    const containerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.id = containerId;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating YouTube player with container:', containerId);
    }
    const playerConfig: YTPlayerOptions = {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 0,
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
          onReadyRef.current?.();
          if (process.env.NODE_ENV === 'development') {
            console.log('YouTube player ready');
          }
        },
        onStateChange: (event) => {
          const state = event.data;
          const YT = window.YT;
          if (!YT) return;

          if (state === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            onPlayRef.current?.();
            startProgressTracking();
          } else if (state === YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            onPauseRef.current?.();
            stopProgressTracking();
          } else if (state === YT.PlayerState.ENDED) {
            setIsPlaying(false);
            onEndRef.current?.();
            stopProgressTracking();
          }
        },
        onError: (event) => {
          if (process.env.NODE_ENV === 'development') {
            const errorMessages: Record<number, string> = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found or private',
              101: 'Video owner does not allow embedding',
              150: 'Video owner does not allow embedding',
            };
            console.warn(
              `YouTube Player Error ${event.data}: ${errorMessages[event.data] || 'Unknown error'}`
            );
          }
          onErrorRef.current?.(event.data);
        },
      },
    };

    playerRef.current = new window.YT.Player(containerId, playerConfig);

    return () => {
      stopProgressTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [apiLoaded, containerMounted, startProgressTracking, stopProgressTracking, volume]);

  const play = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(level);
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    return playerRef.current?.getCurrentTime() || 0;
  }, []);

  const getDuration = useCallback(() => {
    return playerRef.current?.getDuration() || 0;
  }, []);

  const loadVideo = useCallback((newVideoId: string) => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('loadVideoById called with:', newVideoId);
      }
      playerRef.current.loadVideoById(newVideoId);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('loadVideoById not available, player:', !!playerRef.current);
      }
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
      const duration = playerRef.current.getDuration();
      onProgressRef.current?.(seconds, duration);
    }
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
    seekTo,
  };
}

export function YouTubePlayer({
  onReady,
  onPlay,
  onPause,
  onEnd,
  onError,
  onProgress,
  volume = 80,
  className = "",
}: YouTubePlayerProps) {
  const { containerRef } = useYouTubePlayer({
    videoId: "", // Unused in hook but required by type
    onReady,
    onPlay,
    onPause,
    onEnd,
    onError,
    onProgress,
    volume,
  });

  return <div ref={containerRef} className={className} />;
}

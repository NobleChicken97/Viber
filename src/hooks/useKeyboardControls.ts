"use client";

import { useEffect, useCallback } from "react";

interface KeyboardControlsOptions {
  onPlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onToggleMute: () => void;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts for the music player:
 * - Space: play/pause
 * - ArrowRight: next track
 * - ArrowLeft: previous track
 * - ArrowUp: volume up
 * - ArrowDown: volume down
 * - M: toggle mute
 */
export function useKeyboardControls({
  onPlayPause,
  onNextTrack,
  onPrevTrack,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  enabled = true,
}: KeyboardControlsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || (e.target as HTMLElement)?.isContentEditable) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNextTrack();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrevTrack();
          break;
        case "ArrowUp":
          e.preventDefault();
          onVolumeUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          onVolumeDown();
          break;
        case "KeyM":
          e.preventDefault();
          onToggleMute();
          break;
      }
    },
    [onPlayPause, onNextTrack, onPrevTrack, onVolumeUp, onVolumeDown, onToggleMute]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

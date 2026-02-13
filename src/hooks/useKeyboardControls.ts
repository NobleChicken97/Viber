"use client";

import { useEffect, useCallback } from "react";

interface KeyboardControlsOptions {
  onPlayPause: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts for the music player:
 * - Space: play/pause
 * - ArrowRight: skip forward 5s
 * - ArrowLeft: skip backward 5s
 */
export function useKeyboardControls({
  onPlayPause,
  onSeekForward,
  onSeekBackward,
  enabled = true,
}: KeyboardControlsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeekForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeekBackward();
          break;
      }
    },
    [onPlayPause, onSeekForward, onSeekBackward]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

"use client";

import { useEffect, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { SyncedLine, getActiveLyricIndex } from "@/hooks/useLyrics";

interface LyricsPanelProps {
  plainLyrics: string | null;
  syncedLyrics: SyncedLine[] | null;
  currentTime: number;
  loading: boolean;
  error: string | null;
  accentColor?: string;
  headingFont?: string;
  textColor?: string;
  textMuted?: string;
}

export function LyricsPanel({
  plainLyrics,
  syncedLyrics,
  currentTime,
  loading,
  error,
  accentColor = "#58a6ff",
  headingFont = '"Inter", sans-serif',
  textColor = "#c9d1d9",
  textMuted = "#6e7681",
}: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime, syncedLyrics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: accentColor }}
        />
        <span
          className="text-sm tracking-[0.25em] uppercase"
          style={{ fontFamily: headingFont, color: textMuted }}
        >
          Finding lyrics...
        </span>
      </div>
    );
  }

  if (error || (!plainLyrics && !syncedLyrics)) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Mic size={28} style={{ color: textMuted, opacity: 0.5 }} />
        <span
          className="text-sm tracking-[0.25em] uppercase"
          style={{ fontFamily: headingFont, color: textMuted }}
        >
          Lyrics not available
        </span>
      </div>
    );
  }
  if (syncedLyrics && syncedLyrics.length > 0) {
    const activeIndex = getActiveLyricIndex(syncedLyrics, currentTime);

    return (
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-6 py-8 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: `${accentColor}40 transparent` }}
      >
        <div className="flex flex-col gap-5">
          {syncedLyrics.map((line, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;

            return (
              <p
                key={i}
                ref={isActive ? activeRef : null}
                className="transition-all duration-500 ease-out"
                style={{
                  fontFamily: headingFont,
                  fontSize: isActive ? "1.55rem" : "1.2rem",
                  fontWeight: isActive ? 700 : 400,
                  lineHeight: 1.4,
                  color: isActive ? accentColor : isPast ? textMuted : textColor,
                  opacity: isActive ? 1 : isPast ? 0.35 : 0.65,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transformOrigin: "left center",
                  letterSpacing: isActive ? "0.03em" : "0.01em",
                  textShadow: isActive
                    ? `0 0 30px ${accentColor}50, 0 0 60px ${accentColor}20`
                    : "none",
                }}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-8"
      style={{ scrollbarWidth: "thin", scrollbarColor: `${accentColor}40 transparent` }}
    >
      <div className="flex flex-col gap-3">
        {plainLyrics!.split("\n").map((line, i) => (
          <p
            key={i}
            style={{
              fontFamily: headingFont,
              fontSize: "1.15rem",
              fontWeight: 400,
              lineHeight: 1.5,
              color: line.trim() ? textColor : "transparent",
              opacity: line.trim() ? 0.75 : 0,
              height: line.trim() ? "auto" : "0.75rem",
              letterSpacing: "0.01em",
            }}
          >
            {line || "\u00A0"}
          </p>
        ))}
      </div>
    </div>
  );
}
interface LyricsToggleProps {
  showLyrics: boolean;
  onToggle: () => void;
  loading: boolean;
  accentColor?: string;
}

export function LyricsToggle({
  showLyrics,
  onToggle,
  loading,
  accentColor,
}: LyricsToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full transition-all ${loading ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: showLyrics ? `${accentColor || "#fff"}20` : "transparent",
        color: showLyrics ? accentColor || "#fff" : "#9ca3af",
      }}
      title={showLyrics ? "Hide lyrics" : "Show lyrics"}
    >
      <Mic size={18} />
    </button>
  );
}

"use client";

import { useEffect, useRef, useReducer } from "react";

export interface SyncedLine {
  time: number; // seconds
  text: string;
}

export interface LyricsData {
  plainLyrics: string | null;
  syncedLyrics: SyncedLine[] | null;
  trackName: string;
  artistName: string;
}

/**
 * Parse LRC format lyrics into timed lines.
 * Format: [mm:ss.xx] Lyrics text
 */
function parseLRC(lrc: string): SyncedLine[] {
  const lines: SyncedLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/;

  for (const line of lrc.split("\n")) {
    const match = line.match(regex);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const time = mins * 60 + secs + ms / (match[3].length === 3 ? 1000 : 100);
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * Fetch lyrics from lrclib.net — free, no API key needed.
 * Supports both synced (LRC) and plain lyrics.
 */
export function useLyrics(trackName: string | undefined, artistName: string | undefined) {
  type State = { lyrics: LyricsData | null; loading: boolean; error: string | null };
  type Action =
    | { type: "reset" }
    | { type: "loading" }
    | { type: "success"; lyrics: LyricsData }
    | { type: "error"; error: string };

  const reducer = (_: State, action: Action): State => {
    switch (action.type) {
      case "reset": return { lyrics: null, loading: false, error: null };
      case "loading": return { lyrics: null, loading: true, error: null };
      case "success": return { lyrics: action.lyrics, loading: false, error: null };
      case "error": return { lyrics: null, loading: false, error: action.error };
    }
  };

  const [state, dispatch] = useReducer(reducer, { lyrics: null, loading: false, error: null });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!trackName || !artistName) {
      dispatch({ type: "reset" });
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "loading" });

    (async () => {
      try {
        // Use search API — we don't have album_name/duration required by /api/get
        const searchParams = new URLSearchParams({
          track_name: trackName,
          artist_name: artistName,
        });

        const res = await fetch(`https://lrclib.net/api/search?${searchParams}`, {
          signal: controller.signal,
          headers: { "User-Agent": "Viber Music App/1.0 (https://github.com/NobleChicken97/Viber)" },
        });

        if (res.ok) {
          const results = await res.json();
          if (results.length > 0) {
            // Prefer results with synced lyrics
            const withSynced = results.find((r: Record<string, unknown>) => r.syncedLyrics);
            const best = withSynced || results[0];
            dispatch({
              type: "success",
              lyrics: {
                plainLyrics: best.plainLyrics || null,
                syncedLyrics: best.syncedLyrics ? parseLRC(best.syncedLyrics) : null,
                trackName: best.trackName,
                artistName: best.artistName,
              },
            });
            return;
          }
        }

        dispatch({ type: "error", error: "Lyrics not found" });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        dispatch({ type: "error", error: "Failed to fetch lyrics" });
      }
    })();

    return () => controller.abort();
  }, [trackName, artistName]);

  return { lyrics: state.lyrics, loading: state.loading, error: state.error };
}

/**
 * Find the currently active lyric line based on playback time.
 */
export function getActiveLyricIndex(
  syncedLyrics: SyncedLine[],
  currentTime: number
): number {
  if (!syncedLyrics.length) return -1;

  for (let i = syncedLyrics.length - 1; i >= 0; i--) {
    if (currentTime >= syncedLyrics[i].time) return i;
  }

  return -1;
}

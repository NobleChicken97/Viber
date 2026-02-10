"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from "react";
import type { Mood } from "@/lib/moodTheme";
import type { Track } from "@/lib/playlists";
import { generateMoodPath, distributeMoodPathBySongs } from "@/lib/moodPath";
import { buildSessionQueue, getRandomTracks } from "@/lib/playlists";
import { saveSession, loadSession, completeSession, isStorageAvailable } from "@/lib/sessionPersistence";

/**
 * Session State Types
 */
export interface SessionState {
  queue: Track[];
  currentIndex: number;
  countedSongs: number; // Songs with ≥25% listened
  listenProgress: number[]; // Progress (0-1) for each song in queue
  isPlaying: boolean;
  volume: number;
  moodPath: Mood[];
  distribution: number[];
  upliftEnabled: boolean;
}

type SessionAction =
  | { type: "INITIALIZE"; payload: { startMood: Mood; upliftEnabled: boolean } }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "UPDATE_PROGRESS"; payload: { index: number; progress: number } }
  | { type: "NEXT_SONG" }
  | { type: "SKIP_SONG" };

const SessionContext = createContext<
  | {
      state: SessionState;
      dispatch: React.Dispatch<SessionAction>;
      play: () => void;
      pause: () => void;
      next: () => void;
      skip: () => void;
      setVolume: (vol: number) => void;
      updateProgress: (elapsed: number, duration: number) => void;
    }
  | undefined
>(undefined);

const initialState: SessionState = {
  queue: [],
  currentIndex: 0,
  countedSongs: 0,
  listenProgress: [],
  isPlaying: false,
  volume: 80,
  moodPath: [],
  distribution: [],
  upliftEnabled: true,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "INITIALIZE": {
      const { startMood, upliftEnabled } = action.payload;
      const moodPath = generateMoodPath({ startMood, upliftEnabled });
      const buckets = distributeMoodPathBySongs(moodPath, 12);
      const distribution = buckets.map((b) => b.targetSongs);
      const queue = buildSessionQueue(moodPath, distribution);

      return {
        ...state,
        queue,
        moodPath,
        distribution,
        upliftEnabled,
        listenProgress: new Array(queue.length).fill(0),
        currentIndex: 0,
        countedSongs: 0,
      };
    }

    case "PLAY":
      return { ...state, isPlaying: true };

    case "PAUSE":
      return { ...state, isPlaying: false };

    case "SET_VOLUME":
      return { ...state, volume: action.payload };

    case "UPDATE_PROGRESS": {
      const { index, progress } = action.payload;
      const newProgress = [...state.listenProgress];
      newProgress[index] = progress;

      // Check if song just became "counted" (≥25%)
      const wasCounted = state.listenProgress[index] >= 0.25;
      const isCounted = progress >= 0.25;
      const newCountedSongs =
        !wasCounted && isCounted ? state.countedSongs + 1 : state.countedSongs;

      return {
        ...state,
        listenProgress: newProgress,
        countedSongs: newCountedSongs,
      };
    }

    case "NEXT_SONG": {
      // Advance to next song (only if current was counted)
      const currentProgress = state.listenProgress[state.currentIndex];
      if (currentProgress < 0.25) {
        console.warn("Cannot advance: current song not counted (< 25%)");
        return state;
      }

      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        return { ...state, isPlaying: false };
      }

      return {
        ...state,
        currentIndex: nextIndex,
      };
    }

    case "SKIP_SONG": {
      // Skip current song: if < 25%, append replacement from same mood bucket
      const currentProgress = state.listenProgress[state.currentIndex];

      if (currentProgress >= 0.25) {
        // Already counted, just advance normally
        return sessionReducer(state, { type: "NEXT_SONG" });
      }

      // Find which mood stage we're in
      let stageIndex = 0;
      let cumulativeSongs = 0;
      for (let i = 0; i < state.distribution.length; i++) {
        cumulativeSongs += state.distribution[i];
        if (state.countedSongs < cumulativeSongs) {
          stageIndex = i;
          break;
        }
      }

      const currentMood = state.moodPath[stageIndex];
      const usedIds = state.queue.map((t) => t.id);
      const replacement = getRandomTracks(currentMood, 1, usedIds);

      if (replacement.length === 0) {
        console.warn("No replacement tracks available for mood:", currentMood);
        // Force advance anyway
        return sessionReducer(state, { type: "NEXT_SONG" });
      }

      // Insert replacement at the end of current mood bucket
      const newQueue = [...state.queue];
      newQueue.splice(cumulativeSongs, 0, ...replacement);

      const newProgress = [...state.listenProgress];
      newProgress.splice(cumulativeSongs, 0, 0);

      return {
        ...state,
        queue: newQueue,
        listenProgress: newProgress,
        currentIndex: state.currentIndex + 1,
      };
    }

    default:
      return state;
  }
}

export function SessionProvider({
  children,
  startMood,
  upliftEnabled,
}: {
  children: ReactNode;
  startMood?: Mood;
  upliftEnabled?: boolean;
}) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Load persisted session on mount
  useEffect(() => {
    if (!isStorageAvailable()) return;
    
    const persisted = loadSession();
    if (persisted) {
      // Restore session state
      dispatch({
        type: "INITIALIZE",
        payload: { startMood: persisted.startMood, upliftEnabled: persisted.upliftEnabled }
      });
      // Note: We can't fully restore the state here without modifying the reducer
      // For MVP, just initializing fresh is acceptable
    } else if (startMood !== undefined && upliftEnabled !== undefined) {
      dispatch({ type: "INITIALIZE", payload: { startMood, upliftEnabled } });
    }
  }, [startMood, upliftEnabled]);

  // Save session state on changes
  useEffect(() => {
    if (!isStorageAvailable() || state.queue.length === 0) return;
    
    saveSession({
      queue: state.queue,
      currentIndex: state.currentIndex,
      countedSongs: state.countedSongs,
      listenProgress: state.listenProgress,
      volume: state.volume,
      moodPath: state.moodPath,
      distribution: state.distribution,
      upliftEnabled: state.upliftEnabled,
      startMood: state.moodPath[0] || 'calm'
    });
  }, [state]);

  // Complete session when finished
  useEffect(() => {
    if (state.countedSongs >= 12 && state.queue.length > 0) {
      const finalMood = state.moodPath[state.moodPath.length - 1] || state.moodPath[0];
      completeSession({
        startMood: state.moodPath[0],
        finalMood,
        songsCompleted: state.countedSongs,
        moodPath: state.moodPath
      });
    }
  }, [state.countedSongs, state.queue.length, state.moodPath]);

  const play = useCallback(() => dispatch({ type: "PLAY" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const next = useCallback(() => dispatch({ type: "NEXT_SONG" }), []);
  const skip = useCallback(() => dispatch({ type: "SKIP_SONG" }), []);
  const setVolume = useCallback((vol: number) => dispatch({ type: "SET_VOLUME", payload: vol }), []);
  const updateProgress = useCallback((elapsed: number, duration: number) => {
    if (duration > 0) {
      const progress = elapsed / duration;
      dispatch({
        type: "UPDATE_PROGRESS",
        payload: { index: state.currentIndex, progress },
      });
    }
  }, [state.currentIndex]);

  return (
    <SessionContext.Provider value={{ state, dispatch, play, pause, next, skip, setVolume, updateProgress }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

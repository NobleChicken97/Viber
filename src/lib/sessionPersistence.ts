/**
 * Session Persistence Service
 * 
 * Saves and restores session state using localStorage.
 * Enables session recovery after page refresh.
 */

import type { Mood } from '@/lib/moodTheme';
import type { Track } from '@/lib/playlists';

export interface PersistedSession {
  id: string;
  startTime: number;
  lastUpdated: number;
  queue: Track[];
  currentIndex: number;
  countedSongs: number;
  listenProgress: number[];
  volume: number;
  moodPath: Mood[];
  distribution: number[];
  upliftEnabled: boolean;
  startMood: Mood;
}

export interface SessionHistory {
  id: string;
  startTime: number;
  endTime: number;
  startMood: Mood;
  finalMood: Mood;
  songsCompleted: number;
  totalDuration: number; // in seconds
  moodPath: Mood[];
}

const CURRENT_SESSION_KEY = 'viber_current_session';
const SESSION_HISTORY_KEY = 'viber_session_history';
const MAX_HISTORY = 10;

/**
 * Save current session state
 */
export function saveSession(session: Omit<PersistedSession, 'id' | 'startTime' | 'lastUpdated'>): void {
  try {
    const existing = loadSession();
    const sessionData: PersistedSession = {
      id: existing?.id || generateSessionId(),
      startTime: existing?.startTime || Date.now(),
      lastUpdated: Date.now(),
      ...session
    };
    
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Load current session state
 */
export function loadSession(): PersistedSession | null {
  try {
    const data = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!data) return null;
    
    const session = JSON.parse(data) as PersistedSession;
    
    // Validate session isn't too old (expire after 24 hours)
    const age = Date.now() - session.lastUpdated;
    if (age > 24 * 60 * 60 * 1000) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

/**
 * Clear current session
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Complete current session and add to history
 */
export function completeSession(finalState: {
  startMood: Mood;
  finalMood: Mood;
  songsCompleted: number;
  moodPath: Mood[];
}): void {
  try {
    const currentSession = loadSession();
    if (!currentSession) return;
    
    const historyEntry: SessionHistory = {
      id: currentSession.id,
      startTime: currentSession.startTime,
      endTime: Date.now(),
      startMood: finalState.startMood,
      finalMood: finalState.finalMood,
      songsCompleted: finalState.songsCompleted,
      totalDuration: Math.floor((Date.now() - currentSession.startTime) / 1000),
      moodPath: finalState.moodPath
    };
    
    addToHistory(historyEntry);
    clearSession();
  } catch (error) {
    console.error('Failed to complete session:', error);
  }
}

/**
 * Get session history
 */
export function getSessionHistory(): SessionHistory[] {
  try {
    const data = localStorage.getItem(SESSION_HISTORY_KEY);
    if (!data) return [];
    
    return JSON.parse(data) as SessionHistory[];
  } catch (error) {
    console.error('Failed to load session history:', error);
    return [];
  }
}

/**
 * Add session to history
 */
function addToHistory(session: SessionHistory): void {
  try {
    const history = getSessionHistory();
    history.unshift(session); // Add to beginning
    
    // Keep only last N sessions
    const trimmed = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(SESSION_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  totalSessions: number;
  totalSongs: number;
  totalTime: number;
  favoriteMood: Mood | null;
  avgSessionLength: number;
} {
  const history = getSessionHistory();
  
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalSongs: 0,
      totalTime: 0,
      favoriteMood: null,
      avgSessionLength: 0
    };
  }
  
  const totalSessions = history.length;
  const totalSongs = history.reduce((sum, s) => sum + s.songsCompleted, 0);
  const totalTime = history.reduce((sum, s) => sum + s.totalDuration, 0);
  
  // Find favorite mood
  const moodCounts: Record<Mood, number> = {
    sad: 0,
    calm: 0,
    romantic: 0,
    happy: 0,
    energetic: 0
  };
  
  history.forEach(session => {
    session.moodPath.forEach(mood => {
      moodCounts[mood]++;
    });
  });
  
  const favoriteMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as Mood || null;
  
  const avgSessionLength = totalTime / totalSessions;
  
  return {
    totalSessions,
    totalSongs,
    totalTime,
    favoriteMood,
    avgSessionLength
  };
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

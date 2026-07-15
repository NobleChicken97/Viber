"use client";

import { useSession } from "@/contexts/SessionContext";
import { YouTubePlayer } from "./YouTubePlayer";
export function SessionPlayer() {
  const { state, dispatch } = useSession();
  const currentSong = state.queue[state.currentIndex];

  if (!currentSong) {
    return null;
  }

  const handleProgress = (elapsed: number, duration: number) => {
    if (duration > 0) {
      const progress = elapsed / duration;
      dispatch({
        type: "UPDATE_PROGRESS",
        payload: { index: state.currentIndex, progress },
      });
    }
  };

  const handleVideoEnd = () => {
    dispatch({ type: "NEXT_SONG" });
  };

  return (
    <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
      <YouTubePlayer
        videoId={currentSong.id}
        autoplay={state.isPlaying}
        volume={state.volume}
        onProgress={handleProgress}
        onEnd={handleVideoEnd}
      />
    </div>
  );
}
export function useSessionPlayerControls() {
  const { state, dispatch } = useSession();

  return {
    play: () => dispatch({ type: "PLAY" }),
    pause: () => dispatch({ type: "PAUSE" }),
    skip: () => {
      const currentProgress = state.listenProgress[state.currentIndex] || 0;
      if (currentProgress < 0.25) {
        dispatch({ type: "SKIP_SONG" });
      } else {
        dispatch({ type: "NEXT_SONG" });
      }
    },
    setVolume: (volume: number) =>
      dispatch({ type: "SET_VOLUME", payload: volume }),
    state,
  };
}

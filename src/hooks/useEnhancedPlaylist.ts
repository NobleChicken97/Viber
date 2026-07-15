
import { useState, useEffect } from 'react';
import { fetchVideoDetails, isYouTubeAPIConfigured } from '@/lib/youtubeApi';
import type { Track } from '@/lib/playlists';

export interface EnhancedTrack extends Track {
  thumbnail?: string;
  duration?: number;
  isEnhanced: boolean;
}

interface UseEnhancedPlaylistResult {
  tracks: EnhancedTrack[];
  isLoading: boolean;
  error: string | null;
  isAPIConfigured: boolean;
}

export function useEnhancedPlaylist(tracks: Track[]): UseEnhancedPlaylistResult {
  const [enhancedTracks, setEnhancedTracks] = useState<EnhancedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAPIConfigured = isYouTubeAPIConfigured();

  useEffect(() => {
    let mounted = true;

    async function enhancePlaylists() {
      if (!isAPIConfigured) {
        if (mounted) {
          setEnhancedTracks(tracks.map(track => ({
            ...track,
            thumbnail: `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`,
            duration: track.duration || 240,
            isEnhanced: false
          })));
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const batchSize = 50;
        const batches: Track[][] = [];
        
        for (let i = 0; i < tracks.length; i += batchSize) {
          batches.push(tracks.slice(i, i + batchSize));
        }

        const allEnhanced: EnhancedTrack[] = [];

        for (const batch of batches) {
          const videoIds = batch.map(t => t.id);
          const details = await fetchVideoDetails(videoIds);
          const enhanced = batch.map((track) => {
            const apiData = details.find(d => d.id === track.id);
            return {
              ...track,
              title: apiData?.title || track.title,
              artist: apiData?.artist || track.artist,
              thumbnail: apiData?.thumbnail || `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`,
              duration: apiData?.duration || track.duration || 240,
              isEnhanced: !!apiData
            };
          });

          allEnhanced.push(...enhanced);
        }

        if (mounted) {
          setEnhancedTracks(allEnhanced);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to enhance playlist:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load playlist details');
          setEnhancedTracks(tracks.map(track => ({
            ...track,
            thumbnail: `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`,
            duration: track.duration || 240,
            isEnhanced: false
          })));
          setIsLoading(false);
        }
      }
    }

    enhancePlaylists();

    return () => {
      mounted = false;
    };
  }, [tracks, isAPIConfigured]);

  return {
    tracks: enhancedTracks,
    isLoading,
    error,
    isAPIConfigured
  };
}


export interface YouTubeVideo {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  thumbnail: string;
}

interface YouTubeAPIError {
  error: {
    code: number;
    message: string;
  };
}

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}
function extractArtist(title: string): string {
  const dashIndex = title.indexOf(' - ');
  if (dashIndex > 0 && dashIndex < title.length / 2) {
    return title.substring(0, dashIndex).trim();
  }
  const pipeIndex = title.indexOf(' | ');
  if (pipeIndex > 0 && pipeIndex < title.length / 2) {
    return title.substring(0, pipeIndex).trim();
  }
  const parenIndex = title.indexOf('(');
  if (parenIndex > 0) {
    const beforeParen = title.substring(0, parenIndex).trim();
    const words = beforeParen.split(' ');
    if (words.length > 1) {
      return words.slice(0, Math.ceil(words.length / 2)).join(' ');
    }
  }
  
  return 'Unknown Artist';
}
export async function fetchVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
  if (!API_KEY) {
    console.warn('YouTube API key not configured');
    return videoIds.map(id => ({
      id,
      title: 'Unknown Title',
      artist: 'Unknown Artist',
      duration: 240, // 4 minutes default
      thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
    }));
  }

  try {
    const idsParam = videoIds.join(',');
    const url = `${BASE_URL}/videos?part=snippet,contentDetails&id=${idsParam}&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if ('error' in data) {
      const error = data as YouTubeAPIError;
      console.error('YouTube API error:', error.error.message);
      throw new Error(error.error.message);
    }

    return data.items.map((item: Record<string, unknown>) => {
      const videoItem = item as {
        id: string;
        snippet: {
          title: string;
          thumbnails?: {
            medium?: { url: string };
            default?: { url: string };
          };
        };
        contentDetails: {
          duration: string;
        };
      };

      return {
        id: videoItem.id,
        title: videoItem.snippet.title,
        artist: extractArtist(videoItem.snippet.title),
        duration: parseDuration(videoItem.contentDetails.duration),
        thumbnail: videoItem.snippet.thumbnails?.medium?.url || 
                  videoItem.snippet.thumbnails?.default?.url ||
                  `https://img.youtube.com/vi/${videoItem.id}/mqdefault.jpg`
      };
    });
  } catch (error) {
    console.error('Failed to fetch video details:', error);
    return videoIds.map(id => ({
      id,
      title: 'Unknown Title',
      artist: 'Unknown Artist',
      duration: 240,
      thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
    }));
  }
}
export async function searchMusic(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  if (!API_KEY) {
    console.warn('YouTube API key not configured');
    return [];
  }

  try {
    const url = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=${maxResults}&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if ('error' in data) {
      const error = data as YouTubeAPIError;
      console.error('YouTube API error:', error.error.message);
      throw new Error(error.error.message);
    }

    const videoIds = data.items.map((item: Record<string, unknown>) => {
      const itemData = item as { id: { videoId: string } };
      return itemData.id.videoId;
    });
    return fetchVideoDetails(videoIds);
  } catch (error) {
    console.error('Failed to search music:', error);
    return [];
  }
}
export async function validateVideoId(videoId: string): Promise<boolean> {
  if (!API_KEY) {
    return true; // Assume valid if no API key
  }

  try {
    const url = `${BASE_URL}/videos?part=status&id=${videoId}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if ('error' in data) {
      return false;
    }

    if (!data.items || data.items.length === 0) {
      return false;
    }

    const video = data.items[0];
    return video.status.embeddable && video.status.privacyStatus !== 'private';
  } catch (error) {
    console.error('Failed to validate video:', error);
    return false;
  }
}
export function isYouTubeAPIConfigured(): boolean {
  return !!API_KEY;
}

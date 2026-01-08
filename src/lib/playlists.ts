/**
 * Viber - YouTube Music Playlists by Mood
 * 
 * Each mood has 30-50 curated tracks from YouTube Music.
 * Format: YouTube video IDs only (not full URLs).
 * 
 * Usage: 
 *   import { MOOD_PLAYLISTS } from '@/lib/playlists';
 *   const sadTracks = MOOD_PLAYLISTS.sad;
 */

export interface Track {
  id: string;        // YouTube video ID
  title: string;     // Song title
  artist: string;    // Artist name
  duration?: number; // Duration in seconds (optional, can be fetched from API)
}

export type MoodPlaylist = Track[];

export interface MoodPlaylists {
  sad: MoodPlaylist;
  calm: MoodPlaylist;
  romantic: MoodPlaylist;
  happy: MoodPlaylist;
  energetic: MoodPlaylist;
}

/**
 * Curated playlists per mood.
 * TODO: Replace with real YouTube Music track IDs.
 */
export const MOOD_PLAYLISTS: MoodPlaylists = {
  sad: [
    { id: "4fndeDfaWCg", title: "Hurt", artist: "Johnny Cash" },
    { id: "hLQl3WQQoQ0", title: "Someone Like You", artist: "Adele" },
    { id: "lDK9QqIzhwk", title: "Liability", artist: "Lorde" },
    { id: "Bznxx12Ptl0", title: "Skinny Love", artist: "Bon Iver" },
    { id: "e9dZQelULDk", title: "How to Save a Life", artist: "The Fray" },
    { id: "jhC1pI76Rqo", title: "The Night We Met", artist: "Lord Huron" },
    { id: "1SiylvmFI_8", title: "Lost Boy", artist: "Ruth B." },
    { id: "YQHsXMglC9A", title: "Hello", artist: "Adele" },
    { id: "RBumgq5yVrA", title: "Let Her Go", artist: "Passenger" },
    { id: "Kb24RrHIbFk", title: "Creep", artist: "Radiohead" },
  ],

  calm: [
    { id: "O0_ardwzTrA", title: "Weightless", artist: "Marconi Union" },
    { id: "1ZYbU82GVz4", title: "Pure Shores", artist: "All Saints" },
    { id: "NUVCQXMUVnI", title: "Holocene", artist: "Bon Iver" },
    { id: "sKbnGfr7yew", title: "Intro", artist: "The xx" },
    { id: "WIKqgE4BwAY", title: "Pink Moon", artist: "Nick Drake" },
    { id: "X_DVS_303kQ", title: "To Build a Home", artist: "The Cinematic Orchestra" },
    { id: "8aJfTqKlMRU", title: "River Flows in You", artist: "Yiruma" },
    { id: "7wOb1bvz9Os", title: "Woods", artist: "Bon Iver" },
    { id: "fcRAHJdeJ6o", title: "Svefn-g-englar", artist: "Sigur Rós" },
    { id: "3ixW5HTutJQ", title: "Avril 14th", artist: "Aphex Twin" },
  ],

  romantic: [
    { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
    { id: "nfWlot6h_JM", title: "Shallow", artist: "Lady Gaga & Bradley Cooper" },
    { id: "lDK9QqIzhwk", title: "Perfect", artist: "Ed Sheeran" },
    { id: "Zi_XLOBDo_Y", title: "Make You Feel My Love", artist: "Adele" },
    { id: "RBumgq5yVrA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
    { id: "dPmZqsQNzGA", title: "At Last", artist: "Etta James" },
    { id: "OPf0YbXqDm0", title: "Unchained Melody", artist: "The Righteous Brothers" },
    { id: "7wtfhZwyrcc", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
    { id: "JGwWNGJdvx8", title: "La Vie en Rose", artist: "Édith Piaf" },
    { id: "XpqqjU7u5Yc", title: "A Thousand Years", artist: "Christina Perri" },
  ],

  happy: [
    { id: "ZbZSe6N_BXs", title: "Happy", artist: "Pharrell Williams" },
    { id: "y6Sxv-sUYtM", title: "Don't Stop Me Now", artist: "Queen" },
    { id: "fLexgOxsZu0", title: "Walking on Sunshine", artist: "Katrina and the Waves" },
    { id: "ru0K8uYEZWw", title: "Mr. Blue Sky", artist: "Electric Light Orchestra" },
    { id: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee" },
    { id: "CevxZvSJLk8", title: "Roar", artist: "Katy Perry" },
    { id: "60ItHLz5WEA", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
    { id: "YR5ApYxkU-U", title: "I Gotta Feeling", artist: "The Black Eyed Peas" },
    { id: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen" },
    { id: "lDK9QqIzhwk", title: "Shake It Off", artist: "Taylor Swift" },
  ],

  energetic: [
    { id: "GDpmVUEjagg", title: "Thunderstruck", artist: "AC/DC" },
    { id: "2HQaBWziYvY", title: "Levels", artist: "Avicii" },
    { id: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii" },
    { id: "fRh_vgS2dFE", title: "Sorry", artist: "Justin Bieber" },
    { id: "hT_nvWreIhg", title: "Counting Stars", artist: "OneRepublic" },
    { id: "fm660vIn8io", title: "Radioactive", artist: "Imagine Dragons" },
    { id: "ktvTqknDobU", title: "Titanium", artist: "David Guetta ft. Sia" },
    { id: "Bznxx12Ptl0", title: "Spectrum", artist: "Zedd" },
    { id: "GhQdlIFylQ8", title: "Turn Down for What", artist: "DJ Snake & Lil Jon" },
    { id: "pIgZ7gMze7A", title: "Animals", artist: "Martin Garrix" },
  ],
};

/**
 * Get random tracks from a mood playlist without repeats.
 * @param mood - Mood key
 * @param count - Number of tracks to select
 * @param excludeIds - Track IDs to exclude (prevent repeats)
 * @returns Array of tracks
 */
export function getRandomTracks(
  mood: keyof MoodPlaylists,
  count: number,
  excludeIds: string[] = []
): Track[] {
  const playlist = MOOD_PLAYLISTS[mood];
  const available = playlist.filter((t) => !excludeIds.includes(t.id));

  if (available.length < count) {
    console.warn(
      `Not enough tracks available for mood "${mood}". Requested: ${count}, Available: ${available.length}`
    );
    return available;
  }

  // Fisher-Yates shuffle
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Build a 12-song queue from a mood path.
 * @param moodPath - Array of moods representing the session path
 * @param distribution - Array of song counts per stage
 * @returns Array of 12 tracks
 */
export function buildSessionQueue(
  moodPath: Array<keyof MoodPlaylists>,
  distribution: number[]
): Track[] {
  const queue: Track[] = [];
  const usedIds: string[] = [];

  for (let i = 0; i < moodPath.length; i++) {
    const mood = moodPath[i];
    const count = distribution[i];
    const tracks = getRandomTracks(mood, count, usedIds);

    queue.push(...tracks);
    usedIds.push(...tracks.map((t) => t.id));
  }

  return queue;
}

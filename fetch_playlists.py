import os
import subprocess
import json

def fetch_playlist_items(url):
    """Fetch playlist items using yt-dlp."""
    print(f"Fetching playlist: {url}")
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--flat-playlist",
        url
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        items = []
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            data = json.loads(line)
            items.append({
                "id": data.get("id"),
                "title": data.get("title"),
                "artist": data.get("uploader", "Unknown Artist")
            })
        return items
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return []

def main():
    songs_file = "songs"
    if not os.path.exists(songs_file):
        print(f"{songs_file} not found.")
        return

    moods_map = {
        "sad": [],
        "calm": [],
        "romantic": [],
        "happy": [],
        "energetic": []
    }

    with open(songs_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or " - " not in line:
            continue
        
        url, mood_desc = line.split(" - ", 1)
        url = url.strip()
        mood_desc = mood_desc.strip().lower()

        # Map to viber mood
        target_mood = None
        for mood in moods_map.keys():
            if mood in mood_desc:
                target_mood = mood
                break
        
        if not target_mood:
            print(f"Could not determine mood for {mood_desc}")
            continue

        items = fetch_playlist_items(url)
        moods_map[target_mood].extend(items)

    # Generate playlists.ts
    out_lines = [
        "/**",
        " * Viber - YouTube Music Playlists by Mood",
        " *",
        " * Curated playlists with tracks per mood for maximum variety.",
        " * Format: YouTube video IDs only (not full URLs).",
        " *",
        " * Usage:",
        " *   import { MOOD_PLAYLISTS } from '@/lib/playlists';",
        " *   const sadTracks = MOOD_PLAYLISTS.sad;",
        " */",
        "",
        "export interface Track {",
        "  id: string;        // YouTube video ID",
        "  title: string;     // Song title",
        "  artist: string;    // Artist name",
        "  duration?: number; // Duration in seconds (optional, can be fetched from API)",
        "}",
        "",
        "export type MoodPlaylist = Track[];",
        "",
        "export interface MoodPlaylists {",
        "  sad: MoodPlaylist;",
        "  calm: MoodPlaylist;",
        "  romantic: MoodPlaylist;",
        "  happy: MoodPlaylist;",
        "  energetic: MoodPlaylist;",
        "}",
        "",
        "export const MOOD_PLAYLISTS: MoodPlaylists = {"
    ]

    for mood, items in moods_map.items():
        out_lines.append(f"  {mood}: [")
        for item in items:
            title = item["title"].replace('"', '\\"') if item["title"] else "Unknown Title"
            artist = item["artist"].replace('"', '\\"') if item["artist"] else "Unknown Artist"
            id_val = item["id"]
            if id_val:
                out_lines.append(f'    {{ id: "{id_val}", title: "{title}", artist: "{artist}" }},')
        out_lines.append("  ],")
        out_lines.append("")
    
    out_lines.append("};")
    out_lines.append("")
    out_lines.append("""
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
""")
    
    with open("src/lib/playlists.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(out_lines))
    
    print("Generated src/lib/playlists.ts successfully.")

if __name__ == "__main__":
    main()

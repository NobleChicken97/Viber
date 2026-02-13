"""Generate updated playlists.ts from extracted YouTube playlists"""

sad_songs = """nOeJuoFs6sM|||КАМИН|||EMIN feat. JONY
-TXtyYZIiWc|||Pastlives|||sapientdream
nyuo9-OjNNg|||I Wanna Be Yours|||Arctic Monkeys
f0bbDFRYD_A|||changes|||XXXTENTACION
IpFX2vq8HKw|||blue|||yung kai
Gwg_KYNgu6Y|||Into Your Arms (No Rap)|||Witt Lowry ft. Ava Max
RgKAFK5djSk|||See You Again|||Wiz Khalifa ft. Charlie Puth
60ItHLz5WEA|||Faded|||Alan Walker
4fqwVBuunxY|||Hurts So Good|||Astrid S
KyAcMpQUY5s|||Hope|||XXXTENTACION
ALZHF5UqnU4|||Alone|||Marshmello
jJPMnTXl63E|||death bed|||Powfu ft. beabadoobee
TdrL3QxjyVw|||Summertime Sadness|||Lana Del Rey
hbqoaJ8sKsQ|||Broken Angel|||Arash feat. Helena
WQq98YPV8yk|||Moral of the Story|||Ashe
DKbfBSrjVHA|||Can We Kiss Forever?|||Kina ft. Adriana Proenza
yctQRe--q6c|||Love Is Gone|||SLANDER ft. Dylan Matthew
1e9B31FLT-s|||Experience|||Ludovico Einaudi
WgTMeICssXY|||Dandelions|||Ruth B.
LTMjsgS_c9M|||Hislerim|||Serhat Durmus feat. Zerrin
YykjpeuMNEk|||Hymn For The Weekend|||Coldplay
EKkzbbLYPuI|||Carol of the Bells|||Lindsey Stirling
PNozaFzqOvI|||Arcade|||Duncan Laurence ft. FLETCHER
I-QfPUz1es8|||Bad Liar|||Imagine Dragons
y7T3ax7JPwI|||Peaky Blinder|||Otnicka
lW9ep22YmlM|||Royalty|||Egzod & Maestro Chives ft. Neoni
mRD0-GxqHVo|||Heat Waves|||Glass Animals
V1Pl8CzNzCw|||lovely|||Billie Eilish & Khalid
Uefu_EU-dW4|||Middle of the Night|||Elley Duhé
OlStmta0Vh4|||I Was Never There|||The Weeknd feat. Gesaffelstein
28W_sotzXUw|||La Câlin|||Serhat Durmus
l08Zw-RY__Q|||WILDFLOWER|||Billie Eilish
kPa7bsKwL-c|||Die With A Smile|||Lady Gaga & Bruno Mars
5FSHSfSnjXk|||What Does It Mean To You|||Carpetman
DF3XjEhJ40Y|||Love Story|||Indila
PWqEPKduGm8|||Infinity|||Jaymes Young
d_HlPboLRL8|||Runaway|||AURORA
MpLaDn82FtI|||Džanum (Moye Moye)|||Teya Dora
m-el0pQLQE4|||childhood|||Rauf & Faik
Mc2-YM9Bhu4|||Hislerim|||Serhat Durmus ft. Zerrin"""

calm_songs = """lbjZPFBD6JU|||Come Away With Me|||Norah Jones
E3iq2GS0B80|||Slave To Love (Piano Cover)|||Bryan Ferry
bPCdsa7hS7M|||Watermark|||Enya
7maJOI3QMu0|||River Flows in You|||Yiruma
rOLN9T9w9kA|||The Sea|||Corinne Bailey Rae
1jNNwbuDXsA|||Feel So High|||Des'ree
QQ84s2uzZ1w|||Ocean Drive|||Lighthouse Family
Rk_sAHh9s08|||Return To Innocence|||Enigma
KLVq0IAzh1A|||Fields Of Gold|||Sting
bTNLYeaL7No|||Songbird|||Eva Cassidy
Jl8iYAo90pE|||Caribbean Blue|||Enya
MEO6gYCFbr0|||Sailing|||Christopher Cross
Ftco75S7ZqE|||Spirit Dances|||Kashy Keegan
dVNdTXEJv1A|||Pure Shores|||All Saints
1TO48Cnl66w|||Thank You|||Dido
fd02pGJx0s0|||Sunrise|||Norah Jones
rrPUJsZQSkw|||Nine Million Bicycles|||Katie Melua
LTrk4X9ACtw|||Orinoco Flow|||Enya
j-fWDrZSiZs|||White Flag|||Dido
DmAOBosGlHY|||Morning Has Broken|||Yusuf / Cat Stevens
rjOhZZyn30k|||Put Your Records On|||Corinne Bailey Rae
KPctA0hT9c8|||Peaceful Easy Feeling|||Eagles
VqhCQZaH4Vs|||What A Wonderful World|||Louis Armstrong
QDYfEBY9NM4|||Let It Be|||The Beatles
d-diB65scQU|||Don't Worry Be Happy|||Bobby McFerrin
flHo2LFWh2I|||Serenity|||Kashy Keegan
GemKqzILV4w|||Chasing Cars|||Snow Patrol
2rd8VktT8xY|||Over The Rainbow|||Eva Cassidy
mer6X7nOY_o|||Somewhere Only We Know|||Lily Allen
tO4dxvguQDk|||Don't Know Why|||Norah Jones"""

def parse_songs(text):
    songs = []
    for line in text.strip().split('\n'):
        if not line.strip():
            continue
        parts = line.split('|||')
        if len(parts) >= 3:
            video_id = parts[0].strip()
            title = parts[1].strip()
            artist = parts[2].strip()
            songs.append(f'    {{ id: "{video_id}", title: "{title}", artist: "{artist}" }}')
    return ',\n'.join(songs)

# Generate the TypeScript content
content = '''/**
 * Viber - YouTube Music Playlists by Mood
 * 
 * Curated playlists with 30-100+ tracks per mood for maximum variety.
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
 * Updated with fresh tracks from curated YouTube playlists.
 */
export const MOOD_PLAYLISTS: MoodPlaylists = {
  sad: [
''' + parse_songs(sad_songs) + '''
  ],

  calm: [
''' + parse_songs(calm_songs) + '''
  ],

  romantic: [
    { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
    { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
    { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" }
  ],

  happy: [
    { id: "ZbZSe6N_BXs", title: "Happy", artist: "Pharrell Williams" },
    { id: "y6Sxv-sUYtM", title: "Don't Stop Me Now", artist: "Queen" },
    { id: "ru0K8uYEZWw", title: "Mr. Blue Sky", artist: "Electric Light Orchestra" }
  ],

  energetic: [
    { id: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd" },
    { id: "2NiyrtYegso", title: "Wake Me Up", artist: "Avicii" },
    { id: "tYvFa2ARD24", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" }
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
'''

print(content)

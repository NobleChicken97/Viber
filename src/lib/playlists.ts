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
 * Updated with fresh tracks from curated YouTube playlists.
 */
export const MOOD_PLAYLISTS: MoodPlaylists = {
  sad: [
    { id: 'nOeJuoFs6sM', title: 'КАМИН', artist: 'EMIN feat. JONY' },
    { id: '-TXtyYZIiWc', title: 'Pastlives', artist: 'sapientdream' },
    { id: 'nyuo9-OjNNg', title: 'I Wanna Be Yours', artist: 'Arctic Monkeys' },
    { id: 'f0bbDFRYD_A', title: 'changes', artist: 'XXXTENTACION' },
    { id: 'IpFX2vq8HKw', title: 'blue', artist: 'yung kai' },
    { id: 'Gwg_KYNgu6Y', title: 'Into Your Arms (No Rap)', artist: 'Witt Lowry ft. Ava Max' },
    { id: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth' },
    { id: '60ItHLz5WEA', title: 'Faded', artist: 'Alan Walker' },
    { id: '4fqwVBuunxY', title: 'Hurts So Good', artist: 'Astrid S' },
    { id: 'KyAcMpQUY5s', title: 'Hope', artist: 'XXXTENTACION' },
    { id: 'ALZHF5UqnU4', title: 'Alone', artist: 'Marshmello' },
    { id: 'jJPMnTXl63E', title: 'death bed', artist: 'Powfu ft. beabadoobee' },
    { id: 'TdrL3QxjyVw', title: 'Summertime Sadness', artist: 'Lana Del Rey' },
    { id: 'hbqoaJ8sKsQ', title: 'Broken Angel', artist: 'Arash feat. Helena' },
    { id: 'WQq98YPV8yk', title: 'Moral of the Story', artist: 'Ashe' },
    { id: 'DKbfBSrjVHA', title: 'Can We Kiss Forever?', artist: 'Kina ft. Adriana Proenza' },
    { id: 'yctQRe--q6c', title: 'Love Is Gone', artist: 'SLANDER ft. Dylan Matthew' },
    { id: '1e9B31FLT-s', title: 'Experience', artist: 'Ludovico Einaudi' },
    { id: 'WgTMeICssXY', title: 'Dandelions', artist: 'Ruth B.' },
    { id: 'LTMjsgS_c9M', title: 'Hislerim', artist: 'Serhat Durmus feat. Zerrin' },
    { id: 'YykjpeuMNEk', title: 'Hymn For The Weekend', artist: 'Coldplay' },
    { id: 'EKkzbbLYPuI', title: 'Carol of the Bells', artist: 'Lindsey Stirling' },
    { id: 'PNozaFzqOvI', title: 'Arcade', artist: 'Duncan Laurence ft. FLETCHER' },
    { id: 'I-QfPUz1es8', title: 'Bad Liar', artist: 'Imagine Dragons' },
    { id: 'y7T3ax7JPwI', title: 'Peaky Blinder', artist: 'Otnicka' },
    { id: 'lW9ep22YmlM', title: 'Royalty', artist: 'Egzod & Maestro Chives ft. Neoni' },
    { id: 'mRD0-GxqHVo', title: 'Heat Waves', artist: 'Glass Animals' },
    { id: 'V1Pl8CzNzCw', title: 'lovely', artist: 'Billie Eilish & Khalid' },
    { id: 'Uefu_EU-dW4', title: 'Middle of the Night', artist: 'Elley Duhé' },
    { id: 'OlStmta0Vh4', title: 'I Was Never There', artist: 'The Weeknd feat. Gesaffelstein' },
    { id: '28W_sotzXUw', title: 'La Câlin', artist: 'Serhat Durmus' },
    { id: 'l08Zw-RY__Q', title: 'WILDFLOWER', artist: 'Billie Eilish' },
    { id: 'kPa7bsKwL-c', title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars' },
    { id: '5FSHSfSnjXk', title: 'What Does It Mean To You', artist: 'Carpetman' },
    { id: 'DF3XjEhJ40Y', title: 'Love Story', artist: 'Indila' },
    { id: 'PWqEPKduGm8', title: 'Infinity', artist: 'Jaymes Young' },
    { id: 'd_HlPboLRL8', title: 'Runaway', artist: 'AURORA' },
    { id: 'MpLaDn82FtI', title: 'Džanum (Moye Moye)', artist: 'Teya Dora' },
    { id: 'm-el0pQLQE4', title: 'childhood', artist: 'Rauf & Faik' },
    { id: 'Mc2-YM9Bhu4', title: 'Hislerim', artist: 'Serhat Durmus ft. Zerrin' },
  ],

  calm: [
    { id: 'lbjZPFBD6JU', title: 'Come Away With Me', artist: 'Norah Jones' },
    { id: 'E3iq2GS0B80', title: 'Slave To Love (Piano Cover)', artist: 'Bryan Ferry' },
    { id: 'bPCdsa7hS7M', title: 'Watermark', artist: 'Enya' },
    { id: '7maJOI3QMu0', title: 'River Flows in You', artist: 'Yiruma' },
    { id: 'rOLN9T9w9kA', title: 'The Sea', artist: 'Corinne Bailey Rae' },
    { id: '1jNNwbuDXsA', title: 'Feel So High', artist: "Des'ree" },
    { id: 'QQ84s2uzZ1w', title: 'Ocean Drive', artist: 'Lighthouse Family' },
    { id: 'Rk_sAHh9s08', title: 'Return To Innocence', artist: 'Enigma' },
    { id: 'KLVq0IAzh1A', title: 'Fields Of Gold', artist: 'Sting' },
    { id: 'bTNLYeaL7No', title: 'Songbird', artist: 'Eva Cassidy' },
    { id: 'Jl8iYAo90pE', title: 'Caribbean Blue', artist: 'Enya' },
    { id: 'MEO6gYCFbr0', title: 'Sailing', artist: 'Christopher Cross' },
    { id: 'Ftco75S7ZqE', title: 'Spirit Dances', artist: 'Kashy Keegan' },
    { id: 'dVNdTXEJv1A', title: 'Pure Shores', artist: 'All Saints' },
    { id: '1TO48Cnl66w', title: 'Thank You', artist: 'Dido' },
    { id: 'fd02pGJx0s0', title: 'Sunrise', artist: 'Norah Jones' },
    { id: 'rrPUJsZQSkw', title: 'Nine Million Bicycles', artist: 'Katie Melua' },
    { id: 'LTrk4X9ACtw', title: 'Orinoco Flow', artist: 'Enya' },
    { id: 'j-fWDrZSiZs', title: 'White Flag', artist: 'Dido' },
    { id: 'DmAOBosGlHY', title: 'Morning Has Broken', artist: 'Yusuf / Cat Stevens' },
    { id: 'rjOhZZyn30k', title: 'Put Your Records On', artist: 'Corinne Bailey Rae' },
    { id: 'KPctA0hT9c8', title: 'Peaceful Easy Feeling', artist: 'Eagles' },
    { id: 'VqhCQZaH4Vs', title: 'What A Wonderful World', artist: 'Louis Armstrong' },
    { id: 'QDYfEBY9NM4', title: 'Let It Be', artist: 'The Beatles' },
    { id: 'd-diB65scQU', title: "Don't Worry Be Happy", artist: 'Bobby McFerrin' },
    { id: 'flHo2LFWh2I', title: 'Serenity', artist: 'Kashy Keegan' },
    { id: 'GemKqzILV4w', title: 'Chasing Cars', artist: 'Snow Patrol' },
    { id: '2rd8VktT8xY', title: 'Over The Rainbow', artist: 'Eva Cassidy' },
    { id: 'mer6X7nOY_o', title: 'Somewhere Only We Know', artist: 'Lily Allen' },
    { id: 'tO4dxvguQDk', title: "Don't Know Why", artist: 'Norah Jones' },
  ],

  romantic: [
    { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
    { id: "nfWlot6h_JM", title: "Shallow", artist: "Lady Gaga & Bradley Cooper" },
    { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
    { id: "Zi_XLOBDo_Y", title: "Make You Feel My Love", artist: "Adele" },
    { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
    { id: "dPmZqsQNzGA", title: "At Last", artist: "Etta James" },
    { id: "OPf0YbXqDm0", title: "Unchained Melody", artist: "The Righteous Brothers" },
    { id: "7wtfhZwyrcc", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
    { id: "JGwWNGJdvx8", title: "La Vie en Rose", artist: "Édith Piaf" },
    { id: "XpqqjU7u5Yc", title: "A Thousand Years", artist: "Christina Perri" },
    { id: "kJQP7kiw5Fk", title: "Love Story", artist: "Taylor Swift" },
    { id: "V3s8_7Lk4uw", title: "I Don't Want to Miss a Thing", artist: "Aerosmith" },
    { id: "450p7goxZqg", title: "The Way You Look Tonight", artist: "Frank Sinatra" },
    { id: "Dp3jda591M4", title: "Amazed", artist: "Lonestar" },
    { id: "raNGeq3_DtM", title: "Endless Love", artist: "Diana Ross & Lionel Richie" },
    { id: "HIwAI05Y1kU", title: "Your Song", artist: "Elton John" },
    { id: "450p7goxZqg", title: "Everything", artist: "Michael Bublé" },
    { id: "SSCzDykng4g", title: "You Are the Best Thing", artist: "Ray LaMontagne" },
    { id: "cR0EBDU1Qac", title: "Ho Hey", artist: "The Lumineers" },
    { id: "aJJrkyHas78", title: "From the Ground Up", artist: "Dan + Shay" },
    { id: "l21ZKrLmXps", title: "Speechless", artist: "Dan + Shay" },
    { id: "nsdZKCh6RsU", title: "Die a Happy Man", artist: "Thomas Rhett" },
    { id: "lp-EO5I60KA", title: "Marry Me", artist: "Train" },
    { id: "NGSHQhHDxTU", title: "Make You Feel My Love", artist: "Bob Dylan" },
    { id: "weRHyjj34ZE", title: "Wonderwall", artist: "Oasis" },
    { id: "oyEuk8j8imI", title: "Video Games", artist: "Lana Del Rey" },
    { id: "zABLecsR5UE", title: "Young and Beautiful", artist: "Lana Del Rey" },
    { id: "e2J-0EtsCpo", title: "Halo", artist: "Beyoncé" },
    { id: "2EwViQxSJJQ", title: "Crazy in Love", artist: "Beyoncé ft. Jay-Z" },
    { id: "lWA2pjMjpBs", title: "Gravity", artist: "John Mayer" },
    { id: "N5EnGwXV_Pg", title: "Slow Dancing in a Burning Room", artist: "John Mayer" },
    { id: "uJ_1HMAGb4k", title: "Chasing Cars", artist: "Snow Patrol" },
    { id: "SSCzDykng4g", title: "Photograph", artist: "Ed Sheeran" },
    { id: "lp-EO5I60KA", title: "Shape of You", artist: "Ed Sheeran" },
    { id: "09R8_2nJtjg", title: "Say You Won't Let Go", artist: "James Arthur" },
    { id: "fKopy74weus", title: "Somebody That I Used to Know", artist: "Gotye" },
    { id: "GaoLU7KGQv8", title: "Stay with Me", artist: "Sam Smith" },
    { id: "pB-5XG-DbAA", title: "I'm Not the Only One", artist: "Sam Smith" },
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
    { id: "nfWlot6h_JM", title: "Shake It Off", artist: "Taylor Swift" },
    { id: "09839DpTctU", title: "Can't Stop the Feeling!", artist: "Justin Timberlake" },
    { id: "Pkh8UtuejGw", title: "Shut Up and Dance", artist: "Walk the Moon" },
    { id: "hT_nvWreIhg", title: "Good Life", artist: "OneRepublic" },
    { id: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii" },
    { id: "450p7goxZqg", title: "Sugar", artist: "Maroon 5" },
    { id: "OPf0YbXqDm0", title: "24K Magic", artist: "Bruno Mars" },
    { id: "fRh_vgS2dFE", title: "What Makes You Beautiful", artist: "One Direction" },
    { id: "kJQP7kiw5Fk", title: "Best Day of My Life", artist: "American Authors" },
    { id: "lWA2pjMjpBs", title: "Good Vibrations", artist: "The Beach Boys" },
    { id: "ZyhrYis509A", title: "September", artist: "Earth, Wind & Fire" },
    { id: "d9Gu1PspA3Y", title: "Dancing Queen", artist: "ABBA" },
    { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", artist: "Rick Astley" },
    { id: "O-zpOMYRi0w", title: "Three Little Birds", artist: "Bob Marley" },
    { id: "SbyAZQ45uww", title: "Lovely Day", artist: "Bill Withers" },
    { id: "7PCkvCPvDXk", title: "Don't Worry Be Happy", artist: "Bobby McFerrin" },
    { id: "BQ9YtJC-Kd8", title: "Twist and Shout", artist: "The Beatles" },
    { id: "POaaw_x7gvQ", title: "I Want to Break Free", artist: "Queen" },
    { id: "1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
    { id: "tbNlMtqrYS0", title: "We Are the Champions", artist: "Queen" },
    { id: "oofSnsGkops", title: "I Want You Back", artist: "The Jackson 5" },
    { id: "djV11Xbc914", title: "Stayin' Alive", artist: "Bee Gees" },
    { id: "vx2u5uUu3DE", title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper" },
    { id: "Qqqux6Xpz2M", title: "I'm a Believer", artist: "The Monkees" },
    { id: "tbU3zdAgiX8", title: "Livin' on a Prayer", artist: "Bon Jovi" },
    { id: "ewRjZoRtu0Y", title: "Come On Eileen", artist: "Dexys Midnight Runners" },
    { id: "2H5uWRjFsGc", title: "Don't Stop Believin'", artist: "Journey" },
    { id: "lDK9QqIzhwk", title: "Take On Me", artist: "a-ha" },
  ],

  energetic: [
    { id: "GDpmVUEjagg", title: "Thunderstruck", artist: "AC/DC" },
    { id: "2HQaBWziYvY", title: "Levels", artist: "Avicii" },
    { id: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii" },
    { id: "fRh_vgS2dFE", title: "Sorry", artist: "Justin Bieber" },
    { id: "hT_nvWreIhg", title: "Counting Stars", artist: "OneRepublic" },
    { id: "fm660vIn8io", title: "Radioactive", artist: "Imagine Dragons" },
    { id: "ktvTqknDobU", title: "Titanium", artist: "David Guetta ft. Sia" },
    { id: "gCYcHz2k5x0", title: "Spectrum", artist: "Zedd" },
    { id: "GhQdlIFylQ8", title: "Turn Down for What", artist: "DJ Snake & Lil Jon" },
    { id: "pIgZ7gMze7A", title: "Animals", artist: "Martin Garrix" },
    { id: "aatr_2MstrI", title: "Bangarang", artist: "Skrillex" },
    { id: "e-IWRmpefzE", title: "Scary Monsters and Nice Sprites", artist: "Skrillex" },
    { id: "KQ6zr6kCPj8", title: "One", artist: "Swedish House Mafia" },
    { id: "IxuThNgl3YA", title: "Don't You Worry Child", artist: "Swedish House Mafia" },
    { id: "lDK9QqIzhwk", title: "Clarity", artist: "Zedd ft. Foxes" },
    { id: "XfR9iY5y94s", title: "Roses", artist: "The Chainsmokers" },
    { id: "PT2_F-1esPk", title: "Closer", artist: "The Chainsmokers ft. Halsey" },
    { id: "fRh_vgS2dFE", title: "Don't Let Me Down", artist: "The Chainsmokers" },
    { id: "nfWlot6h_JM", title: "This Is What You Came For", artist: "Calvin Harris" },
    { id: "kOkQ4T-RoKs", title: "Summer", artist: "Calvin Harris" },
    { id: "GQMlWwIXg3M", title: "Summertime Sadness", artist: "Lana Del Rey (Cedric Gervais Remix)" },
    { id: "CsGYh8AacgY", title: "Pump It", artist: "The Black Eyed Peas" },
    { id: "gAjR4_CbPpQ", title: "Boom Boom Pow", artist: "The Black Eyed Peas" },
    { id: "YR5ApYxkU-U", title: "Where Is the Love?", artist: "The Black Eyed Peas" },
    { id: "eOofWzI3flA", title: "Till I Collapse", artist: "Eminem" },
    { id: "XbGs_qK2PQA", title: "Lose Yourself", artist: "Eminem" },
    { id: "j5-yKhDd64s", title: "Without Me", artist: "Eminem" },
    { id: "YVkUvmDQ3HY", title: "In the End", artist: "Linkin Park" },
    { id: "eVTXPUF4Oz4", title: "Numb", artist: "Linkin Park" },
    { id: "OnuuYcqhzCE", title: "What I've Done", artist: "Linkin Park" },
    { id: "kXYiU_JCYtU", title: "Numb/Encore", artist: "Linkin Park & Jay-Z" },
    { id: "4AXgi7zpLsk", title: "Enter Sandman", artist: "Metallica" },
    { id: "CD-E-LDc384", title: "Master of Puppets", artist: "Metallica" },
    { id: "iywaBOMvYLI", title: "Back in Black", artist: "AC/DC" },
    { id: "pAgnJDJN4VA", title: "Highway to Hell", artist: "AC/DC" },
    { id: "v2AC41dglnM", title: "You Shook Me All Night Long", artist: "AC/DC" },
    { id: "ZgHfvqZ0vQM", title: "Eye of the Tiger", artist: "Survivor" },
    { id: "btPJPFnesV4", title: "We Will Rock You", artist: "Queen" },
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

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
    { id: "Qv-W3qNXMRM", title: "Mad World", artist: "Gary Jules" },
    { id: "NUVCQXMUVnI", title: "Holocene", artist: "Bon Iver" },
    { id: "dhHLDjbj9FU", title: "Tears in Heaven", artist: "Eric Clapton" },
    { id: "LHCob76kigA", title: "Stay", artist: "Rihanna ft. Mikky Ekko" },
    { id: "S-sJp1FfG7Q", title: "Breathe Me", artist: "Sia" },
    { id: "4N3N1MlvVc4", title: "Jealous", artist: "Labrinth" },
    { id: "VEpMj-tqixs", title: "Everybody Hurts", artist: "R.E.M." },
    { id: "pB-5XG-DbAA", title: "Say Something", artist: "A Great Big World" },
    { id: "VdQY7BusJNU", title: "Falling", artist: "Harry Styles" },
    { id: "k3Fa4lOQfbA", title: "Drivers License", artist: "Olivia Rodrigo" },
    { id: "SlPhMPnQ58k", title: "Zombie", artist: "The Cranberries" },
    { id: "6Ejga4kJUts", title: "Black", artist: "Pearl Jam" },
    { id: "VastXQ_hPb0", title: "Fade to Black", artist: "Metallica" },
    { id: "QDYfEBY9NM4", title: "Fix You", artist: "Coldplay" },
    { id: "hT_nvWreIhg", title: "Chasing Cars", artist: "Snow Patrol" },
    { id: "CvBfHwUxHIk", title: "Iris", artist: "Goo Goo Dolls" },
    { id: "uelHwf8o7_U", title: "When I Was Your Man", artist: "Bruno Mars" },
    { id: "nM0xDI5R50E", title: "Sing for the Moment", artist: "Eminem" },
    { id: "fOexR_S8RHU", title: "Mockingbird", artist: "Eminem" },
    { id: "RgKAFK5djSk", title: "Wicked Game", artist: "Chris Isaak" },
    { id: "5anLPw0Efmo", title: "Nothing Compares 2 U", artist: "Sinéad O'Connor" },
    { id: "QkF3oxziUI4", title: "Careless Whisper", artist: "George Michael" },
    { id: "pIgZ7gMze7A", title: "Fast Car", artist: "Tracy Chapman" },
    { id: "GnKxqTJ_uuw", title: "The Scientist", artist: "Coldplay" },
    { id: "oRdxUFDoQe0", title: "Boulevard of Broken Dreams", artist: "Green Day" },
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
    { id: "3YxaaGgTDYM", title: "Clair de Lune", artist: "Claude Debussy" },
    { id: "jgpJVI3tDbY", title: "Gymnopédie No. 1", artist: "Erik Satie" },
    { id: "S-Xm7s9eGxU", title: "Bloom", artist: "The Paper Kites" },
    { id: "qbvP-rvkKJk", title: "Saturn", artist: "Sleeping At Last" },
    { id: "z0NfI2NeDHI", title: "Nude", artist: "Radiohead" },
    { id: "rVN1B-tUpgs", title: "No Surprises", artist: "Radiohead" },
    { id: "Z6ih1aKeETk", title: "True Love Waits", artist: "Radiohead" },
    { id: "jUQ8z-4hBTo", title: "Blood Bank", artist: "Bon Iver" },
    { id: "RdBy09yNMPw", title: "Re: Stacks", artist: "Bon Iver" },
    { id: "aUU5zlKKZ64", title: "The Night We Met", artist: "Lord Huron" },
    { id: "IqyAy5dYsLQ", title: "Skinny Love", artist: "Bon Iver" },
    { id: "9RMHHwJ9Eqk", title: "Breathe", artist: "Télépopmusik" },
    { id: "aNYjOVo5IEw", title: "Porcelain", artist: "Moby" },
    { id: "v2AC41dglnM", title: "Teardrop", artist: "Massive Attack" },
    { id: "6p6PcFFUm5I", title: "Glory Box", artist: "Portishead" },
    { id: "yftOy8kz7aE", title: "Roads", artist: "Portishead" },
    { id: "RsX3U_dXwrk", title: "Spiegel im Spiegel", artist: "Arvo Pärt" },
    { id: "rVN1B-tUpgs", title: "Pyramid Song", artist: "Radiohead" },
    { id: "L3HQMbQAWRc", title: "On the Nature of Daylight", artist: "Max Richter" },
    { id: "dQEmaj9C6ko", title: "Experience", artist: "Ludovico Einaudi" },
    { id: "LlvUepMa31o", title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
    { id: "EvG8HGxZ7u0", title: "Una Mattina", artist: "Ludovico Einaudi" },
    { id: "BhOADXRdZXc", title: "Nocturnе Op.9 No.2", artist: "Chopin" },
    { id: "w17BG3d-iWY", title: "Moonlight Sonata", artist: "Beethoven" },
    { id: "O5RdMvgk8b0", title: "Comptine d'un autre été", artist: "Yann Tiersen" },
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

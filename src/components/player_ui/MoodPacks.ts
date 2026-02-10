export type MoodType = 'sad' | 'calm' | 'romantic' | 'happy' | 'energetic';

export interface Song {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  duration: string;
}

export interface MoodPack {
  id: MoodType;
  name: string;
  emoji: string;
  bg: string;
  surface: string;
  border: string;
  accent: string;
  accentSecondary?: string;
  text: string;
  textMuted: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  spacing: 'tight' | 'normal' | 'generous';
  playlistName: string;
  description: string;
  songs: Song[];
  albumGradient: string;
}

export const moodPacks: Record<MoodType, MoodPack> = {
  sad: {
    id: 'sad',
    name: 'Melancholic',
    emoji: '🌧️',
    bg: '#0d1117',
    surface: '#161b22',
    border: '#21262d',
    accent: '#58a6ff',
    text: '#c9d1d9',
    textMuted: '#6e7681',
    headingFont: '"Playfair Display", serif',
    bodyFont: '"Inter", sans-serif',
    borderRadius: '6px',
    spacing: 'generous',
    playlistName: 'Midnight Reflections',
    description:
      'Songs for the quiet moments when the rain hits the window and the world feels far away.',
    albumGradient: 'linear-gradient(135deg, #161b22 0%, #1a2332 100%)',
    songs: [
      { id: 'hLQl3WQQoQ0', title: 'Someone Like You', artist: 'Adele', duration: '4:45' },
      { id: 'jhC1pI76Rqo', title: 'The Night We Met', artist: 'Lord Huron', duration: '3:28' },
      { id: 'Bznxx12Ptl0', title: 'Skinny Love', artist: 'Bon Iver', duration: '3:58' },
      { id: 'Qv-W3qNXMRM', title: 'Mad World', artist: 'Gary Jules', duration: '3:33' },
      { id: '4fndeDfaWCg', title: 'Hurt', artist: 'Johnny Cash', duration: '3:38' },
      { id: 'Kb24RrHIbFk', title: 'Creep', artist: 'Radiohead', duration: '3:56' },
      { id: 'VEpMj-tqixs', title: 'Everybody Hurts', artist: 'R.E.M.', duration: '5:17' },
      { id: 'QDYfEBY9NM4', title: 'Fix You', artist: 'Coldplay', duration: '4:55' }
    ]
  },
  calm: {
    id: 'calm',
    name: 'Peaceful',
    emoji: '🍃',
    bg: '#f5f0e8',
    surface: '#ede7d9',
    border: '#d4cdbf',
    accent: '#7c9a6e',
    text: '#3d3929',
    textMuted: '#8a8070',
    headingFont: '"DM Sans", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    borderRadius: '14px',
    spacing: 'normal',
    playlistName: 'Morning Dew',
    description:
      'A gentle collection of sounds to start your day with clarity and peace.',
    albumGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    songs: [
      { id: 'O0_ardwzTrA', title: 'Weightless', artist: 'Marconi Union', duration: '8:09' },
      { id: '1ZYbU82GVz4', title: 'Pure Shores', artist: 'All Saints', duration: '3:41' },
      { id: '9RMHHwJ9Eqk', title: 'Breathe', artist: 'Télépopmusik', duration: '4:40' },
      { id: 'sKbnGfr7yew', title: 'Intro', artist: 'The xx', duration: '2:07' },
      { id: 'NUVCQXMUVnI', title: 'Holocene', artist: 'Bon Iver', duration: '5:36' },
      { id: 'RdBy09yNMPw', title: 'Re: Stacks', artist: 'Bon Iver', duration: '6:41' },
      { id: 'jUQ8z-4hBTo', title: 'Blood Bank', artist: 'Bon Iver', duration: '7:49' },
      { id: 'jgpJVI3tDbY', title: 'Gymnopédie No.1', artist: 'Erik Satie', duration: '3:05' }
    ]
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    emoji: '🌹',
    bg: '#1a0a10',
    surface: '#2a1520',
    border: '#3d2030',
    accent: '#c4547a',
    accentSecondary: '#d4a574',
    text: '#e8d5dc',
    textMuted: '#9a7585',
    headingFont: '"Cormorant Garamond", serif',
    bodyFont: '"Inter", sans-serif',
    borderRadius: '2px',
    spacing: 'tight',
    playlistName: 'Velvet Hour',
    description:
      'Intimate melodies for hearts that beat in sync.',
    albumGradient: 'linear-gradient(135deg, #2a1520 0%, #3d2030 100%)',
    songs: [
        { id: "rtOvBOTyX00", title: "All of Me", artist: "John Legend", duration: "4:30" },
        { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran", duration: "4:41" },
        { id: "izGwDsrQ1eQ", title: "Careless Whisper", artist: "George Michael", duration: "5:00" },
        { id: "S2Cti12XB04", title: "Make You Feel My Love", artist: "Adele", duration: "3:32" },
        { id: "pIgZ7gMze7A", title: "Fast Car", artist: "Tracy Chapman", duration: "4:56" }
    ]
  },
  happy: {
    id: 'happy',
    name: 'Joyful',
    emoji: '☀️',
    bg: '#ffffff',
    surface: '#fff9e6',
    border: '#ffe0b2',
    accent: '#ffb300',
    text: '#4a3b00',
    textMuted: '#8c7d40',
    headingFont: '"Bebas Neue", sans-serif',
    bodyFont: '"Inter", sans-serif',
    borderRadius: '24px',
    spacing: 'normal',
    playlistName: 'Golden Hour',
    description:
      'Radiant vibes to keep your spirit high and your smile wide.',
    albumGradient: 'linear-gradient(135deg, #fff9e6 0%, #ffecb3 100%)',
    songs: [
        { id: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", duration: "3:55" },
        { id: "ZbZSe6N_BXs", title: "Happy", artist: "Pharrell Williams", duration: "3:53" },
        { id: "OPf0YbXqDm0", title: "Uptown Funk", artist: "Mark Ronson", duration: "4:30" },
        { id: "ru0K8uYEZWw", title: "Can't Stop the Feeling!", artist: "Justin Timberlake", duration: "3:56" },
        { id: "nfWlot6h_JM", title: "Shake It Off", artist: "Taylor Swift", duration: "3:39" }
    ]
  },
  energetic: {
    id: 'energetic',
    name: 'Electric',
    emoji: '⚡',
    bg: '#000000',
    surface: '#0a0a0a',
    border: '#1a1a1a',
    accent: '#ccff00',
    text: '#ffffff',
    textMuted: '#666666',
    headingFont: '"Syne", sans-serif',
    bodyFont: '"Inter", sans-serif',
    borderRadius: '0px',
    spacing: 'tight',
    playlistName: 'High Voltage',
    description:
      'High-octane tracks to fuel your drive and keep you moving.',
    albumGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    songs: [
        { id: "btPJPFnesV4", title: "Eye of the Tiger", artist: "Survivor", duration: "4:04" },
        { id: "PapBjpzRhnA", title: "Thunderstruck", artist: "AC/DC", duration: "4:52" },
        { id: "kxyeaIyhZD0", title: "Lose Yourself", artist: "Eminem", duration: "5:26" },
        { id: "uelHwf8o7_U", title: "Titanium", artist: "David Guetta", duration: "4:05" },
        { id: "hT_nvWreIhg", title: "Levels", artist: "Avicii", duration: "3:19" }
    ]
  }
};

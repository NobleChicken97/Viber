# Viber 🎵

**Mood-based music player that curates playlists and gradually lifts your mood.**

## How It Works

1. **Pick your mood** → Select from 5 moods (Sad, Calm, Romantic, Happy, Energetic)
2. **Curated transition** → Algorithm builds a 12-song playlist that transitions toward happier vibes
3. **Play** → YouTube-powered audio with full playback controls

**Example:** Starting mood **Sad** → Playlist: 4 sad → 3 calm → 3 happy → 2 energetic songs

## Features

- **🎵 Mood Uplift**: Sessions gradually transition from your starting mood to happier vibes
- **🎧 Full Player Controls**: Play/pause, next/prev, seekable progress bar, volume control
- **⚡ Fast & Responsive**: Built with Next.js 16 and React 19
- **🔄 Auto-Skip**: Handles unplayable videos automatically
- **📱 Mobile-Friendly**: Works on all devices
- **🎨 Dynamic Theming**: Colors shift based on current song's mood

## Moods

| Mood | Transition Path |
|------|-----------------|
| Sad | Sad → Calm → Happy → Energetic |
| Calm | Calm → Happy → Energetic |
| Romantic | Romantic → Happy |
| Happy | Happy → Energetic |
| Energetic | Energetic (stays) |

## Quick Start

```bash
git clone https://github.com/NobleChicken97/Viber.git
cd viber
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- YouTube IFrame API

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NobleChicken97/Viber)

---

**Made by Arpan Goyal**

- GitHub: https://github.com/NobleChicken97
- LinkedIn: https://www.linkedin.com/in/arpangoyal97/
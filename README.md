<p align="center">
  <img src="public/icon.svg" width="80" height="80" alt="Viber logo" />
</p>

<h1 align="center">Viber</h1>
<p align="center"><strong>Music that feels what you feel.</strong></p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Get Started</a> ·
  <a href="#privacy">Privacy</a> ·
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/MediaPipe-FaceLandmarker-4285f4?logo=google&logoColor=white" alt="MediaPipe" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

---

## What is Viber?

Viber is a web-based music player that uses **real-time facial emotion recognition** to curate playlists that match — and gently transition — your current mood. Everything runs client-side. No video data ever leaves your browser.

> **Example:** You sit down looking tired. Viber detects a calm/melancholic mood, starts with mellow tracks, then progressively uplifts the playlist toward happier, more energetic music.

---

## Features

| | Feature | Description |
|---|---|---|
| 🎭 | **Facial Emotion Recognition** | Google MediaPipe FaceLandmarker runs entirely in-browser with WebGL/WebGPU — zero server calls |
| 🎵 | **Mood-Adaptive Playlists** | Algorithmic mood paths transition from your detected mood toward an uplift target |
| 🎨 | **Dynamic Theming** | Background, accent, and animation intensity shift in real time as the mood path progresses |
| 📝 | **Synced Lyrics** | Auto-fetched time-synced lyrics displayed alongside playback |
| ▶️ | **YouTube Integration** | Streams music directly via YouTube IFrame API — no audio hosting required |
| ⌨️ | **Keyboard Controls** | Full playback control (play/pause, skip, volume) from the keyboard |
| ☀️🌙 | **Light & Dark Mode** | System-aware theme with manual toggle, mood colors adapt to both modes |
| 🔒 | **100% Private** | All ML inference is local — no biometric data transmitted, ever |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                       │
├──────────┬──────────┬──────────┬───────────┬──────────┬─────────┤
│  /       │ /player  │ /camera  │ /settings │ /how     │ /privacy│
│  Landing │ Player   │ Camera   │ Settings  │ How It   │ Privacy │
│  Page    │ Page     │ Page     │ Page      │ Works    │ Policy  │
└────┬─────┴────┬─────┴────┬─────┴─────┬─────┴──────────┴─────────┘
     │          │          │           │
     ▼          ▼          ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Core Libraries                           │
│                                                                 │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ emotionClass │  │  moodPath   │  │      moodTheme         │  │
│  │  ifier.ts    │  │    .ts      │  │        .ts             │  │
│  │              │  │             │  │                        │  │
│  │ Blendshape   │  │ Mood path   │  │ HSL color targets +    │  │
│  │ → BaseEmotion│  │ generation  │  │ dynamic CSS var        │  │
│  │ → Mood       │  │ & bucketing │  │ computation            │  │
│  └──────┬───────┘  └──────┬──────┘  └───────────┬────────────┘  │
│         │                 │                     │               │
│  ┌──────┴─────────────────┴─────────────────────┴────────────┐  │
│  │                    playlists.ts                            │  │
│  │        Song catalog · Session queue builder               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Custom React Hooks                           │
│                                                                 │
│  useFaceApi        useLyrics          useKeyboardControls       │
│  MediaPipe init    LRCLIB fetch +     Spacebar, arrows,         │
│  + inference       LRC parser         volume shortcuts           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       UI Components                              │
│                                                                 │
│  YouTubePlayer   MoodThemeProvider   CameraModal   LyricsPanel  │
│  BottomBar       Sidebar             MainArea      MoodSelector │
│  MoodButton      MoodCard            MoodSwitch    ThemeToggle  │
└─────────────────────────────────────────────────────────────────┘
```

### Module Relationships (from knowledge graph)

The codebase contains **102 nodes** and **74 edges** across **43 communities**. The most connected modules are:

| Module | Role | Connections |
|---|---|---|
| `classifyEmotion()` | Maps facial blendshapes → mood labels | 4 edges |
| `clamp01()` | Shared numeric utility | 4 edges |
| `computeMoodThemeTarget()` | Generates dynamic HSL theme from mood + progress | 4 edges |
| `scoreBaseEmotions()` | Scores happy/sad/calm from raw blendshapes | 3 edges |
| `useYouTubePlayer()` | YouTube IFrame lifecycle hook | 2 edges |
| `setCssVars()` | Applies computed theme to DOM CSS variables | 2 edges |
| `lerp()` | Linear interpolation for smooth transitions | 2 edges |

### Data Flow

```
Camera → MediaPipe FaceLandmarker → Blendshapes
  → scoreBaseEmotions() → classifyEmotion() → Mood
  → generateMoodPath() → distributeMoodPathBySongs()
  → buildSessionQueue() → YouTubePlayer
  → computeMoodThemeTarget() → setCssVars() → Dynamic UI
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, routing, React Server Components |
| **Language** | TypeScript 5 | Type safety across the entire codebase |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with dynamic HSL variables |
| **Animation** | Framer Motion 12 | Layout animations, page transitions, sidebar collapse |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **ML Runtime** | MediaPipe FaceLandmarker | Client-side facial landmark detection (GPU-accelerated) |
| **Media** | YouTube IFrame API | Music streaming without audio hosting |
| **Theming** | next-themes | System-aware dark/light mode |
| **Monitoring** | Sentry | Error tracking and performance monitoring |
| **Utilities** | clsx, tailwind-merge | Conditional class composition |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (bundled with Node.js)
- A webcam (optional — you can also pick moods manually)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/NobleChicken97/Viber.git
cd Viber

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — that's it.

### Environment Variables

Copy the example env file and fill in any keys you need:

```bash
cp .env.example .env.local
```

See [`.env.example`](.env.example) for all available variables.

### Build for Production

```bash
npm run build
npm start
```

---

## How It Works

1. **Detect** — The landing page activates your webcam and runs MediaPipe FaceLandmarker to read 52 facial blendshapes in real time.
2. **Classify** — `emotionClassifier.ts` scores base emotions (happy, sad, calm) from blendshape intensities, then maps to a mood (happy, energetic, calm, sad, romantic).
3. **Path** — `moodPath.ts` generates a multi-segment mood journey that starts at your detected mood and optionally uplifts toward happier states.
4. **Queue** — `playlists.ts` builds a session queue by sampling songs from curated mood packs, distributed across mood path segments.
5. **Theme** — `moodTheme.ts` computes HSL color targets that shift continuously as you progress through the playlist, driving background gradients, accent colors, and animation intensity.
6. **Play** — The YouTube IFrame player streams each track while synced lyrics scroll alongside.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing — mood detection + manual selection
│   ├── player/page.tsx     # Player — queue, playback, theme
│   ├── camera/page.tsx     # Standalone camera page
│   ├── settings/page.tsx   # User preferences (uplift toggle, etc.)
│   ├── how/page.tsx        # How it works explainer
│   ├── privacy/page.tsx    # Privacy policy
│   ├── layout.tsx          # Root layout (fonts, theme, metadata)
│   └── globals.css         # Global styles + CSS custom properties
│
├── components/
│   ├── YouTubePlayer.tsx   # YouTube IFrame wrapper + hook
│   ├── MoodThemeProvider.tsx # Reactive theme engine (CSS vars)
│   ├── CameraModal.tsx     # Webcam capture modal
│   ├── LyricsPanel.tsx     # Synced lyrics display
│   ├── ThemeProvider.tsx    # next-themes wrapper
│   ├── ThemeToggle.tsx     # Light/dark toggle button
│   ├── player_ui/          # Player page sub-components
│   │   ├── BottomBar.tsx   # Playback controls + progress
│   │   ├── MainArea.tsx    # Album art + track info
│   │   ├── Sidebar.tsx     # Collapsible queue sidebar
│   │   ├── MoodSelector.tsx# In-player mood switcher
│   │   └── MoodPacks.ts    # Song catalog (mood → tracks)
│   └── ui/                 # Reusable primitives
│       ├── MoodButton.tsx  # Mood selection button
│       ├── MoodCard.tsx    # Mood display card
│       └── MoodSwitch.tsx  # Toggle switch variant
│
├── hooks/
│   ├── useFaceApi.ts       # MediaPipe initialization + inference
│   ├── useLyrics.ts        # LRCLIB fetch + LRC parser
│   └── useKeyboardControls.ts # Keyboard shortcut bindings
│
└── lib/
    ├── emotionClassifier.ts # Blendshape → mood classification
    ├── moodPath.ts          # Mood journey generation + bucketing
    ├── moodTheme.ts         # Dynamic HSL theme computation
    ├── playlists.ts         # Session queue builder
    ├── settings.ts          # localStorage settings hook
    └── utils.ts             # Shared utilities (cn)
```

---

## Privacy

All facial recognition and emotion detection happens **100% locally in the browser**. Viber never transmits video streams, images, or biometric data to any server. The webcam feed is processed in real time by MediaPipe's on-device WASM/WebGPU runtime and immediately discarded after mood classification.

See the full [Privacy Policy](/privacy) in the app.

---

## Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a PR.

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## License

[MIT](LICENSE) © 2026 [Arpan Goyal](https://github.com/NobleChicken97)

---

<p align="center">
  <strong>Built by <a href="https://www.linkedin.com/in/arpangoyal97/">Arpan Goyal</a></strong>
  <br />
  <a href="https://github.com/NobleChicken97">GitHub</a> · <a href="https://www.linkedin.com/in/arpangoyal97/">LinkedIn</a>
</p>

<!-- made by arpan -->

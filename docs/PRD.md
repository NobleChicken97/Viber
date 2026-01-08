# Viber – Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** January 8, 2026  
> **Status:** MVP Definition Complete

---

## 1. Executive Summary

**Viber** is a vibe-based music player that uses optional on-device facial expression detection to sense the user's mood and dynamically generates a unique, mood-aware music session. The core innovation is **subtle, evolving UI aesthetics** that shift smoothly over the listening session—never jarring, always immersive—while music transitions the user through emotional stages without explicit mood labels.

### Core Philosophy
> "The UI should feel like it's breathing with you. You shouldn't notice the change moment-to-moment, but at minute 10 vs minute 1, it's unmistakably different."

---

## 2. Product Vision

### 2.1 Problem Statement
Existing music players are static experiences. Users manually search for music that matches their mood, but:
- They often don't know what they want to hear
- Mood changes during listening aren't reflected in playback
- The UI is disconnected from emotional context

### 2.2 Solution
Viber creates a **living, adaptive music experience**:
1. Detect mood via short camera session OR manual selection
2. Generate a unique, non-repeating music path per session
3. Smoothly transition through emotional stages via curated playlists
4. Reflect mood shifts through **subtle, continuous UI evolution**
5. Never show the detected mood explicitly—let the user *feel* it

### 2.3 Target Audience
- **Primary:** Young adults aged 16–30
- **Secondary:** Anyone seeking ambient, mood-matched music
- **Use Cases:** Study sessions, winding down, emotional processing, background vibes

---

## 3. Core Features (MVP)

### 3.1 Mood Detection

| Aspect | Specification |
|--------|---------------|
| **Method** | On-device facial expression analysis (MediaPipe / face-api.js) |
| **Duration** | 3–5 seconds camera preview, then auto-close |
| **Fallback** | Manual mood selection if camera denied or face not detected |
| **Storage** | No images/video stored; only derived mood label + confidence |
| **Multi-face** | Detection pauses if multiple faces appear |

#### Mood Categories (5 MVP Moods)
| Mood | Visual Character | Music Character |
|------|------------------|-----------------|
| **Sad** | Deep blues, low contrast, slow pulse | Melancholic, acoustic, minor keys |
| **Calm / Chill** | Muted teals, gentle movement | Lo-fi, ambient, relaxed tempo |
| **Romantic** | Warm pinks/magentas, soft glow | Love songs, R&B, smooth vocals |
| **Happy** | Warm yellows/oranges, brighter, bouncy | Pop, upbeat, major keys |
| **Energetic** | Vibrant oranges/reds, high contrast, snappy | EDM, rock, high BPM |

### 3.2 Music Playback

| Aspect | Specification |
|--------|---------------|
| **Source** | Curated public/unlisted YouTube Music playlists |
| **API** | YouTube IFrame Player API |
| **Playback Location** | Entirely on website (no redirects, no downloads) |
| **Controls** | Play/Pause, Next, Volume, Mute |
| **NOT Included** | Previous, Seek, Crossfade, Background playback |

### 3.3 Session Structure

| Parameter | Value |
|-----------|-------|
| **Session Length** | Always 12 "counted" songs |
| **Counted Song** | User listened ≥ 25% of track duration |
| **Skipped Song** | User listened < 25% → does NOT count; replacement appended from same mood pool |
| **No Repeats** | Within session, no track plays twice |
| **Session End** | After 12 counted songs, user can continue or re-detect mood |

### 3.4 Unique Mood Paths (Uplift System)

When **uplift is enabled**, music transitions through emotional stages. Paths are probabilistic—never the same twice.

#### Path Rules
- ❌ No skipping stages (Sad → Energetic directly is forbidden)
- ❌ No forced uplift (user controls toggle)
- ✅ Transitions only between songs
- ✅ Each session generates a new path
- ✅ Same user ≠ same experience twice

#### Mood Path Definitions

**Starting Mood: Sad**
```
Default:     Sad → Calm → Happy → Energetic
Alternative: Sad → Calm → Romantic
Alternative: Sad → Calm → Happy
Uplift OFF:  Sad only
```

**Starting Mood: Calm**
```
Default:     Calm → Happy → Energetic
Alternative: Calm → Romantic
Alternative: Calm → Happy
Uplift OFF:  Calm only
```

**Starting Mood: Romantic**
```
Default:     Romantic → Happy
Alternative: Romantic → Calm
Uplift OFF:  Romantic only
```

**Starting Mood: Happy**
```
Default:     Happy → Energetic
Alternative: Happy only
Uplift OFF:  Happy only
```

**Starting Mood: Energetic**
```
Default:     Energetic only
Rare:        Energetic → Happy (cool-down)
Uplift OFF:  Energetic only
```

#### Song Distribution per Stage
Songs are distributed across stages with **earlier stages getting more songs** (quadratic weighting):

| Path Length | Distribution (12 songs) |
|-------------|------------------------|
| 1 stage | 12 songs |
| 2 stages | 8 + 4 |
| 3 stages | 5 + 4 + 3 |
| 4 stages | 4 + 3 + 3 + 2 |

---

## 4. Visual Design System

### 4.1 Design Philosophy: "Minimal Premium with Mood-Adaptive Aesthetics"

The UI is **clean, modern, and understated**—but it *lives*. The aesthetic subtly shifts based on:
1. **Current mood stage** (color palette, accent)
2. **Session progress** (contrast, saturation, motion snappiness)
3. **Micro-drift** (gentle cyclic wobble so it feels alive)

> **Key Principle:** Changes are **smooth and subtle moment-to-moment** but **noticeably different over longer periods** (1 min vs 10 min).

### 4.2 Mood-to-Visual Token System

Each mood defines a base palette. As the session progresses, these values drift.

| Token | Sad | Calm | Romantic | Happy | Energetic |
|-------|-----|------|----------|-------|-----------|
| **BG Hue** | 220° | 200° | 330° | 45° | 18° |
| **BG Saturation** | 18% | 18% | 16% | 16% | 16% |
| **BG Lightness** | 10% | 11% | 11% | 12% | 12% |
| **Accent Hue** | 220° | 190° | 338° | 46° | 14° |
| **Accent Saturation** | 55% | 55% | 60% | 70% | 78% |
| **Accent Lightness** | 60% | 60% | 62% | 60% | 60% |

### 4.3 Session Progress Drift

As songs are listened to (0% → 100% of session), visual parameters evolve:

| Parameter | Start (Song 1) | End (Song 12) | Effect |
|-----------|----------------|---------------|--------|
| **BG Lightness** | Base | Base + 7% | Scene becomes more "alive" |
| **BG Saturation** | Base | Base + 6% | Colors become richer |
| **Contrast** | 0.35 | 0.65 | More visual depth |
| **Pulse Frequency** | 18s cycle | 7s cycle | Faster ambient breathing |
| **Blob Size/Blur** | Subtle | Prominent | More atmospheric presence |
| **Motion Snappiness** | 0.35 | 0.85 | Interactions feel tighter, bouncier |

### 4.4 Micro-Drift (Cyclic Wobble)

A ~1-minute sine wave adds tiny hue/parameter shifts so the UI never feels static:
- Hue wobble: ±2°
- Creates a "breathing" feel without being distracting

### 4.5 Transition Smoothing

All CSS variable changes are **exponentially smoothed**:
- Tau (time constant): ~8 seconds
- No sudden jumps, ever
- Changes are imperceptible moment-to-moment but obvious over minutes

### 4.6 Background Atmosphere

A fixed `::before` pseudo-element creates the ambient backdrop:

```
┌─────────────────────────────────────────┐
│  ◉ Accent-tinted radial gradient (top-left)
│                                         │
│           ◉ Secondary glow (top-right)  │
│                                         │
│                                         │
│      ◉ Subtle foreground glow (bottom)  │
└─────────────────────────────────────────┘
```

- **Opacity:** 12% → 30% (increases with blob parameter)
- **Blur:** 36px → 80px (increases with blob parameter)
- **Animation:** Slow pulse (7s–18s based on mood/progress)
- **Scale:** Subtle breathing (1.0 → 1.14)

---

## 5. UI/UX Specifications

### 5.1 Information Architecture

```
/                   Landing Page
├── /player         Music Player (core experience)
├── /how            How It Works (explainer)
├── /privacy        Privacy Policy
└── /settings       User Preferences
```

### 5.2 Page Specifications

#### 5.2.1 Landing Page (`/`)

**Purpose:** Value proposition + Start action

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              [Logo: Viber]              │
│                                         │
│    "Music that feels what you feel"     │
│                                         │
│         ┌──────────────────┐            │
│         │   ▶ Start Vibing │            │
│         └──────────────────┘            │
│                                         │
│    ┌─────────┐  ┌─────────────────┐     │
│    │ How It  │  │ Skip Camera,    │     │
│    │ Works   │  │ Choose Mood     │     │
│    └─────────┘  └─────────────────┘     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│    Minimal footer:                      │
│    Privacy · Built with 🎵              │
│                                         │
└─────────────────────────────────────────┘
```

**Interactions:**
- "Start Vibing" → Camera permission flow
- "Skip Camera, Choose Mood" → Manual mood selector
- "How It Works" → `/how`

**Visual:**
- Default to "Calm" mood palette on load
- Subtle background animation active
- Clean, spacious, premium feel

#### 5.2.2 Camera Permission Flow

**Trigger:** User clicks "Start Vibing"

**Flow:**
```
1. Modal appears with camera preview frame (empty)
2. Text: "We'll use your camera for 3–5 seconds to sense your vibe.
          No photos are saved. Everything happens on your device."
3. [Allow Camera] [Skip, Choose Manually]

4a. If allowed:
    - Camera preview appears (mirrored)
    - Countdown: "Sensing your vibe... 3... 2... 1..."
    - Mood detected → Camera closes
    - Smooth transition to /player with detected mood

4b. If denied:
    - "No worries! Pick your vibe instead:"
    - [😢 Sad] [😌 Calm] [💕 Romantic] [😊 Happy] [⚡ Energetic]
    
4c. If face not detected:
    - "Couldn't detect your face. Try again or pick manually."
    - [Try Again] [Pick Manually]
```

**Visual during detection:**
- Camera preview in rounded container
- Subtle pulsing border (accent color)
- Progress indicator (circular)

#### 5.2.3 Player Page (`/player`)

**Purpose:** Core music experience

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │       [Album Art / Visualizer]    │  │
│  │              (YouTube embed       │  │
│  │               hidden/minimal)     │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│         Song Title                      │
│         Artist Name                     │
│                                         │
│    ════════════════════════════════     │
│    Progress bar (if available)          │
│                                         │
│         ┌─────────────────┐             │
│         │  ▶ ⏭  🔊 ────○  │             │
│         │     Play Next Vol│             │
│         └─────────────────┘             │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │ Up Next (3–5 tracks preview)    │  │
│    │ ├─ Track 2 - Artist             │  │
│    │ ├─ Track 3 - Artist             │  │
│    │ └─ Track 4 - Artist             │  │
│    └─────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Session: ●●●●●○○○○○○○ (5/12)     │   │
│  │ [⚙ Settings]  [🔄 Re-detect Vibe]│   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
- **Album Art Area:** Large, dominant visual; could show stylized visualizer instead of YouTube frame
- **Song Info:** Title + Artist, clean typography
- **Progress Bar:** Thin, accent-colored (shows listen progress for 25% threshold awareness)
- **Controls:** Minimal—Play/Pause, Next, Volume slider, Mute toggle
- **Up Next:** 3–5 upcoming tracks (not full queue)
- **Session Progress:** Visual dots showing counted songs (filled = listened, empty = remaining)
- **Quick Actions:** Settings toggle, Re-detect vibe option

**NOT Shown:**
- Explicit mood label (no "You're feeling: Sad")
- Previous button
- Seek bar (YouTube limitation)
- Full queue scroll

**Visual Behavior:**
- Background atmosphere animates continuously
- Accent color matches current mood stage
- As session progresses, UI becomes slightly more vibrant/contrasty
- Transitions between stages are smooth (over multiple songs, not instant)

#### 5.2.4 How It Works (`/how`)

**Purpose:** Simple explainer for first-time users

**Content:**
```
How Viber Works

1. Detect Your Vibe
   We use your camera for a few seconds to sense your mood.
   Everything happens on your device—nothing is stored or uploaded.

2. Build Your Music Path
   Based on your vibe, we create a unique playlist just for you.
   No two sessions are exactly the same.

3. Evolve Together
   As you listen, the music can gently shift your mood upward—
   or you can stay in your current vibe. You're always in control.

4. Feel, Don't Think
   The app subtly changes around you. Colors shift. Animations breathe.
   You won't notice it happening, but you'll feel it.

[Start Vibing →]
```

**Visual:** Same mood-adaptive background as rest of site

#### 5.2.5 Privacy Page (`/privacy`)

**Purpose:** Transparent data policy

**Key Points:**
- Camera data processed 100% on-device
- No images, video, or biometric data stored
- Only derived metadata: mood label, confidence, timestamp
- Session data: playback actions (play, skip, like)
- No personal identifiers collected
- GDPR / India DPDP aligned
- Not intended for children under 13

#### 5.2.6 Settings Page (`/settings`)

**Purpose:** User preferences

**Toggles:**
- **Mood Uplift:** ON/OFF (smooth transition to happier moods)
- **Re-detect Vibe:** Trigger new camera session
- **Manual Mood Override:** Select mood directly

**Future (not MVP):**
- Theme preference (auto/dark/light)
- Audio quality
- Notification preferences

---

## 6. Interaction & Animation Design

### 6.1 Animation Philosophy

> "Animations should feel like a warm exhale—natural, unhurried, and calming. But as energy increases, they should feel like a heartbeat quickening."

### 6.2 Motion Parameters by Mood Stage

| Mood | Easing | Duration Multiplier | Bounce | Description |
|------|--------|---------------------|--------|-------------|
| Sad | `cubic-bezier(0.4, 0, 0.2, 1)` | 1.3x | None | Slow, heavy, deliberate |
| Calm | `cubic-bezier(0.2, 0.9, 0.2, 1)` | 1.0x | Minimal | Smooth, flowing |
| Romantic | `cubic-bezier(0.25, 0.8, 0.25, 1)` | 1.0x | Soft | Gentle, tender |
| Happy | `cubic-bezier(0.1, 0.9, 0.1, 1)` | 0.85x | Medium | Light, bouncy |
| Energetic | `cubic-bezier(0.05, 0.9, 0.1, 1.1)` | 0.7x | High | Snappy, punchy, overshoot |

### 6.3 Micro-Interactions

| Element | Animation | Mood Variation |
|---------|-----------|----------------|
| **Button Hover** | Scale up + glow | More intense glow as mood → Energetic |
| **Button Press** | Scale down + ripple | Faster ripple as mood → Energetic |
| **Play/Pause** | Morphing icon | Bouncier morph for Happy/Energetic |
| **Next Track** | Slide + fade | Snappier slide for Energetic |
| **Volume Slider** | Smooth thumb tracking | Tighter response for Energetic |
| **Track Change** | Album art crossfade | Faster crossfade for Energetic |

### 6.4 Background Pulse Animation

```css
@keyframes moodPulse {
  from {
    transform: scale(1.0) translateY(0);
  }
  to {
    transform: scale(1.04–1.14) translateY(-10px);
  }
}
```

- **Duration:** 7s (Energetic) → 18s (Sad)
- **Easing:** Matches current mood
- **Direction:** `alternate` (breathe in/out)

### 6.5 Session Progress Indicator

Visual representation of 12-song session:
```
●●●●●○○○○○○○
```
- Filled dots = counted (listened ≥25%)
- Empty dots = remaining
- Current dot pulses gently
- Dots fill smoothly (not snap)

---

## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui |
| **Animation** | anime.js + CSS variables |
| **Mood Detection** | MediaPipe / face-api.js (on-device) |
| **Music Playback** | YouTube IFrame Player API |
| **State Management** | React Context + useReducer |
| **Deployment** | Vercel |

### 7.2 Key Modules

```
src/
├── app/
│   ├── layout.tsx          # Root layout + MoodThemeProvider
│   ├── page.tsx             # Landing page
│   ├── player/page.tsx      # Player page
│   ├── how/page.tsx         # How it works
│   ├── privacy/page.tsx     # Privacy policy
│   ├── settings/page.tsx    # Settings
│   └── globals.css          # CSS variables + base styles
├── components/
│   ├── MoodThemeProvider.tsx    # CSS variable drift engine
│   ├── StagewiseToolbar.tsx     # Dev toolbar (dev only)
│   ├── CameraModal.tsx          # Camera permission + detection
│   ├── MoodSelector.tsx         # Manual mood picker
│   ├── Player/
│   │   ├── PlayerContainer.tsx  # Main player wrapper
│   │   ├── NowPlaying.tsx       # Current track display
│   │   ├── Controls.tsx         # Play/Pause/Next/Volume
│   │   ├── UpNext.tsx           # Upcoming tracks preview
│   │   └── SessionProgress.tsx  # 12-dot progress indicator
│   └── ui/                      # shadcn components
├── lib/
│   ├── moodTheme.ts         # Mood → visual token computation
│   ├── moodPath.ts          # Unique path generation + distribution
│   ├── moodDetection.ts     # Camera + ML inference wrapper
│   ├── youtubePlayer.ts     # YouTube IFrame API wrapper
│   └── sessionState.ts      # Session + queue state management
└── hooks/
    ├── useMoodDetection.ts  # Camera + inference hook
    ├── usePlayer.ts         # Playback control hook
    └── useSession.ts        # Session state hook
```

### 7.3 Data Flow

```
┌─────────────┐
│  User Visit │
└──────┬──────┘
       │
       ▼
┌─────────────────┐     ┌──────────────────┐
│ Camera Detection│ OR  │ Manual Selection │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
           ┌─────────────────┐
           │ startMood: Mood │
           └────────┬────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ generateMoodPath()  │
         │ (probabilistic)      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ distributeMoodPath- │
         │ BySongs(path, 12)   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Build initial queue │
         │ (sample from pools) │
         └──────────┬───────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │         PLAYBACK LOOP         │
    │  ┌─────────────────────────┐  │
    │  │ Play track via YouTube  │  │
    │  │ IFrame Player API       │  │
    │  └───────────┬─────────────┘  │
    │              │                │
    │              ▼                │
    │  ┌─────────────────────────┐  │
    │  │ Track ends or skipped   │  │
    │  └───────────┬─────────────┘  │
    │              │                │
    │              ▼                │
    │  ┌─────────────────────────┐  │
    │  │ listenedFraction ≥ 25%? │  │
    │  └───────────┬─────────────┘  │
    │         YES  │  NO            │
    │              │                │
    │   ┌──────────┴────────┐       │
    │   ▼                   ▼       │
    │ countedSongIndex++  Append    │
    │                     replacement│
    │                     from same  │
    │                     mood pool  │
    │   │                   │       │
    │   └─────────┬─────────┘       │
    │             │                 │
    │             ▼                 │
    │  ┌─────────────────────────┐  │
    │  │ Update MoodThemeProvider│  │
    │  │ (countedSongIndex)      │  │
    │  └───────────┬─────────────┘  │
    │              │                │
    │              ▼                │
    │  ┌─────────────────────────┐  │
    │  │ CSS variables drift     │  │
    │  │ (smooth interpolation)  │  │
    │  └─────────────────────────┘  │
    │                               │
    │  Loop until countedSongs = 12 │
    └───────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Session Complete     │
         │ [Continue] [Re-detect]│
         └──────────────────────┘
```

### 7.4 CSS Variable System

```css
:root {
  /* Mood-driven primitives (updated by MoodThemeProvider) */
  --mood-bg-h: 200;
  --mood-bg-s: 18%;
  --mood-bg-l: 11%;
  --mood-fg-h: 0;
  --mood-fg-s: 0%;
  --mood-fg-l: 93%;
  --mood-accent-h: 190;
  --mood-accent-s: 55%;
  --mood-accent-l: 60%;
  --mood-contrast: 0.4;
  --mood-pulse: 0.2;
  --mood-pulse-ms: 18000ms;
  --mood-blob: 0.5;
  --mood-motion: 0.4;
  --mood-ease: cubic-bezier(0.2, 0.9, 0.2, 1);

  /* Derived tokens */
  --background: hsl(var(--mood-bg-h) var(--mood-bg-s) var(--mood-bg-l));
  --foreground: hsl(var(--mood-fg-h) var(--mood-fg-s) var(--mood-fg-l));
  --accent: hsl(var(--mood-accent-h) var(--mood-accent-s) var(--mood-accent-l));
}
```

### 7.5 Smoothing Algorithm

```typescript
// Exponential smoothing for CSS variable updates
const tau = 8000; // ms time constant
const alpha = 1 - Math.exp(-dt / tau);

newValue = lerp(currentValue, targetValue, alpha);
```

This ensures:
- Imperceptible changes frame-to-frame
- Obvious changes over minutes
- No sudden jumps on mood stage transitions

---

## 8. Performance Requirements

| Metric | Target |
|--------|--------|
| **Initial Page Load** | ≤ 3 seconds |
| **Mood Detection** | ≤ 5 seconds (after camera start) |
| **Track Switch** | ≤ 2 seconds |
| **Initial JS Bundle** | ≤ 2–3 MB |
| **ML Models** | Lazy-loaded after camera opt-in |
| **CSS Variable Updates** | 60 FPS (requestAnimationFrame) |

### Low-End Device Fallback
- Graceful degradation to manual mood selection
- Reduced background animation complexity
- Simplified blur/glow effects

---

## 9. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All controls keyboard-accessible |
| **Screen Reader** | Buttons and controls have clear labels |
| **No Icon-Only Actions** | All icons have text labels or tooltips |
| **Color Contrast** | Maintain WCAG AA in all mood states |
| **Reduced Motion** | Respect `prefers-reduced-motion` |

---

## 10. Privacy & Compliance

| Aspect | Specification |
|--------|---------------|
| **Camera Data** | Processed 100% on-device; never uploaded |
| **Image Storage** | None. Discarded immediately after inference |
| **Stored Data** | Mood label, confidence, session metadata, playback actions |
| **PII** | None collected |
| **Compliance** | GDPR-aligned, India DPDP-aligned |
| **Age Restriction** | Not for children under 13 (disclaimer shown) |
| **Consent** | Explicit camera permission with clear explanation |

---

## 11. SEO & Metadata

| Page | SEO Handling |
|------|--------------|
| Landing (`/`) | Full SEO: title, description, OG tags |
| How It Works (`/how`) | Full SEO |
| Privacy (`/privacy`) | Full SEO |
| Player (`/player`) | `noindex` (dynamic, personalized) |
| Settings (`/settings`) | `noindex` |

---

## 12. Browser Support

| Browser | Support Level |
|---------|---------------|
| Chrome (latest) | ✅ Full |
| Edge (latest) | ✅ Full |
| Firefox (latest) | ✅ Full |
| Safari (latest) | ⚠️ Best-effort (WebRTC quirks) |
| Internet Explorer | ❌ Not supported |

---

## 13. Acceptance Criteria (Definition of Done)

### MVP Complete When:
- [ ] Clicking "Start Vibing" shows camera and detects mood within 5 seconds
- [ ] After detection, music auto-starts on the website
- [ ] User can deny camera and select mood manually
- [ ] Music plays continuously from dynamically generated queue
- [ ] Tracks do not repeat within a session
- [ ] User can Play/Pause, Skip, Mute, and adjust Volume
- [ ] Session ends after 12 counted songs (≥25% listened)
- [ ] Skipped songs (<25%) trigger replacement from same mood pool
- [ ] At session end, user can continue or re-detect
- [ ] Camera turns off immediately after detection
- [ ] No images or video are stored/uploaded
- [ ] UI theme subtly shifts based on mood + progress
- [ ] Theme changes are smooth (no sudden jumps)
- [ ] Difference between minute 1 and minute 10 is noticeable
- [ ] Works on desktop and mobile
- [ ] Passes basic accessibility checks

---

## 14. Future Roadmap (Post-MVP)

| Phase | Features |
|-------|----------|
| **v1.1** | User accounts, cross-session history, liked songs |
| **v1.2** | Spotify integration as alternative source |
| **v1.3** | Time-of-day + weather context blending |
| **v1.4** | Social sharing (share your vibe path) |
| **v2.0** | Native mobile apps (iOS, Android) |

---

## 15. Open Questions

1. **YouTube Music vs YouTube:** Can we use YouTube Music playlists via standard IFrame API, or must we use regular YouTube playlists?
2. **Playlist Curation:** Who curates the mood playlists? How often are they updated?
3. **Feedback Storage:** Do we want to persist feedback across sessions (requires backend)?
4. **Monetization:** Ads? Premium tier? Donations?

---

## Appendix A: Mood Path Examples

### Example Session: Start = Sad, Uplift = ON

**Generated Path:** Sad → Calm → Happy → Energetic

**Song Distribution (12 counted):**
| Stage | Mood | Songs | Bucket Range |
|-------|------|-------|--------------|
| 1 | Sad | 4 | Songs 1–4 |
| 2 | Calm | 3 | Songs 5–7 |
| 3 | Happy | 3 | Songs 8–10 |
| 4 | Energetic | 2 | Songs 11–12 |

**Visual Progression:**
- Songs 1–4: Deep blue palette, slow pulse (18s), low contrast, gentle motion
- Songs 5–7: Muted teal, medium pulse (14s), rising contrast
- Songs 8–10: Warm yellow, faster pulse (10s), bouncy interactions
- Songs 11–12: Vibrant orange-red, snappy pulse (7s), high contrast, punchy motion

**If user skips song 3 at 10%:**
- Song 3 does NOT count
- System appends another Sad-pool track after song 4
- User still needs to listen to 4 Sad tracks total before progressing to Calm

---

## Appendix B: Component Wireframes

*(Detailed wireframes would be attached as separate Figma/image files)*

---

**End of PRD**

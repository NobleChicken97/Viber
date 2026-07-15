# Viber - Music That Feels What You Feel

Viber is a Next.js web application that uses client-side facial emotion recognition to curate and play YouTube music playlists that match (or transition) your current mood. 

## Features
- **Facial Emotion Recognition:** Uses `face-api.js` directly in the browser to detect your mood without sending any video data to a server.
- **Dynamic Mood Curation:** Starts from your current mood (e.g., Sad, Calm, Energetic) and builds a seamless playlist that gently transitions you toward a target mood (Uplift path).
- **Custom Player UI:** A beautiful, responsive, typography-heavy player interface with dynamic color gradients and a collapsible sidebar.
- **YouTube IFrame Integration:** Plays music directly from YouTube without heavy audio hosting.
- **Lyrics Support:** Automatically fetches synced lyrics when available and displays them beautifully on screen.
- **Session History:** Tracks your past listening sessions and mood journeys locally in the browser.

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture & Technologies
- **Next.js (App Router):** The core React framework for routing and component structure.
- **Tailwind CSS:** For all styling, typography, and responsive layouts.
- **Framer Motion:** For smooth UI transitions, layout animations, and the collapsible sidebar.
- **Lucide React:** For clean, consistent iconography.
- **Face-API.js:** For client-side, real-time emotion detection using the device webcam.

## Privacy
All facial recognition and emotion detection happens **100% locally** in the browser. No video streams, images, or biometric data are ever sent to a server. 

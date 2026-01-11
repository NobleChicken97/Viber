# Viber 🎵

**AI-powered music recommendation app that detects your mood through facial expressions and curates the perfect playlist for you.**

## ✨ Features

- **🎭 Real-time Mood Detection**: Uses webcam to analyze facial expressions and determine your emotional state
- **🎵 Smart Music Curation**: 35+ curated songs per mood (175+ total tracks)
- **📊 Session Statistics**: Track your listening journey with mood distribution analytics
- **💾 Session Persistence**: Auto-save your sessions and view history
- **🎨 Beautiful UI**: Modern, gradient-rich design with mood-specific color themes
- **📱 Progressive Web App**: Install on any device, works offline
- **🔄 Live Player**: Integrated YouTube player with playlist management
- **⚡ Fast & Lightweight**: Optimized ONNX model (~5MB) for browser-based inference

## 🎭 Mood Categories

- **Sad** 💙: Melancholic, introspective music (35 tracks)
- **Calm** 🌿: Peaceful, relaxing tunes (35 tracks)
- **Romantic** 💕: Love songs and soft melodies (38 tracks)
- **Happy** ☀️: Upbeat, cheerful tracks (37 tracks)
- **Energetic** ⚡: High-energy, motivational music (38 tracks)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn
- Modern browser with webcam support
- (Optional) Python 3.9-3.13 for ML model training

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/NobleChicken97/Viber.git
cd viber
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here" > .env.local
echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" >> .env.local
```

**Get a YouTube API key:**
- Follow the guide in [docs/YOUTUBE_API.md](docs/YOUTUBE_API.md)
- The app works without API key but with limited metadata

4. **Generate app icons** (optional, for PWA)
   - Create icons: `icon-192.png`, `icon-512.png`, `apple-icon.png`, `og-image.png`
   - See [public/ICONS_README.md](public/ICONS_README.md) for guidelines

5. **Run the development server**
```bash
npm run dev
# Or with Turbopack (faster)
npm run dev -- --turbopack
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 🔨 Production Build

```bash
npm run build
npm start
```

### 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NobleChicken97/Viber)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_YOUTUBE_API_KEY`
   - `NEXT_PUBLIC_BASE_URL` (your production URL)
4. Deploy!

## 🧠 Machine Learning Model

The mood detection model is built with PyTorch and exported to ONNX for browser-based inference. See [`ml/README.md`](ml/README.md) for detailed information about:

- Model architecture (Lightweight CNN for FER2013)
- Training process (configurable epochs, targeting ~70% accuracy)
- Dataset preparation (FER2013: 35,887 grayscale 48x48 images)
- Model export for web deployment (ONNX Runtime Web)

### Current Model Status

**Pre-trained model available:** `public/mood_detector.onnx` (4.54 MB)
- **Status:** Ready for testing - requires more training for production accuracy
- **Input:** 48x48 grayscale images
- **Output:** 5 mood probabilities (sad, calm, romantic, happy, energetic)
- **Inference:** Browser-based with ONNX Runtime Web (WebAssembly)
- **Performance:** Lightweight model optimized for real-time inference

### Training the Model (Optional)

```bash
cd ml
python -m venv venv
.\venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Linux/Mac

pip install -r requirements.txt
python train_simple.py --epochs 30 --batch_size 64
python export_web.py  # Export to ONNX
```

**Note:** Python 3.9-3.13 recommended (3.14 has limited ML library support)

## 📁 Project Structure

```
viber/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx            # Landing page
│   │   ├── player/             # Music player
│   │   ├── camera/             # Camera mood detection
│   │   ├── history/            # Session history
│   │   ├── settings/           # App settings
│   │   ├── privacy/            # Privacy policy
│   │   └── how/                # How it works
│   ├── components/             # React components
│   │   ├── CameraModal.tsx     # Mood detection UI
│   │   ├── SessionPlayer.tsx   # YouTube player
│   │   ├── SessionStats.tsx    # Statistics display
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── MoodThemeProvider.tsx # Dynamic theming
│   │   └── ui/                 # Reusable UI components
│   ├── contexts/               # React context
│   │   └── SessionContext.tsx  # Global session state
│   ├── hooks/                  # Custom hooks
│   │   ├── useMoodDetection.ts # ML inference
│   │   └── useEnhancedPlaylist.ts # YouTube API
│   ├── lib/                    # Utilities
│   │   ├── playlists.ts        # Music library (183 songs)
│   │   ├── youtubeApi.ts       # YouTube integration
│   │   ├── sessionPersistence.ts # localStorage
│   │   ├── moodTheme.ts        # Theming system
│   │   └── moodPath.ts         # Mood progression logic
│   └── app/globals.css         # Global styles
├── ml/                         # Machine learning code
│   ├── model.py                # CNN architectures
│   ├── dataset.py              # FER2013 data loading
│   ├── train_simple.py         # Training script
│   └── export_web.py           # ONNX export
├── public/                     # Static assets
│   ├── mood_detector.onnx      # Pre-trained model
│   ├── mood_detector.json      # Model metadata
│   └── manifest.json           # PWA config
└── docs/                       # Documentation
    ├── PRD.md                  # Product requirements
    ├── PROGRESS.md             # Development log
    └── YOUTUBE_API.md          # API setup guide
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16.1.1 (App Router + Turbopack)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 3.4
- Lucide React (icons)

**ML/AI:**
- PyTorch 2.1+
- OpenCV (cv2)
- ONNX Runtime Web 1.23.2
- FER2013 Dataset

**APIs & Services:**
- YouTube Data API v3
- localStorage (session persistence)

## 🎯 Roadmap

### ✅ Completed
- [x] Basic mood detection UI
- [x] YouTube integration with API
- [x] ML model training pipeline
- [x] Browser-based ML inference (ONNX)
- [x] Session persistence & history
- [x] Progressive Web App (PWA)
- [x] Session statistics & analytics
- [x] Dynamic mood-based theming
- [x] Mood progression system (uplift mode)
- [x] Error boundary and error handling
- [x] Responsive design (mobile/desktop)
- [x] Multiple pages (privacy, how-it-works, settings)

### 🚧 In Progress
- [ ] Improved ML model (70%+ accuracy) - currently training
- [ ] App icons for PWA (192px, 512px, apple-icon)
- [ ] Comprehensive accessibility (WCAG AA)

### 📋 Planned
- [ ] Spotify integration
- [ ] User accounts & cloud sync
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Playlist customization
- [ ] Advanced analytics dashboard

## 🧪 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ⚠️ Needs Testing |
| Safari | 14+ | ⚠️ Needs Testing |

**Requirements:**
- WebAssembly support
- getUserMedia (camera access)
- localStorage
- ES2020+ JavaScript

## 🤝 Contributing

Contributions are welcome! Please check out the [issues](https://github.com/NobleChicken97/Viber/issues) page.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FER2013 Dataset** - Facial expression recognition dataset
- **YouTube Music** - Music streaming and metadata
- **ONNX Runtime** - Cross-platform ML inference
- **Vercel** - Hosting and deployment

---

## 👨‍💻 Author

**Made with ❤️ by [NobleChicken97](https://github.com/NobleChicken97)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/arpangoyal97/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NobleChicken97)

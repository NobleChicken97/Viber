# Viber 🎵

**AI-powered music recommendation app that detects your mood through facial expressions and curates the perfect playlist for you.**

## ✨ Features

- **🎭 Real-time Mood Detection**: Uses webcam to analyze facial expressions and determine your emotional state
- **🎵 Smart Music Curation**: Automatically generates YouTube playlists matching your mood
- **🎨 Beautiful UI**: Modern, gradient-rich design with mood-specific color themes
- **📱 Responsive**: Works seamlessly on desktop and mobile devices
- **🔄 Live Player**: Integrated YouTube player with playlist management
- **⚡ Fast & Lightweight**: Optimized ML model (~500KB) for quick inference

## 🎭 Mood Categories

- **Sad**: Melancholic, introspective music
- **Calm**: Peaceful, relaxing tunes
- **Romantic**: Love songs and soft melodies
- **Happy**: Upbeat, cheerful tracks
- **Energetic**: High-energy, motivational music

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.14+ (for ML model training)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/NobleChicken97/Viber.git
cd Viber
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your YouTube API key to `.env.local`:
```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🧠 Machine Learning Model

The mood detection model is built with PyTorch and trained on the FER2013 dataset. See [`ml/README.md`](ml/README.md) for detailed information about:

- Model architecture
- Training process
- Dataset preparation
- Model export for web deployment

### Training the Model

```bash
cd ml
python -m venv venv
.\venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Linux/Mac

pip install -r requirements.txt
python train_simple.py --epochs 30 --batch_size 64 --model lightweight
```

## 📁 Project Structure

```
viber/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── page.tsx      # Landing page
│   │   ├── camera/       # Mood detection page
│   │   ├── player/       # Music player page
│   │   └── settings/     # App settings
│   ├── components/       # React components
│   │   ├── CameraModal.tsx
│   │   ├── YouTubePlayer.tsx
│   │   └── ui/           # UI components
│   ├── lib/              # Utilities
│   └── styles/           # Global styles
├── ml/                   # Machine learning code
│   ├── model.py          # Model architectures
│   ├── dataset.py        # Data loading
│   ├── train_simple.py   # Training script
│   ├── inference.py      # Real-time inference
│   └── export_web.py     # ONNX export
├── public/               # Static assets
└── docs/                 # Documentation
    ├── PRD.md            # Product requirements
    └── PROGRESS.md       # Development progress
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

**ML/AI:**
- PyTorch
- OpenCV
- ONNX Runtime (for browser inference)
- FER2013 Dataset

**APIs:**
- YouTube Data API v3

## 🎯 Roadmap

- [x] Basic mood detection UI
- [x] YouTube integration
- [x] ML model training pipeline
- [ ] Browser-based ML inference (ONNX)
- [ ] Spotify integration
- [ ] User accounts & playlist history
- [ ] Social sharing features
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please check out the [issues](https://github.com/NobleChicken97/Viber/issues) page.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FER2013 dataset for emotion recognition
- Next.js team for the amazing framework
- YouTube API for music integration

---

Made with ❤️ by [NobleChicken97](https://github.com/NobleChicken97)

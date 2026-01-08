# Viber Mood Detection Model

This directory contains the ML model for detecting mood from facial expressions in a 3-5 second video feed.

## Architecture

**Approach:** Facial Expression Recognition (FER) using CNN
- Input: Video frames (3-5 seconds @ ~10 FPS = 30-50 frames)
- Processing: Extract faces → Classify expression per frame → Aggregate over time
- Output: One of 5 moods (sad, calm, romantic, happy, energetic)

## Mood Mapping

Standard emotion datasets (FER2013, AffectNet) have 7 emotions. We map them to our 5 moods:

| Dataset Emotion | Viber Mood |
|-----------------|------------|
| Angry           | Energetic  |
| Disgust         | Sad        |
| Fear            | Sad        |
| Happy           | Happy      |
| Sad             | Sad        |
| Surprise        | Energetic  |
| Neutral         | Calm       |
| Contempt*       | Calm       |

*AffectNet only

**Note:** "Romantic" mood will be inferred contextually or via combination signals (e.g., soft smile + relaxed features → romantic vs happy)

## Setup

```bash
cd ml
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Training

```bash
python train.py --epochs 50 --batch_size 64
```

## Directory Structure

```
ml/
├── data/              # Training data (gitignored)
├── models/            # Saved model checkpoints
├── exports/           # Web-ready exports (ONNX, TF.js)
├── train.py           # Training script
├── model.py           # Model architecture
├── dataset.py         # Data loading & augmentation
├── inference.py       # Test inference
├── export_web.py      # Export to TF.js/ONNX
└── requirements.txt   # Python dependencies
```

## Export for Web

After training:
```bash
python export_web.py --checkpoint models/best.pth --format onnx
```

The exported model can be used with ONNX Runtime Web in the Next.js app.

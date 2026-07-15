"""
Dataset loading and augmentation for Facial Expression Recognition.

Supports:
- FER2013 (Kaggle): 35,887 grayscale 48x48 images, 7 emotions
- AffectNet: 400K+ images, 8 emotions (requires separate download)
- Custom dataset structure

Emotions are mapped to Viber's 5 moods.
"""

import os
from pathlib import Path
from typing import Optional, Callable, Tuple, List
import numpy as np
import pandas as pd
import cv2
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
import albumentations as A
from albumentations.pytorch import ToTensorV2

# Mapping from FER2013/AffectNet emotions to Viber moods
# FER2013 labels: 0=Angry, 1=Disgust, 2=Fear, 3=Happy, 4=Sad, 5=Surprise, 6=Neutral
#
# Psychological mapping based on Russell's Circumplex Model:
# - Sad (melancholic): Low arousal, negative valence → Fear, Sad
# - Calm (peaceful): Low arousal, neutral/positive → Neutral
# - Energetic (intense): High arousal, negative valence → Angry, Disgust
# - Happy (joyful): High arousal, positive valence → Happy, Surprise
# - Romantic: Not detectable from FER2013 (manual selection or mood progression only)
FER2013_TO_MOOD = {
    0: 4,  # Angry → Energetic (intense/aggressive music)
    1: 4,  # Disgust → Energetic (intense/dark music)
    2: 0,  # Fear → Sad (calming/melancholic for anxiety)
    3: 3,  # Happy → Happy (joyful music)
    4: 0,  # Sad → Sad (melancholic music)
    5: 3,  # Surprise → Happy (positive excitement)
    6: 1,  # Neutral → Calm (peaceful/serene music)
}

# Mood names for reference
MOOD_NAMES = ["sad", "calm", "romantic", "happy", "energetic"]


def get_train_transforms(input_size: int = 48, grayscale: bool = True) -> A.Compose:
    """Training augmentations for facial expression recognition."""
    return A.Compose(
        [
            A.Resize(input_size, input_size),
            A.HorizontalFlip(p=0.5),
            A.Rotate(limit=15, p=0.5),
            A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5),
            A.GaussNoise(var_limit=(10, 50), p=0.3),
            A.GaussianBlur(blur_limit=(3, 5), p=0.2),
            A.CoarseDropout(
                max_holes=8,
                max_height=input_size // 8,
                max_width=input_size // 8,
                min_holes=1,
                min_height=2,
                min_width=2,
                p=0.3,
            ),
            A.Normalize(
                mean=[0.5] if grayscale else [0.485, 0.456, 0.406],
                std=[0.5] if grayscale else [0.229, 0.224, 0.225],
            ),
            ToTensorV2(),
        ]
    )


def get_val_transforms(input_size: int = 48, grayscale: bool = True) -> A.Compose:
    """Validation/test transforms (no augmentation)."""
    return A.Compose(
        [
            A.Resize(input_size, input_size),
            A.Normalize(
                mean=[0.5] if grayscale else [0.485, 0.456, 0.406],
                std=[0.5] if grayscale else [0.229, 0.224, 0.225],
            ),
            ToTensorV2(),
        ]
    )


class FER2013Dataset(Dataset):
    """
    FER2013 Dataset from Kaggle.

    Download: https://www.kaggle.com/datasets/msambare/fer2013
    Expected structure after download:
        data/fer2013/
        ├── train/
        │   ├── angry/
        │   ├── disgust/
        │   ├── fear/
        │   ├── happy/
        │   ├── neutral/
        │   ├── sad/
        │   └── surprise/
        └── test/
            └── (same structure)
    """

    EMOTION_FOLDERS = {
        "angry": 0,
        "disgust": 1,
        "fear": 2,
        "happy": 3,
        "sad": 4,
        "surprise": 5,
        "neutral": 6,
    }

    def __init__(
        self,
        root: str,
        split: str = "train",
        transform: Optional[Callable] = None,
        map_to_moods: bool = True,
    ):
        self.root = Path(root)
        self.split = split
        self.transform = transform
        self.map_to_moods = map_to_moods

        self.images: List[Path] = []
        self.labels: List[int] = []

        split_dir = self.root / split
        if not split_dir.exists():
            raise ValueError(f"Split directory not found: {split_dir}")

        for emotion_name, emotion_idx in self.EMOTION_FOLDERS.items():
            emotion_dir = split_dir / emotion_name
            if emotion_dir.exists():
                for img_path in emotion_dir.glob("*.jpg"):
                    self.images.append(img_path)
                    label = (
                        FER2013_TO_MOOD[emotion_idx] if map_to_moods else emotion_idx
                    )
                    self.labels.append(label)
                for img_path in emotion_dir.glob("*.png"):
                    self.images.append(img_path)
                    label = (
                        FER2013_TO_MOOD[emotion_idx] if map_to_moods else emotion_idx
                    )
                    self.labels.append(label)

        print(f"Loaded {len(self.images)} images from {split} split")
        self._print_class_distribution()

    def _print_class_distribution(self):
        """Print class distribution."""
        labels = np.array(self.labels)
        names = MOOD_NAMES if self.map_to_moods else list(self.EMOTION_FOLDERS.keys())
        print("Class distribution:")
        for i, name in enumerate(names):
            count = (labels == i).sum()
            pct = count / len(labels) * 100
            print(f"  {name}: {count} ({pct:.1f}%)")

    def __len__(self) -> int:
        return len(self.images)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path = self.images[idx]
        label = self.labels[idx]

        # Load image as grayscale
        image = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError(f"Failed to load image: {img_path}")

        # Add channel dimension for albumentations (H, W) -> (H, W, 1)
        image = np.expand_dims(image, axis=-1)

        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]

        return image, label  # type: ignore

    def get_class_weights(self) -> torch.Tensor:
        """Compute class weights for balanced training."""
        labels = np.array(self.labels)
        num_classes = 5 if self.map_to_moods else 7
        class_counts = np.bincount(labels, minlength=num_classes)
        # Inverse frequency weighting
        weights = 1.0 / (class_counts + 1e-6)
        weights = weights / weights.sum() * num_classes
        return torch.FloatTensor(weights)


class FER2013CSVDataset(Dataset):
    """
    FER2013 Dataset from original CSV format.

    Download fer2013.csv from Kaggle:
    https://www.kaggle.com/c/challenges-in-representation-learning-facial-expression-recognition-challenge/data

    CSV columns: emotion, pixels, Usage
    - pixels: space-separated 48x48=2304 pixel values
    - Usage: Training, PublicTest, PrivateTest
    """

    def __init__(
        self,
        csv_path: str,
        split: str = "Training",  # "Training", "PublicTest", "PrivateTest"
        transform: Optional[Callable] = None,
        map_to_moods: bool = True,
    ):
        self.transform = transform
        self.map_to_moods = map_to_moods

        # Load CSV
        df = pd.read_csv(csv_path)
        df = df[df["Usage"] == split]

        self.labels = df["emotion"].values.astype(np.int64)
        if map_to_moods:
            self.labels = np.array([FER2013_TO_MOOD[l] for l in self.labels])

        # Parse pixel strings to arrays
        self.images = []
        for pixels in df["pixels"]:
            img = np.array(pixels.split(), dtype=np.uint8).reshape(48, 48)
            self.images.append(img)

        print(f"Loaded {len(self.images)} images from {split}")
        self._print_distribution()

    def _print_distribution(self):
        names = (
            MOOD_NAMES
            if self.map_to_moods
            else ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]
        )
        for i, name in enumerate(names):
            count = (self.labels == i).sum()
            print(f"  {name}: {count}")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        image = self.images[idx]
        label = self.labels[idx]

        image = np.expand_dims(image, axis=-1)  # (48, 48, 1)

        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]

        return image, int(label)  # type: ignore

    def get_class_weights(self) -> torch.Tensor:
        num_classes = 5 if self.map_to_moods else 7
        class_counts = np.bincount(self.labels, minlength=num_classes)
        weights = 1.0 / (class_counts + 1e-6)
        weights = weights / weights.sum() * num_classes
        return torch.FloatTensor(weights)


class VideoFrameDataset(Dataset):
    """
    Dataset for processing video frames during inference.
    Takes a list of frames (numpy arrays) and returns preprocessed tensors.
    """

    def __init__(self, frames: List[np.ndarray], transform: Optional[Callable] = None):
        self.frames = frames
        self.transform = transform or get_val_transforms()

    def __len__(self):
        return len(self.frames)

    def __getitem__(self, idx):
        frame = self.frames[idx]

        # Convert to grayscale if needed
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        frame = np.expand_dims(frame, axis=-1)

        if self.transform:
            augmented = self.transform(image=frame)
            frame = augmented["image"]

        return frame


def create_data_loaders(
    data_root: str,
    batch_size: int = 64,
    input_size: int = 48,
    num_workers: int = 4,
    use_weighted_sampler: bool = True,
    csv_mode: bool = False,
    csv_path: Optional[str] = None,
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """
    Create train, validation, and test data loaders.

    Args:
        data_root: Root directory containing data
        batch_size: Batch size
        input_size: Image size (48 for lightweight model, 224 for MobileNet)
        num_workers: Number of data loading workers
        use_weighted_sampler: Use weighted random sampler for class imbalance
        csv_mode: Use CSV dataset instead of folder structure
        csv_path: Path to fer2013.csv if csv_mode=True

    Returns:
        (train_loader, val_loader, test_loader)
    """
    train_transform = get_train_transforms(input_size)
    val_transform = get_val_transforms(input_size)

    train_dataset: Dataset
    val_dataset: Dataset
    test_dataset: Dataset
    if csv_mode:
        if csv_path is None:
            csv_path = os.path.join(data_root, "fer2013.csv")
        train_dataset = FER2013CSVDataset(csv_path, "Training", train_transform)
        val_dataset = FER2013CSVDataset(csv_path, "PublicTest", val_transform)
        test_dataset = FER2013CSVDataset(csv_path, "PrivateTest", val_transform)
    else:
        train_dataset = FER2013Dataset(data_root, "train", train_transform)
        val_dataset = FER2013Dataset(data_root, "test", val_transform)
        test_dataset = val_dataset  # FER2013 folder version only has train/test

    # Create weighted sampler for training
    sampler = None
    shuffle = True
    if use_weighted_sampler:
        class_weights = train_dataset.get_class_weights()
        sample_weights = class_weights[train_dataset.labels]
        sampler = WeightedRandomSampler(
            sample_weights.tolist(), len(sample_weights), replacement=True
        )
        shuffle = False  # Sampler handles shuffling

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        sampler=sampler,
        num_workers=num_workers,
        pin_memory=True,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    return train_loader, val_loader, test_loader


if __name__ == "__main__":
    # Test data loading
    print("Testing dataset loading...")

    # Create dummy transforms for testing
    transform = get_train_transforms(48)
    print(f"Transform: {transform}")

    # Test VideoFrameDataset
    dummy_frames = [
        np.random.randint(0, 255, (48, 48), dtype=np.uint8) for _ in range(10)
    ]
    video_dataset = VideoFrameDataset(dummy_frames)
    print(f"\nVideoFrameDataset test:")
    print(f"  Num frames: {len(video_dataset)}")
    print(f"  Frame shape: {video_dataset[0].shape}")

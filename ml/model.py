"""
Viber Mood Detection Model Architecture

Uses a lightweight CNN (MobileNetV3-Small based) for real-time facial expression recognition.
Designed to run efficiently in the browser via ONNX Runtime Web.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models


class MoodClassifier(nn.Module):
    """
    Mood classification model using MobileNetV3-Small backbone.
    
    Input: 48x48 or 224x224 grayscale/RGB face images
    Output: 5-class mood probabilities (sad, calm, romantic, happy, energetic)
    """
    
    # Mood labels in order
    MOODS = ["sad", "calm", "romantic", "happy", "energetic"]
    
    def __init__(
        self, 
        num_classes: int = 5, 
        input_size: int = 224,
        pretrained: bool = True,
        dropout: float = 0.3
    ):
        super().__init__()
        
        self.num_classes = num_classes
        self.input_size = input_size
        
        # Use MobileNetV3-Small for efficiency (browser-friendly)
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_small(weights=weights)
        
        # Replace classifier head
        in_features = self.backbone.classifier[0].in_features  # 576
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(dropout),
            nn.Linear(256, 64),
            nn.Hardswish(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input tensor of shape (B, 3, H, W)
        Returns:
            Logits of shape (B, num_classes)
        """
        return self.backbone(x)
    
    def predict(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Get mood predictions with probabilities.
        
        Returns:
            (mood_indices, probabilities)
        """
        logits = self.forward(x)
        probs = F.softmax(logits, dim=-1)
        mood_indices = torch.argmax(probs, dim=-1)
        return mood_indices, probs
    
    def predict_mood_name(self, x: torch.Tensor) -> list[str]:
        """Get mood names for batch of images."""
        indices, _ = self.predict(x)
        return [self.MOODS[i] for i in indices.cpu().numpy()]


class TemporalMoodAggregator(nn.Module):
    """
    Aggregates frame-level mood predictions over a video sequence.
    
    Uses weighted averaging with recency bias (later frames matter more).
    """
    
    def __init__(self, base_model: MoodClassifier, recency_weight: float = 1.5):
        super().__init__()
        self.base_model = base_model
        self.recency_weight = recency_weight
        
    def forward(self, frames: torch.Tensor) -> tuple[int, torch.Tensor]:
        """
        Aggregate predictions over video frames.
        
        Args:
            frames: Tensor of shape (T, 3, H, W) where T is number of frames
            
        Returns:
            (final_mood_index, aggregated_probabilities)
        """
        T = frames.shape[0]
        
        # Get predictions for all frames
        with torch.no_grad():
            logits = self.base_model(frames)  # (T, num_classes)
            probs = F.softmax(logits, dim=-1)
        
        # Create recency weights (later frames weighted more)
        weights = torch.linspace(1.0, self.recency_weight, T, device=frames.device)
        weights = weights / weights.sum()  # Normalize
        
        # Weighted average of probabilities
        weighted_probs = (probs * weights.unsqueeze(-1)).sum(dim=0)
        
        final_mood = torch.argmax(weighted_probs).item()
        
        return final_mood, weighted_probs


class LightweightFERModel(nn.Module):
    """
    Ultra-lightweight model for faster inference.
    Uses custom CNN instead of pretrained backbone.
    
    ~500KB model size, suitable for web deployment.
    """
    
    MOODS = ["sad", "calm", "romantic", "happy", "energetic"]
    
    def __init__(self, num_classes: int = 5, input_size: int = 48):
        super().__init__()
        
        self.input_size = input_size
        
        # Convolutional blocks
        self.features = nn.Sequential(
            # Block 1: 48 -> 24
            nn.Conv2d(1, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
            
            # Block 2: 24 -> 12
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
            
            # Block 3: 12 -> 6
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
            
            # Block 4: 6 -> 3
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
        )
        
        # Calculate feature size (for 48x48 input: 256 * 3 * 3 = 2304)
        self._feature_size = 256 * (input_size // 16) ** 2
        
        # Classifier
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(self._feature_size, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.classifier(x)
        return x
    
    def predict(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        logits = self.forward(x)
        probs = F.softmax(logits, dim=-1)
        indices = torch.argmax(probs, dim=-1)
        return indices, probs


def get_model(model_type: str = "mobilenet", **kwargs) -> nn.Module:
    """
    Factory function to get the appropriate model.
    
    Args:
        model_type: "mobilenet" for MobileNetV3 or "lightweight" for custom CNN
        **kwargs: Additional model parameters
        
    Returns:
        Model instance
    """
    if model_type == "mobilenet":
        return MoodClassifier(**kwargs)
    elif model_type == "lightweight":
        return LightweightFERModel(**kwargs)
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    # Quick test
    print("Testing MoodClassifier (MobileNetV3)...")
    model = MoodClassifier(pretrained=False)
    x = torch.randn(2, 3, 224, 224)
    out = model(x)
    print(f"  Input shape: {x.shape}")
    print(f"  Output shape: {out.shape}")
    print(f"  Mood predictions: {model.predict_mood_name(x)}")
    
    print("\nTesting LightweightFERModel...")
    model_light = LightweightFERModel()
    x_small = torch.randn(2, 1, 48, 48)  # Grayscale 48x48
    out_light = model_light(x_small)
    print(f"  Input shape: {x_small.shape}")
    print(f"  Output shape: {out_light.shape}")
    
    # Model size comparison
    def count_params(m):
        return sum(p.numel() for p in m.parameters())
    
    print(f"\nModel sizes:")
    print(f"  MobileNetV3: {count_params(model) / 1e6:.2f}M parameters")
    print(f"  Lightweight:  {count_params(model_light) / 1e6:.2f}M parameters")

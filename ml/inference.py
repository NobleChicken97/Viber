"""
Real-time inference for mood detection from video frames.

This module provides:
1. Face detection using OpenCV's DNN or Haar Cascades
2. Frame-by-frame mood classification
3. Temporal aggregation for stable predictions over 3-5 seconds
"""

import cv2
import numpy as np
import torch
from pathlib import Path
from typing import Optional, Tuple, List
from collections import deque
import time

from model import LightweightFERModel, MoodClassifier
from dataset import get_val_transforms, MOOD_NAMES


class FaceDetector:
    """Face detection using OpenCV."""

    def __init__(self, method: str = "haar"):
        """
        Args:
            method: "haar" for Haar Cascades (fast, less accurate)
                   "dnn" for DNN-based detection (accurate, requires model)
        """
        self.method = method

        if method == "haar":
            # Use OpenCV's built-in Haar Cascade
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"  # type: ignore
            self.detector = cv2.CascadeClassifier(cascade_path)
        else:
            # DNN-based face detection (requires separate download)
            raise NotImplementedError("DNN method requires additional setup")

    def detect(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in a frame.

        Args:
            frame: BGR image

        Returns:
            List of (x, y, w, h) bounding boxes
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if self.method == "haar":
            faces = self.detector.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(48, 48),
                flags=cv2.CASCADE_SCALE_IMAGE,
            )
            return list(faces)  # type: ignore

        return []

    def extract_face(
        self,
        frame: np.ndarray,
        bbox: Tuple[int, int, int, int],
        target_size: int = 48,
        padding: float = 0.2,
    ) -> np.ndarray:
        """
        Extract and preprocess face region.

        Args:
            frame: BGR image
            bbox: (x, y, w, h) bounding box
            target_size: Output size (48 for lightweight, 224 for mobilenet)
            padding: Extra padding around face (0.2 = 20%)

        Returns:
            Grayscale face image of target_size x target_size
        """
        x, y, w, h = bbox

        # Add padding
        pad_x = int(w * padding)
        pad_y = int(h * padding)

        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(frame.shape[1], x + w + pad_x)
        y2 = min(frame.shape[0], y + h + pad_y)

        # Extract and resize
        face = frame[y1:y2, x1:x2]
        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        face = cv2.resize(face, (target_size, target_size))

        return face


class MoodDetector:
    """
    Real-time mood detection from video frames.

    Uses temporal smoothing to provide stable mood predictions
    over a 3-5 second window.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        model_type: str = "lightweight",
        device: str = "auto",
        input_size: int = 48,
        temporal_window: int = 30,  # ~3 seconds at 10 FPS
        min_confidence: float = 0.3,
    ):
        """
        Args:
            model_path: Path to trained model checkpoint
            model_type: "lightweight" or "mobilenet"
            device: "auto", "cuda", "cpu"
            input_size: Model input size
            temporal_window: Number of frames to average over
            min_confidence: Minimum confidence threshold
        """
        self.input_size = input_size
        self.temporal_window = temporal_window
        self.min_confidence = min_confidence

        # Setup device
        if device == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        # Load model
        self.model: torch.nn.Module
        if model_type == "lightweight":
            self.model = LightweightFERModel(input_size=input_size)
        else:
            self.model = MoodClassifier(input_size=input_size, pretrained=False)

        if model_path:
            checkpoint = torch.load(model_path, map_location=self.device)
            if "model_state_dict" in checkpoint:
                self.model.load_state_dict(checkpoint["model_state_dict"])
            else:
                self.model.load_state_dict(checkpoint)

        self.model = self.model.to(self.device)
        self.model.eval()

        # Face detector
        self.face_detector = FaceDetector("haar")

        # Preprocessing
        self.transform = get_val_transforms(input_size, grayscale=True)

        # Temporal buffer for smoothing
        self.prediction_buffer: deque = deque(maxlen=temporal_window)

        print(f"MoodDetector initialized on {self.device}")

    def preprocess_face(self, face: np.ndarray) -> torch.Tensor:
        """Preprocess face image for model input."""
        # Ensure grayscale with channel dim
        if len(face.shape) == 2:
            face = np.expand_dims(face, axis=-1)

        # Apply transforms
        augmented = self.transform(image=face)
        tensor = augmented["image"]

        return tensor.unsqueeze(0).to(self.device)

    def predict_single_frame(
        self, frame: np.ndarray
    ) -> Optional[Tuple[str, float, Tuple[int, int, int, int]]]:
        """
        Predict mood from a single frame.

        Args:
            frame: BGR image

        Returns:
            (mood, confidence, bbox) or None if no face detected
        """
        # Detect faces
        faces = self.face_detector.detect(frame)

        if len(faces) == 0:
            return None

        if len(faces) > 1:
            # Multiple faces - use largest
            faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)

        bbox = faces[0]

        # Extract and preprocess face
        face = self.face_detector.extract_face(frame, bbox, self.input_size)
        input_tensor = self.preprocess_face(face)

        # Predict
        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = torch.softmax(logits, dim=-1)
            mood_idx = int(torch.argmax(probs, dim=-1).item())
            confidence = float(probs[0, mood_idx].item())

        mood = MOOD_NAMES[mood_idx]

        return mood, confidence, tuple(bbox)

    def process_frame(
        self, frame: np.ndarray
    ) -> Optional[Tuple[str, float, np.ndarray]]:
        """
        Process a frame and update temporal buffer.

        Returns aggregated prediction over temporal window.

        Args:
            frame: BGR image

        Returns:
            (mood, confidence, probs) or None if no face
        """
        # Get single frame prediction
        result = self.predict_single_frame(frame)

        if result is None:
            return None

        mood, confidence, bbox = result

        # Add to buffer
        mood_idx = MOOD_NAMES.index(mood)
        self.prediction_buffer.append((mood_idx, confidence))

        # Aggregate predictions
        if len(self.prediction_buffer) < 5:
            # Not enough frames yet
            return mood, confidence, np.zeros(5)

        # Weighted average (recent frames weighted more)
        indices = []
        weights = []

        for i, (idx, conf) in enumerate(self.prediction_buffer):
            weight = (i + 1) * conf  # Recency + confidence weighting
            indices.append(idx)
            weights.append(weight)

        # Compute mood distribution
        mood_scores = np.zeros(5)
        total_weight = sum(weights)

        for idx, weight in zip(indices, weights):
            mood_scores[idx] += weight / total_weight

        # Get final prediction
        final_mood_idx = np.argmax(mood_scores)
        final_confidence = mood_scores[final_mood_idx]

        return MOOD_NAMES[final_mood_idx], final_confidence, mood_scores

    def detect_mood_from_video(
        self,
        duration: float = 3.0,
        fps: int = 10,
        camera_id: int = 0,
        show_preview: bool = True,
    ) -> Tuple[str, float, np.ndarray]:
        """
        Detect mood from live video feed.

        Args:
            duration: How long to capture (seconds)
            fps: Target frame rate
            camera_id: Camera device ID
            show_preview: Show live preview window

        Returns:
            (mood, confidence, mood_distribution)
        """
        cap = cv2.VideoCapture(camera_id)

        if not cap.isOpened():
            raise RuntimeError(f"Cannot open camera {camera_id}")

        # Clear buffer
        self.prediction_buffer.clear()

        start_time = time.time()
        frame_interval = 1.0 / fps
        last_frame_time = 0.0

        try:
            while True:
                current_time = time.time() - start_time

                # Check duration
                if current_time >= duration:
                    break

                # Frame rate limiting
                if current_time - last_frame_time < frame_interval:
                    continue

                last_frame_time = current_time

                # Read frame
                ret, frame = cap.read()
                if not ret:
                    continue

                # Process
                result = self.process_frame(frame)

                # Show preview
                if show_preview:
                    preview = frame.copy()

                    # Draw face box and mood
                    if result:
                        faces = self.face_detector.detect(frame)
                        if faces:
                            x, y, w, h = faces[0]
                            cv2.rectangle(
                                preview, (x, y), (x + w, y + h), (0, 255, 0), 2
                            )

                            mood, conf, _ = result
                            text = f"{mood}: {conf:.1%}"
                            cv2.putText(
                                preview,
                                text,
                                (x, y - 10),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.7,
                                (0, 255, 0),
                                2,
                            )

                    # Draw progress bar
                    progress = current_time / duration
                    bar_width = int(preview.shape[1] * progress)
                    cv2.rectangle(preview, (0, 0), (bar_width, 10), (0, 255, 0), -1)

                    cv2.imshow("Mood Detection", preview)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break

        finally:
            cap.release()
            if show_preview:
                cv2.destroyAllWindows()

        # Get final aggregated result
        if len(self.prediction_buffer) == 0:
            return "calm", 0.0, np.zeros(5)  # Default

        # Final aggregation
        mood_scores = np.zeros(5)
        total_weight = 0

        for i, (idx, conf) in enumerate(self.prediction_buffer):
            weight = (i + 1) * conf
            mood_scores[idx] += weight
            total_weight += weight

        mood_scores /= total_weight

        final_idx = np.argmax(mood_scores)
        final_mood = MOOD_NAMES[final_idx]
        final_confidence = mood_scores[final_idx]

        return final_mood, final_confidence, mood_scores


def main():
    """Test mood detection from webcam."""
    import argparse

    parser = argparse.ArgumentParser(description="Test mood detection")
    parser.add_argument(
        "--model", type=str, default=None, help="Path to model checkpoint"
    )
    parser.add_argument(
        "--duration", type=float, default=5.0, help="Detection duration in seconds"
    )
    parser.add_argument("--camera", type=int, default=0, help="Camera device ID")

    args = parser.parse_args()

    detector = MoodDetector(
        model_path=args.model, model_type="lightweight", input_size=48
    )

    print(f"\nStarting {args.duration}s mood detection...")
    print("Look at the camera with a natural expression.")
    print("Press 'q' to quit early.\n")

    mood, confidence, distribution = detector.detect_mood_from_video(
        duration=args.duration, camera_id=args.camera, show_preview=True
    )

    print(f"\nDetected Mood: {mood.upper()}")
    print(f"Confidence: {confidence:.1%}")
    print("\nMood Distribution:")
    for name, score in zip(MOOD_NAMES, distribution):
        bar = "█" * int(score * 20)
        print(f"  {name:10s} {bar:20s} {score:.1%}")


if __name__ == "__main__":
    main()

"""
Export trained model for web deployment.

Supports:
- ONNX: For ONNX Runtime Web (recommended for browser)
- TorchScript: For torch.js or custom runtime

The exported model can be loaded in the browser using ONNX Runtime Web.
"""

import argparse
import os
from pathlib import Path
import torch
import torch.onnx
import numpy as np

from model import LightweightFERModel, MoodClassifier, MOOD_NAMES


def export_to_onnx(
    model: torch.nn.Module,
    output_path: str,
    input_size: int = 48,
    grayscale: bool = True,
    opset_version: int = 14,
    dynamic_batch: bool = True
):
    """
    Export PyTorch model to ONNX format.
    
    Args:
        model: Trained PyTorch model
        output_path: Output .onnx file path
        input_size: Model input size
        grayscale: Whether model expects grayscale input
        opset_version: ONNX opset version
        dynamic_batch: Allow dynamic batch size
    """
    model.eval()
    
    # Create dummy input
    channels = 1 if grayscale else 3
    dummy_input = torch.randn(1, channels, input_size, input_size)
    
    # Dynamic axes for variable batch size
    dynamic_axes = None
    if dynamic_batch:
        dynamic_axes = {
            "input": {0: "batch_size"},
            "output": {0: "batch_size"}
        }
    
    print(f"Exporting to ONNX...")
    print(f"  Input shape: {dummy_input.shape}")
    print(f"  Output path: {output_path}")
    
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=opset_version,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes=dynamic_axes
    )
    
    # Verify export
    import onnx
    import onnxruntime as ort
    
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)
    print("  ONNX model verified ✓")
    
    # Test inference
    ort_session = ort.InferenceSession(output_path)
    ort_inputs = {"input": dummy_input.numpy()}
    ort_outputs = ort_session.run(None, ort_inputs)
    
    print(f"  Output shape: {ort_outputs[0].shape}")
    print(f"  Test prediction: {MOOD_NAMES[np.argmax(ort_outputs[0][0])]}")
    
    # Model size
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Model size: {size_mb:.2f} MB")


def export_to_torchscript(
    model: torch.nn.Module,
    output_path: str,
    input_size: int = 48,
    grayscale: bool = True
):
    """
    Export model to TorchScript format.
    
    Args:
        model: Trained PyTorch model
        output_path: Output .pt file path
        input_size: Model input size
        grayscale: Whether model expects grayscale input
    """
    model.eval()
    
    channels = 1 if grayscale else 3
    dummy_input = torch.randn(1, channels, input_size, input_size)
    
    print(f"Exporting to TorchScript...")
    print(f"  Input shape: {dummy_input.shape}")
    print(f"  Output path: {output_path}")
    
    # Trace the model
    traced = torch.jit.trace(model, dummy_input)
    traced.save(output_path)
    
    # Verify
    loaded = torch.jit.load(output_path)
    test_output = loaded(dummy_input)
    
    print(f"  Output shape: {test_output.shape}")
    print(f"  Test prediction: {MOOD_NAMES[torch.argmax(test_output[0]).item()]}")
    
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Model size: {size_mb:.2f} MB")


def create_metadata(model_path: str, config: dict):
    """Create metadata JSON for the exported model."""
    import json
    
    metadata = {
        "model_name": "viber-mood-detector",
        "version": "1.0.0",
        "moods": MOOD_NAMES,
        "input": {
            "shape": [1, config.get("channels", 1), config["input_size"], config["input_size"]],
            "dtype": "float32",
            "normalization": {
                "mean": [0.5],
                "std": [0.5]
            }
        },
        "output": {
            "shape": [1, 5],
            "dtype": "float32",
            "description": "Raw logits (apply softmax for probabilities)"
        },
        "preprocessing": {
            "face_detection": "Required before inference",
            "resize": f"{config['input_size']}x{config['input_size']}",
            "colorspace": "grayscale" if config.get("grayscale", True) else "RGB"
        }
    }
    
    metadata_path = model_path.replace(".onnx", ".json").replace(".pt", ".json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Metadata saved to: {metadata_path}")


def main():
    parser = argparse.ArgumentParser(description="Export model for web deployment")
    
    parser.add_argument("--checkpoint", type=str, required=True,
                        help="Path to model checkpoint (.pth)")
    parser.add_argument("--format", type=str, default="onnx",
                        choices=["onnx", "torchscript", "both"],
                        help="Export format")
    parser.add_argument("--output_dir", type=str, default="exports",
                        help="Output directory")
    parser.add_argument("--model_type", type=str, default="lightweight",
                        choices=["lightweight", "mobilenet"],
                        help="Model architecture")
    parser.add_argument("--input_size", type=int, default=48,
                        help="Input image size")
    parser.add_argument("--name", type=str, default="mood_detector",
                        help="Output filename (without extension)")
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load model
    print(f"Loading model from {args.checkpoint}...")
    
    if args.model_type == "lightweight":
        model = LightweightFERModel(input_size=args.input_size)
        grayscale = True
    else:
        model = MoodClassifier(input_size=args.input_size, pretrained=False)
        grayscale = args.input_size == 48  # Grayscale for small, RGB for 224
    
    checkpoint = torch.load(args.checkpoint, map_location="cpu")
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
        print(f"  Loaded from epoch {checkpoint.get('epoch', '?')}")
        print(f"  Val accuracy: {checkpoint.get('val_acc', '?')}")
    else:
        model.load_state_dict(checkpoint)
    
    model.eval()
    
    # Count parameters
    params = sum(p.numel() for p in model.parameters())
    print(f"  Parameters: {params / 1e6:.2f}M")
    
    # Export
    config = {
        "input_size": args.input_size,
        "grayscale": grayscale,
        "channels": 1 if grayscale else 3,
        "model_type": args.model_type
    }
    
    if args.format in ["onnx", "both"]:
        onnx_path = str(output_dir / f"{args.name}.onnx")
        export_to_onnx(model, onnx_path, args.input_size, grayscale)
        create_metadata(onnx_path, config)
    
    if args.format in ["torchscript", "both"]:
        ts_path = str(output_dir / f"{args.name}.pt")
        export_to_torchscript(model, ts_path, args.input_size, grayscale)
        create_metadata(ts_path, config)
    
    print("\n✓ Export complete!")


if __name__ == "__main__":
    main()

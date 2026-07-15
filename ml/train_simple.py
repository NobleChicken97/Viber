"""
Simplified Training script for Viber Mood Detection Model.
Avoids pandas/sklearn compatibility issues with Python 3.14.

Usage:
    python train_simple.py --epochs 30 --batch_size 64 --model lightweight
"""

import argparse
from pathlib import Path
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from tqdm import tqdm
import numpy as np

from model import get_model, LightweightFERModel
from dataset import create_data_loaders, MOOD_NAMES


def parse_args():
    parser = argparse.ArgumentParser(description="Train Viber Mood Detection Model")

    # Data
    parser.add_argument(
        "--data_root",
        type=str,
        default="data/fer2013",
        help="Root directory for dataset",
    )

    # Model
    parser.add_argument(
        "--model",
        type=str,
        default="lightweight",
        choices=["lightweight", "mobilenet"],
        help="Model architecture",
    )
    parser.add_argument(
        "--input_size",
        type=int,
        default=48,
        help="Input image size (48 for lightweight, 224 for mobilenet)",
    )
    parser.add_argument("--dropout", type=float, default=0.3, help="Dropout rate")

    # Training
    parser.add_argument("--epochs", type=int, default=30, help="Number of epochs")
    parser.add_argument("--batch_size", type=int, default=64, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    parser.add_argument("--weight_decay", type=float, default=1e-4, help="Weight decay")

    # Output
    parser.add_argument(
        "--save_dir", type=str, default="models", help="Directory to save models"
    )

    return parser.parse_args()


def train_epoch(model, loader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    pbar = tqdm(loader, desc="Training", leave=False)
    for batch_idx, (images, labels) in enumerate(pbar):
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        pbar.set_postfix(
            {"loss": f"{loss.item():.4f}", "acc": f"{100.*correct/total:.2f}%"}
        )

    return total_loss / len(loader), 100.0 * correct / total


def validate(model, loader, criterion, device):
    """Validate the model."""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in tqdm(loader, desc="Validating", leave=False):
            images, labels = images.to(device), labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            total_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return total_loss / len(loader), 100.0 * correct / total


def compute_confusion_matrix(model, loader, device, num_classes=5):
    """Compute confusion matrix."""
    model.eval()
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            outputs = model(images)
            _, predicted = outputs.max(1)
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.numpy())

    # Build confusion matrix
    cm = np.zeros((num_classes, num_classes), dtype=int)
    for pred, label in zip(all_preds, all_labels):
        cm[label][pred] += 1

    return cm, all_preds, all_labels


def print_confusion_matrix(cm, class_names):
    """Pretty print confusion matrix."""
    print("\nConfusion Matrix:")
    print("-" * 50)

    # Header
    header = "         " + " ".join([f"{name[:6]:>8}" for name in class_names])
    print(header)

    # Rows
    for i, row in enumerate(cm):
        row_str = f"{class_names[i][:8]:>8} " + " ".join([f"{val:>8}" for val in row])
        print(row_str)

    print("-" * 50)

    # Per-class accuracy
    print("\nPer-class Accuracy:")
    for i, name in enumerate(class_names):
        total = cm[i].sum()
        correct = cm[i][i]
        acc = 100 * correct / total if total > 0 else 0
        print(f"  {name}: {acc:.1f}% ({correct}/{total})")


def main():
    args = parse_args()

    # Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nUsing device: {device}")

    # Create save directory
    save_dir = Path(args.save_dir)
    save_dir.mkdir(parents=True, exist_ok=True)

    # Create data loaders
    print("\nLoading dataset...")
    train_loader, val_loader, test_loader = create_data_loaders(
        data_root=args.data_root,
        batch_size=args.batch_size,
        input_size=args.input_size,
        num_workers=0,  # Avoid multiprocessing issues on Windows
        use_weighted_sampler=True,
    )

    print(f"Training samples: {len(train_loader.dataset)}")
    print(f"Validation samples: {len(val_loader.dataset)}")

    # Create model
    print(f"\nCreating {args.model} model...")
    if args.model == "lightweight":
        model = LightweightFERModel(num_classes=5, input_size=args.input_size)
    else:
        model = get_model(
            model_type=args.model,
            num_classes=5,
            pretrained=False,
            dropout=args.dropout,
            input_size=args.input_size,
        )
    model = model.to(device)

    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")

    # Loss function (weighted for class imbalance)
    criterion = nn.CrossEntropyLoss()

    # Optimizer
    optimizer = optim.AdamW(
        model.parameters(), lr=args.lr, weight_decay=args.weight_decay
    )

    # Learning rate scheduler
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2)

    # Training loop
    print(f"\nStarting training for {args.epochs} epochs...")
    print("=" * 60)

    best_val_acc = 0
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    for epoch in range(args.epochs):
        print(f"\nEpoch {epoch+1}/{args.epochs}")

        # Train
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, device
        )

        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)

        # Update scheduler
        scheduler.step()

        # Record history
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        # Print results
        print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"  Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_acc": val_acc,
                    "args": vars(args),
                },
                save_dir / "best.pth",
            )
            print(f"  ✓ New best model saved! (Val Acc: {val_acc:.2f}%)")

    print("\n" + "=" * 60)
    print(f"Training complete! Best validation accuracy: {best_val_acc:.2f}%")

    # Load best model and compute final metrics
    print("\nLoading best model for evaluation...")
    checkpoint = torch.load(save_dir / "best.pth", weights_only=True)
    model.load_state_dict(checkpoint["model_state_dict"])

    cm, _, _ = compute_confusion_matrix(model, val_loader, device)
    print_confusion_matrix(cm, MOOD_NAMES)

    # Save final model for export
    torch.save(model.state_dict(), save_dir / "final.pth")
    print(f"\nFinal model saved to {save_dir / 'final.pth'}")

    # Save training history
    with open(save_dir / "history.json", "w") as f:
        json.dump(history, f, indent=2)
    print(f"Training history saved to {save_dir / 'history.json'}")


if __name__ == "__main__":
    main()

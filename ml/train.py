"""
Training script for Viber Mood Detection Model.

Usage:
    python train.py --epochs 50 --batch_size 64 --model lightweight
    python train.py --epochs 30 --batch_size 32 --model mobilenet --input_size 224
"""

import argparse
from pathlib import Path
from datetime import datetime
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts, ReduceLROnPlateau
from tqdm import tqdm
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt

from model import get_model
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
    parser.add_argument(
        "--csv_mode",
        action="store_true",
        help="Use CSV format instead of folder structure",
    )
    parser.add_argument(
        "--csv_path", type=str, default=None, help="Path to fer2013.csv"
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
    parser.add_argument(
        "--pretrained",
        action="store_true",
        help="Use pretrained backbone (mobilenet only)",
    )
    parser.add_argument("--dropout", type=float, default=0.3, help="Dropout rate")

    # Training
    parser.add_argument(
        "--epochs", type=int, default=50, help="Number of training epochs"
    )
    parser.add_argument("--batch_size", type=int, default=64, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Initial learning rate")
    parser.add_argument(
        "--weight_decay", type=float, default=1e-4, help="Weight decay for optimizer"
    )
    parser.add_argument(
        "--scheduler",
        type=str,
        default="plateau",
        choices=["cosine", "plateau", "none"],
        help="Learning rate scheduler",
    )
    parser.add_argument(
        "--early_stop",
        type=int,
        default=10,
        help="Early stopping patience (0 to disable)",
    )

    # System
    parser.add_argument(
        "--num_workers", type=int, default=4, help="Number of data loading workers"
    )
    parser.add_argument(
        "--device", type=str, default="auto", help="Device: auto, cuda, cpu"
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    # Output
    parser.add_argument(
        "--output_dir",
        type=str,
        default="models",
        help="Output directory for checkpoints",
    )
    parser.add_argument(
        "--experiment",
        type=str,
        default=None,
        help="Experiment name (auto-generated if not provided)",
    )

    return parser.parse_args()


def set_seed(seed: int):
    """Set random seed for reproducibility."""
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)
    torch.backends.cudnn.deterministic = True


def get_device(device_arg: str) -> torch.device:
    """Get the appropriate device."""
    if device_arg == "auto":
        if torch.cuda.is_available():
            return torch.device("cuda")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return torch.device("mps")
        else:
            return torch.device("cpu")
    return torch.device(device_arg)


def train_epoch(
    model: nn.Module,
    loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
    epoch: int,
) -> tuple[float, float]:
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    pbar = tqdm(loader, desc=f"Epoch {epoch} [Train]", leave=False)
    for images, labels in pbar:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        pbar.set_postfix(
            {"loss": f"{loss.item():.4f}", "acc": f"{100. * correct / total:.2f}%"}
        )

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc


def validate(
    model: nn.Module,
    loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    device: torch.device,
    epoch: int,
) -> tuple[float, float, np.ndarray, np.ndarray]:
    """Validate the model."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    with torch.no_grad():
        pbar = tqdm(loader, desc=f"Epoch {epoch} [Val]", leave=False)
        for images, labels in pbar:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    epoch_loss = running_loss / total
    epoch_acc = 100.0 * correct / total
    return epoch_loss, epoch_acc, np.array(all_preds), np.array(all_labels)


def plot_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, save_path: str):
    """Plot and save confusion matrix."""
    cm = confusion_matrix(y_true, y_pred)

    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    ax.figure.colorbar(im, ax=ax)

    ax.set(
        xticks=np.arange(cm.shape[1]),
        yticks=np.arange(cm.shape[0]),
        xticklabels=MOOD_NAMES,
        yticklabels=MOOD_NAMES,
        title="Confusion Matrix",
        ylabel="True label",
        xlabel="Predicted label",
    )

    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    # Add text annotations
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j,
                i,
                format(cm[i, j], "d"),
                ha="center",
                va="center",
                color="white" if cm[i, j] > thresh else "black",
            )

    fig.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()


def plot_training_history(history: dict, save_path: str):
    """Plot training history."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Loss plot
    axes[0].plot(history["train_loss"], label="Train Loss")
    axes[0].plot(history["val_loss"], label="Val Loss")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].set_title("Training & Validation Loss")
    axes[0].legend()
    axes[0].grid(True)

    # Accuracy plot
    axes[1].plot(history["train_acc"], label="Train Acc")
    axes[1].plot(history["val_acc"], label="Val Acc")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Accuracy (%)")
    axes[1].set_title("Training & Validation Accuracy")
    axes[1].legend()
    axes[1].grid(True)

    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()


def main():
    args = parse_args()

    # Setup
    set_seed(args.seed)
    device = get_device(args.device)
    print(f"Using device: {device}")

    # Create output directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    experiment_name = args.experiment or f"{args.model}_{timestamp}"
    output_dir = Path(args.output_dir) / experiment_name
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save args
    with open(output_dir / "config.json", "w") as f:
        json.dump(vars(args), f, indent=2)

    print(f"Experiment: {experiment_name}")
    print(f"Output: {output_dir}")

    # Data
    print("\nLoading data...")
    train_loader, val_loader, test_loader = create_data_loaders(
        data_root=args.data_root,
        batch_size=args.batch_size,
        input_size=args.input_size,
        num_workers=args.num_workers,
        use_weighted_sampler=True,
        csv_mode=args.csv_mode,
        csv_path=args.csv_path,
    )
    print(f"Train batches: {len(train_loader)}")
    print(f"Val batches: {len(val_loader)}")

    # Model
    print(f"\nCreating {args.model} model...")
    if args.model == "mobilenet":
        model = get_model(
            "mobilenet",
            input_size=args.input_size,
            pretrained=args.pretrained,
            dropout=args.dropout,
        )
    else:
        model = get_model("lightweight", input_size=args.input_size)

    model = model.to(device)

    param_count = sum(p.numel() for p in model.parameters())
    print(f"Parameters: {param_count / 1e6:.2f}M")

    # Loss, optimizer, scheduler
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(
        model.parameters(), lr=args.lr, weight_decay=args.weight_decay
    )

    scheduler = None
    if args.scheduler == "cosine":
        scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2)
    elif args.scheduler == "plateau":
        scheduler = ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=3)

    # Training loop
    print("\nStarting training...")
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    best_val_acc = 0.0
    patience_counter = 0

    for epoch in range(1, args.epochs + 1):
        # Train
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, device, epoch
        )

        # Validate
        val_loss, val_acc, val_preds, val_labels = validate(
            model, val_loader, criterion, device, epoch
        )

        # Update scheduler
        if scheduler:
            if isinstance(scheduler, ReduceLROnPlateau):
                scheduler.step(val_acc)
            else:
                scheduler.step()

        # Log
        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        current_lr = optimizer.param_groups[0]["lr"]
        print(
            f"Epoch {epoch}/{args.epochs} | "
            f"Train: {train_loss:.4f} / {train_acc:.2f}% | "
            f"Val: {val_loss:.4f} / {val_acc:.2f}% | "
            f"LR: {current_lr:.2e}"
        )

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0

            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_acc": val_acc,
                    "config": vars(args),
                },
                output_dir / "best.pth",
            )

            print(f"  → New best model saved (acc: {val_acc:.2f}%)")
        else:
            patience_counter += 1

        # Early stopping
        if args.early_stop > 0 and patience_counter >= args.early_stop:
            print(f"\nEarly stopping triggered after {epoch} epochs")
            break

    # Final evaluation on test set
    print("\nEvaluating on test set...")
    checkpoint = torch.load(output_dir / "best.pth", map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])

    test_loss, test_acc, test_preds, test_labels = validate(
        model, test_loader, criterion, device, 0
    )

    print("\nTest Results:")
    print(f"  Loss: {test_loss:.4f}")
    print(f"  Accuracy: {test_acc:.2f}%")

    # Classification report
    report = classification_report(test_labels, test_preds, target_names=MOOD_NAMES)
    print("\nClassification Report:")
    print(report)

    # Save results
    with open(output_dir / "results.txt", "w") as f:
        f.write(f"Test Loss: {test_loss:.4f}\n")
        f.write(f"Test Accuracy: {test_acc:.2f}%\n\n")
        f.write("Classification Report:\n")
        f.write(report)

    # Save plots
    plot_confusion_matrix(test_labels, test_preds, output_dir / "confusion_matrix.png")
    plot_training_history(history, output_dir / "training_history.png")

    print(f"\nTraining complete! Best val accuracy: {best_val_acc:.2f}%")
    print(f"Results saved to: {output_dir}")


if __name__ == "__main__":
    main()

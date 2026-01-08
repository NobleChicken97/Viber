"""
Download and prepare the FER2013 dataset for training.

Manual download instructions:
1. Go to https://www.kaggle.com/datasets/msambare/fer2013
2. Click "Download" (you may need to sign in)
3. Extract the archive to: ml/data/fer2013/
4. The structure should be:
   ml/data/fer2013/
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

import os
import sys
import shutil
from pathlib import Path
import zipfile


def download_fer2013():
    """Download FER2013 dataset (manual instructions)."""
    
    data_dir = Path(__file__).parent / "data"
    fer_dir = data_dir / "fer2013"
    
    if fer_dir.exists() and len(list(fer_dir.glob("*"))) > 0:
        print(f"FER2013 already exists at {fer_dir}")
        print_dataset_stats(fer_dir)
        return fer_dir
    
    data_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("FER2013 Dataset Download Instructions")
    print("=" * 60)
    print()
    print("1. Go to: https://www.kaggle.com/datasets/msambare/fer2013")
    print("2. Click 'Download' (sign in if needed)")
    print("3. Extract the archive to:")
    print(f"   {fer_dir}")
    print()
    print("Expected structure after extraction:")
    print("   fer2013/")
    print("   ├── train/")
    print("   │   ├── angry/")
    print("   │   ├── disgust/")
    print("   │   ├── fear/")
    print("   │   ├── happy/")
    print("   │   ├── neutral/")
    print("   │   ├── sad/")
    print("   │   └── surprise/")
    print("   └── test/")
    print("       └── (same structure)")
    print()
    print("=" * 60)
    
    return None


def print_dataset_stats(fer_dir: Path):
    """Print dataset statistics."""
    emotions = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
    
    print("\nDataset Statistics:")
    print("-" * 50)
    
    for split in ["train", "test"]:
        split_dir = fer_dir / split
        if not split_dir.exists():
            continue
            
        print(f"\n{split.upper()}:")
        total = 0
        for emotion in emotions:
            emotion_dir = split_dir / emotion
            if emotion_dir.exists():
                count = len(list(emotion_dir.glob("*.jpg"))) + len(list(emotion_dir.glob("*.png")))
                print(f"  {emotion}: {count}")
                total += count
        print(f"  TOTAL: {total}")


def download_fer2013_csv():
    """
    Download the original FER2013 CSV from Kaggle competition.
    This contains pixel values instead of image files.
    """
    data_dir = Path(__file__).parent / "data"
    csv_path = data_dir / "fer2013.csv"
    
    if csv_path.exists():
        print(f"fer2013.csv already exists at {csv_path}")
        return csv_path
    
    data_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        import kaggle
        print("Downloading FER2013 CSV from Kaggle...")
        kaggle.api.authenticate()
        
        # Download from competition
        kaggle.api.competition_download_file(
            "challenges-in-representation-learning-facial-expression-recognition-challenge",
            "fer2013.csv",
            path=str(data_dir)
        )
        
        # Unzip if needed
        csv_zip = data_dir / "fer2013.csv.zip"
        if csv_zip.exists():
            with zipfile.ZipFile(csv_zip, 'r') as zip_ref:
                zip_ref.extractall(data_dir)
            csv_zip.unlink()
        
        print(f"Downloaded to {csv_path}")
        return csv_path
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nNote: FER2013 CSV requires joining the Kaggle competition:")
        print("https://www.kaggle.com/c/challenges-in-representation-learning-facial-expression-recognition-challenge")
        print("\nAlternatively, use the folder-structured version:")
        print("python download_data.py --format folder")
        sys.exit(1)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Download FER2013 dataset")
    parser.add_argument("--format", type=str, default="folder",
                        choices=["folder", "csv"],
                        help="Dataset format: folder (images) or csv (pixel values)")
    
    args = parser.parse_args()
    
    if args.format == "folder":
        download_fer2013()
    else:
        download_fer2013_csv()

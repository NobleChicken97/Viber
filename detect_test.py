import json
import traceback
from graphify.detect import detect
from pathlib import Path

try:
    print("Starting detect...")
    result = detect(Path('.'))
    print("Detect done.")
    Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result), encoding='utf-8')
    print("File written.")
except Exception as e:
    print("Error:", e)
    traceback.print_exc()

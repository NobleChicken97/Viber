import sys, json
from pathlib import Path

analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text())
communities = analysis['communities']

labels = {}
for cid, nodes in communities.items():
    # Use the first part of the first node as a label
    prefix = nodes[0].split('_')[0] if nodes else f"Community {cid}"
    labels[cid] = f"{prefix.capitalize()}"

Path('graphify-out/.graphify_labels.json').write_text(json.dumps(labels, indent=2))
print("Labels generated.")

import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path

# Part A - AST
code_files = []
detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

if code_files:
    result = extract(code_files, cache_root=Path('.'))
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2))
    print(f'AST: {len(result.get("nodes", []))} nodes, {len(result.get("edges", []))} edges')
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}))
    print('No code files - skipping AST extraction')
    result = {'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}

# Part C - Merge (sem is empty as no docs/papers)
merged = {
    'nodes': result.get('nodes', []),
    'edges': result.get('edges', []),
    'hyperedges': [],
    'input_tokens': 0,
    'output_tokens': 0,
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2))
print(f"Merged: {len(merged['nodes'])} nodes, {len(merged['edges'])} edges")

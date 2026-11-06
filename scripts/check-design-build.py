"""Verify a fresh isolated Vite build reproduces the retained current-main bundles."""
import argparse,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,default=ROOT/'.verification/design-build');a=p.parse_args()
names=['style.css','spaces.js','world.js','world2.js','three.module.js']
errors=[name for name in names if not (a.output/name).is_file() or (a.output/name).read_bytes()!=(ROOT/'assets/unity'/name).read_bytes()]
actual={x.name for x in a.output.iterdir() if x.is_file()} if a.output.exists() else set()
if actual!=set(names):errors.append('Unexpected or missing output file set')
print(json.dumps({'assets':len(names),'passed':not errors,'errors':errors},indent=2));raise SystemExit(1 if errors else 0)

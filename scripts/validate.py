"""Verify migration integrity against the independently recorded Git baseline."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from build import ROOT, safe_path, manifest_entries, expected_content

def validate(root, output, manifest_path, check_git=False):
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    errors = []
    rows = manifest_entries(root, manifest)
    originals = [x['original'] for x in rows]
    baseline_originals = [x['original'] for x in manifest['files']]
    if check_git:
        tracked = subprocess.check_output(['git', '-C', str(ROOT), 'ls-tree', '-r', '--name-only', manifest['baseline']]).decode().splitlines()
        if set(tracked) != set(baseline_originals) or len(originals) != len(set(originals)):
            errors.append('Manifest does not cover baseline exactly once')
    for row in rows:
        expected_bytes, expected_sha = expected_content(row) if check_git and not row.get('concurrent') else (None, None)
        for base, key in ((root, 'source'), (output, 'original')):
            path = safe_path(base, row[key])
            if not path.is_file():
                errors.append(f'Missing {key}: {row[key]}')
                continue
            data = path.read_bytes()
            if check_git and not row.get('concurrent') and (len(data) != expected_bytes or hashlib.sha256(data).hexdigest() != expected_sha):
                errors.append(f'Baseline content mismatch: {row[key]}')
        if check_git and not row.get('concurrent'):
            original = subprocess.check_output(['git', '-C', str(ROOT), 'show', manifest['baseline']+':'+row.get('baseline_source', row['original'])])
            if hashlib.sha256(original).hexdigest() != row['sha256']:
                errors.append(f'Manifest hash disagrees with Git baseline: {row["original"]}')
    for row in rows:
        source = safe_path(root, row['source'])
        target = safe_path(output, row['original'])
        if source.is_file() and target.is_file() and source.read_bytes() != target.read_bytes():
            errors.append(f'Source/output content differs: {row["original"]}')
    expected = set(originals) | {'.nojekyll'}
    actual = {p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file()}
    if expected != actual:
        errors.append(f'Output file set differs: unexpected={sorted(actual-expected)}, missing={sorted(expected-actual)}')
    return dict(files=len(rows),passed=not errors,errors=errors,baseline=manifest['baseline'],intentional_text_fixes=[row['original'] for row in rows if row.get('source_sha256')])

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source-root', type=Path, default=ROOT)
    p.add_argument('--output', type=Path, default=ROOT/'dist')
    p.add_argument('--manifest', type=Path, default=ROOT/'config/routes.json')
    p.add_argument('--migration', action='store_true', help='Require exact original Git baseline content')
    a = p.parse_args()
    report = validate(a.source_root.resolve(), a.output.resolve(), a.manifest.resolve(), check_git=a.migration)
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report['passed'] else 1)

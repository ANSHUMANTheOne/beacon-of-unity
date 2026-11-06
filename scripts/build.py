"""Recreate the original public layout without transforming application content."""
import argparse
import json
from pathlib import Path, PurePosixPath
import shutil
import fnmatch
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def safe_path(root, value):
    p = PurePosixPath(value)
    if p.is_absolute() or '..' in p.parts or '\\' in value or ':' in value:
        raise ValueError(f'Unsafe manifest path: {value}')
    result = (root / value).resolve()
    if not result.is_relative_to(root.resolve()):
        raise ValueError(f'Path escapes root: {value}')
    return result

def manifest_entries(source_root, manifest):
    rows = list(manifest['files']) + list(manifest.get('aliases', [])) + list(manifest.get('additions', []))
    existing = {row['source'] for row in rows}
    patterns = manifest.get('passthrough_patterns', [])
    tracked = subprocess.check_output(['git', '-C', str(source_root), 'ls-files', '-z']).decode().split('\0')
    for path in sorted(set(tracked)):
        if path and path not in existing and any(fnmatch.fnmatchcase(path, pat) for pat in patterns):
            if any(part.startswith(('.env', '.dev.vars')) or part in ('.git', '.wrangler', 'node_modules') or part.endswith(('.pem', '.key')) for part in path.split('/')):
                raise ValueError(f'Sensitive or generated tracked passthrough path requires review: {path}')
            rows.append(dict(source=path, original=path, published='/'+path, concurrent=True))
    if manifest.get('require_explicit_sources'):
        known = {row['source'] for row in rows}
        source_only = set(manifest.get('source_only_files', []))
        prefixes = tuple(manifest.get('source_only_prefixes', []))
        unknown = sorted(path for path in tracked if path and path not in known and path not in source_only and not path.startswith(prefixes))
        if unknown:
            raise ValueError('Unmapped tracked sources require an explicit public route or source-only classification: ' + ', '.join(unknown))
    return rows

def expected_content(row):
    """Keep original hashes as evidence; declare narrow text-only functional repairs."""
    if 'source_sha256' in row:
        if (PurePosixPath(row['original']).suffix not in ('.html', '.js', '.css', '.md') and row['original'] != '.assetsignore') or not row.get('source_change'):
            raise ValueError('A source update requires a documented supported text-file change; media overrides are not allowed')
        return row['source_bytes'], row['source_sha256']
    return row['bytes'], row['sha256']

def build(source_root, output, manifest_path):
    source_root = source_root.resolve()
    output = output.resolve()
    if output == source_root or output in source_root.parents or output.exists():
        raise ValueError('Output must be a new directory, outside source ancestors. Remove an old build explicitly or choose a new output.')
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    prepared = []
    destinations = set()
    for item in manifest_entries(source_root, manifest):
        source = safe_path(source_root, item['source'])
        target = safe_path(output, item['original'])
        key = item['original'].casefold()
        if key in destinations:
            raise ValueError(f'Duplicate or case-colliding output: {key}')
        destinations.add(key)
        if source.is_symlink() or not source.is_file():
            raise ValueError(f'Expected regular source: {source}')
        prepared.append((source, target))
    # Copy only explicit manifest entries; never publish the repository wholesale.
    output.mkdir(parents=True)
    for source, target in prepared:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    (output / '.nojekyll').write_bytes(b'')
    return len(prepared)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, default=ROOT)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    parser.add_argument('--manifest', type=Path, default=ROOT / 'config/routes.json')
    args = parser.parse_args()
    print(f'Published {build(args.source_root, args.output, args.manifest)} unchanged paths to {args.output}')

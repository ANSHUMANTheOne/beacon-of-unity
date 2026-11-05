"""Parse every published inline JavaScript block without executing application code."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__(); self.blocks = []; self.current = None
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            attrs = dict(attrs); kind = attrs.get('type', '')
            self.current = {'kind': kind, 'line': self.getpos()[0], 'body': ''} if not attrs.get('src') and kind in ('', 'text/javascript', 'application/javascript', 'module') else None
    def handle_data(self, data):
        if self.current is not None:
            self.current['body'] += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.current is not None:
            self.blocks.append(self.current); self.current = None

def audit():
    manifest = json.loads((ROOT / 'config/routes.json').read_text(encoding='utf-8'))
    count = 0; failures = []
    for row in manifest['files']:
        if not row['original'].endswith('.html'):
            continue
        parser = Scripts(); parser.feed((ROOT / row['source']).read_text(encoding='utf-8'))
        for script in parser.blocks:
            if not script['body'].strip():
                continue
            count += 1
            result = subprocess.run(['node', '--check', '--input-type=' + ('module' if script['kind'] == 'module' else 'commonjs')], input=script['body'], text=True, encoding='utf-8', capture_output=True)
            if result.returncode:
                line = re.search(r'\[stdin\]:(\d+)', result.stderr)
                error = re.search(r'SyntaxError: ([^\n]+)', result.stderr)
                failures.append({'original': row['original'], 'source': row['source'], 'line': script['line'] + int(line.group(1)) - 1 if line else script['line'], 'error': error.group(1) if error else 'Syntax check failed'})
    return {'scripts': count, 'failures': failures}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args(); report = audit()
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    print(json.dumps(report, indent=2))
    raise SystemExit(1 if report['failures'] else 0)

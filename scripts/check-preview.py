"""Read-only acceptance checks for an uploaded Cloudflare migration version."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from build import expected_content

ROOT = Path(__file__).resolve().parents[1]
MIME = {
    '.html': {'text/html'}, '.css': {'text/css'},
    '.js': {'application/javascript', 'text/javascript'},
    '.json': {'application/json'}, '.gif': {'image/gif'},
    '.mp3': {'audio/mpeg'}, '.mp4': {'video/mp4'},
    '.png': {'image/png'}, '.jpg': {'image/jpeg'},
    '.ico': {'image/x-icon', 'image/vnd.microsoft.icon'},
    '.zip': {'application/zip', 'application/x-zip-compressed'},
}

def verify(base, manifest, report_path, wait_seconds=0):
    origin = urllib.parse.urlsplit(base)
    if (origin.scheme != 'https' or origin.username or origin.password or
            origin.port or origin.path not in ('', '/') or origin.query or origin.fragment or
            not re.fullmatch(r'[a-z0-9-]+-beaconofunity\.anshorg\.workers\.dev', origin.hostname or '')):
        raise ValueError('Use an HTTPS version or alias URL for the existing beaconofunity Worker.')
    base = base.rstrip('/')
    baseline = json.loads((ROOT / 'docs/audit/live-routes-complete.json').read_text())
    prior = {urllib.parse.urlsplit(x['url']).path: x for x in baseline
             if urllib.parse.urlsplit(x['url']).hostname == 'beaconofunity.com'}

    def check(item):
        path, expected = item
        redirects = []
        class SameOrigin(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, request, fp, code, message, headers, newurl):
                target = urllib.parse.urlsplit(newurl)
                if target.scheme != 'https' or target.netloc != origin.netloc:
                    raise ValueError('Unexpected cross-origin redirect')
                redirects.append({'status': code, 'target': target.path})
                return super().redirect_request(request, fp, code, message, headers, newurl)
        result = {'path': path}
        for attempt in range(3):
            try:
                opener = urllib.request.build_opener(SameOrigin())
                request = urllib.request.Request(base + path, headers={
                    'User-Agent': 'Beacon-Migration-ReadOnly-Check',
                    'Accept-Encoding': 'identity',
                })
                try:
                    response = opener.open(request, timeout=30)
                except urllib.error.HTTPError as error:
                    response = error
                with response:
                    data = response.read()
                    mime = (response.headers.get('Content-Type') or '').split(';')[0].lower()
                    result.update(status=response.status, final_url=response.url, redirects=redirects,
                                  content_type=mime, bytes=len(data),
                                  sha256=hashlib.sha256(data).hexdigest())
                    if response.status == 404 and path == '/.assetsignore' and prior.get(path, {}).get('status') == 404:
                        result.update(passed=True, validation='Previously unavailable path remains unavailable')
                    else:
                        allowed = MIME.get(Path(expected['original']).suffix)
                        matched = (response.status == 200 and len(data) == expected['bytes'] and
                                   result['sha256'] == expected['sha256'])
                        result.update(passed=matched and (not allowed or mime in allowed),
                                      validation='Content and MIME comparison')
                        # OmniScope's custom-domain redirects belong to its separate Worker.
                        # On this assets-only preview, verify the files without asserting that
                        # the separate Worker's route dispatch is present.
                        previous = prior.get(path, {})
                        if previous.get('status') == 200 and not path.startswith('/omniscope/'):
                            expected_redirects = [
                                {'status': x['status'],
                                 'target': urllib.parse.urlsplit(x['to_url']).path}
                                for x in previous.get('redirects', [])
                            ]
                            result['expected_redirects'] = expected_redirects
                            result['passed'] = result['passed'] and redirects == expected_redirects
                if result['status'] not in (429, 500, 502, 503, 504):
                    return result
            except Exception as error:
                result.update(passed=False, error=type(error).__name__)
            time.sleep(0.5 * (attempt + 1))
        return result

    files = [dict(row, bytes=expected_content(row)[0], sha256=expected_content(row)[1]) for row in (manifest['files'] + manifest.get('aliases', []) + manifest.get('additions', []))]
    by_path = {x['original']: x for x in files}
    tasks = [('/' + x['original'], x) for x in files]
    for alias, original in [
        ('/', 'index.html'), ('/gods-eye/', 'gods-eye/index.html'),
        ('/CozyStudio/', 'CozyStudio/index.html'), ('/omniscope/', 'omniscope/index.html'),
    ]:
        tasks.append((alias, by_path[original]))
    if wait_seconds:
        # Cloudflare's upload and GitHub CI run concurrently. Wait for the branch
        # alias to serve all explicitly repaired files before comparing the snapshot.
        samples = [('/' + row['original'], row) for row in files if row.get('source_sha256') or row.get('alias')]
        if not samples:
            samples = [('/', by_path['index.html'])]
        deadline = time.monotonic() + wait_seconds
        while True:
            with ThreadPoolExecutor(max_workers=4) as pool:
                ready = list(pool.map(check, samples))
            if all(row['passed'] for row in ready):
                break
            if time.monotonic() >= deadline:
                raise RuntimeError('The uploaded branch preview has not reached the expected source snapshot; inspect its build before retrying')
            time.sleep(3)
    with ThreadPoolExecutor(max_workers=8) as pool:
        rows = list(pool.map(check, tasks))
    video = by_path['voltwayvideo.mp4']
    with (ROOT / video['source']).open('rb') as source:
        expected_prefix = source.read(1024)

    def range_probe(host):
        request = urllib.request.Request(host + '/voltwayvideo.mp4', headers={
            'Range': 'bytes=0-1023', 'Accept-Encoding': 'identity',
            'User-Agent': 'Beacon-Migration-ReadOnly-Check',
        })
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
                digest = hashlib.sha256(data).hexdigest()
                content_range = response.headers.get('Content-Range')
                mime = (response.headers.get('Content-Type') or '').split(';')[0].lower()
                partial = (response.status == 206 and data == expected_prefix and
                           content_range == 'bytes 0-1023/' + str(video['bytes']))
                complete = (response.status == 200 and len(data) == video['bytes'] and
                            digest == video['sha256'])
                return {'status': response.status, 'bytes': len(data), 'sha256': digest,
                        'content_type': mime, 'content_range': content_range,
                        'accept_ranges': response.headers.get('Accept-Ranges'),
                        'valid': mime == 'video/mp4' and (partial or complete)}
        except Exception as error:
            return {'valid': False, 'error': type(error).__name__}

    preview_range = range_probe(base)
    live_range = range_probe('https://beaconofunity.com')
    range_ok = (preview_range['valid'] and live_range['valid'] and
                preview_range.get('status') == live_range.get('status') and
                preview_range.get('sha256') == live_range.get('sha256'))
    rows.append({'path': '/voltwayvideo.mp4',
                 'validation': 'Range-request response parity with the existing live site',
                 'passed': range_ok, 'preview': preview_range, 'live_baseline': live_range,
                 'partial_ranges_supported': preview_range.get('status') == 206})
    summary = {
        'base_url': base, 'checked': len(rows), 'passed': sum(x['passed'] for x in rows),
        'failed': [x for x in rows if not x['passed']],
        'unchanged_unavailable': [x['path'] for x in rows if x.get('status') == 404 and x['passed']],
        'declared_source_updates': [row['original'] for row in files if row.get('source_sha256')],
        'new_design_assets': [row['original'] for row in manifest.get('additions', [])],
        'additional_aliases': [row['original'] for row in files if row.get('alias')],
        'scope': 'Original paths with declared source updates and preserved current-main design assets, public bytes/MIME, redirects, directory aliases and live video response parity; no authenticated actions.',
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps({'summary': summary, 'results': rows}, indent=2) + '\n')
    print(json.dumps(summary, indent=2))
    return not summary['failed']

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', required=True)
    parser.add_argument('--report', type=Path, default=ROOT / '.verification/provider-preview.json')
    parser.add_argument('--wait-seconds', type=int, default=0)
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'config/routes.json').read_text())
    raise SystemExit(0 if verify(args.base_url, manifest, args.report, args.wait_seconds) else 1)

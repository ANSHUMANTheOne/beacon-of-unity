/**
 * Prepare the original public paths before Wrangler uploads a Worker version.
 * Reuse an existing output only when validation proves it still matches source.
 * Never remove or overwrite an existing build directory.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../dist', import.meta.url);
const python = process.platform === 'win32' ? 'python' : 'python3';

function run(args) {
  const result = spawnSync(python, args, { cwd: root, stdio: 'inherit' });
  if (result.error) {
    console.error('Python 3.10+ is required to prepare the public artifact:', result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error('Public artifact preparation failed. No upload should proceed.');
    console.error('If dist already exists, preserve or move it before rebuilding; this command never deletes it.');
    process.exit(result.status || 1);
  }
}

if (!existsSync(output)) {
  run(['scripts/build.py']);
}
run(['scripts/validate.py']);
console.log('Validated public artifact ready for Wrangler: dist/');

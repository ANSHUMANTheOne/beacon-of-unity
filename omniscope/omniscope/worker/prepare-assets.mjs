import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, 'dist');
if (relative(root, dist) !== 'dist') throw new Error('Refusing to clear a path outside the Worker build directory.');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(root, '../index.html'), resolve(dist, 'index.html'));
await cp(resolve(root, '../public'), resolve(dist, 'public'), { recursive: true });
console.log('Prepared OmniScope assets for /omniscope.');

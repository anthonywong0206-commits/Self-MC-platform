import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const files = ['index.html', 'styles.css', 'app.js', 'supabase-config.js', 'favicon.svg', 'README.md'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  if (!existsSync(source)) throw new Error(`Missing required file: ${file}`);
  await cp(source, path.join(out, file), { recursive: true });
}

const assets = path.join(root, 'assets');
if (existsSync(assets)) await cp(assets, path.join(out, 'assets'), { recursive: true });

console.log(`✓ Static production build created at ${out}`);

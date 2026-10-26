import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const apiDir = path.join(root, 'src', 'app', 'api');
const stashDir = path.join(root, 'cloudflare', '_api_stash');
const legacyIdDir = path.join(root, 'src', 'app', 'student', 'modules', '[id]');
const nextTypesApiDir = path.join(root, '.next', 'types', 'app', 'api');
const nextServerApiDir = path.join(root, '.next', 'server', 'app', 'api');

console.log('--- Preparing Cloudflare Build ---');

if (fs.existsSync(legacyIdDir)) {
  fs.rmSync(legacyIdDir, { recursive: true, force: true });
}

if (!fs.existsSync(apiDir) && fs.existsSync(stashDir)) {
  fs.cpSync(stashDir, apiDir, { recursive: true });
}

let stashed = false;
if (fs.existsSync(apiDir)) {
  if (fs.existsSync(stashDir)) {
    fs.rmSync(stashDir, { recursive: true, force: true });
  }
  fs.cpSync(apiDir, stashDir, { recursive: true });
  fs.rmSync(apiDir, { recursive: true, force: true });
  stashed = true;
}

if (fs.existsSync(nextTypesApiDir)) {
  fs.rmSync(nextTypesApiDir, { recursive: true, force: true });
}
if (fs.existsSync(nextServerApiDir)) {
  fs.rmSync(nextServerApiDir, { recursive: true, force: true });
}

function precreateNextDirs() {
  const appRoot = path.join(root, 'src', 'app');
  const prefixes = [
    path.join(root, '.next', 'server', 'app'),
    path.join(root, '.next', 'static', 'chunks', 'app'),
    path.join(root, '.next', 'types', 'app'),
    path.join(root, 'out'),
  ];
  function walk(rel = '') {
    for (const p of prefixes) {
      fs.mkdirSync(path.join(p, rel), { recursive: true });
    }
    const entries = fs.readdirSync(path.join(appRoot, rel), { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        walk(path.join(rel, e.name));
      }
    }
  }
  walk();
}

try {
  let built = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      precreateNextDirs();
      console.log(`Running Next.js static export (attempt ${attempt})...`);
      execSync('npx next build', {
        stdio: 'inherit',
        env: { ...process.env, BUILD_TARGET: 'cloudflare' },
      });
      built = true;
      break;
    } catch (err) {
      if (attempt === 5) throw err;
      console.log('Retrying build after transient filesystem lock...');
    }
  }
  if (built) {
    console.log('✓ Cloudflare static assets exported to ./out');
  }
} finally {
  if (stashed && fs.existsSync(stashDir)) {
    fs.cpSync(stashDir, apiDir, { recursive: true });
    fs.rmSync(stashDir, { recursive: true, force: true });
    console.log('✓ Restored src/app/api routes');
  }
}

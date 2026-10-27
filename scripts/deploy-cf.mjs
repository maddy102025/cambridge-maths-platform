import fs from 'fs';
import { execSync } from 'child_process';

// Load .env if present
if (fs.existsSync('.env')) {
  const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)="?([^"]*)"?$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

console.log('--- Deploying Worker + Static Assets + D1 Binding to Cloudflare ---');

let deployed = false;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(`Cloudflare deploy attempt ${attempt}/3...`);
    execSync('npx wrangler deploy', {
      stdio: 'inherit',
      env: process.env,
    });
    deployed = true;
    break;
  } catch (err) {
    if (attempt === 3) throw err;
    console.log('Transient Cloudflare API error. Retrying in 3 seconds...');
    execSync('node -e "setTimeout(() => {}, 3000)"');
  }
}

if (deployed) {
  console.log('✓ Successfully deployed to Cloudflare Workers!');
}

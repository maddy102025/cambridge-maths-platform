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
execSync('npx wrangler deploy', {
  stdio: 'inherit',
  env: process.env,
});

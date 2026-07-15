/**
 * Cross-platform dev launcher.
 *
 * Reads .env.local and — only when NODE_EXTRA_CA_CERTS is defined there and
 * the referenced file exists — injects it into the child process environment
 * before spawning nuxt. This is necessary because NODE_EXTRA_CA_CERTS must
 * be set before Node's TLS stack initialises; dotenv loaded inside nuxt is
 * too late.
 *
 * Usage (via package.json scripts):
 *   node scripts/run.mjs dev
 *   node scripts/run.mjs build
 *   node scripts/run.mjs preview
 *   node scripts/run.mjs generate
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envFile = resolve(root, '.env.local');
const cmd = process.argv[2];

if (!cmd) {
  console.error('Usage: node scripts/run.mjs <dev|build|preview|generate>');
  process.exit(1);
}

// Parse .env.local to extract variable values without using a runtime import.
// Handles quoted values, inline comments, and blank lines correctly.
function parseEnvFile(filePath) {
  const vars = {};
  if (!existsSync(filePath)) return vars;
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    const maybeQuote = value[0];
    if (maybeQuote === '"' || maybeQuote === "'" || maybeQuote === '`') {
      const endIdx = value.indexOf(maybeQuote, 1);
      if (endIdx !== -1) {
        value = value.slice(1, endIdx);
      }
    } else {
      const hashIdx = value.indexOf('#');
      if (hashIdx !== -1) {
        value = value.slice(0, hashIdx).trim();
      }
    }
    vars[key] = value;
  }
  return vars;
}

const envVars = parseEnvFile(envFile);
const childEnv = { ...process.env };

// Inject NODE_EXTRA_CA_CERTS only when the file actually exists on this machine.
const caPath = envVars['NODE_EXTRA_CA_CERTS'];
if (caPath) {
  const resolvedCaPath = resolve(root, caPath);
  if (existsSync(resolvedCaPath)) {
    childEnv['NODE_EXTRA_CA_CERTS'] = resolvedCaPath;
  } else {
    console.warn(
      `[run.mjs] NODE_EXTRA_CA_CERTS is set but file not found: ${resolvedCaPath} — skipping.`
    );
  }
}

const args = [cmd, '--dotenv', '.env.local'];

// Resolve the nuxt binary from the local node_modules to avoid relying on
// the shell PATH and to prevent any PATH-based injection.
// On Windows, yarn/npm create nuxt.cmd rather than a bare nuxt symlink.
const nuxtBin = resolve(root, 'node_modules', '.bin', process.platform === 'win32' ? 'nuxt.cmd' : 'nuxt');

if (!existsSync(nuxtBin)) {
  console.error(`[run.mjs] nuxt binary not found at ${nuxtBin}. Run 'yarn install' first.`);
  process.exit(1);
}

const result = spawnSync(nuxtBin, args, {
  cwd: root,
  env: childEnv,
  stdio: 'inherit',
});

if (result.error) {
  console.error('[run.mjs] Failed to start Nuxt:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);

#!/usr/bin/env node
/**
 * Verify every franchise redirect on production:
 *  - source returns 308/301 (not 200 = not redirecting, not 404)
 *  - the destination it points to returns 200 (no redirect → 404)
 *  - the destination is NOT itself a redirect (no chain / loop)
 *
 * Reads the redirect list straight from .next/routes-manifest.json so it always
 * matches what shipped. Usage: node scripts/verify-redirects-live.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE = 'https://pinkautoglass.com';

const manifest = JSON.parse(readFileSync(resolve(ROOT, '.next/routes-manifest.json'), 'utf-8'));
// Only the franchise redirects (static sources to /colorado or /arizona). Skip
// regex/param sources and the www host rule — those need real example paths.
const redirects = manifest.redirects.filter(
  (r) => (/\/(colorado|arizona)\//.test(r.destination) || ['/colorado', '/arizona'].includes(r.destination))
    && !r.source.includes(':') && !r.source.includes('(')
);

async function status(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const loc = res.headers.get('location');
  return { code: res.status, location: loc ? loc.replace(BASE, '') : null };
}

const problems = [];
let ok = 0;
console.log(`Checking ${redirects.length} franchise redirects on ${BASE}...\n`);

for (const r of redirects) {
  const src = await status(r.source);
  if (![301, 308].includes(src.code)) {
    problems.push(`✗ ${r.source} → expected 301/308, got ${src.code}`);
    continue;
  }
  if (src.location !== r.destination) {
    problems.push(`✗ ${r.source} → 308 to ${src.location} (expected ${r.destination})`);
    continue;
  }
  // Destination must be a real 200 page, not another redirect
  const dest = await status(r.destination);
  if (dest.code === 200) {
    ok++;
  } else if ([301, 308].includes(dest.code)) {
    problems.push(`✗ CHAIN: ${r.source} → ${r.destination} → ${dest.code} → ${dest.location}`);
  } else {
    problems.push(`✗ DEST ${dest.code}: ${r.source} → ${r.destination} returns ${dest.code}`);
  }
}

console.log(`✓ ${ok}/${redirects.length} redirects clean (308 → live 200 target, no chain)\n`);
if (problems.length) {
  console.log(`${problems.length} PROBLEM(S):`);
  for (const p of problems) console.log('  ' + p);
  process.exit(1);
} else {
  console.log('All franchise redirects verified healthy.');
}

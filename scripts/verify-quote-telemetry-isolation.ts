#!/usr/bin/env tsx
/**
 * CI guard: quote-funnel diagnostic telemetry isolation.
 *
 * Diagnostic funnel events (diagnostic_*, quote_attempt_*) measure YMM demand
 * and nudge effectiveness. They MUST route through trackEvent (GA4 + DB only)
 * and must NEVER be passed to an ad-conversion sender (trackFormSubmission /
 * trackConversion), or YMM-miss volume — which fires on most quote attempts —
 * would inflate Google/Microsoft Ads conversions.
 *
 * This guard was mandated by the 2026-05-29 council (Codex + Gemini): both
 * flagged that a future edit could accidentally wire a diagnostic event into
 * the conversion path. A code comment isn't enough; this fails the build.
 *
 * Run: tsx scripts/verify-quote-telemetry-isolation.ts (wired into ci:guards)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Guards are invoked from the repo root via npm scripts (package.json), so cwd
// is the project root. Avoid import.meta.dirname — it is undefined under the
// tsx loader this repo uses and silently breaks the guard.
const REPO_ROOT = process.cwd();
const SRC = join(REPO_ROOT, 'src');

let failures = 0;
const fail = (msg: string) => { failures++; console.error(`✗ ${msg}`); };

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(full)) {
      out.push(full);
    }
  }
  return out;
}

// Event-name prefixes that are diagnostic-only and must never be sent as a conversion.
const DIAGNOSTIC_PREFIXES = ['diagnostic_', 'quote_attempt_'];
// Functions that fire a real ad-platform conversion.
const CONVERSION_SENDERS = ['trackFormSubmission', 'trackConversion'];

// Match a conversion sender invoked with a string/template literal first arg:
//   trackFormSubmission('name'  |  trackFormSubmission("name"  |  trackFormSubmission(`name`
function firstStringArg(line: string, fn: string): string | null {
  const idx = line.indexOf(`${fn}(`);
  if (idx === -1) return null;
  const after = line.slice(idx + fn.length + 1).trimStart();
  const m = /^['"`]([^'"`]+)['"`]/.exec(after);
  return m ? m[1] : null;
}

const files = walk(SRC);
for (const file of files) {
  const rel = file.replace(REPO_ROOT + '/', '');
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const fn of CONVERSION_SENDERS) {
      const name = firstStringArg(line, fn);
      if (name && DIAGNOSTIC_PREFIXES.some((p) => name.startsWith(p))) {
        fail(`${rel}:${i + 1} passes diagnostic event "${name}" to ${fn}() — diagnostics must use trackEvent, never a conversion sender.`);
      }
    }
  });
}

// Positive sanity: the diagnostic names we ship must exist somewhere (catches a
// rename that would silently disable measurement).
const allSrc = files.map((f) => readFileSync(f, 'utf8')).join('\n');
for (const required of ['diagnostic_ymm_miss', 'quote_attempt_ymm']) {
  if (!allSrc.includes(required)) {
    fail(`Expected diagnostic event "${required}" not found in src — measurement may be broken.`);
  }
}

console.log(failures === 0 ? '✓ quote telemetry isolation guard passed' : `✗ ${failures} quote telemetry isolation failure(s)`);
process.exit(failures === 0 ? 0 : 1);

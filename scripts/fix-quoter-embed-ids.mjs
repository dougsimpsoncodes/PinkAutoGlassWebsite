/**
 * fix-quoter-embed-ids.mjs
 *
 * Fixes two issues identified in Codex QA (HOLD round 2):
 *
 * 1. Duplicate mount IDs — homepages with two QuoterEmbed instances share
 *    the same mountId = `pag-quoter-${siteKey}`, causing DOM collisions.
 *    Fix: add useId() to generate a unique suffix per instance.
 *
 * 2. National sites show ZIP gate on question pages — quoterConfig.mode is
 *    'zip-first' for national sites but question pages should always use
 *    standard mode (user is already on a specific question; no ZIP gate needed).
 *    Fix: spread mode='standard' override in the question page template.
 *
 * Usage: node scripts/fix-quoter-embed-ids.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITES_ROOT = path.resolve(__dirname, '../../sites');
const DRY_RUN = process.argv.includes('--dry-run');
const BRANCH = 'fix/quoter-embed-unique-ids';

const DIRS = [
  'windshield-denver', 'mobile-windshield-denver', 'windshield-chip-repair-denver',
  'windshield-chip-repair-boulder', 'aurora-windshield', 'coloradospringswindshield',
  'autoglasscoloradosprings', 'mobilewindshieldcoloradosprings', 'windshieldreplacementfortcollins',
  'windshield-chip-repair-phoenix', 'mobile-windshield-phoenix', 'windshield-chip-repair-mesa',
  'windshield-chip-repair-tempe', 'windshield-chip-repair-scottsdale',
  'windshield-cost-calculator', 'windshield-price-compare', 'new-windshield-cost',
  'windshield-cost-phoenix', 'new-windshield-near-me', 'cheapest-windshield',
];

// ── Updated QuoterEmbed.tsx with useId() ──────────────────────────────────────

const QUOTER_EMBED_TSX = `'use client'

import { useEffect, useId, useState } from 'react'
import LeadForm from './LeadForm'

const BUNDLE_URL = 'https://pinkautoglass.com/embed/satellite-quoter.v1.js'
const SCRIPT_ID = 'pag-satellite-quoter-bundle'
const MOUNT_TIMEOUT_MS = 8000

declare global {
  interface Window {
    PAGSatelliteQuoterV1?: {
      mount: (selector: string, config: Record<string, unknown>) => void
      unmount: (selector: string) => void
    }
  }
}

export interface QuoterEmbedConfig {
  siteKey: string
  marketHint: 'colorado' | 'arizona' | 'national'
  utmSource: string
  mode: 'standard' | 'zip-first'
  wrapperCopy?: {
    headline?: string
    subhead?: string
  }
}

type EmbedState = 'loading' | 'mounted' | 'failed'

export default function QuoterEmbed({
  siteKey,
  marketHint,
  utmSource,
  mode,
  wrapperCopy,
}: QuoterEmbedConfig) {
  const [state, setState] = useState<EmbedState>('loading')
  // useId generates a stable unique suffix per component instance, preventing
  // DOM id collisions when multiple QuoterEmbed instances appear on one page.
  const instanceSuffix = useId().replace(/:/g, '')
  const mountId = \`pag-quoter-\${siteKey}-\${instanceSuffix}\`

  useEffect(() => {
    const timeout = setTimeout(() => setState('failed'), MOUNT_TIMEOUT_MS)

    function mount() {
      clearTimeout(timeout)
      try {
        window.PAGSatelliteQuoterV1?.mount(\`#\${mountId}\`, {
          mode,
          siteKey,
          marketHint,
          utmSource,
          ...(wrapperCopy ? { wrapperCopy } : {}),
        })
        setState('mounted')
      } catch {
        setState('failed')
      }
    }

    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      if (window.PAGSatelliteQuoterV1) {
        mount()
      } else {
        existing.addEventListener('load', mount, { once: true })
        existing.addEventListener('error', () => { clearTimeout(timeout); setState('failed') }, { once: true })
      }
      return () => {
        clearTimeout(timeout)
        window.PAGSatelliteQuoterV1?.unmount(\`#\${mountId}\`)
      }
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = BUNDLE_URL
    script.async = true
    script.onload = mount
    script.onerror = () => { clearTimeout(timeout); setState('failed') }
    document.head.appendChild(script)

    return () => {
      clearTimeout(timeout)
      window.PAGSatelliteQuoterV1?.unmount(\`#\${mountId}\`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'failed') return <LeadForm />

  return (
    <div className="relative min-h-[420px]">
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-gray-100 bg-white">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      )}
      <div id={mountId} />
    </div>
  )
}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function write(filePath, content) {
  if (DRY_RUN) { console.log(`  [dry] write ${path.basename(filePath)}`); return; }
  writeFileSync(filePath, content, 'utf8');
}

function run(cmd, cwd) {
  if (DRY_RUN) { console.log(`  [dry] ${cmd}`); return; }
  execSync(cmd, { cwd, stdio: 'pipe' });
}

// ── Per-site processing ───────────────────────────────────────────────────────

async function processSite(dir) {
  const siteDir = path.join(SITES_ROOT, dir);
  if (!existsSync(siteDir)) { console.log(`  ⚠️  ${dir} not found`); return; }
  console.log(`\n▶ ${dir}`);

  // Branch
  try { run(`git checkout ${BRANCH} 2>/dev/null || git checkout -b ${BRANCH}`, siteDir); }
  catch { run(`git checkout -b ${BRANCH}`, siteDir); }

  // Fix 1: overwrite QuoterEmbed.tsx with useId version
  const embedPath = path.join(siteDir, 'src/components/QuoterEmbed.tsx');
  if (existsSync(embedPath)) {
    write(embedPath, QUOTER_EMBED_TSX);
    console.log('  ✅ QuoterEmbed.tsx updated (useId)');
  }

  // Fix 2: question page — add mode='standard' override
  const slugPagePath = path.join(siteDir, 'src/app/questions/[slug]/page.tsx');
  if (existsSync(slugPagePath)) {
    const content = readFileSync(slugPagePath, 'utf8');
    if (content.includes('<QuoterEmbed {...quoterConfig} />') && !content.includes('mode: \'standard\'')) {
      const patched = content.replace(
        '<QuoterEmbed {...quoterConfig} />',
        '<QuoterEmbed {...quoterConfig} mode="standard" />'
      );
      write(slugPagePath, patched);
      console.log('  ✅ question/[slug]/page.tsx — mode=standard override added');
    } else if (content.includes('mode="standard"')) {
      console.log('  ℹ️  question/[slug]/page.tsx — already has mode=standard');
    }
  }

  // Commit + push
  if (!DRY_RUN) {
    try {
      execSync('git add -A', { cwd: siteDir, stdio: 'pipe' });
      const status = execSync('git status --porcelain', { cwd: siteDir }).toString().trim();
      if (!status) { console.log('  ℹ️  no changes'); return; }
      execSync(`git commit -m "fix(quoter): unique mount IDs + force standard mode on question pages

- QuoterEmbed: useId() generates unique mountId per instance, preventing
  DOM id collisions when two QuoterEmbed instances appear on the same page
- questions/[slug]/page.tsx: force mode='standard' so national zip-first
  sites show the full quoter on question pages, not the ZIP gate

Codex QA HOLD round 2 (2026-06-04).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`, { cwd: siteDir, stdio: 'inherit' });
      execSync(`git push -u origin ${BRANCH}`, { cwd: siteDir, stdio: 'pipe' });
      console.log(`  🚀 pushed`);
    } catch (e) {
      console.error(`  ❌ git error: ${e.message}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(60)}`);
console.log(`  QuoterEmbed ID fix — ${DIRS.length} sites`);
console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
console.log(`${'═'.repeat(60)}`);

for (const dir of DIRS) await processSite(dir);

console.log('\n✅ Done.');

/**
 * apply-quoter-embed.mjs
 *
 * Swaps <LeadForm> → <QuoterEmbed> across all 19 satellite sites.
 * - Writes src/components/QuoterEmbed.tsx (identical template, LeadForm fallback)
 * - Adds quoterConfig export to src/data/questions.ts
 * - Patches src/app/questions/[slug]/page.tsx
 * - Patches src/app/page.tsx (hero + mid-page forms)
 * - Git: branch feat/quoter-embed, commit, push per site
 *
 * Usage: node scripts/apply-quoter-embed.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITES_ROOT = path.resolve(__dirname, '../../sites');
const DRY_RUN = process.argv.includes('--dry-run');
const BRANCH = 'feat/quoter-embed';

// ── Site definitions ──────────────────────────────────────────────────────────

const SITES = [
  // windshield-denver pilot: question page already swapped; homepage still needs it
  { dir: 'windshield-denver',                  url: 'https://windshielddenver.com',               type: 'co',       city: 'Denver' },
  { dir: 'mobile-windshield-denver',           url: 'https://mobilewindshielddenver.com',          type: 'co',       city: 'Denver' },
  { dir: 'windshield-chip-repair-denver',      url: 'https://windshieldchiprepairdenver.com',      type: 'co',       city: 'Denver' },
  { dir: 'windshield-chip-repair-boulder',     url: 'https://windshieldchiprepairboulder.com',     type: 'co',       city: 'Boulder' },
  { dir: 'aurora-windshield',                  url: 'https://aurorawindshield.com',                type: 'co',       city: 'Aurora' },
  { dir: 'coloradospringswindshield',          url: 'https://coloradospringswindshield.com',       type: 'co',       city: 'Colorado Springs' },
  { dir: 'autoglasscoloradosprings',           url: 'https://autoglasscoloradosprings.com',        type: 'co',       city: 'Colorado Springs' },
  { dir: 'mobilewindshieldcoloradosprings',    url: 'https://mobilewindshieldcoloradosprings.com', type: 'co',       city: 'Colorado Springs' },
  { dir: 'windshieldreplacementfortcollins',   url: 'https://windshieldreplacementfortcollins.com',type: 'co',       city: 'Fort Collins' },
  { dir: 'windshield-chip-repair-phoenix',     url: 'https://windshieldchiprepairphoenix.com',     type: 'az',       city: 'Phoenix' },
  { dir: 'mobile-windshield-phoenix',          url: 'https://mobilewindshieldphoenix.com',         type: 'az',       city: 'Phoenix' },
  { dir: 'windshield-chip-repair-mesa',        url: 'https://windshieldchiprepairmesa.com',        type: 'az',       city: 'Mesa' },
  { dir: 'windshield-chip-repair-tempe',       url: 'https://windshieldchiprepairtempe.com',       type: 'az',       city: 'Tempe' },
  { dir: 'windshield-chip-repair-scottsdale',  url: 'https://windshieldchiprepairscottsdale.com',  type: 'az',       city: 'Scottsdale' },
  { dir: 'windshield-cost-calculator',         url: 'https://windshieldcostcalculator.com',        type: 'national', city: null },
  { dir: 'windshield-price-compare',           url: 'https://windshieldpricecompare.com',          type: 'national', city: null },
  { dir: 'new-windshield-cost',                url: 'https://newwindshieldcost.com',               type: 'national', city: null },
  { dir: 'windshield-cost-phoenix',            url: 'https://windshieldcostphoenix.com',           type: 'az',       city: 'Phoenix' },
  { dir: 'new-windshield-near-me',             url: 'https://newwindshieldnearme.com',             type: 'national', city: null },
  { dir: 'cheapest-windshield',                url: 'https://cheapestwindshieldnearme.com',        type: 'national', city: null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function siteKey(url) {
  return url.replace('https://', '').replace('.com', '');
}

function marketHint(type) {
  if (type === 'co') return 'colorado';
  if (type === 'az') return 'arizona';
  return 'national';
}

function mode(type) {
  return type === 'national' ? 'zip-first' : 'standard';
}

function wrapperCopy(site) {
  if (site.type === 'national') {
    return {
      headline: "Get an Instant Quote\\nand Book Your Service",
      subhead: 'Enter your ZIP to unlock instant pricing and online booking.',
    };
  }
  const cityLine = site.city;
  const action = site.type === 'az' ? 'Service' : 'Install';
  return {
    headline: `Get an Instant Quote\\nand Book Your ${cityLine} ${action}`,
    subhead: 'No phone calls. See your price and book online in minutes.',
  };
}

function run(cmd, cwd) {
  if (DRY_RUN) { console.log(`  [dry] ${cmd}`); return; }
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function write(filePath, content) {
  if (DRY_RUN) { console.log(`  [dry] write ${filePath}`); return; }
  writeFileSync(filePath, content, 'utf8');
}

function patch(filePath, oldStr, newStr) {
  const content = readFileSync(filePath, 'utf8');
  if (!content.includes(oldStr)) return false;
  write(filePath, content.replace(oldStr, newStr));
  return true;
}

// ── QuoterEmbed.tsx template (identical for all sites) ────────────────────────

const QUOTER_EMBED_TSX = `'use client'

import { useEffect, useState } from 'react'
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
  const mountId = \`pag-quoter-\${siteKey}\`

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


// Dashboard short codes — must match SATELLITE_DOMAINS in src/app/api/admin/satellite-domains/route.ts.
// Quoter leads must land in leads.utm_source with these exact values or the satellite dashboard won't count them.
const UTM_SHORT_CODES = {
  'windshieldcostcalculator.com': 'windshieldcostcalculator',
  'windshielddenver.com': 'windshielddenver',
  'windshieldchiprepairdenver.com': 'chiprepairdenver',
  'windshieldchiprepairboulder.com': 'chiprepairboulder',
  'aurorawindshield.com': 'aurorawindshield',
  'mobilewindshielddenver.com': 'mobilewindshielddenver',
  'cheapestwindshieldnearme.com': 'cheapestwindshield',
  'newwindshieldcost.com': 'newwindshieldcost',
  'getawindshieldquote.com': 'getawindshieldquote',
  'newwindshieldnearme.com': 'newwindshieldnearme',
  'windshieldpricecompare.com': 'windshieldpricecompare',
  'windshieldchiprepairmesa.com': 'chiprepairmesa',
  'windshieldchiprepairphoenix.com': 'chiprepairphoenix',
  'windshieldchiprepairscottsdale.com': 'chiprepairscottsdale',
  'windshieldchiprepairtempe.com': 'chiprepairtempe',
  'windshieldcostphoenix.com': 'windshieldcostphoenix',
  'mobilewindshieldphoenix.com': 'mobilewindshieldphoenix',
  'carwindshieldprices.com': 'carwindshieldprices',
  'windshieldrepairprices.com': 'windshieldrepairprices',
  'carglassprices.com': 'carglassprices',
  'coloradospringswindshield.com': 'coloradospringswindshield',
  'autoglasscoloradosprings.com': 'autoglasscoloradosprings',
  'mobilewindshieldcoloradosprings.com': 'mobilewindshieldcoloradosprings',
  'windshieldreplacementfortcollins.com': 'windshieldreplacementfortcollins',
};

function utmShortCode(url) {
  const domain = url.replace('https://', '');
  const code = UTM_SHORT_CODES[domain];
  if (!code) throw new Error('No UTM short code for ' + domain + ' — add it to UTM_SHORT_CODES');
  return code;
}

// ── quoterConfig block to prepend to questions.ts ─────────────────────────────

function quoterConfigBlock(site) {
  const copy = wrapperCopy(site);
  return `export const quoterConfig = {
  siteKey: '${siteKey(site.url)}',
  marketHint: '${marketHint(site.type)}' as const,
  utmSource: '${utmShortCode(site.url)}',
  mode: '${mode(site.type)}' as const,
  wrapperCopy: {
    headline: "${copy.headline}",
    subhead: '${copy.subhead}',
  },
}

`;
}

// ── Per-site processing ───────────────────────────────────────────────────────

async function processSite(site) {
  const siteDir = path.join(SITES_ROOT, site.dir);
  if (!existsSync(siteDir)) {
    console.log(`  ⚠️  ${site.dir} — directory not found, skipping`);
    return;
  }

  console.log(`\n▶ ${site.dir} (${site.url})`);

  // 1. Ensure on feat/quoter-embed branch
  try {
    run(`git checkout ${BRANCH} 2>/dev/null || git checkout -b ${BRANCH}`, siteDir);
  } catch {
    run(`git checkout -b ${BRANCH}`, siteDir);
  }

  // 2. Write QuoterEmbed.tsx
  const embedPath = path.join(siteDir, 'src/components/QuoterEmbed.tsx');
  write(embedPath, QUOTER_EMBED_TSX);
  console.log('  ✅ QuoterEmbed.tsx written');

  // 3. Patch questions.ts — add quoterConfig if not present
  const questionsPath = path.join(siteDir, 'src/data/questions.ts');
  if (existsSync(questionsPath)) {
    const qContent = readFileSync(questionsPath, 'utf8');
    if (!qContent.includes('quoterConfig')) {
      write(questionsPath, quoterConfigBlock(site) + qContent);
      console.log('  ✅ quoterConfig added to questions.ts');
    } else {
      // Already has it (windshield-denver pilot) — overwrite to ensure canonical
      const withoutOld = qContent.replace(/^export const quoterConfig[\s\S]*?\n\n/m, '');
      write(questionsPath, quoterConfigBlock(site) + withoutOld);
      console.log('  ✅ quoterConfig refreshed in questions.ts');
    }
  }

  // 4. Patch questions/[slug]/page.tsx
  const slugPagePath = path.join(siteDir, 'src/app/questions/[slug]/page.tsx');
  if (existsSync(slugPagePath)) {
    patch(slugPagePath,
      `import LeadForm from '@/components/LeadForm'`,
      `import QuoterEmbed from '@/components/QuoterEmbed'`
    );
    patch(slugPagePath,
      `import { questions, siteConfig } from '@/data/questions'`,
      `import { questions, siteConfig, quoterConfig } from '@/data/questions'`
    );
    // Handle case where quoterConfig already in import (windshield-denver pilot)
    patch(slugPagePath,
      `<LeadForm />`,
      `<QuoterEmbed {...quoterConfig} />`
    );
    console.log('  ✅ questions/[slug]/page.tsx patched');
  }

  // 5. Patch homepage page.tsx — both LeadForm instances
  const homePath = path.join(siteDir, 'src/app/page.tsx');
  if (existsSync(homePath)) {
    patch(homePath,
      `import LeadForm from "@/components/LeadForm"`,
      `import QuoterEmbed from "@/components/QuoterEmbed"\nimport { quoterConfig } from "@/data/questions"`
    );
    // Replace all <LeadForm /> occurrences on homepage
    const homeContent = readFileSync(homePath, 'utf8');
    const patched = homeContent.replaceAll('<LeadForm />', '<QuoterEmbed {...quoterConfig} />');
    if (patched !== homeContent) {
      write(homePath, patched);
      console.log('  ✅ homepage page.tsx patched (all LeadForm instances)');
    }
  }

  // 6. Git commit + push
  if (!DRY_RUN) {
    try {
      execSync('git add -A', { cwd: siteDir, stdio: 'pipe' });
      const status = execSync('git status --porcelain', { cwd: siteDir }).toString().trim();
      if (!status) {
        console.log('  ℹ️  No changes to commit');
        return;
      }
      execSync(`git commit -m "feat(quoter): swap LeadForm → QuoterEmbed across all pages

Replaces <LeadForm> with the shared satellite quoter embed on all pages.
LeadForm is kept as a silent fallback (8s timeout, script error, outage).

Council 3/3 unanimous: batch deploy with fallback (2026-06-04).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`, { cwd: siteDir, stdio: 'inherit' });
      execSync(`git push -u origin ${BRANCH}`, { cwd: siteDir, stdio: 'inherit' });
      console.log(`  🚀 pushed ${BRANCH}`);
    } catch (e) {
      console.error(`  ❌ git error: ${e.message}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(60)}`);
console.log(`  QuoterEmbed batch deploy — ${SITES.length} sites`);
console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
console.log(`${'═'.repeat(60)}`);

for (const site of SITES) {
  await processSite(site);
}

console.log('\n✅ Done.');

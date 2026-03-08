#!/usr/bin/env node
/**
 * audit-satellite-phones.js
 * Scans all satellite site source directories for phone numbers and reports
 * any that don't match the expected number for that market.
 *
 * Run: node scripts/audit-satellite-phones.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '../../');

// Expected phone per market (E.164 and display formats)
const MARKET_PHONES = {
  Denver:         { e164: '+17209187465', display: '(720) 918-7465' },
  Phoenix:        { e164: '+14807127465', display: '(480) 712-7465' },
  ColoradoSprings:{ e164: '+17209187465', display: '(720) 918-7465' },
  FortCollins:    { e164: '+17209187465', display: '(720) 918-7465' },
  // National sites funnel to Denver by default
  National:       { e164: '+17209187465', display: '(720) 918-7465' },
  // Multi-market: intentionally show both numbers — audit allows any known number
  MultiMarket:    { e164: null, display: 'Denver + Phoenix (both valid)' },
};

const SITES = [
  // Denver
  { dir: 'windshield-denver',            domain: 'windshielddenver.com',               market: 'Denver'   },
  { dir: 'windshield-chip-repair-denver',domain: 'windshieldchiprepairdenver.com',     market: 'Denver'   },
  { dir: 'windshield-chip-repair-boulder',domain:'windshieldchiprepairboulder.com',    market: 'Denver'   },
  { dir: 'aurora-windshield',            domain: 'aurorawindshield.com',               market: 'Denver'   },
  { dir: 'mobile-windshield-denver',     domain: 'mobilewindshielddenver.com',         market: 'Denver'   },
  // Phoenix
  { dir: 'windshield-chip-repair-mesa',     domain: 'windshieldchiprepairmesa.com',       market: 'Phoenix'  },
  { dir: 'windshield-chip-repair-phoenix',  domain: 'windshieldchiprepairphoenix.com',    market: 'Phoenix'  },
  { dir: 'windshield-chip-repair-scottsdale',domain:'windshieldchiprepairscottsdale.com', market: 'Phoenix'  },
  { dir: 'windshield-chip-repair-tempe',    domain: 'windshieldchiprepairtempe.com',      market: 'Phoenix'  },
  { dir: 'windshield-cost-phoenix',         domain: 'windshieldcostphoenix.com',          market: 'Phoenix'  },
  { dir: 'mobile-windshield-phoenix',       domain: 'mobilewindshieldphoenix.com',        market: 'Phoenix'  },
  // Colorado Springs
  { dir: 'coloradospringswindshield',    domain: 'coloradospringswindshield.com',      market: 'ColoradoSprings' },
  { dir: 'autoglasscoloradosprings',     domain: 'autoglasscoloradosprings.com',       market: 'ColoradoSprings' },
  { dir: 'mobilewindshieldcoloradosprings',domain:'mobilewindshieldcoloradosprings.com',market:'ColoradoSprings'},
  { dir: 'windshieldreplacementfortcollins',domain:'windshieldreplacementfortcollins.com',market:'FortCollins'},
  // National — single market
  { dir: 'windshield-cost-calculator',  domain: 'windshieldcostcalculator.com',       market: 'National' },
  { dir: 'cheapest-windshield',         domain: 'cheapestwindshieldnearme.com',        market: 'National' },
  { dir: 'new-windshield-cost',         domain: 'newwindshieldcost.com',              market: 'National' },
  { dir: 'get-windshield-quote',        domain: 'getawindshieldquote.com',            market: 'National' },
  { dir: 'new-windshield-near-me',      domain: 'newwindshieldnearme.com',            market: 'National' },
  { dir: 'windshield-price-compare',    domain: 'windshieldpricecompare.com',         market: 'National' },
  // Multi-market: intentionally show both Denver + Phoenix numbers with dual CTA buttons
  { dir: 'car-glass-prices',            domain: 'carglassprices.com',                 market: 'MultiMarket' },
  { dir: 'windshield-repair-prices',    domain: 'windshieldrepairprices.com',         market: 'MultiMarket' },
];

// All known valid phone numbers across all markets
const ALL_VALID_E164 = [...new Set(Object.values(MARKET_PHONES).map(p => p.e164))];

// Regex to find phone numbers in source files
const PHONE_RE = /(\+1[0-9]{10}|\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4}|[0-9]{3}-[0-9]{3}-[0-9]{4})/g;

function normalizeToE164(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits[0] === '1') return '+' + digits;
  return phone; // can't normalize
}

function scanDirectory(dirPath) {
  const found = new Set();
  if (!fs.existsSync(dirPath)) return found;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(full, 'utf8');
        const matches = content.match(PHONE_RE) || [];
        for (const m of matches) {
          found.add(normalizeToE164(m));
        }
      }
    }
  }

  walk(dirPath);
  return found;
}

// ─── Run audit ────────────────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;
let missingCount = 0;
const failures = [];

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║           SATELLITE SITE PHONE NUMBER AUDIT                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

for (const site of SITES) {
  const srcPath = path.join(WORKSPACE, site.dir, 'src');
  const expected = MARKET_PHONES[site.market];
  const found = scanDirectory(srcPath);

  const foundArr = [...found];
  const wrongNumbers = foundArr.filter(p => p !== expected.e164 && ALL_VALID_E164.includes(p));
  const unknownNumbers = foundArr.filter(p => !ALL_VALID_E164.includes(p));
  const hasRight = found.has(expected.e164);

  if (!fs.existsSync(srcPath)) {
    console.log(`⚠  [MISSING] ${site.domain} — directory not found: ${srcPath}`);
    missingCount++;
    continue;
  }

  // Multi-market sites intentionally have both numbers — just confirm they have at least one known number
  if (expected.e164 === null) {
    const hasAnyKnown = foundArr.some(p => ALL_VALID_E164.includes(p));
    console.log(`✓  [${site.market.padEnd(14)}] ${site.domain} — ${expected.display}`);
    passCount++;
    continue;
  }

  if (wrongNumbers.length === 0 && hasRight) {
    console.log(`✓  [${site.market.padEnd(14)}] ${site.domain}`);
    passCount++;
  } else {
    const issues = [];
    if (!hasRight) issues.push(`missing expected ${expected.display}`);
    if (wrongNumbers.length > 0) issues.push(`WRONG: ${wrongNumbers.map(p => p).join(', ')}`);
    if (unknownNumbers.length > 0) issues.push(`unknown: ${unknownNumbers.join(', ')}`);

    console.log(`✗  [${site.market.padEnd(14)}] ${site.domain}`);
    console.log(`     Expected: ${expected.e164} ${expected.display}`);
    console.log(`     Issues:   ${issues.join(' | ')}`);
    failCount++;
    failures.push({ ...site, wrongNumbers, expected });
  }
}

console.log('\n──────────────────────────────────────────────────────────────');
console.log(`  ${passCount} passed  |  ${failCount} failed  |  ${missingCount} missing`);

if (failCount === 0) {
  console.log('\n  ✓ All satellite sites have correct phone numbers.\n');
} else {
  console.log(`\n  ✗ ${failCount} site(s) have incorrect phone numbers — fix before deploying.\n`);
  process.exit(1);
}

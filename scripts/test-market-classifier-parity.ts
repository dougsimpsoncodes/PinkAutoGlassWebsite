#!/usr/bin/env -S npx tsx
/**
 * Parity test for the TypeScript market classifiers in src/lib/market.ts
 * vs the SQL classifier functions in
 * supabase/migrations/20260504_market_triggers_leads_calls.sql.
 *
 * Why: classifier drift is the #1 risk Codex flagged on the P2c review.
 * The TS classifier and SQL trigger MUST produce identical outputs for the
 * same inputs, otherwise data tagged on write will diverge from data tagged
 * on backfill or in admin filters.
 *
 * Run: npx tsx scripts/test-market-classifier-parity.ts
 *
 * Re-run after any change to:
 *   - src/lib/market.ts
 *   - any migration that touches derive_lead_market or derive_call_market
 *   - COLORADO_SATELLITE_SOURCES or ARIZONA_SATELLITE_SOURCES constants
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { classifyLeadMarket, classifyCallMarket } from '../src/lib/market';

function loadEnv(p: string) {
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(resolve(__dirname, '..', '.env.local'));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEAD_CASES: Array<{ state: string | null; zip: string | null; utm_source: string | null; expected: string | null; label: string }> = [
  { state: 'CO', zip: null, utm_source: null, expected: 'colorado', label: 'state CO' },
  { state: 'AZ', zip: null, utm_source: null, expected: 'arizona', label: 'state AZ' },
  { state: 'colorado', zip: null, utm_source: null, expected: 'colorado', label: 'state colorado lowercase' },
  { state: 'Arizona', zip: null, utm_source: null, expected: 'arizona', label: 'state Arizona mixed case' },
  { state: null, zip: '80202', utm_source: null, expected: 'colorado', label: 'zip 80202 (Denver)' },
  { state: null, zip: '85001', utm_source: null, expected: 'arizona', label: 'zip 85001 (Phoenix)' },
  { state: null, zip: '80401', utm_source: null, expected: 'colorado', label: 'zip 80401 (Golden CO)' },
  { state: null, zip: '85281', utm_source: null, expected: 'arizona', label: 'zip 85281 (Tempe AZ)' },
  { state: null, zip: '81601', utm_source: null, expected: 'colorado', label: 'zip 81601 (Glenwood Springs)' },
  { state: null, zip: '85700', utm_source: null, expected: 'arizona', label: 'zip 85700 (Tucson)' },
  { state: null, zip: '79999', utm_source: null, expected: null, label: 'zip 79999 (just below CO range)' },
  { state: null, zip: '81700', utm_source: null, expected: null, label: 'zip 81700 (just above CO range)' },
  { state: null, zip: '84999', utm_source: null, expected: null, label: 'zip 84999 (between CO and AZ)' },
  { state: null, zip: '86600', utm_source: null, expected: null, label: 'zip 86600 (above AZ)' },
  { state: null, zip: '80202-1234', utm_source: null, expected: 'colorado', label: 'zip with +4' },
  { state: null, zip: '  85001  ', utm_source: null, expected: 'arizona', label: 'zip with whitespace' },
  { state: null, zip: null, utm_source: 'aurorawindshield', expected: 'colorado', label: 'utm aurorawindshield' },
  { state: null, zip: null, utm_source: 'chiprepairtempe', expected: 'arizona', label: 'utm chiprepairtempe' },
  { state: null, zip: null, utm_source: 'newwindshieldcost', expected: 'colorado', label: 'utm newwindshieldcost' },
  { state: null, zip: null, utm_source: 'mobilewindshieldphoenix', expected: 'arizona', label: 'utm mobilewindshieldphoenix' },
  { state: null, zip: null, utm_source: 'campaign-aurorawindshield-q1', expected: 'colorado', label: 'utm aurorawindshield substring' },
  { state: null, zip: null, utm_source: 'google', expected: null, label: 'utm google (no satellite)' },
  { state: null, zip: null, utm_source: 'facebook', expected: null, label: 'utm facebook' },
  { state: null, zip: null, utm_source: null, expected: null, label: 'all null' },
  { state: '', zip: '', utm_source: '', expected: null, label: 'all empty strings' },
  { state: 'CO', zip: '85001', utm_source: 'chiprepairmesa', expected: 'colorado', label: 'state CO beats AZ zip + AZ utm' },
  { state: null, zip: '80202', utm_source: 'chiprepairmesa', expected: 'colorado', label: 'CO zip beats AZ utm' },
  { state: 'XX', zip: null, utm_source: null, expected: null, label: 'unknown state' },
];

const CALL_CASES: Array<{ to_number: string | null; expected: string | null; label: string }> = [
  { to_number: '+17209187465', expected: 'colorado', label: 'CO E.164' },
  { to_number: '+14807127465', expected: 'arizona', label: 'AZ E.164' },
  { to_number: '7209187465', expected: 'colorado', label: 'CO 10-digit' },
  { to_number: '4807127465', expected: 'arizona', label: 'AZ 10-digit' },
  { to_number: '17209187465', expected: 'colorado', label: 'CO 11-digit no plus' },
  { to_number: '14807127465', expected: 'arizona', label: 'AZ 11-digit no plus' },
  { to_number: '(720) 918-7465', expected: 'colorado', label: 'CO formatted with parens' },
  { to_number: '480-712-7465', expected: 'arizona', label: 'AZ formatted with dashes' },
  { to_number: '+13035551234', expected: null, label: 'random Denver-area number' },
  { to_number: '+18005551234', expected: null, label: 'toll-free' },
  { to_number: null, expected: null, label: 'null' },
  { to_number: '', expected: null, label: 'empty' },
  { to_number: '+1234', expected: null, label: 'too short' },
];

async function main() {
  let failures = 0;
  let total = 0;

  console.log('═══════ LEAD CLASSIFIER PARITY ═══════');
  for (const c of LEAD_CASES) {
    total++;
    const tsResult = classifyLeadMarket({ state: c.state, zip: c.zip, utm_source: c.utm_source });
    const { data: sqlResult, error } = await supabase.rpc('derive_lead_market', {
      p_state: c.state,
      p_zip: c.zip,
      p_utm_source: c.utm_source,
    });
    if (error) {
      failures++;
      console.log(`  ✗ ${c.label}: SQL RPC error ${error.message}`);
      continue;
    }
    if (tsResult !== sqlResult || tsResult !== c.expected) {
      failures++;
      console.log(`  ✗ ${c.label}: expected=${c.expected} ts=${tsResult} sql=${sqlResult}`);
    } else {
      console.log(`  ✓ ${c.label}: ${c.expected ?? 'null'}`);
    }
  }

  console.log('');
  console.log('═══════ CALL CLASSIFIER PARITY ═══════');
  for (const c of CALL_CASES) {
    total++;
    const tsResult = classifyCallMarket(c.to_number);
    const { data: sqlResult, error } = await supabase.rpc('derive_call_market', { p_to_number: c.to_number });
    if (error) {
      failures++;
      console.log(`  ✗ ${c.label}: SQL RPC error ${error.message}`);
      continue;
    }
    if (tsResult !== sqlResult || tsResult !== c.expected) {
      failures++;
      console.log(`  ✗ ${c.label}: expected=${c.expected} ts=${tsResult} sql=${sqlResult}`);
    } else {
      console.log(`  ✓ ${c.label}: ${c.expected ?? 'null'}`);
    }
  }

  console.log('');
  console.log(`═══════ ${total - failures} / ${total} passed ═══════`);
  if (failures > 0) {
    console.log(`✗ ${failures} mismatch(es) — TS classifier and SQL function are NOT in parity`);
    process.exit(1);
  } else {
    console.log('✓ TS and SQL classifiers in parity');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

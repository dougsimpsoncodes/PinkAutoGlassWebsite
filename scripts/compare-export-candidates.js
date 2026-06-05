#!/usr/bin/env node
/**
 * compare-export-candidates.js
 *
 * Dry-run comparison: export_candidates (PR 2 contract) vs the active uploader
 * (ringcentral_calls.google_ads_uploaded_at / microsoft_ads_uploaded_at).
 *
 * Prints a 7-day and 30-day breakdown showing:
 *   - newly eligible   : candidate.eligible=true, call not yet uploaded by old uploader
 *   - newly skipped    : candidate.eligible=false, call WAS uploaded by old uploader
 *   - correctly eligible: both agree (eligible + uploaded)
 *   - correctly skipped : both agree (ineligible + not uploaded)
 *   - reason breakdown  : counts by reason for all ineligible candidates
 *
 * Run from the project root:
 *   node scripts/compare-export-candidates.js
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function runComparison(lookbackDays) {
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  // Fetch export_candidates for the window
  const { data: candidates, error: ecErr } = await supabase
    .from('export_candidates')
    .select('source_type, source_id, platform, eligible, reason, confidence, uploaded_at, conversion_time')
    .eq('source_type', 'call')
    .gte('conversion_time', since)
    .lte('conversion_time', now)
    .order('conversion_time', { ascending: false });

  if (ecErr) throw new Error(`export_candidates query failed: ${ecErr.message}`);
  if (!candidates?.length) {
    console.log(`  [${lookbackDays}d] No export_candidates found. Run a cron cycle first.`);
    return;
  }

  // Build a lookup of which calls have been uploaded by the old uploader
  const callIds = [...new Set(candidates.map(c => c.source_id))];
  const { data: calls, error: callsErr } = await supabase
    .from('ringcentral_calls')
    .select('call_id, google_ads_uploaded_at, microsoft_ads_uploaded_at')
    .in('call_id', callIds);

  if (callsErr) throw new Error(`ringcentral_calls query failed: ${callsErr.message}`);

  const uploadedGoogle = new Set((calls || []).filter(c => c.google_ads_uploaded_at).map(c => c.call_id));
  const uploadedMicrosoft = new Set((calls || []).filter(c => c.microsoft_ads_uploaded_at).map(c => c.call_id));

  const isUploadedByOld = (sourceId, platform) =>
    platform === 'google' ? uploadedGoogle.has(sourceId) : uploadedMicrosoft.has(sourceId);

  let newlyEligible = 0;
  let newlySkipped = 0;
  let correctlyEligible = 0;
  let correctlySkipped = 0;
  const reasonCounts = {};
  const newlySkippedReasons = {};
  const newlyEligibleByPlatform = { google: 0, microsoft: 0 };

  for (const c of candidates) {
    const oldUploaded = isUploadedByOld(c.source_id, c.platform);
    reasonCounts[c.reason] = (reasonCounts[c.reason] || 0) + 1;

    if (c.eligible && !oldUploaded) {
      newlyEligible++;
      newlyEligibleByPlatform[c.platform]++;
    } else if (!c.eligible && oldUploaded) {
      newlySkipped++;
      newlySkippedReasons[c.reason] = (newlySkippedReasons[c.reason] || 0) + 1;
    } else if (c.eligible && oldUploaded) {
      correctlyEligible++;
    } else {
      correctlySkipped++;
    }
  }

  const total = candidates.length;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${lookbackDays}-day window (${candidates.length} candidate records, ${callIds.length} unique calls)`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Correctly eligible (both agree):   ${correctlyEligible.toString().padStart(5)}  ${pct(correctlyEligible)}`);
  console.log(`  Correctly skipped  (both agree):   ${correctlySkipped.toString().padStart(5)}  ${pct(correctlySkipped)}`);
  console.log(`  NEWLY ELIGIBLE (contract finds, old misses): ${newlyEligible.toString().padStart(5)}  ${pct(newlyEligible)}`);
  if (newlyEligible > 0) {
    console.log(`    → Google: ${newlyEligibleByPlatform.google}, Microsoft: ${newlyEligibleByPlatform.microsoft}`);
  }
  console.log(`  NEWLY SKIPPED  (old uploads, contract says no): ${newlySkipped.toString().padStart(5)}  ${pct(newlySkipped)}`);
  if (newlySkipped > 0) {
    console.log('    → Reasons:', JSON.stringify(newlySkippedReasons));
  }
  console.log(`\n  Ineligible reason breakdown:`);
  for (const [reason, count] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${reason.padEnd(30)} ${count.toString().padStart(5)}`);
  }
}

async function main() {
  console.log('\nExport Candidates Comparison — new contract vs active uploader');
  console.log('(Run this after at least one cron cycle has populated export_candidates)');

  for (const days of [7, 30]) {
    try {
      await runComparison(days);
    } catch (err) {
      console.error(`  [${days}d] Error: ${err.message}`);
    }
  }
  console.log('');
}

main().catch(err => { console.error(err); process.exit(1); });

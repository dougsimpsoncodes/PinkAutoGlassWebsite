#!/usr/bin/env -S npx tsx
/**
 * Backfill `market` column on user_sessions where it is currently NULL.
 *
 * Reads sessions that have utm_campaign / utm_source / referrer / landing_page
 * fields and computes classifySessionMarket() for each. UPDATEs the row only
 * if classifier returns a non-null value (NULL stays NULL — factually accurate
 * for sessions with no usable market signal).
 *
 * Usage:
 *   npx tsx scripts/backfill-market-user-sessions.ts          # apply
 *   npx tsx scripts/backfill-market-user-sessions.ts --dry    # report only
 *
 * Idempotent — re-running will only touch rows that are still NULL.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { classifySessionMarket } from '../src/lib/market';

function loadEnv(envPath: string) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
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

const dryRun = process.argv.includes('--dry');
const BATCH_SIZE = 1000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log(`[backfill user_sessions market] ${dryRun ? 'DRY RUN' : 'APPLYING'}`);

  let totalProcessed = 0;
  let totalClassified = 0;
  let totalSkipped = 0;
  const byMarket: Record<string, number> = { colorado: 0, arizona: 0, null: 0 };

  // Cursor pagination on started_at. Critical: filtering on `market IS NULL`
  // does NOT advance the cursor through unclassifiable rows, since they stay
  // NULL after processing. We need to scan ALL rows where market IS NULL and
  // advance past each whether we update it or not. started_at is sortable
  // and unique enough at millisecond resolution; ties are broken by session_id.
  let cursorStartedAt: string | null = null;
  let cursorSessionId: string | null = null;

  while (true) {
    let q = supabase
      .from('user_sessions')
      .select('session_id, started_at, utm_campaign, utm_source, referrer, landing_page')
      .is('market', null)
      .order('started_at', { ascending: true })
      .order('session_id', { ascending: true })
      .limit(BATCH_SIZE);

    if (cursorStartedAt !== null) {
      // Advance past last row of previous batch — equivalent to
      // (started_at, session_id) > (cursorStartedAt, cursorSessionId).
      // Supabase doesn't support tuple comparisons directly, so use OR:
      //   started_at > X
      //   OR (started_at = X AND session_id > Y)
      q = q.or(`started_at.gt.${cursorStartedAt},and(started_at.eq.${cursorStartedAt},session_id.gt.${cursorSessionId})`);
    }

    const { data, error } = await q;
    if (error) { console.error('Read error:', error); process.exit(1); }
    if (!data || data.length === 0) break;

    const updates: Array<{ session_id: string; market: 'colorado' | 'arizona' }> = [];
    for (const row of data) {
      totalProcessed++;
      const market = classifySessionMarket({
        utm_campaign: row.utm_campaign,
        utm_source: row.utm_source,
        referrer: row.referrer,
        landing_page: row.landing_page,
      });
      if (market === null) {
        byMarket.null++;
        totalSkipped++;
      } else {
        byMarket[market]++;
        totalClassified++;
        updates.push({ session_id: row.session_id, market });
      }
    }

    if (!dryRun && updates.length > 0) {
      let updated = 0;
      for (const u of updates) {
        const { error: updateError } = await supabase
          .from('user_sessions')
          .update({ market: u.market })
          .eq('session_id', u.session_id);
        if (updateError) {
          console.error(`Update failed for ${u.session_id}:`, updateError.message);
        } else {
          updated++;
        }
      }
      process.stderr.write(`  batch: scanned=${data.length}, updated=${updated}, skipped=${data.length - updated} (cumulative: ${totalProcessed} processed, ${totalClassified} classified)\n`);
    } else {
      process.stderr.write(`  batch (dry): scanned=${data.length}, would-update=${updates.length}, would-skip=${data.length - updates.length} (cumulative: ${totalProcessed})\n`);
    }

    // Advance cursor to the LAST row of this batch (whether updated or not).
    const last = data[data.length - 1];
    cursorStartedAt = last.started_at;
    cursorSessionId = last.session_id;

    if (data.length < BATCH_SIZE) break;

    // Dry-run: bail after one batch so we don't pretend to scan everything.
    if (dryRun) break;
  }

  console.log('');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Classified:      ${totalClassified} (colorado=${byMarket.colorado}, arizona=${byMarket.arizona})`);
  console.log(`Left as NULL:    ${totalSkipped}`);
  if (dryRun) console.log('(dry run — no writes performed)');
}

main().catch(err => { console.error(err); process.exit(1); });

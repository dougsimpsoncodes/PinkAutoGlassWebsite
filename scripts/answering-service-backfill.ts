/**
 * Backfill executor for answering-service lead ingestion.
 *
 * Replays every archived answering-service text (ringcentral_sms) through the
 * SAME shared writer the live webhook uses, then retires the old collapsed
 * "blob" lead rows (the ones mis-attributed to the service number).
 *
 *   npx tsx scripts/answering-service-backfill.ts            # PREVIEW (no writes)
 *   npx tsx scripts/answering-service-backfill.ts --execute  # writes, then retires blobs
 *
 * Idempotent: re-running is safe (one lead per customer phone). Blobs are only
 * retired AFTER create/enrich is verified. See Item 2 in
 * tasks/2026-05-30-reporting-consistency-audit.md.
 */
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { ANSWERING_SERVICE_NUMBERS } from '../src/lib/answeringService';
import { ingestAnsweringServiceMessage, type IngestResult } from '../src/lib/answeringServiceIngest';

function loadEnv(p: string) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v.replace(/\\n$/, '');
  }
}
loadEnv(__dirname + '/../.env.local');
loadEnv(__dirname + '/../.env.local.service');

const EXECUTE = process.argv.includes('--execute');

(async () => {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  console.log(`════ ANSWERING-SERVICE BACKFILL — ${EXECUTE ? 'EXECUTE (writing)' : 'PREVIEW (no writes)'} ════`);

  // 1. Pull all archived service messages, oldest first (so created_at anchoring is chronological).
  let msgs: { message_text: string; message_time: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('ringcentral_sms')
      .select('message_text, message_time')
      .in('from_number', ANSWERING_SERVICE_NUMBERS as string[])
      .order('message_time', { ascending: true })
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    msgs = msgs.concat(data);
    if (data.length < 1000) break;
  }
  console.log(`Archived messages: ${msgs.length}`);

  // 2. Replay through the shared writer.
  const totals = { created: 0, created_from_call: 0, enriched: 0, noop: 0, skip: 0, review: 0 };
  for (const m of msgs) {
    const r: IngestResult = await ingestAnsweringServiceMessage(
      sb,
      { messageText: m.message_text, messageTime: m.message_time },
      { dryRun: !EXECUTE }
    );
    totals.created += r.outcomes.filter(o => o.action === 'created').length;
    totals.created_from_call += r.outcomes.filter(o => o.action === 'created_from_call').length;
    totals.enriched += r.enriched;
    totals.noop += r.outcomes.filter(o => o.action === 'noop_complete').length;
    totals.skip += r.skippedNonLead;
    totals.review += r.manualReview;
  }
  console.log('── Ingest reconciliation ──');
  console.log(`  created (net-new):        ${totals.created}`);
  console.log(`  created (from main call): ${totals.created_from_call}`);
  console.log(`  enriched existing:        ${totals.enriched}`);
  console.log(`  already complete (noop):  ${totals.noop}`);
  console.log(`  skipped non-lead:         ${totals.skip}`);
  console.log(`  manual review:            ${totals.review}`);

  // 3. Identify the old collapsed "blob" rows (leads attributed to the SERVICE number).
  const { data: blobs } = await sb
    .from('leads')
    .select('id, phone_e164, is_test, notes')
    .in('phone_e164', ANSWERING_SERVICE_NUMBERS as string[]);
  console.log(`── Blob rows (leads attributed to the service number): ${(blobs || []).length} ──`);
  (blobs || []).forEach(b => console.log(`   ${b.id} ${b.phone_e164} is_test=${b.is_test}`));

  if (!EXECUTE) {
    console.log('PREVIEW only — no writes, no blobs retired. Re-run with --execute to apply.');
    return;
  }

  // 4. Retire blobs ONLY after a successful ingest (their customers now exist as real leads).
  const ingestedSomething = totals.created + totals.created_from_call + totals.enriched > 0;
  if (!ingestedSomething) {
    console.log('No leads created/enriched — NOT retiring blobs (safety guard).');
    return;
  }
  for (const b of blobs || []) {
    if (b.is_test === true) continue; // already retired
    const note = (b.notes ? `${b.notes}\n` : '') + `[retired ${new Date().toISOString().slice(0, 10)} — answering-service customers re-ingested as individual call leads]`;
    await sb.from('leads').update({ is_test: true, notes: note }).eq('id', b.id);
    console.log(`   retired blob ${b.id} (is_test=true)`);
  }
  console.log('════ BACKFILL COMPLETE ════');
})().catch(e => { console.error('BACKFILL ERR:', e.message || e); process.exit(1); });

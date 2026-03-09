/**
 * review-blast-test.mjs
 *
 * 1. Inserts a fake completed lead with Doug's phone/email
 * 2. Calls /api/admin/review-blast scoped to that lead only
 * 3. Calls /api/cron/process-drip to send immediately
 * 4. Prints results
 *
 * Run: node scripts/review-blast-test.mjs
 * Cleanup: node scripts/review-blast-test.mjs --cleanup <lead_id>
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fypzafbsfrrlrrufzkol.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CRON_SECRET = process.env.CRON_SECRET;
const SITE_URL = 'https://pinkautoglass.com';

if (!SUPABASE_SERVICE_KEY || !ADMIN_PASSWORD || !CRON_SECRET) {
  console.error('Missing env vars. Run: source .env.local first, or use dotenv.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Cleanup mode ──────────────────────────────────────────────────────────────
if (process.argv[2] === '--cleanup') {
  const leadId = process.argv[3];
  if (!leadId) { console.error('Usage: --cleanup <lead_id>'); process.exit(1); }

  const { error: msgErr } = await supabase
    .from('scheduled_messages')
    .delete()
    .eq('lead_id', leadId);

  const { error: leadErr } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (msgErr) console.error('Error deleting messages:', msgErr.message);
  if (leadErr) console.error('Error deleting lead:', leadErr.message);
  if (!msgErr && !leadErr) console.log(`✅ Cleaned up lead ${leadId} and its scheduled messages`);
  process.exit(0);
}

// ── Step 1: Insert fake lead ──────────────────────────────────────────────────
console.log('📝 Inserting test lead...');
const { data: lead, error: insertError } = await supabase
  .from('leads')
  .insert({
    first_name: 'Doug',
    phone_e164: '+13104280616',
    email: 'dougiefreshcodes@gmail.com',
    vehicle_year: 2022,
    vehicle_make: 'Toyota',
    vehicle_model: 'Camry',
    status: 'completed',
    is_test: true,
  })
  .select('id')
  .single();

if (insertError) {
  console.error('❌ Failed to insert test lead:', insertError.message);
  process.exit(1);
}

const leadId = lead.id;
console.log(`✅ Test lead created: ${leadId}`);
console.log('');

// ── Step 2: Call review-blast scoped to this lead only ────────────────────────
console.log('📤 Calling /api/admin/review-blast (test mode)...');
const blastRes = await fetch(`${SITE_URL}/api/admin/review-blast`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64'),
  },
  body: JSON.stringify({ lead_id: leadId }),
});

const blastData = await blastRes.json();
console.log('Blast result:', JSON.stringify(blastData, null, 2));
console.log('');

if (!blastData.ok) {
  console.error('❌ Blast failed — cleaning up lead');
  await supabase.from('leads').delete().eq('id', leadId);
  process.exit(1);
}

// ── Step 3: Trigger process-drip to send now ──────────────────────────────────
console.log('🚀 Triggering process-drip...');
const dripRes = await fetch(`${SITE_URL}/api/cron/process-drip`, {
  headers: { 'Authorization': `Bearer ${CRON_SECRET}` },
});

const dripData = await dripRes.json();
console.log('Drip result:', JSON.stringify(dripData, null, 2));
console.log('');

console.log('─────────────────────────────────────────────');
console.log(`✅ Test complete. Lead ID: ${leadId}`);
console.log('');
console.log('Check your phone (+13104280616) for the SMS.');
console.log('');
console.log('When ready to clean up, run:');
console.log(`  node scripts/review-blast-test.mjs --cleanup ${leadId}`);
console.log('─────────────────────────────────────────────');

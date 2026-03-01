/**
 * One-time backfill: Create leads for historical callers who have no lead record.
 *
 * Uses the same logic as syncCallLeads() — qualifying inbound calls (30s+),
 * deduplicated by phone, upsert (create if missing, update attribution if exists).
 *
 * Usage: NODE_PATH=./node_modules node scripts/backfill-call-leads.cjs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const MIN_CALL_DURATION_SECONDS = 30;

const PLATFORM_PRIORITY = { google: 1, microsoft: 2, organic: 3, direct: 4 };
function platformRank(p) { return p ? (PLATFORM_PRIORITY[p] ?? 5) : 99; }

// Load phone exclusion lists from env
const excludedPhones = new Set(
  (process.env.EXCLUDED_DRIP_PHONES || '').split(',').map(p => p.trim()).filter(Boolean)
);
const testPhones = new Set(
  (process.env.TEST_PHONES || '').split(',').map(p => p.trim()).filter(Boolean)
);

function isExcludedPhone(phone) { return excludedPhones.has(phone); }
function isTestPhone(phone) { return testPhones.has(phone); }

async function backfill() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Fetching qualifying inbound calls (2025-10-01 to 2026-03-01)...');

  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, ad_platform')
    .eq('direction', 'Inbound')
    .gte('duration', MIN_CALL_DURATION_SECONDS)
    .gte('start_time', '2025-10-01T00:00:00.000Z')
    .lte('start_time', '2026-03-01T23:59:59.999Z')
    .not('from_number', 'is', null)
    .neq('from_number', '');

  if (callsError) {
    console.error('Failed to fetch calls:', callsError.message);
    process.exit(1);
  }

  console.log(`Found ${calls.length} qualifying calls`);

  // Deduplicate by from_number — keep best ad_platform
  const byPhone = new Map();
  for (const call of calls) {
    const phone = call.from_number;
    if (!phone) continue;
    const existing = byPhone.get(phone);
    if (!existing || platformRank(call.ad_platform) < platformRank(existing.ad_platform)) {
      byPhone.set(phone, {
        from_number: phone,
        start_time: call.start_time,
        ad_platform: call.ad_platform,
      });
    }
  }

  console.log(`${byPhone.size} unique callers after dedup`);

  let created = 0, updated = 0, skipped = 0, errors = 0;

  for (const [phone, call] of byPhone) {
    const isTest = isExcludedPhone(phone) || isTestPhone(phone);

    // Check if a lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, ad_platform, is_test')
      .eq('phone_e164', phone)
      .eq('is_test', isTest)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingLead) {
      const weakPlatform = !existingLead.ad_platform
        || existingLead.ad_platform === 'direct'
        || existingLead.ad_platform === 'unknown';
      const callHasPlatform = call.ad_platform
        && call.ad_platform !== 'direct'
        && call.ad_platform !== 'unknown';

      if (weakPlatform && callHasPlatform) {
        const { error } = await supabase
          .from('leads')
          .update({
            ad_platform: call.ad_platform,
            first_contact_method: 'call',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingLead.id);

        if (error) {
          console.error(`Failed to update lead ${existingLead.id}:`, error.message);
          errors++;
        } else {
          updated++;
        }
      } else {
        skipped++;
      }
    } else {
      const { error } = await supabase
        .from('leads')
        .insert({
          phone_e164: phone,
          first_name: '',
          last_name: '',
          first_contact_method: 'call',
          ad_platform: call.ad_platform || null,
          is_test: isTest,
          status: 'new',
          created_at: call.start_time,
        });

      if (error) {
        console.error(`Failed to create lead for ${phone}:`, error.message);
        errors++;
      } else {
        created++;
      }
    }
  }

  console.log(`\nBackfill complete:`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);

  // Verify: count leads with first_contact_method = 'call'
  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('first_contact_method', 'call');

  console.log(`\nTotal call-based leads in DB: ${count}`);

  // Check for duplicates
  const { data: dupes } = await supabase.rpc('check_phone_dupes', {});
  if (dupes && dupes.length > 0) {
    console.warn(`\nWARNING: ${dupes.length} duplicate phone numbers found!`);
  } else {
    console.log('No duplicate phone numbers detected (RPC not available or clean)');
  }
}

backfill().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});

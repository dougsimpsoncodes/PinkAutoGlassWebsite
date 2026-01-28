/**
 * Investigate Data Warnings
 * - Orphaned conversion events (no matching session)
 * - Duplicate form submissions
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DAYS_BACK = 30;

async function findOrphanedEvents() {
  console.log('\n' + '='.repeat(70));
  console.log('  INVESTIGATING ORPHANED EVENTS');
  console.log('='.repeat(70));

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_BACK);

  // Get conversion events
  const { data: events } = await supabase
    .from('conversion_events')
    .select('id, session_id, visitor_id, event_type, created_at, gclid, msclkid, phone_number')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(200);

  console.log(`\nChecking ${events.length} events for orphaned sessions...\n`);

  const orphaned = [];
  for (const event of events) {
    if (!event.session_id) {
      orphaned.push({ ...event, reason: 'No session_id field' });
      continue;
    }

    const { data: session } = await supabase
      .from('user_sessions')
      .select('session_id, started_at, gclid, msclkid')
      .eq('session_id', event.session_id)
      .single();

    if (!session) {
      orphaned.push({ ...event, reason: 'Session not found in user_sessions table' });
    }
  }

  console.log(`Found ${orphaned.length} orphaned events:\n`);

  if (orphaned.length === 0) {
    console.log('  No orphaned events found!');
    return [];
  }

  orphaned.forEach((e, i) => {
    console.log(`--- Orphaned Event ${i + 1} ---`);
    console.log(`  Event ID: ${e.id}`);
    console.log(`  Session ID: ${e.session_id || 'NULL'}`);
    console.log(`  Visitor ID: ${e.visitor_id || 'NULL'}`);
    console.log(`  Event Type: ${e.event_type}`);
    console.log(`  Created: ${e.created_at}`);
    console.log(`  GCLID: ${e.gclid || 'none'}`);
    console.log(`  MSCLKID: ${e.msclkid || 'none'}`);
    console.log(`  Reason: ${e.reason}`);
    console.log('');
  });

  return orphaned;
}

async function findDuplicateForms() {
  console.log('\n' + '='.repeat(70));
  console.log('  INVESTIGATING DUPLICATE FORM SUBMISSIONS');
  console.log('='.repeat(70));

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_BACK);

  // Get all form_submit events
  const { data: formEvents } = await supabase
    .from('conversion_events')
    .select('id, session_id, visitor_id, created_at, gclid, msclkid')
    .eq('event_type', 'form_submit')
    .gte('created_at', startDate.toISOString())
    .order('session_id');

  // Group by session_id
  const bySession = {};
  formEvents.forEach(e => {
    if (!bySession[e.session_id]) {
      bySession[e.session_id] = [];
    }
    bySession[e.session_id].push(e);
  });

  // Find sessions with multiple form submissions
  const duplicates = Object.entries(bySession)
    .filter(([_, events]) => events.length > 1)
    .map(([sessionId, events]) => ({ sessionId, events, count: events.length }));

  console.log(`\nFound ${duplicates.length} sessions with multiple form submissions:\n`);

  if (duplicates.length === 0) {
    console.log('  No duplicate form submissions found!');
    return [];
  }

  for (const dup of duplicates) {
    console.log(`--- Session: ${dup.sessionId} ---`);
    console.log(`  Form submissions: ${dup.count}`);

    // Get session details
    const { data: session } = await supabase
      .from('user_sessions')
      .select('started_at, gclid, msclkid, landing_page, utm_source')
      .eq('session_id', dup.sessionId)
      .single();

    if (session) {
      console.log(`  Session started: ${session.started_at}`);
      console.log(`  Landing page: ${session.landing_page}`);
      console.log(`  UTM source: ${session.utm_source || 'none'}`);
    }

    console.log('  Form events:');
    dup.events.forEach((e, i) => {
      console.log(`    ${i + 1}. ${e.created_at} (ID: ${e.id})`);
    });

    // Calculate time between submissions
    if (dup.events.length >= 2) {
      const times = dup.events.map(e => new Date(e.created_at).getTime()).sort((a, b) => a - b);
      const diffSeconds = (times[times.length - 1] - times[0]) / 1000;
      console.log(`  Time between first and last: ${diffSeconds.toFixed(1)} seconds`);

      if (diffSeconds < 5) {
        console.log(`  ⚠️  LIKELY DUPLICATE: Submissions within ${diffSeconds.toFixed(1)}s`);
      } else {
        console.log(`  ℹ️  May be legitimate re-submission (${diffSeconds.toFixed(0)}s apart)`);
      }
    }
    console.log('');
  }

  return duplicates;
}

async function suggestFixes(orphaned, duplicates) {
  console.log('\n' + '='.repeat(70));
  console.log('  RECOMMENDED ACTIONS');
  console.log('='.repeat(70));

  console.log('\n### Orphaned Events ###');
  if (orphaned.length === 0) {
    console.log('  No action needed.');
  } else if (orphaned.length <= 3) {
    console.log('  These are likely edge cases (bot traffic, session expiry, etc.)');
    console.log('  Recommendation: No immediate action needed.');
    console.log('  Monitor: If count increases, investigate session creation logic.');
  } else {
    console.log('  ⚠️  High count of orphaned events - investigate session tracking');
    console.log('  Check: Is the session being created before conversion events?');
  }

  console.log('\n### Duplicate Form Submissions ###');
  if (duplicates.length === 0) {
    console.log('  No action needed.');
  } else {
    const rapidDupes = duplicates.filter(d => {
      const times = d.events.map(e => new Date(e.created_at).getTime()).sort((a, b) => a - b);
      return (times[times.length - 1] - times[0]) / 1000 < 5;
    });

    if (rapidDupes.length > 0) {
      console.log(`  Found ${rapidDupes.length} sessions with rapid duplicate submissions (<5s)`);
      console.log('  Options:');
      console.log('    1. Add debounce to form submission (prevent rapid clicks)');
      console.log('    2. Add server-side deduplication (check for recent submission)');
      console.log('    3. Delete duplicate events (keep first submission only)');

      console.log('\n  To delete duplicates, run:');
      for (const dup of rapidDupes) {
        const keepId = dup.events.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0].id;
        const deleteIds = dup.events.filter(e => e.id !== keepId).map(e => e.id);
        console.log(`    DELETE FROM conversion_events WHERE id IN (${deleteIds.join(', ')});`);
      }
    } else {
      console.log('  All duplicates appear to be legitimate re-submissions (>5s apart)');
      console.log('  Recommendation: No action needed.');
    }
  }
}

async function main() {
  const orphaned = await findOrphanedEvents();
  const duplicates = await findDuplicateForms();
  await suggestFixes(orphaned, duplicates);
}

main().catch(console.error);

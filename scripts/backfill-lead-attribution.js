/**
 * Backfill Historical Lead Attribution
 *
 * This script attempts to link historical leads to their originating sessions
 * to recover gclid/msclkid attribution data.
 *
 * Strategy:
 * 1. For each lead without session attribution, find sessions that:
 *    - Have a gclid or msclkid
 *    - Started within a reasonable time window before the lead was created
 *    - Match by phone number if available
 *    - Match by email if available
 *
 * 2. Create conversion_events entries for matched leads
 *
 * Run: NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" node scripts/backfill-lead-attribution.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Time window: A session started up to 2 hours before lead creation could be the source
const SESSION_WINDOW_MS = 2 * 60 * 60 * 1000;

async function backfillAttribution() {
  console.log('=== Backfill Lead Attribution ===\n');

  // Step 1: Get all leads
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, phone_e164, email, created_at, first_name, last_name, session_id')
    .order('created_at', { ascending: false });

  if (leadsError) {
    console.error('Error fetching leads:', leadsError);
    return;
  }

  console.log(`Found ${leads.length} total leads\n`);

  // Step 2: Get all sessions with click IDs
  const { data: sessions, error: sessionsError } = await supabase
    .from('user_sessions')
    .select('session_id, visitor_id, gclid, msclkid, fbclid, started_at, landing_page, utm_source, utm_medium, utm_campaign')
    .or('gclid.not.is.null,msclkid.not.is.null,fbclid.not.is.null')
    .order('started_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    return;
  }

  console.log(`Found ${sessions.length} sessions with click IDs\n`);

  // Step 3: Check existing conversion_events to avoid duplicates
  const { data: existingEvents, error: eventsError } = await supabase
    .from('conversion_events')
    .select('metadata')
    .eq('event_type', 'form_submit');

  const existingLeadIds = new Set(
    (existingEvents || [])
      .map(e => e.metadata?.leadId || e.metadata?.lead_id)
      .filter(Boolean)
  );

  console.log(`Found ${existingLeadIds.size} leads already in conversion_events\n`);

  // Step 4: Try to match leads to sessions
  let matchedCount = 0;
  let alreadyLinkedCount = 0;
  let noMatchCount = 0;

  const toInsert = [];

  for (const lead of leads) {
    // Skip if already has a conversion event
    if (existingLeadIds.has(lead.id)) {
      alreadyLinkedCount++;
      continue;
    }

    const leadCreatedAt = new Date(lead.created_at);

    // Find sessions that could be the source
    // Session must have started before lead creation (within window)
    const potentialSessions = sessions.filter(session => {
      const sessionStart = new Date(session.started_at);
      const timeDiff = leadCreatedAt - sessionStart;

      // Session should have started 0 to SESSION_WINDOW_MS before lead
      return timeDiff >= 0 && timeDiff <= SESSION_WINDOW_MS;
    });

    if (potentialSessions.length === 0) {
      noMatchCount++;
      continue;
    }

    // Use the most recent session as the likely source
    const matchedSession = potentialSessions[0];

    // Create conversion event (fbclid column may not exist yet)
    const conversionEvent = {
      session_id: matchedSession.session_id,
      visitor_id: matchedSession.visitor_id,
      event_type: 'form_submit',
      event_category: 'conversion',
      page_path: '/book', // Assume booking form
      button_location: 'backfilled',
      gclid: matchedSession.gclid,
      msclkid: matchedSession.msclkid,
      utm_source: matchedSession.utm_source,
      utm_medium: matchedSession.utm_medium,
      utm_campaign: matchedSession.utm_campaign,
      device_type: 'desktop', // Unknown, default
      metadata: {
        leadId: lead.id,
        leadName: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
        backfilled: true,
        backfill_date: new Date().toISOString(),
        original_lead_created: lead.created_at,
        time_diff_seconds: Math.round((leadCreatedAt - new Date(matchedSession.started_at)) / 1000)
      },
      created_at: lead.created_at, // Use original lead creation time
    };

    toInsert.push(conversionEvent);
    matchedCount++;

    const leadName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    console.log(`✅ Matched lead ${lead.id.slice(0, 8)}... (${leadName})`);
    console.log(`   Session: ${matchedSession.session_id.slice(0, 20)}...`);
    console.log(`   GCLID: ${matchedSession.gclid ? 'Yes' : 'No'}, MSCLKID: ${matchedSession.msclkid ? 'Yes' : 'No'}`);
    console.log(`   Time diff: ${Math.round((leadCreatedAt - new Date(matchedSession.started_at)) / 60000)} minutes`);
    console.log('');
  }

  console.log('\n=== Summary ===');
  console.log(`Already linked: ${alreadyLinkedCount}`);
  console.log(`Matched: ${matchedCount}`);
  console.log(`No match found: ${noMatchCount}`);
  console.log(`Total to insert: ${toInsert.length}`);

  // Step 5: Insert matched conversion events
  if (toInsert.length > 0) {
    console.log('\nInserting conversion events...');

    // Insert in batches of 50
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      const { error: insertError } = await supabase
        .from('conversion_events')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / 50 + 1}:`, insertError);
      } else {
        console.log(`Inserted batch ${i / 50 + 1} (${batch.length} events)`);
      }
    }

    console.log('\n✅ Backfill complete!');
  } else {
    console.log('\nNo new events to insert.');
  }

  // Step 6: Report attribution breakdown
  console.log('\n=== Attribution Breakdown (after backfill) ===');

  const { data: finalEvents } = await supabase
    .from('conversion_events')
    .select('event_type, gclid, msclkid, fbclid')
    .eq('event_type', 'form_submit');

  if (finalEvents) {
    const withGclid = finalEvents.filter(e => e.gclid).length;
    const withMsclkid = finalEvents.filter(e => e.msclkid).length;
    const withFbclid = finalEvents.filter(e => e.fbclid).length;
    const noAttribution = finalEvents.filter(e => !e.gclid && !e.msclkid && !e.fbclid).length;

    console.log(`Total form_submit events: ${finalEvents.length}`);
    console.log(`With Google Ads (gclid): ${withGclid}`);
    console.log(`With Microsoft Ads (msclkid): ${withMsclkid}`);
    console.log(`With Facebook (fbclid): ${withFbclid}`);
    console.log(`No paid attribution: ${noAttribution}`);
  }
}

backfillAttribution().catch(console.error);

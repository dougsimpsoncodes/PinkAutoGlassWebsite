/**
 * Backfill Lead Attribution from Conversion Events
 *
 * This script updates existing leads with attribution data from conversion_events.
 * Run this AFTER applying the fn_insert_lead fix to populate historical data.
 *
 * Strategy:
 * 1. Find leads that have no attribution (gclid, msclkid, ad_platform are null)
 * 2. Look up their corresponding conversion_event by matching metadata.leadId
 * 3. Copy gclid, msclkid, and utm fields from conversion_event to lead
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backfillAttribution() {
  console.log('=== Backfill Lead Attribution from Conversion Events ===');
  console.log('');

  // Step 1: Get all leads without attribution
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, first_name, last_name, gclid, msclkid, ad_platform, created_at')
    .is('ad_platform', null)
    .order('created_at', { ascending: false });

  if (leadsError) {
    console.error('Error fetching leads:', leadsError);
    return;
  }

  console.log(`Found ${leads.length} leads without attribution`);

  // Step 2: Get all form_submit conversion_events with attribution
  const { data: events, error: eventsError } = await supabase
    .from('conversion_events')
    .select('id, metadata, gclid, msclkid, utm_source, utm_medium, utm_campaign, utm_term, utm_content, created_at')
    .eq('event_type', 'form_submit')
    .or('gclid.not.is.null,msclkid.not.is.null');

  if (eventsError) {
    console.error('Error fetching conversion events:', eventsError);
    return;
  }

  console.log(`Found ${events.length} conversion events with attribution`);

  // Step 3: Match leads to events and update
  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const lead of leads) {
    // Find matching conversion_event by metadata.leadId
    const matchingEvent = events.find(e =>
      e.metadata?.leadId === lead.id ||
      e.metadata?.lead_id === lead.id
    );

    if (!matchingEvent) {
      // Try matching by created_at timestamp (within 5 seconds)
      const leadTime = new Date(lead.created_at).getTime();
      const closeEvent = events.find(e => {
        const eventTime = new Date(e.created_at).getTime();
        return Math.abs(leadTime - eventTime) < 5000; // Within 5 seconds
      });

      if (closeEvent) {
        console.log(`  Matched lead ${lead.id.slice(0, 8)}... by timestamp proximity`);

        const adPlatform = closeEvent.gclid ? 'google' : closeEvent.msclkid ? 'microsoft' : closeEvent.utm_source || 'direct';

        const { error: updateError } = await supabase
          .from('leads')
          .update({
            gclid: closeEvent.gclid,
            msclkid: closeEvent.msclkid,
            ad_platform: adPlatform,
            utm_source: closeEvent.utm_source,
            utm_medium: closeEvent.utm_medium,
            utm_campaign: closeEvent.utm_campaign,
            utm_term: closeEvent.utm_term,
            utm_content: closeEvent.utm_content,
          })
          .eq('id', lead.id);

        if (updateError) {
          console.log(`    Error: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`    Updated with ${adPlatform} attribution`);
          updatedCount++;
        }
      } else {
        notFoundCount++;
      }
      continue;
    }

    // Determine ad_platform
    const adPlatform = matchingEvent.gclid ? 'google' : matchingEvent.msclkid ? 'microsoft' : matchingEvent.utm_source || 'direct';

    // Update lead
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        gclid: matchingEvent.gclid,
        msclkid: matchingEvent.msclkid,
        ad_platform: adPlatform,
        utm_source: matchingEvent.utm_source,
        utm_medium: matchingEvent.utm_medium,
        utm_campaign: matchingEvent.utm_campaign,
        utm_term: matchingEvent.utm_term,
        utm_content: matchingEvent.utm_content,
      })
      .eq('id', lead.id);

    if (updateError) {
      console.log(`Error updating lead ${lead.id}:`, updateError.message);
      errorCount++;
    } else {
      const leadName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown';
      console.log(`  Updated lead ${lead.id.slice(0, 8)}... (${leadName}) with ${adPlatform} attribution`);
      updatedCount++;
    }
  }

  // Step 4: Summary
  console.log('');
  console.log('=== Summary ===');
  console.log(`Leads updated: ${updatedCount}`);
  console.log(`Leads not matched: ${notFoundCount}`);
  console.log(`Errors: ${errorCount}`);

  // Step 5: Verify results
  console.log('');
  console.log('=== After Backfill ===');

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  const { count: leadsWithAdPlatform } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .not('ad_platform', 'is', null);

  console.log(`Total leads: ${totalLeads}`);
  console.log(`With ad_platform: ${leadsWithAdPlatform} (${((leadsWithAdPlatform / totalLeads) * 100).toFixed(1)}%)`);
}

backfillAttribution().catch(console.error);

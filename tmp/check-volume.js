#!/usr/bin/env node
/**
 * Quick script to check current call and lead volume
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVolume() {
  console.log('📊 Checking call and lead volume...\n');

  // Get calls from last 30 days grouped by day
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('start_time, result, direction, ad_platform, utm_source')
    .eq('direction', 'Inbound')
    .gte('start_time', thirtyDaysAgo.toISOString())
    .order('start_time', { ascending: false });

  if (callsError) {
    console.error('Error fetching calls:', callsError);
    return;
  }

  // Get leads from last 30 days
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('created_at, ad_platform, utm_source, gclid')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (leadsError) {
    console.error('Error fetching leads:', leadsError);
    return;
  }

  // Get Google Ads spend from last 30 days
  const { data: adSpend, error: spendError } = await supabase
    .from('google_ads_daily_performance')
    .select('date, cost_micros')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (spendError) {
    console.error('Error fetching ad spend:', spendError);
  }

  // Group calls by day
  const callsByDay = {};
  const callsBySource = { google_ads: 0, organic: 0, direct: 0, unknown: 0 };

  calls.forEach(call => {
    const date = call.start_time.split('T')[0];
    if (!callsByDay[date]) {
      callsByDay[date] = { total: 0, answered: 0, google_ads: 0, organic: 0 };
    }
    callsByDay[date].total++;
    if (call.result === 'Accepted') {
      callsByDay[date].answered++;
    }

    // Attribution
    if (call.ad_platform === 'google' || call.utm_source?.includes('google')) {
      callsByDay[date].google_ads++;
      callsBySource.google_ads++;
    } else if (call.utm_source === 'google' && call.utm_medium === 'organic') {
      callsByDay[date].organic++;
      callsBySource.organic++;
    } else if (call.utm_source) {
      callsBySource.direct++;
    } else {
      callsBySource.unknown++;
    }
  });

  // Group leads by day
  const leadsByDay = {};
  const leadsBySource = { google_ads: 0, organic: 0, direct: 0, unknown: 0 };

  leads.forEach(lead => {
    const date = lead.created_at.split('T')[0];
    if (!leadsByDay[date]) {
      leadsByDay[date] = { total: 0, google_ads: 0, organic: 0 };
    }
    leadsByDay[date].total++;

    // Attribution
    if (lead.gclid || lead.ad_platform === 'google') {
      leadsByDay[date].google_ads++;
      leadsBySource.google_ads++;
    } else if (lead.utm_source === 'google' && lead.utm_medium === 'organic') {
      leadsByDay[date].organic++;
      leadsBySource.organic++;
    } else if (lead.utm_source) {
      leadsBySource.direct++;
    } else {
      leadsBySource.unknown++;
    }
  });

  // Calculate totals
  const totalCalls = calls.length;
  const totalLeads = leads.length;
  const answeredCalls = calls.filter(c => c.result === 'Accepted').length;
  const totalAdSpend = adSpend?.reduce((sum, row) => sum + (row.cost_micros || 0), 0) / 1000000 || 0;

  // Get recent days for daily averages
  const recentDays = Object.keys(callsByDay).slice(0, 7);
  const avgCallsPerDay = recentDays.reduce((sum, day) => sum + callsByDay[day].total, 0) / recentDays.length;
  const avgLeadsPerDay = recentDays.reduce((sum, day) => sum + (leadsByDay[day]?.total || 0), 0) / recentDays.length;

  console.log('📞 CALL VOLUME (Last 30 Days)');
  console.log('═══════════════════════════════════════');
  console.log(`Total Calls:        ${totalCalls}`);
  console.log(`Answered:           ${answeredCalls} (${((answeredCalls/totalCalls)*100).toFixed(1)}%)`);
  console.log(`Avg/Day (last 7d):  ${avgCallsPerDay.toFixed(1)} calls/day`);
  console.log('');
  console.log('Attribution:');
  console.log(`  Google Ads:       ${callsBySource.google_ads} calls`);
  console.log(`  Organic:          ${callsBySource.organic} calls`);
  console.log(`  Direct/Other:     ${callsBySource.direct} calls`);
  console.log(`  Unknown:          ${callsBySource.unknown} calls`);
  console.log('');

  console.log('📝 LEAD VOLUME (Last 30 Days)');
  console.log('═══════════════════════════════════════');
  console.log(`Total Leads:        ${totalLeads}`);
  console.log(`Avg/Day (last 7d):  ${avgLeadsPerDay.toFixed(1)} leads/day`);
  console.log('');
  console.log('Attribution:');
  console.log(`  Google Ads:       ${leadsBySource.google_ads} leads`);
  console.log(`  Organic:          ${leadsBySource.organic} leads`);
  console.log(`  Direct/Other:     ${leadsBySource.direct} leads`);
  console.log(`  Unknown:          ${leadsBySource.unknown} leads`);
  console.log('');

  if (totalAdSpend > 0) {
    console.log('💰 GOOGLE ADS PERFORMANCE (Last 30 Days)');
    console.log('═══════════════════════════════════════');
    console.log(`Total Spend:        $${totalAdSpend.toFixed(2)}`);
    console.log(`Avg/Day:            $${(totalAdSpend/30).toFixed(2)}/day`);
    const paidCalls = callsBySource.google_ads;
    const paidLeads = leadsBySource.google_ads;
    const totalPaidConversions = paidCalls + paidLeads;
    console.log(`Total Conversions:  ${totalPaidConversions} (${paidCalls} calls + ${paidLeads} leads)`);
    if (totalPaidConversions > 0) {
      console.log(`Cost per Conv:      $${(totalAdSpend/totalPaidConversions).toFixed(2)}`);
    }
    console.log('');
  }

  console.log('📊 DAILY BREAKDOWN (Last 7 Days)');
  console.log('═══════════════════════════════════════');
  console.log('Date       | Calls | Leads | Total | Google Ads');
  console.log('-----------|-------|-------|-------|------------');

  recentDays.forEach(date => {
    const calls = callsByDay[date]?.total || 0;
    const leads = leadsByDay[date]?.total || 0;
    const total = calls + leads;
    const googleAds = (callsByDay[date]?.google_ads || 0) + (leadsByDay[date]?.google_ads || 0);
    console.log(`${date} |   ${calls.toString().padStart(2)}  |   ${leads.toString().padStart(2)}  |   ${total.toString().padStart(2)}  |     ${googleAds.toString().padStart(2)}`);
  });

  console.log('');
  console.log('🎯 TARGET vs ACTUAL');
  console.log('═══════════════════════════════════════');
  console.log(`Target:             20 calls/day`);
  console.log(`Actual (7d avg):    ${avgCallsPerDay.toFixed(1)} calls/day`);
  const gap = 20 - avgCallsPerDay;
  if (gap > 0) {
    console.log(`Gap:                -${gap.toFixed(1)} calls/day ⚠️`);
  } else {
    console.log(`Gap:                +${Math.abs(gap).toFixed(1)} calls/day ✅`);
  }
  console.log('');
  console.log(`Target:             15 paid calls/day @ $10/call`);
  const avgPaidCallsPerDay = recentDays.reduce((sum, day) => sum + (callsByDay[day]?.google_ads || 0), 0) / recentDays.length;
  console.log(`Actual (7d avg):    ${avgPaidCallsPerDay.toFixed(1)} paid calls/day`);
  if (totalAdSpend > 0 && callsBySource.google_ads > 0) {
    const actualCostPerCall = totalAdSpend / callsBySource.google_ads;
    console.log(`Cost per call:      $${actualCostPerCall.toFixed(2)}`);
  }
}

checkVolume().catch(console.error);

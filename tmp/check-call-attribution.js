#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttribution() {
  const { data: calls } = await supabase
    .from('ringcentral_calls')
    .select('call_id, from_number, start_time, ad_platform, utm_source, utm_medium, utm_campaign')
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false })
    .limit(20);

  console.log('Last 20 Inbound Calls - Attribution Status:\n');
  console.log('From Number       | Time       | ad_platform | utm_source | utm_medium | utm_campaign');
  console.log('------------------|------------|-------------|------------|------------|-------------');

  let withAttribution = 0;
  let withoutAttribution = 0;

  calls?.forEach(call => {
    const time = new Date(call.start_time).toLocaleString();
    const platform = call.ad_platform || 'NULL';
    const source = call.utm_source || 'NULL';
    const medium = call.utm_medium || 'NULL';
    const campaign = call.utm_campaign || 'NULL';

    console.log(
      `${call.from_number.padEnd(17)} | ${time.split(',')[0].padEnd(10)} | ${platform.padEnd(11)} | ${source.padEnd(10)} | ${medium.padEnd(10)} | ${campaign}`
    );

    if (call.ad_platform || call.utm_source) {
      withAttribution++;
    } else {
      withoutAttribution++;
    }
  });

  console.log('\n');
  console.log(`Calls WITH attribution:    ${withAttribution}/${calls?.length || 0}`);
  console.log(`Calls WITHOUT attribution: ${withoutAttribution}/${calls?.length || 0}`);

  if (withoutAttribution === calls?.length) {
    console.log('\n❌ ZERO calls have attribution data');
    console.log('This means you currently CANNOT track which Google Ads terms drive calls.');
  } else if (withAttribution > 0) {
    console.log('\n⚠️ Partial attribution - some calls tracked, most not');
  } else {
    console.log('\n✅ All calls have attribution');
  }
}

checkAttribution().catch(console.error);

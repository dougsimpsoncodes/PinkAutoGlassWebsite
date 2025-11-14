#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentCalls() {
  console.log('Checking recent RingCentral calls...\n');

  // Get the most recent 10 calls
  const { data: calls, error } = await supabase
    .from('ringcentral_calls')
    .select('call_id, direction, from_number, to_number, duration, start_time, result')
    .order('start_time', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error querying calls:', error);
    return;
  }

  if (!calls || calls.length === 0) {
    console.log('No calls found in database');
    return;
  }

  console.log(`Found ${calls.length} recent calls:\n`);
  calls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.direction} call`);
    console.log(`   ID: ${call.call_id}`);
    console.log(`   From: ${call.from_number}`);
    console.log(`   To: ${call.to_number}`);
    console.log(`   Duration: ${call.duration}s`);
    console.log(`   Time: ${call.start_time}`);
    console.log(`   Result: ${call.result}`);
    console.log('');
  });

  // Get call statistics
  const { data: stats, error: statsError } = await supabase
    .from('ringcentral_calls')
    .select('start_time')
    .order('start_time', { ascending: false });

  if (!statsError && stats) {
    const lastCallDate = new Date(stats[0].start_time);
    const now = new Date();
    const hoursSinceLastCall = (now - lastCallDate) / (1000 * 60 * 60);

    console.log(`\n📊 Statistics:`);
    console.log(`   Total calls in DB: ${stats.length}`);
    console.log(`   Last call: ${lastCallDate.toLocaleString()}`);
    console.log(`   Hours since last call: ${hoursSinceLastCall.toFixed(1)}`);
    console.log(`   Days since last call: ${(hoursSinceLastCall / 24).toFixed(1)}`);
  }
}

checkRecentCalls();

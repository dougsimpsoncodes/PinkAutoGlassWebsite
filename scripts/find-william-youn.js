#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findWilliamYoun() {
  console.log('Searching for William Youn calls...\n');

  // Search for calls with "William" or "Youn" in the name
  const { data: calls, error } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .or('from_name.ilike.%william%,to_name.ilike.%william%,from_name.ilike.%youn%,to_name.ilike.%youn%')
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error searching for calls:', error);
    return;
  }

  if (!calls || calls.length === 0) {
    console.log('No calls found for William Youn');
    return;
  }

  console.log(`Found ${calls.length} calls related to William Youn:\n`);
  calls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.direction} call`);
    console.log(`   From: ${call.from_name || 'Unknown'} (${call.from_number})`);
    console.log(`   To: ${call.to_name || 'Unknown'} (${call.to_number})`);
    console.log(`   Time: ${call.start_time}`);
    console.log(`   Duration: ${call.duration}s`);
    console.log(`   Result: ${call.result}`);
    console.log('');
  });

  // Also check for calls around November 7, 9:13 PM
  console.log('\n=== Calls around November 7, 9:13 PM ===\n');
  const { data: nov7calls, error: nov7error } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', '2025-11-07T20:00:00')
    .lte('start_time', '2025-11-07T22:30:00')
    .order('start_time', { ascending: false });

  if (!nov7error && nov7calls) {
    nov7calls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.direction} call`);
      console.log(`   From: ${call.from_name || 'Unknown'} (${call.from_number})`);
      console.log(`   To: ${call.to_name || 'Unknown'} (${call.to_number})`);
      console.log(`   Time: ${call.start_time}`);
      console.log(`   Duration: ${call.duration}s`);
      console.log(`   Result: ${call.result}`);
      console.log('');
    });
  }
}

findWilliamYoun();

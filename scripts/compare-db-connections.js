#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('Comparing database connections...\n');

// Check environment variables
console.log('Environment variables:');
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...`);
console.log('');

// Create client (same way the API does)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function compareConnections() {
  // Query 1: What the API route does
  console.log('1. Querying with API route method (limit 1000, order by start_time desc):');
  const { data: apiStyleData, error: apiError, count: apiCount } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact' })
    .order('start_time', { ascending: false })
    .range(0, 999);

  if (apiError) {
    console.error('  Error:', apiError);
  } else {
    console.log(`  Total count: ${apiCount}`);
    console.log(`  Rows returned: ${apiStyleData.length}`);
    if (apiStyleData.length > 0) {
      console.log(`  Most recent: ${apiStyleData[0].start_time} | ${apiStyleData[0].direction}`);
      console.log(`  Oldest: ${apiStyleData[apiStyleData.length - 1].start_time}`);
    }
  }

  // Query 2: Direct simple query
  console.log('\n2. Simple query (select *, order by start_time desc, limit 10):');
  const { data: simpleData, error: simpleError } = await supabase
    .from('ringcentral_calls')
    .select('start_time, direction, result')
    .order('start_time', { ascending: false })
    .limit(10);

  if (simpleError) {
    console.error('  Error:', simpleError);
  } else {
    console.log(`  Rows returned: ${simpleData.length}`);
    simpleData.forEach((call, i) => {
      console.log(`  ${i + 1}. ${call.start_time} | ${call.direction} | ${call.result}`);
    });
  }

  // Query 3: Total count
  console.log('\n3. Total count query:');
  const { count: totalCount, error: countError } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('  Error:', countError);
  } else {
    console.log(`  Total rows: ${totalCount}`);
  }

  // Query 4: Check for Nov 12 calls
  console.log('\n4. Checking for Nov 12, 2025 calls:');
  const { data: nov12Data, error: nov12Error, count: nov12Count } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact' })
    .gte('start_time', '2025-11-12T00:00:00Z')
    .lte('start_time', '2025-11-12T23:59:59Z');

  if (nov12Error) {
    console.error('  Error:', nov12Error);
  } else {
    console.log(`  Nov 12 calls found: ${nov12Count}`);
    if (nov12Data && nov12Data.length > 0) {
      nov12Data.slice(0, 5).forEach((call, i) => {
        console.log(`  ${i + 1}. ${call.start_time} | ${call.direction} | ${call.result}`);
      });
    }
  }
}

compareConnections();

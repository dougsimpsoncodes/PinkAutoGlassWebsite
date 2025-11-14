#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSPolicies() {
  console.log('Checking RLS policies on ringcentral_calls table...\n');

  // Query the pg_policies table to see RLS policies
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'ringcentral_calls';
    `
  });

  if (error) {
    console.log('Could not query pg_policies (expected - need custom function)');
    console.log('Checking RLS status via Supabase client...\n');

    // Try to query with and without service role
    console.log('1. Testing direct query (should bypass RLS with service role):');
    const { data: calls1, error: error1, count } = await supabase
      .from('ringcentral_calls')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log(`   Total rows: ${count}`);
    console.log(`   Rows returned: ${calls1?.length || 0}`);
    if (calls1 && calls1.length > 0) {
      console.log(`   Most recent: ${calls1[0].start_time}`);
    }
  } else {
    console.log('RLS Policies found:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkRLSPolicies();

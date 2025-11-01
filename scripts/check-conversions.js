#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('\n📊 Checking Analytics Data...\n');

  // Check conversion_events
  const { data: conversions, error: convError } = await supabase
    .from('conversion_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('🔄 Conversion Events:');
  if (convError) {
    console.log('  ❌ Error:', convError.message);
  } else if (!conversions || conversions.length === 0) {
    console.log('  ⚠️  No conversions found');
  } else {
    console.log(`  ✅ Found ${conversions.length} conversions`);
    conversions.forEach((c, i) => {
      console.log(`     ${i + 1}. ${c.event_type} - ${c.button_location || c.page_path} (${new Date(c.created_at).toLocaleString()})`);
    });
  }

  // Check page_views
  const { count: pageViewsCount, error: pvError } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true });

  console.log('\n📄 Page Views:');
  if (pvError) {
    console.log('  ❌ Error:', pvError.message);
  } else {
    console.log(`  ✅ Total: ${pageViewsCount || 0}`);
  }

  // Check user_sessions
  const { count: sessionsCount, error: sessError } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true });

  console.log('\n👥 User Sessions:');
  if (sessError) {
    console.log('  ❌ Error:', sessError.message);
  } else {
    console.log(`  ✅ Total: ${sessionsCount || 0}`);
  }

  console.log('');
}

checkData();

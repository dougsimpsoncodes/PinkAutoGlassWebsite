#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service key present:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('\nChecking for analytics tables...\n');

  const tables = ['page_views', 'user_sessions', 'conversion_events', 'analytics_events', 'admin_users'];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Does not exist or not accessible (${error.message})`);
      } else {
        console.log(`✓ ${table}: Exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }

  console.log('\nChecking existing tables...\n');

  // Try to get leads table as a baseline
  try {
    const { data, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ leads: ${error.message}`);
    } else {
      console.log(`✓ leads: Exists (${count || 0} rows)`);
    }
  } catch (err) {
    console.log(`❌ leads: ${err.message}`);
  }
}

checkTables();

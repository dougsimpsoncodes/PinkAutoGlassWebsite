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

async function createTables() {
  console.log('Creating vehicle tables...');

  // Read the migration SQL
  const sql = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/20251017_create_vehicle_tables.sql'),
    'utf8'
  );

  console.log('\n⚠️  Direct SQL execution not supported via Supabase client.');
  console.log('Please run this SQL in Supabase SQL Editor:');
  console.log('\n' + '='.repeat(80));
  console.log(sql);
  console.log('='.repeat(80) + '\n');
  console.log('OR copy the SQL file and paste it into:');
  console.log(`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL.split('.')[0].replace('https://', '')}/sql/new`);
}

createTables().catch(console.error);

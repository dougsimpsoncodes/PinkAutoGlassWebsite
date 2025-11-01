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

async function createTable() {
  console.log('Creating google_ads_recommendations table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS google_ads_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        category TEXT NOT NULL,
        priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        search_term TEXT,
        current_metrics JSONB,
        expected_impact TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'archived')),
        assigned_to TEXT,
        completed_at TIMESTAMPTZ,
        completed_by TEXT,
        implemented_action TEXT,
        results_after JSONB,
        notes TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_recommendations_status ON google_ads_recommendations(status);
      CREATE INDEX IF NOT EXISTS idx_recommendations_category ON google_ads_recommendations(category);
      CREATE INDEX IF NOT EXISTS idx_recommendations_created ON google_ads_recommendations(created_at DESC);
    `
  });

  if (error) {
    // Try alternative approach - using raw SQL
    console.log('Trying direct SQL execution...');

    const sql = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/20251028_google_ads_recommendations.sql'),
      'utf8'
    );

    console.log('Table schema ready. Please run this SQL in Supabase SQL Editor:');
    console.log('\n' + sql);
    console.log('\nOr the APIs will create it automatically on first use.');
    return;
  }

  console.log('✅ Table created successfully!');
}

createTable().catch(console.error);

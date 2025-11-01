#!/usr/bin/env node

const { Client } = require('pg');
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

const projectId = 'fypzafbsfrrlrrufzkol';
const password = 'wkmVo57zZET5JHOV';

// Try different connection string formats
const connectionStrings = [
  // Direct connection
  `postgresql://postgres:${password}@db.${projectId}.supabase.co:5432/postgres`,
  // Pooler with session mode
  `postgresql://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true`,
  // Original pooler
  `postgresql://postgres.${projectId}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  // Direct with project ref
  `postgresql://postgres.${projectId}:${password}@db.${projectId}.supabase.co:5432/postgres`,
];

async function tryConnection(connString, index) {
  console.log(`\nAttempt ${index + 1}/${connectionStrings.length}:`);
  console.log(`Connection string: ${connString.replace(password, '***')}`);

  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('✓ Connected successfully!');

    // Test query
    const result = await client.query('SELECT current_database(), current_user');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('page_views', 'user_sessions', 'conversion_events', 'analytics_events', 'admin_users', 'leads')
    `);

    console.log('Existing tables:', tablesResult.rows.map(r => r.table_name).join(', ') || 'none');

    await client.end();
    return connString;
  } catch (error) {
    console.log('✗ Failed:', error.message);
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

async function main() {
  console.log('Testing database connections...');

  for (let i = 0; i < connectionStrings.length; i++) {
    const working = await tryConnection(connectionStrings[i], i);
    if (working) {
      console.log('\n=================================');
      console.log('WORKING CONNECTION STRING FOUND:');
      console.log(working.replace(password, '***'));
      console.log('=================================\n');

      // Now run the migration
      console.log('Reading migration file...');
      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251027_create_analytics_tables.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');

      const client = new Client({
        connectionString: working,
        ssl: { rejectUnauthorized: false },
      });

      try {
        await client.connect();
        console.log('Running migration...');
        await client.query(sql);
        console.log('✓ Migration completed successfully!');

        // Verify tables
        const result = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('page_views', 'user_sessions', 'conversion_events', 'analytics_events', 'admin_users')
        `);

        console.log('\nTables created:');
        result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

        await client.end();
        return;
      } catch (error) {
        console.error('Migration failed:', error.message);
        await client.end();
        return;
      }
    }
  }

  console.log('\n✗ Could not find working connection string');
  console.log('\nPlease run the migration manually in Supabase Dashboard:');
  console.log('1. Go to https://supabase.com/dashboard/project/' + projectId);
  console.log('2. Click on "SQL Editor"');
  console.log('3. Paste the contents of: supabase/migrations/20251027_create_analytics_tables.sql');
  console.log('4. Click "Run"');
}

main().catch(console.error);

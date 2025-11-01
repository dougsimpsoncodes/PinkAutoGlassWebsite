#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment');
  process.exit(1);
}

console.log('Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251027_create_analytics_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    console.log('Migration file size:', sql.length, 'characters');

    // Split SQL into individual statements (rough split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement using raw SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 200) + '...');

          // Continue with other statements even if one fails
          continue;
        }

        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`Exception in statement ${i + 1}:`, err.message);
      }
    }

    console.log('\n✓ Migration process completed');

    // Verify tables were created
    console.log('\nVerifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .in('tablename', ['page_views', 'user_sessions', 'conversion_events', 'analytics_events', 'admin_users']);

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Tables found:', tables?.map(t => t.tablename).join(', '));
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

#!/usr/bin/env node

/**
 * Database Assessment Script
 * Analyzes both Supabase instances to determine which to keep
 */

const { createClient } = require('@supabase/supabase-js');

// Production database (Auto Glass Staging)
const PROD_URL = 'https://fypzafbsfrrlrrufzkol.supabase.co';
const PROD_KEY = 'REDACTED_SECRET_REMOVED_FROM_HISTORY';

// Other database (Pink Auto Glass Website)
const OTHER_URL = process.env.OTHER_SUPABASE_URL || 'https://jhbhwusdqdcdpvgucvsr.supabase.co';
const OTHER_KEY = process.env.OTHER_SUPABASE_KEY || null;

const CRITICAL_TABLES = [
  'leads',
  'user_sessions',
  'analytics_events',
  'conversion_events',
  'ringcentral_calls',
  'admin_users',
  'vehicle_makes',
  'vehicle_models',
];

async function assessDatabase(name, url, serviceKey) {
  if (!serviceKey) {
    console.log(`\n❌ ${name}: No service key provided - skipping\n`);
    return null;
  }

  console.log(`\n📊 Assessing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('─'.repeat(80));

  const client = createClient(url, serviceKey);
  const results = {
    name,
    url,
    tables: {},
    totalRows: 0,
    hasData: false,
  };

  for (const table of CRITICAL_TABLES) {
    try {
      // Get count
      const { count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.tables[table] = { exists: false, error: error.message };
      } else {
        results.tables[table] = {
          exists: true,
          rows: count || 0,
        };
        results.totalRows += count || 0;
        if (count > 0) results.hasData = true;
      }
    } catch (err) {
      results.tables[table] = { exists: false, error: err.message };
    }
  }

  // Print results
  console.log('\nTable Analysis:');
  console.log('┌─────────────────────────┬────────┬────────────┐');
  console.log('│ Table                   │ Exists │ Row Count  │');
  console.log('├─────────────────────────┼────────┼────────────┤');

  for (const table of CRITICAL_TABLES) {
    const data = results.tables[table];
    const exists = data.exists ? '✅' : '❌';
    const rows = data.exists ? (data.rows || 0).toLocaleString().padStart(10) : 'N/A'.padStart(10);
    const tableName = table.padEnd(23);
    console.log(`│ ${tableName} │   ${exists}   │ ${rows} │`);
  }

  console.log('└─────────────────────────┴────────┴────────────┘');
  console.log(`\nTotal Rows: ${results.totalRows.toLocaleString()}`);
  console.log(`Has Data: ${results.hasData ? '✅ YES' : '❌ NO (Empty database)'}`);

  return results;
}

async function compareAndRecommend(prod, other) {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('  ASSESSMENT SUMMARY & RECOMMENDATIONS');
  console.log('═'.repeat(80));

  console.log(`\n📊 ${prod.name}:`);
  console.log(`   Total Rows: ${prod.totalRows.toLocaleString()}`);
  console.log(`   Has Data: ${prod.hasData ? '✅ YES' : '❌ NO'}`);
  console.log(`   Status: ✅ ACTIVE (Connected to .env.local)`);

  if (other) {
    console.log(`\n📊 ${other.name}:`);
    console.log(`   Total Rows: ${other.totalRows.toLocaleString()}`);
    console.log(`   Has Data: ${other.hasData ? '✅ YES' : '❌ NO'}`);
    console.log(`   Status: ❓ UNUSED (Not in .env.local)`);
  }

  console.log('\n' + '─'.repeat(80));
  console.log('  RECOMMENDATION:');
  console.log('─'.repeat(80));

  if (!other) {
    console.log('\n⚠️  Cannot assess "Pink Auto Glass Website" - need service role key');
    console.log('\nTo complete assessment:');
    console.log('1. Go to Supabase Dashboard → Pink Auto Glass Website → Settings → API');
    console.log('2. Copy the "service_role" key');
    console.log('3. Run: OTHER_SUPABASE_KEY="your-key-here" node scripts/assess-databases.js');
    return;
  }

  if (!other.hasData) {
    console.log('\n✅ SAFE TO DELETE: "Pink Auto Glass Website"');
    console.log('\nReasons:');
    console.log('  • Database is empty (0 rows across all tables)');
    console.log('  • Not connected to production code');
    console.log('  • No customer data to lose');
    console.log('\n💡 Action: Delete this project to save costs and reduce confusion');
  } else if (other.totalRows < prod.totalRows / 10) {
    console.log('\n⚠️  "Pink Auto Glass Website" has SOME data but much less than production');
    console.log(`\n   Production: ${prod.totalRows.toLocaleString()} rows`);
    console.log(`   Other: ${other.totalRows.toLocaleString()} rows`);
    console.log('\n💡 Recommendation:');
    console.log('  1. Review what data exists (likely old test data)');
    console.log('  2. Export if needed for historical reference');
    console.log('  3. Delete to avoid confusion');
  } else {
    console.log('\n🚨 WARNING: "Pink Auto Glass Website" has significant data!');
    console.log(`\n   Production: ${prod.totalRows.toLocaleString()} rows`);
    console.log(`   Other: ${other.totalRows.toLocaleString()} rows`);
    console.log('\n💡 Action Required:');
    console.log('  1. ❌ DO NOT DELETE without investigation');
    console.log('  2. Review table contents to understand what this data is');
    console.log('  3. Determine if this was an old production database');
    console.log('  4. Consider migrating important data before deletion');
  }

  console.log('\n' + '═'.repeat(80));
}

async function main() {
  console.log('🔍 Starting Database Assessment...\n');

  const prod = await assessDatabase(
    'Auto Glass Staging (PRODUCTION)',
    PROD_URL,
    PROD_KEY
  );

  const other = await assessDatabase(
    'Pink Auto Glass Website (UNKNOWN)',
    OTHER_URL,
    OTHER_KEY
  );

  await compareAndRecommend(prod, other);
}

main().catch(console.error);

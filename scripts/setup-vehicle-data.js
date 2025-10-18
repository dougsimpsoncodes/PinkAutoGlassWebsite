/**
 * Setup vehicle data: Apply migration and populate database
 * Run with: node scripts/setup-vehicle-data.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local manually
const envPath = './.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('📋 Checking vehicle tables...\n');

  // Check if tables exist by trying to query them
  await createTablesDirectly();
}

async function createTablesDirectly() {
  console.log('Creating vehicle_makes table...');

  // Note: Supabase JS client doesn't support raw DDL
  // We'll check if tables exist by trying to query them
  const { error: makesError } = await supabase
    .from('vehicle_makes')
    .select('id')
    .limit(1);

  if (makesError && makesError.code === '42P01') {
    console.log('❌ Tables do not exist. Please run the migration manually:');
    console.log('   psql <your-db-url> -f supabase/migrations/20251017_create_vehicle_tables.sql');
    console.log('\nOr use the Supabase dashboard to execute the SQL from:');
    console.log('   supabase/migrations/20251017_create_vehicle_tables.sql');
    process.exit(1);
  }

  console.log('✓ Tables already exist or accessible\n');
}

async function populateVehicleData() {
  console.log('🚗 Populating vehicle make/model data...\n');

  // Load curated vehicle data
  const vehicleData = JSON.parse(
    fs.readFileSync('./vehicle-data-curated.json', 'utf8')
  );

  let totalMakesInserted = 0;
  let totalModelsInserted = 0;
  let errors = 0;

  for (const makeData of vehicleData.makes) {
    const { make, models } = makeData;

    console.log(`[${totalMakesInserted + 1}/${vehicleData.makes.length}] Processing: ${make}`);

    // Insert the make
    const { data: makeRecord, error: makeError } = await supabase
      .from('vehicle_makes')
      .upsert({ make }, { onConflict: 'make' })
      .select('id')
      .single();

    if (makeError) {
      console.error(`  ✗ Error inserting ${make}:`, makeError.message);
      errors++;
      continue;
    }

    totalMakesInserted++;

    // Insert all models for this make
    const modelRecords = models.map(model => ({
      make_id: makeRecord.id,
      model
    }));

    const { error: modelsError } = await supabase
      .from('vehicle_models')
      .upsert(modelRecords, { onConflict: 'make_id,model' });

    if (modelsError) {
      console.error(`  ✗ Error inserting models for ${make}:`, modelsError.message);
      errors++;
      continue;
    }

    totalModelsInserted += models.length;
    console.log(`  ✓ Inserted ${models.length} models`);
  }

  console.log('\n✅ Vehicle data population complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Makes: ${totalMakesInserted}`);
  console.log(`   Models: ${totalModelsInserted}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

async function main() {
  console.log('🔧 Vehicle Data Setup\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await runMigration();
  await populateVehicleData();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

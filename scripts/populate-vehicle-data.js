/**
 * Populate Supabase with curated vehicle make/model data
 * Run with: node scripts/populate-vehicle-data.js
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateVehicleData() {
  console.log('🚗 Populating vehicle make/model data...\n');

  // Load curated vehicle data
  const vehicleData = JSON.parse(
    fs.readFileSync('./vehicle-data-curated.json', 'utf8')
  );

  let totalMakesInserted = 0;
  let totalModelsInserted = 0;

  for (const makeData of vehicleData.makes) {
    const { make, models } = makeData;

    console.log(`Processing: ${make}`);

    // Insert the make
    const { data: makeRecord, error: makeError } = await supabase
      .from('vehicle_makes')
      .upsert({ make }, { onConflict: 'make' })
      .select('id')
      .single();

    if (makeError) {
      console.error(`  ✗ Error inserting ${make}:`, makeError.message);
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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

populateVehicleData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

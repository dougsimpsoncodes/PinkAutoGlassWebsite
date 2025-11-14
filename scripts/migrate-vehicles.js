const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read production env
const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\n]+)"?/)[1].trim();
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Connected to:', supabaseUrl);
console.log('');

async function migrate() {
  try {
    // Phase 1: Check if tables exist
    console.log('Phase 1: Verifying table structure...');
    const { data: makes, error: makesError } = await supabase
      .from('vehicle_makes')
      .select('count')
      .limit(1);

    const { data: models, error: modelsError } = await supabase
      .from('vehicle_models')
      .select('count')
      .limit(1);

    if (makesError || modelsError) {
      console.error('❌ Tables do not exist or are not accessible');
      console.error('Makes error:', makesError);
      console.error('Models error:', modelsError);
      return;
    }
    console.log('✅ Tables exist and are accessible\n');

    // Phase 2: Read CSV files
    console.log('Phase 2: Reading backup CSV files...');
    const backupDir = '/tmp/database-backups';
    const makesCSV = fs.readFileSync(path.join(backupDir, 'vehicle_makes_backup.csv'), 'utf8');
    const modelsCSV = fs.readFileSync(path.join(backupDir, 'vehicle_models_backup.csv'), 'utf8');

    // Parse CSV
    const makeLines = makesCSV.split('\n').filter(l => l.trim());
    const modelLines = modelsCSV.split('\n').filter(l => l.trim());

    const makeHeaders = makeLines[0].split(',');
    const modelHeaders = modelLines[0].split(',');

    console.log(`✅ Found ${makeLines.length - 1} makes in backup`);
    console.log(`✅ Found ${modelLines.length - 1} models in backup\n`);

    // Phase 3: Insert vehicle makes
    console.log('Phase 3: Inserting vehicle makes...');
    let makesInserted = 0;
    let makesSkipped = 0;

    for (let i = 1; i < makeLines.length; i++) {
      const line = makeLines[i];
      if (!line.trim()) continue;

      const values = line.split(',');
      const makeData = {
        id: parseInt(values[0]),
        make: values[1],
        created_at: values[2]
      };

      const { error } = await supabase
        .from('vehicle_makes')
        .upsert(makeData, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.log(`   ⚠️  Skipped: ${makeData.make} (${error.message})`);
        makesSkipped++;
      } else {
        makesInserted++;
      }
    }

    console.log(`✅ Inserted ${makesInserted} makes`);
    if (makesSkipped > 0) console.log(`   Skipped ${makesSkipped} (already exist)`);
    console.log('');

    // Phase 4: Insert vehicle models
    console.log('Phase 4: Inserting vehicle models...');
    let modelsInserted = 0;
    let modelsSkipped = 0;

    for (let i = 1; i < modelLines.length; i++) {
      const line = modelLines[i];
      if (!line.trim()) continue;

      const values = line.split(',');
      const modelData = {
        id: parseInt(values[0]),
        make_id: parseInt(values[1]),
        model: values[2],
        created_at: values[3]
      };

      const { error } = await supabase
        .from('vehicle_models')
        .upsert(modelData, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        modelsSkipped++;
      } else {
        modelsInserted++;
      }

      // Progress indicator
      if (i % 100 === 0) {
        process.stdout.write(`   Progress: ${i}/${modelLines.length - 1}\r`);
      }
    }

    console.log(`✅ Inserted ${modelsInserted} models`);
    if (modelsSkipped > 0) console.log(`   Skipped ${modelsSkipped} (already exist)`);
    console.log('');

    // Phase 5: Verify counts
    console.log('Phase 5: Verifying final counts...');
    const { count: finalMakes } = await supabase
      .from('vehicle_makes')
      .select('*', { count: 'exact', head: true });

    const { count: finalModels } = await supabase
      .from('vehicle_models')
      .select('*', { count: 'exact', head: true });

    console.log(`   Vehicle Makes: ${finalMakes}`);
    console.log(`   Vehicle Models: ${finalModels}`);
    console.log('');

    if (finalMakes === 40 && finalModels === 594) {
      console.log('🎉 Migration completed successfully!');
      console.log('   All 40 makes and 594 models are now in production.\n');
      return true;
    } else {
      console.log('⚠️  Warning: Counts do not match expected values');
      console.log(`   Expected: 40 makes, 594 models`);
      console.log(`   Got: ${finalMakes} makes, ${finalModels} models\n`);
      return false;
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    return false;
  }
}

migrate().then(success => {
  process.exit(success ? 0 : 1);
});

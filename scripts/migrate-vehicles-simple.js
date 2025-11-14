#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// Read admin credentials
const envContent = fs.readFileSync('.env.production', 'utf8');
const username = envContent.match(/ADMIN_USERNAME="?([^"\n]+)"?/)[1].trim();
const password = envContent.match(/ADMIN_PASSWORD="?([^"\n]+)"?/)[1].trim();
const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

console.log('🚀 Vehicle Data Migration');
console.log('========================\n');

// Read CSV files
const backupDir = '/tmp/database-backups';
const makesCSV = fs.readFileSync(`${backupDir}/vehicle_makes_backup.csv`, 'utf8');
const modelsCSV = fs.readFileSync(`${backupDir}/vehicle_models_backup.csv`, 'utf8');

// Parse CSV
const makeLines = makesCSV.trim().split('\n');
const modelLines = modelsCSV.trim().split('\n');

console.log(`📊 Data to migrate:`);
console.log(`   ${makeLines.length - 1} vehicle makes`);
console.log(`   ${modelLines.length - 1} vehicle models\n`);

// Create API endpoint request to do the migration
const migrationData = {
  makes: [],
  models: []
};

// Parse makes (skip header)
for (let i = 1; i < makeLines.length; i++) {
  const line = makeLines[i].trim();
  if (!line) continue;

  const [id, make, created_at] = line.split(',');
  migrationData.makes.push({
    id: parseInt(id),
    make: make,
    created_at: created_at
  });
}

// Parse models (skip header)
for (let i = 1; i < modelLines.length; i++) {
  const line = modelLines[i].trim();
  if (!line) continue;

  const [id, make_id, model, created_at] = line.split(',');
  migrationData.models.push({
    id: parseInt(id),
    make_id: parseInt(make_id),
    model: model,
    created_at: created_at
  });
}

console.log(`✅ Parsed ${migrationData.makes.length} makes and ${migrationData.models.length} models`);
console.log(`\nℹ️  This will use the admin API to insert data via Supabase service role.\n`);

// Create migration endpoint
const postData = JSON.stringify(migrationData);

const options = {
  hostname: 'pinkautoglass.com',
  path: '/api/admin/migrate-vehicles',
  method: 'POST',
  headers: {
    'Authorization': auth,
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('📤 Sending migration request to production...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);

      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Migration completed successfully!\n');
        console.log('📊 Results:');
        console.log(`   Makes inserted: ${result.makesInserted || result.makes || 'unknown'}`);
        console.log(`   Models inserted: ${result.modelsInserted || result.models || 'unknown'}`);
        console.log('\n🎉 Vehicle data is now available in production!\n');
      } else {
        console.log('❌ Migration failed:');
        console.log(result);
      }
    } catch (err) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();

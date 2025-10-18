/**
 * Generate SQL INSERT statements for vehicle data
 * Output can be run directly in Supabase SQL Editor
 */

const fs = require('fs');

// Load curated vehicle data
const vehicleData = JSON.parse(
  fs.readFileSync('./vehicle-data-curated.json', 'utf8')
);

console.log('-- Insert vehicle makes and models');
console.log('-- Generated from vehicle-data-curated.json\n');
console.log('BEGIN;\n');

let makeId = 1;

for (const makeData of vehicleData.makes) {
  const { make, models } = makeData;

  // Escape single quotes in make name
  const escapedMake = make.replace(/'/g, "''");

  console.log(`-- ${make}`);
  console.log(`INSERT INTO public.vehicle_makes (id, make) VALUES (${makeId}, '${escapedMake}') ON CONFLICT (make) DO NOTHING;`);

  // Insert models for this make
  for (const model of models) {
    const escapedModel = model.replace(/'/g, "''");
    console.log(`INSERT INTO public.vehicle_models (make_id, model) VALUES (${makeId}, '${escapedModel}') ON CONFLICT (make_id, model) DO NOTHING;`);
  }

  console.log('');
  makeId++;
}

console.log('COMMIT;');
console.log(`\n-- Total: ${vehicleData.makes.length} makes, ${vehicleData.makes.reduce((sum, m) => sum + m.models.length, 0)} models`);

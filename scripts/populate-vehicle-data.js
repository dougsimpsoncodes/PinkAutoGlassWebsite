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

// Popular vehicle makes and their common models
const vehicleData = {
  'Acura': ['ILX', 'Integra', 'MDX', 'RDX', 'TLX', 'NSX'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i4', 'iX'],
  'Buick': ['Enclave', 'Encore', 'Envision'],
  'Cadillac': ['CT4', 'CT5', 'Escalade', 'XT4', 'XT5', 'XT6', 'Lyriq'],
  'Chevrolet': ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado 1500', 'Silverado 2500HD', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Trax'],
  'Chrysler': ['300', 'Pacifica'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Grand Caravan', 'Hornet', 'Ram 1500', 'Ram 2500', 'Ram 3500'],
  'Ford': ['Bronco', 'Bronco Sport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-250', 'F-350', 'Maverick', 'Mustang', 'Ranger', 'Transit'],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  'GMC': ['Acadia', 'Canyon', 'Sierra 1500', 'Sierra 2500HD', 'Terrain', 'Yukon'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai': ['Elantra', 'Ioniq 5', 'Ioniq 6', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'],
  'Infiniti': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Wagoneer', 'Renegade', 'Wagoneer', 'Wrangler'],
  'Kia': ['Carnival', 'EV6', 'Forte', 'K5', 'Niro', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Lexus': ['ES', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'TX', 'UX'],
  'Lincoln': ['Aviator', 'Corsair', 'Navigator', 'Nautilus'],
  'Mazda': ['CX-5', 'CX-50', 'CX-9', 'CX-90', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQS'],
  'Mitsubishi': ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander Sport'],
  'Nissan': ['Altima', 'Armada', 'Frontier', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
  'Ram': ['1500', '2500', '3500', 'ProMaster'],
  'Subaru': ['Ascent', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Toyota': ['4Runner', 'bZ4X', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'GR86', 'GR Supra', 'Grand Highlander', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza'],
  'Volkswagen': ['Arteon', 'Atlas', 'Atlas Cross Sport', 'ID.4', 'Jetta', 'Passat', 'Taos', 'Tiguan'],
  'Volvo': ['C40 Recharge', 'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  'Other': ['Other']
};

async function populateVehicles() {
  console.log('🚗 Populating vehicle data...\n');

  let totalMakes = 0;
  let totalModels = 0;

  for (const [make, models] of Object.entries(vehicleData)) {
    console.log(`Adding ${make}...`);

    // Insert make
    const { data: makeData, error: makeError } = await supabase
      .from('vehicle_makes')
      .insert({ make })
      .select()
      .single();

    if (makeError) {
      console.error(`  ❌ Error adding ${make}:`, makeError.message);
      continue;
    }

    totalMakes++;

    // Insert models for this make
    const modelInserts = models.map(model => ({
      make_id: makeData.id,
      model
    }));

    const { error: modelsError } = await supabase
      .from('vehicle_models')
      .insert(modelInserts);

    if (modelsError) {
      console.error(`  ❌ Error adding models for ${make}:`, modelsError.message);
    } else {
      totalModels += models.length;
      console.log(`  ✅ Added ${models.length} models`);
    }
  }

  console.log('\n✅ Vehicle data population complete!');
  console.log(`📊 Total: ${totalMakes} makes, ${totalModels} models\n`);
}

populateVehicles().catch(console.error);

/**
 * NHTSA Vehicle Data Fetcher
 * Fetches all passenger car makes and models for model years 2005-2024
 *
 * Output: JSON file with structured vehicle data ready for database import
 */

const fs = require('fs');
const https = require('https');

const CURRENT_YEAR = 2024;
const YEARS_BACK = 20;
const START_YEAR = CURRENT_YEAR - YEARS_BACK + 1; // 2005
const END_YEAR = CURRENT_YEAR; // 2024

// API endpoints
const MAKES_API = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json';
const MODELS_API = (make, year) =>
  `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Add delay between requests to be respectful to API
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to fetch all vehicle data
 */
async function fetchVehicleData() {
  console.log('🚗 Fetching NHTSA Vehicle Data');
  console.log(`📅 Model Years: ${START_YEAR}-${END_YEAR}`);
  console.log('');

  // Step 1: Get all passenger car makes
  console.log('Step 1: Fetching all passenger car makes...');
  const makesResponse = await fetchJSON(MAKES_API);
  const makes = makesResponse.Results;
  console.log(`✓ Found ${makes.length} vehicle makes`);
  console.log('');

  // Step 2: For each make, get models across all years
  console.log('Step 2: Fetching models for each make...');
  const vehicleData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'NHTSA vPIC API',
      modelYearRange: `${START_YEAR}-${END_YEAR}`,
      totalMakes: makes.length,
      yearsIncluded: END_YEAR - START_YEAR + 1
    },
    makes: []
  };

  let processedMakes = 0;
  let totalModels = 0;

  for (const make of makes) {
    processedMakes++;
    const makeName = make.MakeName;

    console.log(`[${processedMakes}/${makes.length}] Processing: ${makeName}`);

    const makeData = {
      makeId: make.MakeId,
      makeName: makeName,
      models: new Set() // Use Set to avoid duplicates
    };

    // Fetch models for each year
    for (let year = START_YEAR; year <= END_YEAR; year++) {
      try {
        await delay(50); // 50ms delay between requests

        const modelsResponse = await fetchJSON(MODELS_API(makeName, year));
        const models = modelsResponse.Results || [];

        // Add each model to the set
        models.forEach(model => {
          if (model.Model_Name) {
            makeData.models.add(model.Model_Name);
          }
        });
      } catch (error) {
        console.error(`  ⚠ Error fetching ${makeName} ${year}:`, error.message);
      }
    }

    // Convert Set to sorted array
    makeData.models = Array.from(makeData.models).sort();

    // Only include makes that have models
    if (makeData.models.length > 0) {
      totalModels += makeData.models.length;
      vehicleData.makes.push(makeData);
      console.log(`  ✓ ${makeData.models.length} unique models found`);
    } else {
      console.log(`  ⊘ No models found - skipping`);
    }
  }

  // Update metadata
  vehicleData.metadata.totalMakes = vehicleData.makes.length;
  vehicleData.metadata.totalModels = totalModels;

  // Step 3: Save to file
  console.log('');
  console.log('Step 3: Saving data...');

  const outputPath = './nhtsa-vehicle-data.json';
  fs.writeFileSync(outputPath, JSON.stringify(vehicleData, null, 2));

  console.log('');
  console.log('✅ Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Vehicle Makes: ${vehicleData.makes.length}`);
  console.log(`   Total Models: ${totalModels}`);
  console.log(`   Model Years: ${START_YEAR}-${END_YEAR} (${END_YEAR - START_YEAR + 1} years)`);
  console.log(`   Output File: ${outputPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run the script
fetchVehicleData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

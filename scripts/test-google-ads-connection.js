/**
 * Test Google Ads API Connection
 * Verifies that all credentials are configured correctly
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Import Google Ads functions
import { testConnection, validateGoogleAdsConfig } from '../src/lib/googleAds.ts';

async function main() {
  console.log('\n🔍 Google Ads API Connection Test\n');
  console.log('='.repeat(50));

  // Step 1: Validate configuration
  console.log('\n📋 Step 1: Validating configuration...\n');
  const config = validateGoogleAdsConfig();

  if (!config.isValid) {
    console.error('❌ Missing required credentials:');
    config.missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  console.log('✅ All required credentials are configured');
  console.log(`   - GOOGLE_ADS_CLIENT_ID: ${process.env.GOOGLE_ADS_CLIENT_ID?.substring(0, 20)}...`);
  console.log(`   - GOOGLE_ADS_CLIENT_SECRET: ${process.env.GOOGLE_ADS_CLIENT_SECRET?.substring(0, 10)}...`);
  console.log(`   - GOOGLE_ADS_DEVELOPER_TOKEN: ${process.env.GOOGLE_ADS_DEVELOPER_TOKEN}`);
  console.log(`   - GOOGLE_ADS_CUSTOMER_ID: ${process.env.GOOGLE_ADS_CUSTOMER_ID}`);
  console.log(`   - GOOGLE_ADS_REFRESH_TOKEN: ${process.env.GOOGLE_ADS_REFRESH_TOKEN?.substring(0, 20)}...`);

  // Step 2: Test connection
  console.log('\n📡 Step 2: Testing API connection...\n');

  try {
    const result = await testConnection();

    if (result.success) {
      console.log('✅ SUCCESS! Connected to Google Ads API');
      console.log(`   - Customer ID: ${result.customerId}`);
      console.log(`   - Customer Name: ${result.customerName}`);
      console.log('\n' + '='.repeat(50));
      console.log('\n🎉 Google Ads API is ready to use!\n');
      process.exit(0);
    } else {
      console.error('❌ Connection failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing connection:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

main();

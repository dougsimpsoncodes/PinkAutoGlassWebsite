/**
 * Upload Offline Conversions to Google Ads
 *
 * This script uploads form submission conversions from our database to Google Ads
 * so they appear in the Google Ads dashboard and can be used for smart bidding optimization.
 *
 * It processes conversion_events with:
 * - event_type = 'form_submit'
 * - gclid is not null
 * - Not already uploaded (tracked via metadata.google_uploaded)
 *
 * Run: GOOGLE_ADS_CLIENT_ID="..." node scripts/upload-offline-conversions.js
 *
 * Or with env file: (use run-offline-upload.sh)
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Import Google Ads functions
const {
  validateGoogleAdsConfig,
  uploadOfflineConversions,
  formatConversionDateTime,
  listConversionActions,
} = require('../src/lib/googleAds');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mountain Time offset for conversion timestamps
const TIMEZONE_OFFSET = '-07:00';

async function main() {
  console.log('=== Upload Offline Conversions to Google Ads ===\n');

  // Step 1: Validate Google Ads config
  const config = validateGoogleAdsConfig();
  if (!config.isValid) {
    console.error('❌ Missing Google Ads credentials:', config.missingVars.join(', '));
    console.log('\nRequired environment variables:');
    console.log('  GOOGLE_ADS_CLIENT_ID');
    console.log('  GOOGLE_ADS_CLIENT_SECRET');
    console.log('  GOOGLE_ADS_REFRESH_TOKEN');
    console.log('  GOOGLE_ADS_DEVELOPER_TOKEN');
    console.log('  GOOGLE_ADS_CUSTOMER_ID');
    console.log('  GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID');
    process.exit(1);
  }

  // Check for conversion action ID
  if (!process.env.GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID) {
    console.log('⚠️ GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID not set.');
    console.log('\nListing available conversion actions...\n');

    try {
      const actions = await listConversionActions();
      console.log('Available conversion actions:');
      actions.forEach((action) => {
        console.log(`  ID: ${action.id}`);
        console.log(`    Name: ${action.name}`);
        console.log(`    Type: ${action.type}`);
        console.log(`    Status: ${action.status}`);
        console.log('');
      });
      console.log('Set GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID to one of these IDs.');
    } catch (err) {
      console.error('Failed to list conversion actions:', err.message);
    }
    process.exit(1);
  }

  // Step 2: Fetch form_submit conversions with gclid that haven't been uploaded
  console.log('Fetching unuploaded conversions from database...\n');

  const { data: conversions, error } = await supabase
    .from('conversion_events')
    .select('id, gclid, created_at, event_value, metadata')
    .eq('event_type', 'form_submit')
    .not('gclid', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching conversions:', error);
    process.exit(1);
  }

  // Filter out already uploaded conversions
  const unuploaded = conversions.filter((c) => {
    const meta = c.metadata || {};
    return !meta.google_uploaded;
  });

  console.log(`Found ${conversions.length} form_submit conversions with gclid`);
  console.log(`Already uploaded: ${conversions.length - unuploaded.length}`);
  console.log(`To upload: ${unuploaded.length}\n`);

  if (unuploaded.length === 0) {
    console.log('✅ No new conversions to upload.');
    return;
  }

  // Step 3: Format conversions for upload
  const toUpload = unuploaded.map((conv) => {
    const convDate = new Date(conv.created_at);
    return {
      gclid: conv.gclid,
      conversionDateTime: formatConversionDateTime(convDate, TIMEZONE_OFFSET),
      conversionValue: conv.event_value || 150, // Default lead value
      currencyCode: 'USD',
      _dbId: conv.id, // Internal tracking
    };
  });

  console.log('Uploading conversions to Google Ads...\n');

  // Step 4: Upload in batches of 50
  const BATCH_SIZE = 50;
  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} conversions)...`);

    try {
      const result = await uploadOfflineConversions(batch);
      totalSuccess += result.successCount;
      totalFailure += result.failureCount;

      // Mark successful uploads in database
      const successfulIds = batch
        .filter((_, idx) => result.results[idx]?.success)
        .map((conv) => conv._dbId);

      if (successfulIds.length > 0) {
        // Update metadata to mark as uploaded
        for (const id of successfulIds) {
          const { error: updateError } = await supabase
            .from('conversion_events')
            .update({
              metadata: supabase.sql`metadata || '{"google_uploaded": true, "google_uploaded_at": "${new Date().toISOString()}"}'::jsonb`,
            })
            .eq('id', id);

          if (updateError) {
            console.warn(`  Warning: Failed to update metadata for ${id}`);
          }
        }
      }

      // Log failures
      result.results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  ❌ Failed: ${r.gclid.slice(0, 20)}... - ${r.error}`);
        });
    } catch (err) {
      console.error(`  ❌ Batch failed:`, err.message);
      totalFailure += batch.length;
    }

    // Small delay between batches
    if (i + BATCH_SIZE < toUpload.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Step 5: Summary
  console.log('\n=== Upload Summary ===');
  console.log(`Total processed: ${toUpload.length}`);
  console.log(`Successful: ${totalSuccess}`);
  console.log(`Failed: ${totalFailure}`);

  if (totalSuccess > 0) {
    console.log('\n✅ Conversions uploaded to Google Ads!');
    console.log('Note: It may take up to 24 hours for conversions to appear in Google Ads.');
  }
}

main().catch(console.error);

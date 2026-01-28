/**
 * Sync Offline Conversions to Google Ads and Microsoft Ads
 *
 * This script uploads form submission conversions from our database to both
 * Google Ads and Microsoft Ads for attribution and smart bidding optimization.
 *
 * It processes conversion_events with:
 * - event_type = 'form_submit'
 * - gclid OR msclkid is not null
 * - Not already uploaded (tracked via metadata.google_uploaded / metadata.microsoft_uploaded)
 *
 * Run: node scripts/sync-offline-conversions.js
 * (Requires .env.local to be loaded)
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Import Google Ads functions
const {
  validateGoogleAdsConfig,
  uploadOfflineConversions: uploadToGoogle,
  formatConversionDateTime,
  listConversionActions,
} = require('../src/lib/googleAds');

// Import Microsoft Ads functions
const {
  validateMicrosoftAdsConfig,
  uploadOfflineConversions: uploadToMicrosoft,
  formatMicrosoftConversionDateTime,
} = require('../src/lib/microsoftAds');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mountain Time offset for Google Ads timestamps
const TIMEZONE_OFFSET = '-07:00';

// Default conversion value for leads
const DEFAULT_LEAD_VALUE = 150;

async function syncGoogleAdsConversions() {
  console.log('\n=== Google Ads Offline Conversions ===\n');

  const config = validateGoogleAdsConfig();
  if (!config.isValid) {
    console.log('⚠️ Google Ads not configured:', config.missingVars.join(', '));
    return { uploaded: 0, failed: 0 };
  }

  if (!process.env.GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID) {
    console.log('⚠️ GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID not set.');
    console.log('   Run: node scripts/list-google-ads-conversions.js');
    return { uploaded: 0, failed: 0 };
  }

  // Fetch unuploaded Google Ads conversions
  const { data: conversions, error } = await supabase
    .from('conversion_events')
    .select('id, gclid, created_at, event_value, metadata')
    .eq('event_type', 'form_submit')
    .not('gclid', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversions:', error);
    return { uploaded: 0, failed: 0 };
  }

  // Filter out already uploaded
  const unuploaded = conversions.filter((c) => !(c.metadata?.google_uploaded));

  console.log(`Total form_submit with gclid: ${conversions.length}`);
  console.log(`Already uploaded: ${conversions.length - unuploaded.length}`);
  console.log(`To upload: ${unuploaded.length}`);

  if (unuploaded.length === 0) {
    return { uploaded: 0, failed: 0 };
  }

  // Format for upload
  const toUpload = unuploaded.map((conv) => ({
    gclid: conv.gclid,
    conversionDateTime: formatConversionDateTime(new Date(conv.created_at), TIMEZONE_OFFSET),
    conversionValue: conv.event_value || DEFAULT_LEAD_VALUE,
    currencyCode: 'USD',
    _dbId: conv.id,
  }));

  // Upload in batches
  let totalSuccess = 0;
  let totalFailure = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);

    try {
      const result = await uploadToGoogle(batch);
      totalSuccess += result.successCount;
      totalFailure += result.failureCount;

      // Mark successful uploads
      for (let j = 0; j < batch.length; j++) {
        if (result.results[j]?.success) {
          await supabase.rpc('jsonb_set_value', {
            table_name: 'conversion_events',
            column_name: 'metadata',
            row_id: batch[j]._dbId,
            key_path: '{google_uploaded}',
            new_value: 'true'
          }).catch(() => {
            // Fallback: direct update
            supabase.from('conversion_events')
              .update({
                metadata: {
                  ...conversions.find(c => c.id === batch[j]._dbId)?.metadata,
                  google_uploaded: true,
                  google_uploaded_at: new Date().toISOString()
                }
              })
              .eq('id', batch[j]._dbId)
              .then(() => {});
          });
        }
      }
    } catch (err) {
      console.error(`Batch error:`, err.message);
      totalFailure += batch.length;
    }
  }

  console.log(`\nGoogle Ads: ${totalSuccess} uploaded, ${totalFailure} failed`);
  return { uploaded: totalSuccess, failed: totalFailure };
}

async function syncMicrosoftAdsConversions() {
  console.log('\n=== Microsoft Ads Offline Conversions ===\n');

  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.log('⚠️ Microsoft Ads not configured:', config.missingVars.join(', '));
    return { uploaded: 0, failed: 0 };
  }

  const conversionName = process.env.MICROSOFT_ADS_CONVERSION_GOAL_NAME || 'Lead Form Submission';
  console.log(`Using conversion goal: "${conversionName}"`);

  // Fetch unuploaded Microsoft Ads conversions
  const { data: conversions, error } = await supabase
    .from('conversion_events')
    .select('id, msclkid, created_at, event_value, metadata')
    .eq('event_type', 'form_submit')
    .not('msclkid', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching conversions:', error);
    return { uploaded: 0, failed: 0 };
  }

  // Filter out already uploaded
  const unuploaded = conversions.filter((c) => !(c.metadata?.microsoft_uploaded));

  console.log(`Total form_submit with msclkid: ${conversions.length}`);
  console.log(`Already uploaded: ${conversions.length - unuploaded.length}`);
  console.log(`To upload: ${unuploaded.length}`);

  if (unuploaded.length === 0) {
    return { uploaded: 0, failed: 0 };
  }

  // Format for upload
  const toUpload = unuploaded.map((conv) => ({
    msclkid: conv.msclkid,
    conversionName: conversionName,
    conversionTime: formatMicrosoftConversionDateTime(new Date(conv.created_at)),
    conversionValue: conv.event_value || DEFAULT_LEAD_VALUE,
    conversionCurrency: 'USD',
    _dbId: conv.id,
  }));

  // Upload in batches
  let totalSuccess = 0;
  let totalFailure = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE);

    try {
      const result = await uploadToMicrosoft(batch);
      totalSuccess += result.successCount;
      totalFailure += result.failureCount;

      // Mark successful uploads
      for (let j = 0; j < batch.length; j++) {
        if (result.results[j]?.success) {
          const conv = conversions.find(c => c.id === batch[j]._dbId);
          await supabase.from('conversion_events')
            .update({
              metadata: {
                ...(conv?.metadata || {}),
                microsoft_uploaded: true,
                microsoft_uploaded_at: new Date().toISOString()
              }
            })
            .eq('id', batch[j]._dbId);
        }
      }
    } catch (err) {
      console.error(`Batch error:`, err.message);
      totalFailure += batch.length;
    }
  }

  console.log(`\nMicrosoft Ads: ${totalSuccess} uploaded, ${totalFailure} failed`);
  return { uploaded: totalSuccess, failed: totalFailure };
}

async function main() {
  console.log('=== Sync Offline Conversions ===');
  console.log(`Time: ${new Date().toISOString()}\n`);

  const googleResults = await syncGoogleAdsConversions();
  const microsoftResults = await syncMicrosoftAdsConversions();

  console.log('\n=== Summary ===');
  console.log(`Google Ads: ${googleResults.uploaded} uploaded, ${googleResults.failed} failed`);
  console.log(`Microsoft Ads: ${microsoftResults.uploaded} uploaded, ${microsoftResults.failed} failed`);

  const total = googleResults.uploaded + microsoftResults.uploaded;
  if (total > 0) {
    console.log(`\n✅ ${total} conversions synced to ad platforms!`);
    console.log('Note: It may take up to 24 hours for conversions to appear in dashboards.');
  }
}

main().catch(console.error);

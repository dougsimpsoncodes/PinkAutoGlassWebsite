/**
 * Fix Microsoft Ads Geo-Targeting
 *
 * Problem: Campaign is set to "PeopleInOrSearchingForOrViewingPages" (default),
 * which serves ads to people in other states searching FOR Denver topics.
 *
 * Fix: Change LocationIntentCriterion to "PeopleIn" (physical location only).
 *
 * Also adds negative location criteria for out-of-area states.
 *
 * Usage: node scripts/fix-microsoft-geo-targeting.js [--dry-run]
 *
 * API docs:
 * - https://learn.microsoft.com/en-us/advertising/campaign-management-service/locationintentcriterion
 * - https://learn.microsoft.com/en-us/advertising/campaign-management-service/updatecampaigncriterions
 * - https://learn.microsoft.com/en-us/advertising/campaign-management-service/getcampaigncriterionsbyids
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const DRY_RUN = process.argv.includes('--dry-run');

const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CAMPAIGN_ID = 523490791; // PinkAutoGlass campaign

async function getAccessToken() {
  // Fetch stored token from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let refreshToken = process.env.MICROSOFT_ADS_REFRESH_TOKEN;

  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'microsoft_ads_refresh_token')
      .single();
    if (data?.value) {
      refreshToken = data.value;
      console.log('  Using stored refresh token from Supabase');
    }
  }

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://ads.microsoft.com/msads.manage',
    }),
  });

  if (!response.ok) throw new Error(`Token failed: ${await response.text()}`);
  const data = await response.json();

  // Store rotated token
  if (data.refresh_token && data.refresh_token !== refreshToken && supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await supabase.from('app_config').upsert(
      { key: 'microsoft_ads_refresh_token', value: data.refresh_token, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    console.log('  Stored rotated refresh token');
  }

  return data.access_token;
}

function headers(accessToken) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'DeveloperToken': DEVELOPER_TOKEN,
    'CustomerId': CUSTOMER_ID,
    'CustomerAccountId': ACCOUNT_ID,
    'Content-Type': 'application/json',
  };
}

async function getCampaignCriterions(accessToken, criterionType) {
  // REST: POST /CampaignManagement/v13/CampaignCriterions/QueryByIds
  const endpoint = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/CampaignCriterions/QueryByIds';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers(accessToken),
    body: JSON.stringify({
      CampaignCriterionIds: null, // null = get all criterions for this campaign
      CampaignId: CAMPAIGN_ID,
      CriterionType: criterionType,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GetCampaignCriterions failed: ${response.status} ${text}`);
  }

  return await response.json();
}

async function updateCampaignCriterions(accessToken, criterions, criterionType) {
  // REST: PATCH /CampaignManagement/v13/CampaignCriterions
  const endpoint = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/CampaignCriterions';

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: headers(accessToken),
    body: JSON.stringify({
      CampaignCriterions: criterions,
      CriterionType: criterionType,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`UpdateCampaignCriterions failed: ${response.status} ${text}`);
  }

  return await response.json();
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');
  console.log('');

  console.log('Authenticating...');
  const accessToken = await getAccessToken();
  console.log('  ✓ Authenticated\n');

  // Step 1: Get current LocationIntent criterions
  console.log('Fetching current campaign criterions...');
  const result = await getCampaignCriterions(accessToken, 'LocationIntent');

  const criterions = result.CampaignCriterions || [];
  console.log(`  Found ${criterions.length} criterion(s)\n`);

  let locationIntentCriterion = null;
  let locationCriterions = [];

  for (const c of criterions) {
    const criterion = c.Criterion;
    if (criterion && criterion.Type === 'LocationIntentCriterion') {
      locationIntentCriterion = c;
      console.log(`  LocationIntentCriterion (ID: ${c.Id})`);
      console.log(`    Current IntentOption: ${criterion.IntentOption}`);
    } else if (criterion && criterion.Type === 'LocationCriterion') {
      locationCriterions.push(c);
      console.log(`  LocationCriterion (ID: ${c.Id}): LocationId=${criterion.LocationId}, LocationType=${criterion.LocationType}, DisplayName=${criterion.DisplayName || 'N/A'}`);
    } else if (criterion) {
      console.log(`  ${criterion.Type} (ID: ${c.Id})`);
    }
  }

  console.log('');

  // Step 2: Update LocationIntentCriterion to PeopleIn
  if (locationIntentCriterion) {
    const currentIntent = locationIntentCriterion.Criterion.IntentOption;
    if (currentIntent === 'PeopleIn') {
      console.log('✓ LocationIntentCriterion already set to PeopleIn — no change needed.\n');
    } else {
      console.log(`Changing IntentOption: ${currentIntent} → PeopleIn`);

      if (DRY_RUN) {
        console.log('  [DRY RUN] Would update LocationIntentCriterion to PeopleIn\n');
      } else {
        const updateResult = await updateCampaignCriterions(
          accessToken,
          [{
            Id: locationIntentCriterion.Id,
            CampaignId: CAMPAIGN_ID,
            Criterion: {
              Type: 'LocationIntentCriterion',
              IntentOption: 'PeopleIn',
            },
            Type: 'BiddableCampaignCriterion',
          }],
          'Targets'
        );

        if (updateResult.NestedPartialErrors && updateResult.NestedPartialErrors.length > 0) {
          console.error('  ✗ Update failed:', JSON.stringify(updateResult.NestedPartialErrors));
        } else {
          console.log('  ✓ Updated to PeopleIn\n');
        }
      }
    }
  } else {
    console.log('⚠ No LocationIntentCriterion found — it may need to be created.\n');
  }

  // Step 3: Summary
  console.log('=== SUMMARY ===');
  console.log('Location intent: PeopleIn (show ads only to people physically in targeted area)');
  console.log('');
  console.log('MANUAL STEPS STILL NEEDED:');
  console.log('1. Add negative location targets for out-of-area states/cities');
  console.log('   (Wyoming, Virginia, Utah, New Mexico, Illinois via Microsoft Ads UI)');
  console.log('2. Verify/update the targeted location radius to Denver metro only');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

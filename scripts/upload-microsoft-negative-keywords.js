/**
 * Upload Negative Keywords to Microsoft Ads
 *
 * Reads from data/microsoft-ads/2026-04-09-negative-keywords-upload.csv
 * and adds them as campaign-level negative keywords via Campaign Management API.
 *
 * Usage: node scripts/upload-microsoft-negative-keywords.js [--dry-run]
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;
const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;

// Match type mapping: CSV value → Microsoft Ads API value
const MATCH_TYPE_MAP = {
  'Exact': 'Exact',
  'Phrase': 'Phrase',
  'Broad': 'Broad',
};

async function getStoredRefreshToken() {
  // Fetch the rotated refresh token from Supabase (same pattern as lib/microsoftAds.ts)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/app_config?key=eq.microsoft_ads_refresh_token&select=value`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  return data?.[0]?.value || null;
}

async function storeRefreshToken(nextToken) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  await fetch(`${supabaseUrl}/rest/v1/app_config`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      key: 'microsoft_ads_refresh_token',
      value: nextToken,
      updated_at: new Date().toISOString(),
    }),
  });
}

async function getAccessToken() {
  // Try stored token from Supabase first (env token may be stale)
  const storedToken = await getStoredRefreshToken();
  const refreshToken = storedToken || REFRESH_TOKEN;

  if (storedToken) {
    console.log('  Using stored refresh token from Supabase');
  } else {
    console.log('  Using env refresh token (no stored token found)');
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

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  // Store rotated refresh token if new one was issued
  if (data.refresh_token && data.refresh_token !== refreshToken) {
    await storeRefreshToken(data.refresh_token);
    console.log('  Stored rotated refresh token');
  }

  return data.access_token;
}

async function getCampaigns(accessToken) {
  const endpoint = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/Campaigns/QueryByAccountId';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'DeveloperToken': DEVELOPER_TOKEN,
      'CustomerId': CUSTOMER_ID,
      'CustomerAccountId': ACCOUNT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      AccountId: parseInt(ACCOUNT_ID),
    }),
  });

  if (!response.ok) {
    throw new Error(`GetCampaigns failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.Campaigns || [];
}

async function addNegativeKeywordsToCampaign(accessToken, campaignId, keywords) {
  // REST API: POST /CampaignManagement/v13/EntityNegativeKeywords
  // Docs: https://learn.microsoft.com/en-us/advertising/campaign-management-service/addnegativekeywordstoentities
  const endpoint = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/EntityNegativeKeywords';

  const entityNegativeKeywords = [{
    EntityId: campaignId,
    EntityType: 'Campaign',
    NegativeKeywords: keywords.map(kw => ({
      Id: null,
      MatchType: MATCH_TYPE_MAP[kw.matchType] || 'Phrase',
      Text: kw.keyword,
    })),
  }];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'DeveloperToken': DEVELOPER_TOKEN,
      'CustomerId': CUSTOMER_ID,
      'CustomerAccountId': ACCOUNT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      EntityNegativeKeywords: entityNegativeKeywords,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AddNegativeKeywords failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  const keywords = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    keywords.push({
      keyword: values[0],
      matchType: values[1],
      category: values[2],
    });
  }
  return keywords;
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');
  console.log('');

  // 1. Parse the CSV
  const csvPath = path.join(__dirname, '..', 'data', 'microsoft-ads', '2026-04-09-negative-keywords-upload.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  const keywords = parseCSV(csvPath);
  console.log(`Loaded ${keywords.length} negative keywords from CSV\n`);

  // Group by category for reporting
  const byCategory = {};
  for (const kw of keywords) {
    byCategory[kw.category] = byCategory[kw.category] || [];
    byCategory[kw.category].push(kw);
  }
  for (const [cat, kws] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${kws.length} keywords`);
  }
  console.log('');

  if (DRY_RUN) {
    console.log('Keywords to add:');
    for (const kw of keywords) {
      console.log(`  "${kw.keyword}" [${kw.matchType}] — ${kw.category}`);
    }
    console.log('\nRun without --dry-run to upload to Microsoft Ads.');
    return;
  }

  // 2. Get access token
  console.log('Authenticating...');
  const accessToken = await getAccessToken();
  console.log('  ✓ Authenticated\n');

  // 3. Get campaigns
  console.log('Fetching campaigns...');
  const campaigns = await getCampaigns(accessToken);
  console.log(`  Found ${campaigns.length} campaign(s):`);
  for (const c of campaigns) {
    console.log(`    ${c.Name} (ID: ${c.Id}, Status: ${c.Status})`);
  }
  console.log('');

  if (campaigns.length === 0) {
    console.error('No campaigns found. Cannot add negative keywords.');
    process.exit(1);
  }

  // 4. Upload negative keywords to each active campaign
  for (const campaign of campaigns) {
    console.log(`Adding ${keywords.length} negative keywords to "${campaign.Name}" (ID: ${campaign.Id})...`);

    try {
      // Microsoft Ads has a limit per request — chunk into batches of 1000
      const BATCH_SIZE = 1000;
      for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
        const batch = keywords.slice(i, i + BATCH_SIZE);
        const result = await addNegativeKeywordsToCampaign(accessToken, campaign.Id, batch);

        // Check for partial errors
        if (result.NestedPartialErrors && result.NestedPartialErrors.length > 0) {
          console.log(`  ⚠ ${result.NestedPartialErrors.length} partial errors in batch ${Math.floor(i / BATCH_SIZE) + 1}`);
          for (const err of result.NestedPartialErrors.slice(0, 5)) {
            console.log(`    Error: ${JSON.stringify(err)}`);
          }
        } else {
          console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} keywords added`);
        }
      }
    } catch (e) {
      console.error(`  ✗ Failed: ${e.message}`);
    }
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

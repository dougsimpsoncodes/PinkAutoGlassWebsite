/**
 * Get Microsoft Advertising Conversion Goals
 * Run: node scripts/get-microsoft-conversion-goals.js
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const ENV_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;

async function getRefreshToken() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'microsoft_ads_refresh_token')
        .single();
      if (data?.value) {
        console.log('✓ Using refresh token from Supabase (production token)');
        return data.value;
      }
    } catch (e) {
      console.log('⚠ Supabase lookup failed, falling back to .env.local');
    }
  }
  console.log('Using refresh token from .env.local');
  return ENV_REFRESH_TOKEN;
}

async function getAccessToken() {
  const refreshToken = await getRefreshToken();
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'https://ads.microsoft.com/msads.manage offline_access'
    }).toString();

    const options = {
      hostname: 'login.microsoftonline.com',
      path: '/common/oauth2/v2.0/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Token error: ${parsed.error} - ${parsed.error_description}`));
          } else {
            resolve(parsed.access_token);
          }
        } catch (e) {
          reject(new Error('Failed to parse token response'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getConversionGoals(accessToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      ConversionGoalIds: null,
      ConversionGoalTypes: 'Event,Url,Duration,PagesViewedPerVisit,OfflineConversion',
      ReturnAdditionalFields: 'ViewThroughConversionWindowInMinutes,IsExternallyAttributed,GoalCategory'
    });

    const options = {
      hostname: 'campaign.api.bingads.microsoft.com',
      path: '/CampaignManagement/v13/ConversionGoals/QueryByIds',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': DEVELOPER_TOKEN,
        'CustomerAccountId': ACCOUNT_ID,
        'CustomerId': CUSTOMER_ID,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response: ' + data.substring(0, 500)));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Fetching Microsoft Ads conversion goals...\n');

  try {
    const accessToken = await getAccessToken();
    console.log('✓ Authenticated\n');

    const result = await getConversionGoals(accessToken);

    if (result.ConversionGoals) {
      console.log(`Found ${result.ConversionGoals.length} conversion goal(s):\n`);

      for (const goal of result.ConversionGoals) {
        console.log('═'.repeat(60));
        console.log(`Name:              ${goal.Name}`);
        console.log(`ID:                ${goal.Id}`);
        console.log(`Type:              ${goal.Type}`);
        console.log(`Status:            ${goal.Status}`);
        console.log(`Tracking Status:   ${goal.TrackingStatus}`);
        console.log(`Count Type:        ${goal.CountType}`);
        console.log(`Conv. Window:      ${goal.ConversionWindowInMinutes} minutes (${(goal.ConversionWindowInMinutes / 60 / 24).toFixed(0)} days)`);
        console.log(`Scope:             ${goal.Scope}`);
        console.log(`Tag ID:            ${goal.TagId}`);
        console.log(`Category:          ${goal.GoalCategory || 'N/A'}`);
        console.log(`Revenue:           ${JSON.stringify(goal.Revenue) || 'N/A'}`);
        console.log(`View-Through:      ${goal.ViewThroughConversionWindowInMinutes || 'N/A'} minutes`);
        console.log(`Externally Attr:   ${goal.IsExternallyAttributed || false}`);

        // Event-specific details
        if (goal.Type === 'Event') {
          console.log('\n  Event Conditions:');
          if (goal.ActionExpression) console.log(`    Action:     ${goal.ActionOperator} "${goal.ActionExpression}"`);
          if (goal.CategoryExpression) console.log(`    Category:   ${goal.CategoryOperator} "${goal.CategoryExpression}"`);
          if (goal.LabelExpression) console.log(`    Label:      ${goal.LabelOperator} "${goal.LabelExpression}"`);
          if (goal.ValueExpression) console.log(`    Value:      ${goal.ValueOperator} "${goal.ValueExpression}"`);
          if (!goal.ActionExpression && !goal.CategoryExpression && !goal.LabelExpression && !goal.ValueExpression) {
            console.log('    (No event conditions configured)');
          }
        }

        // URL-specific details
        if (goal.Type === 'Url') {
          console.log(`\n  URL Condition:  ${goal.UrlOperator} "${goal.UrlExpression}"`);
        }

        console.log('');
      }
    } else {
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

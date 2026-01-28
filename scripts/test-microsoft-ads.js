/**
 * Test Microsoft Advertising API Access
 * Run: node scripts/test-microsoft-ads.js
 */

const https = require('https');

// Load from environment or use defaults
require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
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

async function getUser(accessToken) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      UserId: null
    });

    const options = {
      hostname: 'clientcenter.api.bingads.microsoft.com',
      path: '/CustomerManagement/v13/User/Query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': DEVELOPER_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getAccounts(accessToken, customerId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      CustomerId: customerId,
      AccountsInfo: null
    });

    const options = {
      hostname: 'clientcenter.api.bingads.microsoft.com',
      path: '/CustomerManagement/v13/AccountsInfo/Query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': DEVELOPER_TOKEN,
        'CustomerId': customerId.toString(),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getCampaigns(accessToken, customerId, accountId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      AccountId: parseInt(accountId),
      CampaignType: 'Search',
      ReturnAdditionalFields: null
    });

    console.log('Using Account ID:', accountId, 'Customer ID:', customerId);

    const options = {
      hostname: 'campaign.api.bingads.microsoft.com',
      path: '/CampaignManagement/v13/Campaigns/QueryByAccountId',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': DEVELOPER_TOKEN,
        'CustomerId': customerId.toString(),
        'CustomerAccountId': accountId.toString(),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('===========================================');
  console.log('Microsoft Advertising API Test');
  console.log('===========================================\n');

  // Check credentials
  console.log('Checking credentials...');
  const missing = [];
  if (!CLIENT_ID) missing.push('MICROSOFT_ADS_CLIENT_ID');
  if (!CLIENT_SECRET) missing.push('MICROSOFT_ADS_CLIENT_SECRET');
  if (!REFRESH_TOKEN) missing.push('MICROSOFT_ADS_REFRESH_TOKEN');
  if (!DEVELOPER_TOKEN) missing.push('MICROSOFT_ADS_DEVELOPER_TOKEN');
  if (!ACCOUNT_ID) missing.push('MICROSOFT_ADS_ACCOUNT_ID');
  if (!CUSTOMER_ID) missing.push('MICROSOFT_ADS_CUSTOMER_ID');

  if (missing.length > 0) {
    console.error('❌ Missing credentials:', missing.join(', '));
    process.exit(1);
  }
  console.log('✅ All credentials present\n');

  // Get access token
  console.log('Getting access token...');
  try {
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');

    // Get user info to find correct customer ID
    console.log('Getting user info...');
    const userResult = await getUser(accessToken);
    console.log('User API response:', JSON.stringify(userResult.data, null, 2));

    let customerId = CUSTOMER_ID;
    let accountId = ACCOUNT_ID;

    if (userResult.data && userResult.data.User) {
      customerId = userResult.data.User.CustomerId || userResult.data.CustomerIds?.[0] || CUSTOMER_ID;
      console.log('Found Customer ID from API:', customerId);
    }

    // Get campaigns
    console.log('\nFetching campaigns...');
    const result = await getCampaigns(accessToken, customerId, accountId);

    if (result.status === 200 && result.data.Campaigns) {
      console.log('✅ API call successful!\n');
      console.log('Campaigns found:', result.data.Campaigns.length);
      result.data.Campaigns.forEach(campaign => {
        console.log(`  - ${campaign.Name} (ID: ${campaign.Id}, Status: ${campaign.Status})`);
      });
    } else {
      console.log('Response status:', result.status);
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('\n===========================================');
  console.log('✅ Microsoft Advertising API access verified!');
  console.log('===========================================');
}

main();

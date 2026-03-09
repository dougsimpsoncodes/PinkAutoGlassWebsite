#!/usr/bin/env node
/**
 * Fetch GBP Account ID and Location IDs
 * Usage: node scripts/fetch-gbp-ids.js
 */

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GBP_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing env vars. Run: source .env.local first, or use dotenv.');
  process.exit(1);
}

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error('Token exchange failed:', data);
    process.exit(1);
  }
  return data.access_token;
}

async function main() {
  console.log('Fetching access token...');
  const accessToken = await getAccessToken();

  // 1. List accounts
  console.log('\nFetching GBP accounts...');
  const accountsRes = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const accountsData = await accountsRes.json();

  if (!accountsData.accounts?.length) {
    console.error('No accounts found:', accountsData);
    process.exit(1);
  }

  for (const account of accountsData.accounts) {
    console.log(`\nAccount: ${account.name} (${account.accountName})`);
    console.log(`  GBP_ACCOUNT_ID=${account.name}`);

    // 2. List locations for this account
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const locData = await locRes.json();

    if (!locData.locations?.length) {
      console.log('  No locations found.');
      continue;
    }

    for (const loc of locData.locations) {
      const city = loc.storefrontAddress?.locality || '';
      console.log(`\n  Location: ${loc.title} ${city ? `(${city})` : ''}`);
      console.log(`    GBP_LOCATION_ID=${loc.name}`);
    }
  }
}

main().catch(console.error);

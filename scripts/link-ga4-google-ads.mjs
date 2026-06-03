#!/usr/bin/env node
/**
 * Links the GA4 property to a Google Ads account via the Analytics Admin API.
 * Enables Smart Bidding to use GA4 audience signals + imports GA4 conversions into Ads.
 *
 * Requires:
 *   GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN — analytics.edit scope
 *   GOOGLE_ANALYTICS_PROPERTY_ID        — numeric GA4 property ID
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_ID     — shared OAuth client ID
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET — shared OAuth client secret
 *
 * Run: node scripts/link-ga4-google-ads.mjs
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.vercel.full' });

const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const REFRESH_TOKEN = process.env.GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
const ADS_CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '9961188891').replace(/[-\s]/g, '');

if (!PROPERTY_ID || !REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing required env vars:');
  if (!PROPERTY_ID) console.error('  GOOGLE_ANALYTICS_PROPERTY_ID');
  if (!REFRESH_TOKEN) console.error('  GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN');
  if (!CLIENT_ID) console.error('  GOOGLE_SEARCH_CONSOLE_CLIENT_ID or GOOGLE_ADS_CLIENT_ID');
  if (!CLIENT_SECRET) console.error('  GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET or GOOGLE_ADS_CLIENT_SECRET');
  process.exit(1);
}

function getAuthClient() {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
  auth.setCredentials({ refresh_token: REFRESH_TOKEN });
  return auth;
}

async function adminRequest(method, path, body, token) {
  const base = 'https://analyticsadmin.googleapis.com/v1alpha';
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`GA4 Admin ${method} ${path} → ${res.status}: ${JSON.stringify(data?.error || data)}`);
  }
  return data;
}

async function main() {
  console.log(`\n=== GA4 → Google Ads Link — property ${PROPERTY_ID} ===\n`);
  console.log(`Google Ads customer ID: ${ADS_CUSTOMER_ID}`);

  const auth = getAuthClient();
  const { token } = await auth.getAccessToken();
  const prop = `properties/${PROPERTY_ID}`;

  // Check existing links
  console.log('\n→ Checking existing Google Ads links...');
  const existing = await adminRequest('GET', `/${prop}/googleAdsLinks`, undefined, token);
  const links = existing.googleAdsLinks || [];

  if (links.length > 0) {
    console.log('  Already linked to:');
    links.forEach(l => console.log(`    • Customer ${l.customerId} (${l.name})`));

    const alreadyLinked = links.find(l => l.customerId === ADS_CUSTOMER_ID);
    if (alreadyLinked) {
      console.log(`\n✅ Already linked to customer ${ADS_CUSTOMER_ID} — nothing to do.`);
      return;
    }
  } else {
    console.log('  No existing links.');
  }

  // Create the link
  console.log(`\n→ Creating link to Google Ads customer ${ADS_CUSTOMER_ID}...`);
  const result = await adminRequest('POST', `/${prop}/googleAdsLinks`, {
    customerId: ADS_CUSTOMER_ID,
    adsPersonalizationEnabled: true,
  }, token);

  console.log(`\n✅ Linked! Resource: ${result.name}`);
  console.log(`   Customer ID: ${result.customerId}`);
  console.log(`   Ads personalization: ${result.adsPersonalizationEnabled}`);
  console.log('\nGoogle Ads can now use GA4 audiences for Smart Bidding.');
  console.log('Allow 24–48h for audiences to populate in Google Ads → Tools → Audience manager.');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});

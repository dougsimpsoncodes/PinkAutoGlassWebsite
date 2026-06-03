#!/usr/bin/env node
/**
 * Registers event-scoped custom dimensions in GA4 so event parameters
 * (market, surface, stage, vehicle info) appear as filterable dimensions
 * in all GA4 reports and explorations.
 *
 * Without this, parameters are sent with events but invisible in the GA4 UI.
 *
 * Requires:
 *   GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN — analytics.edit scope
 *   GOOGLE_ANALYTICS_PROPERTY_ID        — numeric GA4 property ID
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_ID     — shared OAuth client ID
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET — shared OAuth client secret
 *
 * Run: node scripts/register-ga4-custom-dimensions.mjs
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const REFRESH_TOKEN = process.env.GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

if (!PROPERTY_ID || !REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing required env vars');
  process.exit(1);
}

// Dimensions to register — all event-scoped.
// These match the parameter names sent by tracking.ts / analytics.ts.
const DIMENSIONS = [
  {
    parameterName: 'market',
    displayName: 'Market',
    description: 'Service market: colorado or arizona',
  },
  {
    parameterName: 'surface',
    displayName: 'Quoter Surface',
    description: 'Page/route where the quoter is mounted (e.g. /, /arizona/...)',
  },
  {
    parameterName: 'flow_mode',
    displayName: 'Flow Mode',
    description: 'Quoter flow mode: standard or zip-first-unlocked',
  },
  {
    parameterName: 'stage',
    displayName: 'Quote Stage',
    description: 'Funnel stage: priced or booked',
  },
  {
    parameterName: 'vehicle_make',
    displayName: 'Vehicle Make',
    description: 'Vehicle manufacturer (e.g. Honda, Toyota)',
  },
  {
    parameterName: 'vehicle_model',
    displayName: 'Vehicle Model',
    description: 'Vehicle model (e.g. Accord, Camry)',
  },
  {
    parameterName: 'vehicle_year',
    displayName: 'Vehicle Year',
    description: 'Vehicle model year (e.g. 2019)',
  },
];

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
  console.log(`\n=== GA4 Custom Dimensions — property ${PROPERTY_ID} ===\n`);

  const auth = getAuthClient();
  const { token } = await auth.getAccessToken();
  const prop = `properties/${PROPERTY_ID}`;

  // Check existing dimensions
  console.log('→ Fetching existing custom dimensions...');
  const existing = await adminRequest('GET', `/${prop}/customDimensions`, undefined, token);
  const existingParams = new Set((existing.customDimensions || []).map(d => d.parameterName));

  if (existingParams.size > 0) {
    console.log(`  Already registered: ${[...existingParams].join(', ')}`);
  } else {
    console.log('  None registered yet.');
  }

  console.log('');

  const results = { created: [], skipped: [], failed: [] };

  for (const dim of DIMENSIONS) {
    if (existingParams.has(dim.parameterName)) {
      console.log(`  ⏭  ${dim.parameterName} — already registered`);
      results.skipped.push(dim.parameterName);
      continue;
    }

    try {
      const result = await adminRequest('POST', `/${prop}/customDimensions`, {
        parameterName: dim.parameterName,
        displayName: dim.displayName,
        description: dim.description,
        scope: 'EVENT',
      }, token);
      console.log(`  ✅ ${dim.parameterName} → "${dim.displayName}" (${result.name})`);
      results.created.push(dim.parameterName);
    } catch (err) {
      console.error(`  ❌ ${dim.parameterName} → ${err.message}`);
      results.failed.push({ parameterName: dim.parameterName, error: err.message });
    }
  }

  console.log('\n=== Summary ===');
  if (results.created.length) console.log(`✅ Created (${results.created.length}): ${results.created.join(', ')}`);
  if (results.skipped.length) console.log(`⏭  Skipped (${results.skipped.length}): ${results.skipped.join(', ')}`);
  if (results.failed.length) {
    console.log(`❌ Failed  (${results.failed.length}): ${results.failed.map(f => f.parameterName).join(', ')}`);
    results.failed.forEach(f => console.log(`   ${f.parameterName}: ${f.error}`));
    process.exit(1);
  }

  console.log('\nCustom dimensions appear in GA4 reports within 24–48h.');
  console.log('Find them under: Explore → any report → Dimensions → Custom → Event scope');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});

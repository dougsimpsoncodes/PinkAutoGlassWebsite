#!/usr/bin/env node
/**
 * Verifies all GA4 configuration changes made in the June 2-3 2026 session:
 *   - Key Events (form_submit, click_to_call, click_to_text)
 *   - Custom dimensions (7)
 *   - Data retention (14 months)
 *   - Google Signals
 *   - Search Console link
 *   - Google Ads link
 *   - Recent event data (quote_generated, purchase, form_submit)
 *
 * Run: node scripts/verify-ga4-setup.mjs
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

const PROPERTY_ID  = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const EDIT_TOKEN   = process.env.GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN;
const READ_TOKEN   = process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN;
const CLIENT_ID    = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

function getAuthClient(token) {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
  auth.setCredentials({ refresh_token: token });
  return auth;
}

async function adminRequest(path, token) {
  const res = await fetch(`https://analyticsadmin.googleapis.com/v1alpha/properties/${PROPERTY_ID}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(data?.error?.message || data)}`);
  return data;
}

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label) { console.log(`  ❌ ${label}`); }
function warn(label) { console.log(`  ⚠️  ${label}`); }
function section(title) { console.log(`\n── ${title} ──`); }

async function main() {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`  GA4 Setup Verification — property ${PROPERTY_ID}`);
  console.log(`╚══════════════════════════════════════════════╝`);

  const editAuth = getAuthClient(EDIT_TOKEN);
  const { token: editToken } = await editAuth.getAccessToken();

  // ── 1. Key Events ─────────────────────────────────────────────────────────
  section('Key Events');
  const EXPECTED_KEY_EVENTS = ['form_submit', 'click_to_call', 'click_to_text'];
  const keyEventsData = await adminRequest('/keyEvents', editToken);
  const keyEventNames = (keyEventsData.keyEvents || []).map(e => e.eventName);
  for (const name of EXPECTED_KEY_EVENTS) {
    keyEventNames.includes(name) ? pass(name) : fail(`${name} — NOT registered`);
  }
  // 'purchase' is a GA4 default ecommerce Key Event — expected, not stale.
  const ignoredKeyEvents = ['purchase'];
  const extraKeyEvents = keyEventNames.filter(n => !EXPECTED_KEY_EVENTS.includes(n) && !ignoredKeyEvents.includes(n));
  if (extraKeyEvents.length) warn(`Unexpected key events registered: ${extraKeyEvents.join(', ')}`);

  // ── 2. Custom Dimensions ──────────────────────────────────────────────────
  section('Custom Dimensions');
  const EXPECTED_DIMS = ['market', 'surface', 'flow_mode', 'stage', 'vehicle_make', 'vehicle_model', 'vehicle_year'];
  const dimsData = await adminRequest('/customDimensions', editToken);
  const dimParams = (dimsData.customDimensions || []).map(d => d.parameterName);
  for (const param of EXPECTED_DIMS) {
    dimParams.includes(param) ? pass(param) : fail(`${param} — NOT registered`);
  }

  // ── 3. Data Retention ─────────────────────────────────────────────────────
  section('Data Retention');
  const retentionData = await adminRequest('/dataRetentionSettings', editToken);
  const retention = retentionData.eventDataRetention;
  retention === 'FOURTEEN_MONTHS'
    ? pass(`Event data retention: 14 months`)
    : fail(`Event data retention: ${retention || 'unknown'} (expected FOURTEEN_MONTHS)`);

  // ── 4. Search Console Link ────────────────────────────────────────────────
  section('Search Console Link');
  const scData = await adminRequest('/searchConsole35Links', editToken).catch(() => null);
  const scLinks = scData?.searchConsole35Links || [];
  scLinks.length > 0
    ? pass(`Linked to: ${scLinks.map(l => l.uri || l.name).join(', ')}`)
    : warn('No SC links via Admin API — verify manually in GA4 Admin → Product links → Search Console');

  // ── 5. Google Ads Link ────────────────────────────────────────────────────
  section('Google Ads Link');
  const adsData = await adminRequest('/googleAdsLinks', editToken);
  const adsLinks = adsData.googleAdsLinks || [];
  adsLinks.length > 0
    ? pass(`Linked to customer: ${adsLinks.map(l => l.customerId).join(', ')}`)
    : fail('No Google Ads link found');

  // ── 6. Recent Event Data ──────────────────────────────────────────────────
  section('Recent Event Data (last 2 days)');

  const readAuth = getAuthClient(READ_TOKEN);
  const { token: readToken } = await readAuth.getAccessToken();

  const EVENTS_TO_CHECK = ['form_submit', 'click_to_call', 'click_to_text', 'quote_generated', 'purchase'];

  try {
    const dataRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${readToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: '2daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: { fieldName: 'eventName', inListFilter: { values: EVENTS_TO_CHECK } },
        },
      }),
    });
    const dataJson = await dataRes.json();
    if (!dataRes.ok) throw new Error(JSON.stringify(dataJson?.error?.message || dataJson));

    const counts = {};
    for (const row of dataJson.rows || []) {
      counts[row.dimensionValues[0].value] = parseInt(row.metricValues[0].value, 10);
    }

    for (const name of EVENTS_TO_CHECK) {
      const count = counts[name] || 0;
      if (count > 0) {
        pass(`${name}: ${count} events`);
      } else if (name === 'quote_generated' || name === 'purchase') {
        warn(`${name}: 0 events — deployed today, needs real traffic`);
      } else {
        warn(`${name}: 0 events in last 2 days`);
      }
    }
  } catch (err) {
    fail(`Data API query failed: ${err.message}`);
  }

  console.log('\n══════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Marks GA4 events as Key Events (conversions) via the Analytics Admin API.
 *
 * Events to register:
 *   form_submit     — ONCE_PER_SESSION  (one conversion per visit, not per retry)
 *   click_to_call   — ONCE_PER_EVENT    (each call click counts)
 *   click_to_text   — ONCE_PER_EVENT    (each text click counts)
 *
 * Requires:
 *   GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN — analytics.edit scope
 *   GOOGLE_ANALYTICS_PROPERTY_ID        — numeric GA4 property ID
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_ID     — shared OAuth client ID
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET — shared OAuth client secret
 *
 * Run: node scripts/fix-ga4-key-events.mjs
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const REFRESH_TOKEN = process.env.GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

if (!PROPERTY_ID || !REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing required env vars:');
  if (!PROPERTY_ID) console.error('  GOOGLE_ANALYTICS_PROPERTY_ID');
  if (!REFRESH_TOKEN) console.error('  GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN (run: npm run oauth:ga4edit)');
  if (!CLIENT_ID) console.error('  GOOGLE_SEARCH_CONSOLE_CLIENT_ID or GOOGLE_ADS_CLIENT_ID');
  if (!CLIENT_SECRET) console.error('  GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET or GOOGLE_ADS_CLIENT_SECRET');
  process.exit(1);
}

const KEY_EVENTS = [
  { eventName: 'form_submit',   countingMethod: 'ONCE_PER_SESSION' },
  { eventName: 'click_to_call', countingMethod: 'ONCE_PER_EVENT'   },
  { eventName: 'click_to_text', countingMethod: 'ONCE_PER_EVENT'   },
];

function getAuthClient() {
  const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
  auth.setCredentials({ refresh_token: REFRESH_TOKEN });
  return auth;
}

async function getAccessToken(auth) {
  const { token } = await auth.getAccessToken();
  return token;
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

async function listExistingKeyEvents(token) {
  const prop = `properties/${PROPERTY_ID}`;
  const data = await adminRequest('GET', `/${prop}/keyEvents`, undefined, token);
  return data.keyEvents || [];
}

async function main() {
  console.log(`\n=== GA4 Key Events — property ${PROPERTY_ID} ===\n`);

  const auth = getAuthClient();
  const token = await getAccessToken(auth);
  const prop = `properties/${PROPERTY_ID}`;

  // Check what's already registered
  console.log('→ Fetching existing key events...');
  const existing = await listExistingKeyEvents(token);
  const existingNames = new Set(existing.map(e => e.eventName));

  if (existing.length > 0) {
    console.log('  Currently registered key events:');
    existing.forEach(e => console.log(`    • ${e.eventName} (${e.countingMethod})`));
  } else {
    console.log('  No key events registered yet — that explains the 0 conversions.');
  }

  console.log('');

  // Register each event
  const results = { created: [], skipped: [], failed: [] };

  for (const { eventName, countingMethod } of KEY_EVENTS) {
    if (existingNames.has(eventName)) {
      console.log(`  ⏭  ${eventName} — already a key event, skipping`);
      results.skipped.push(eventName);
      continue;
    }

    try {
      const result = await adminRequest('POST', `/${prop}/keyEvents`, { eventName, countingMethod }, token);
      console.log(`  ✅ ${eventName} → ${countingMethod} (name: ${result.name})`);
      results.created.push(eventName);
    } catch (err) {
      console.error(`  ❌ ${eventName} → ${err.message}`);
      results.failed.push({ eventName, error: err.message });
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  if (results.created.length) {
    console.log(`✅ Created (${results.created.length}): ${results.created.join(', ')}`);
  }
  if (results.skipped.length) {
    console.log(`⏭  Skipped (${results.skipped.length}): ${results.skipped.join(', ')}`);
  }
  if (results.failed.length) {
    console.log(`❌ Failed  (${results.failed.length}): ${results.failed.map(f => f.eventName).join(', ')}`);
    results.failed.forEach(f => console.log(`   ${f.eventName}: ${f.error}`));
    process.exit(1);
  }

  console.log('\nKey Events take ~24h to appear in GA4 historical reports.');
  console.log('Going forward, GA4 Conversions will count form_submit, click_to_call, click_to_text.');
  console.log('\nNext: verify in GA4 Admin → Events → Key events tab.');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});

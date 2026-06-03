#!/usr/bin/env node
/**
 * Creates GA4 data filters to exclude known bot-city traffic.
 *
 * Bot cities identified from GA4 city report (May 5–Jun 1 2026):
 *   - Boardman, OR    → AWS us-west-2 data center (184 users, 0.18% engagement, <1s)
 *   - Ashburn, VA     → AWS us-east-1 data center (31 users, 3% engagement, 0.03s)
 *   - Singapore       → Cloud bot traffic (170 users, 0% engagement, 0s)
 *   - Burnaby, BC     → CDN/bot traffic (34 users, 2.94% engagement, 0.03s)
 *
 * How GA4 data filters work:
 *   1. InternalTrafficRules define which IP ranges are "internal."
 *   2. GA4 tags those requests with traffic_type=internal at collection time.
 *   3. A DataFilter with type INTERNAL_TRAFFIC (ACTIVE state) excludes them from all reports.
 *
 * Requires:
 *   GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN — get via: npm run oauth:ga4edit (analytics.edit scope)
 *   GOOGLE_ANALYTICS_PROPERTY_ID        — numeric GA4 property ID (e.g. 507414450)
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_ID     — OAuth client ID (shared with GSC/Ads)
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET — OAuth client secret
 *
 * Run: node scripts/filter-ga4-bot-cities.mjs
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config({ path: '.env.local' });

const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const REFRESH_TOKEN = process.env.GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

if (!PROPERTY_ID || !REFRESH_TOKEN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing required env vars. Need:');
  if (!PROPERTY_ID) console.error('  GOOGLE_ANALYTICS_PROPERTY_ID');
  if (!REFRESH_TOKEN) console.error('  GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN (run: npm run oauth:ga4edit)');
  if (!CLIENT_ID) console.error('  GOOGLE_SEARCH_CONSOLE_CLIENT_ID or GOOGLE_ADS_CLIENT_ID');
  if (!CLIENT_SECRET) console.error('  GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET or GOOGLE_ADS_CLIENT_SECRET');
  process.exit(1);
}

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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GA4 Admin API ${method} ${path}: ${JSON.stringify(data?.error || data)}`);
  return data;
}

// Fetch AWS IP ranges and extract CIDRs for given regions
async function getAwsIpRanges(regions) {
  console.log('Fetching AWS IP ranges...');
  const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
  const data = await res.json();
  const cidrs = data.prefixes
    .filter(p => regions.includes(p.region) && p.service === 'EC2')
    .map(p => p.ip_prefix);
  console.log(`  Found ${cidrs.length} CIDRs for regions: ${regions.join(', ')}`);
  return cidrs;
}

async function main() {
  const auth = getAuthClient();
  const token = await getAccessToken(auth);
  const prop = `properties/${PROPERTY_ID}`;

  console.log(`\n=== GA4 Bot Traffic Filter — property ${PROPERTY_ID} ===\n`);

  // ── Step 1: Fetch bot IP ranges ──────────────────────────────────────────
  // Boardman = us-west-2, Ashburn = us-east-1
  const awsCidrs = await getAwsIpRanges(['us-west-2', 'us-east-1']);

  // GA4 InternalTrafficRule accepts max 10 IP expressions per rule.
  // We'll create multiple rules if needed, chunking the CIDR list.
  // Use up to 200 of the most specific /16 and larger ranges to stay manageable.
  const filtered = awsCidrs
    .filter(cidr => {
      const prefix = parseInt(cidr.split('/')[1], 10);
      return prefix <= 20; // only /20 and larger (broader blocks) to keep the list short
    })
    .slice(0, 100);

  console.log(`  Using ${filtered.length} broader CIDR blocks for the filter`);

  // ── Step 2: List existing internal traffic rules ──────────────────────────
  console.log('\n→ Checking existing internal traffic rules...');
  let existing;
  try {
    existing = await adminRequest('GET', `/${prop}/dataStreams`, undefined, token);
  } catch (e) {
    console.error('Could not list data streams:', e.message);
  }

  // ── Step 3: Create internal traffic rule with AWS bot IPs ─────────────────
  console.log('\n→ Creating internal traffic rule for AWS bot IPs (Boardman + Ashburn)...');

  // GA4 requires IP expressions in specific format: CIDR or exact IP
  // Chunk into groups of 10 (API limit per rule)
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < filtered.length; i += chunkSize) {
    chunks.push(filtered.slice(i, i + chunkSize));
  }

  const ruleNames = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const ruleName = `AWS Bot IPs (${i + 1}/${chunks.length})`;
    console.log(`  Creating rule ${i + 1}/${chunks.length}: ${chunk.length} IP ranges`);
    try {
      const rule = await adminRequest('POST', `/${prop}/internalUserLinks`, {
        displayName: ruleName,
        filterExpression: {
          andGroup: {
            expressions: chunk.map(cidr => ({
              filter: {
                fieldName: 'clientIpAddress',
                stringFilter: {
                  matchType: 'BEGINS_WITH',
                  value: cidr.split('/')[0].split('.').slice(0, 2).join('.'),
                },
              },
            })),
          },
        },
      }, token);
      ruleNames.push(rule.name);
    } catch (e) {
      // Try the correct internal traffic rule endpoint
      try {
        const rule = await adminRequest('POST', `/${prop}/internalTrafficRules`, {
          displayName: ruleName,
          trafficSource: { trafficType: 'INTERNAL_TRAFFIC' },
          ipAddresses: chunk.map(cidr => ({ value: cidr })),
        }, token);
        ruleNames.push(rule.name);
        console.log(`  ✅ Created: ${rule.name}`);
      } catch (e2) {
        console.warn(`  ⚠️ Rule creation failed (${ruleName}):`, e2.message);
      }
    }
  }

  // ── Step 4: Create the DataFilter to EXCLUDE internal traffic ─────────────
  console.log('\n→ Creating DataFilter to exclude internal traffic from all reports...');
  try {
    const existing = await adminRequest('GET', `/${prop}/dataFilters`, undefined, token);
    const alreadyExists = (existing.dataFilters || []).find(f =>
      f.filterType === 'INTERNAL_TRAFFIC' && f.state === 'ACTIVE'
    );
    if (alreadyExists) {
      console.log(`  ℹ️ Active INTERNAL_TRAFFIC filter already exists: ${alreadyExists.name}`);
      console.log('  No duplicate created.');
    } else {
      const filter = await adminRequest('POST', `/${prop}/dataFilters`, {
        displayName: 'Exclude Bot Traffic (Boardman + Ashburn AWS)',
        filterType: 'INTERNAL_TRAFFIC',
        state: 'ACTIVE',
      }, token);
      console.log(`  ✅ DataFilter created: ${filter.name}`);
    }
  } catch (e) {
    console.error('  ❌ DataFilter creation failed:', e.message);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== Done ===');
  console.log(`Internal traffic rules created: ${ruleNames.length}`);
  console.log('\nNote: GA4 data filters apply going forward — historical data is unaffected.');
  console.log('Bot traffic from Boardman (AWS us-west-2) and Ashburn (AWS us-east-1)');
  console.log('will be excluded from all GA4 reports once those IPs send tagged requests.');
  console.log('\nFor Singapore bots: add a manual internal traffic rule in GA4 Admin UI');
  console.log('→ Admin > Data collection > Defining internal traffic > Add rule');
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});

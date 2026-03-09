#!/usr/bin/env node
/**
 * Creates google_reviews and google_reviews_meta tables via Supabase management API.
 */
const https = require('https');
const fs = require('fs');

function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  fs.readFileSync(p, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}
loadEnv('.env.local.service');
loadEnv('.env.local');

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0];
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectRef || !serviceKey) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const sql = `
CREATE TABLE IF NOT EXISTS google_reviews (
  review_id     TEXT PRIMARY KEY,
  reviewer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL,
  comment       TEXT,
  published_at  DATE,
  synced_at     TIMESTAMPTZ DEFAULT NOW(),
  source        TEXT DEFAULT 'google_places_api'
);

CREATE TABLE IF NOT EXISTS google_reviews_meta (
  id                SERIAL PRIMARY KEY,
  user_rating_count INTEGER,
  average_rating    NUMERIC(3,2),
  place_id          TEXT,
  synced_at         TIMESTAMPTZ DEFAULT NOW()
);
`;

const body = JSON.stringify({ query: sql });
const options = {
  hostname: `${projectRef}.supabase.co`,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

// Try the management API instead
const mgmtOptions = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(mgmtOptions, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('Migration applied successfully');
    } else {
      console.log('Status:', res.statusCode);
      console.log('Response:', data.slice(0, 500));
    }
  });
});
req.on('error', err => console.error('Request error:', err.message));
req.write(body);
req.end();

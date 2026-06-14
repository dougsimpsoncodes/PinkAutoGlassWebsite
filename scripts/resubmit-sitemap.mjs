#!/usr/bin/env node
/** Resubmit pinkautoglass.com sitemap to GSC. Usage: node scripts/resubmit-sitemap.mjs */
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET,
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN });
const client = google.searchconsole({ version: 'v1', auth });

const SITE = 'sc-domain:pinkautoglass.com';
const SITEMAP = 'https://pinkautoglass.com/sitemap.xml';

try {
  await client.sitemaps.submit({ siteUrl: SITE, feedpath: SITEMAP });
  const res = await client.sitemaps.get({ siteUrl: SITE, feedpath: SITEMAP });
  console.log('Sitemap resubmitted:', SITEMAP);
  console.log('Last submitted now:', res.data.lastSubmitted);
  console.log('Contents:', JSON.stringify(res.data.contents, null, 2));
} catch (e) {
  console.error('Failed:', e.message);
  process.exit(1);
}

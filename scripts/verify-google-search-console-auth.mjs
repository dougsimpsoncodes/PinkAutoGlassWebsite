#!/usr/bin/env node
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });

const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;

if (!clientId || !clientSecret || !refreshToken) {
  console.error('Missing GOOGLE_SEARCH_CONSOLE_* credentials in .env.local');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
oauth2Client.setCredentials({ refresh_token: refreshToken });

const client = google.searchconsole({ version: 'v1', auth: oauth2Client });

try {
  const res = await client.sites.list({});
  const sites = res.data.siteEntry || [];
  const siteUrls = sites.map((s) => s.siteUrl);
  console.log(`GSC auth OK. Accessible properties: ${sites.length}`);
  console.log(`Has sc-domain:pinkautoglass.com: ${siteUrls.includes('sc-domain:pinkautoglass.com') ? 'yes' : 'no'}`);
} catch (error) {
  console.error(`GSC verification failed: ${error.message}`);
  process.exit(1);
}

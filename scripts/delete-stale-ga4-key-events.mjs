#!/usr/bin/env node
import dotenv from 'dotenv';
import { google } from 'googleapis';
dotenv.config({ path: '.env.local' });

const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ANALYTICS_EDIT_REFRESH_TOKEN;

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
auth.setCredentials({ refresh_token: REFRESH_TOKEN });
const { token } = await auth.getAccessToken();

const base = `https://analyticsadmin.googleapis.com/v1alpha/properties/${PROPERTY_ID}`;

const res = await fetch(`${base}/keyEvents`, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();

const stale = (data.keyEvents || []).filter(e => ['close_convert_lead', 'qualify_lead'].includes(e.eventName));
console.log(`Found ${stale.length} stale key event(s) to delete.`);

for (const event of stale) {
  const del = await fetch(`https://analyticsadmin.googleapis.com/v1alpha/${event.name}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`DELETE ${event.eventName}: ${del.ok ? '✅ deleted' : `❌ ${del.status}`}`);
}

console.log('Done.');

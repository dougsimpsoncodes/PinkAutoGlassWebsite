#!/usr/bin/env tsx
/**
 * Google Ads OAuth token self-check (local)
 *
 * Usage:
 *   NODE_OPTIONS="-r dotenv/config" DOTENV_CONFIG_PATH=".env.local" tsx scripts/google-ads-token-check.ts
 *   # or pass a path
 *   tsx scripts/google-ads-token-check.ts .env.local
 */

import fs from 'node:fs';
import path from 'node:path';

async function loadDotenvInline(file?: string) {
  try {
    const dotenvPath = file || process.env.DOTENV_CONFIG_PATH;
    if (!dotenvPath) return;
    const abs = path.resolve(dotenvPath);
    if (fs.existsSync(abs)) {
      const dotenv = await import('dotenv');
      dotenv.config({ path: abs });
      console.log(`[token-check] Loaded env from ${abs}`);
    }
  } catch (e) {
    /* noop */
  }
}

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function tokenCheck() {
  const args = process.argv.slice(2);
  if (args[0]) {
    await loadDotenvInline(args[0]);
  } else {
    await loadDotenvInline();
  }

  const client_id = env('GOOGLE_ADS_CLIENT_ID');
  const client_secret = env('GOOGLE_ADS_CLIENT_SECRET');
  const refresh_token = env('GOOGLE_ADS_REFRESH_TOKEN');

  const form = new URLSearchParams();
  form.set('client_id', client_id);
  form.set('client_secret', client_secret);
  form.set('grant_type', 'refresh_token');
  form.set('refresh_token', refresh_token);

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const text = await resp.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* keep text */ }

  if (!resp.ok) {
    console.error('[token-check] FAILED', resp.status, resp.statusText);
    console.error(json || text);
    process.exit(1);
  }

  // Mask sensitive values in output
  const masked = { ...json };
  if (masked.access_token) masked.access_token = `${String(masked.access_token).slice(0,6)}...`;
  console.log('[token-check] OK');
  console.log({
    token_type: masked.token_type,
    expires_in: masked.expires_in,
    scope: masked.scope,
    access_token_preview: masked.access_token,
  });
}

tokenCheck().catch((e) => { console.error(e); process.exit(1); });


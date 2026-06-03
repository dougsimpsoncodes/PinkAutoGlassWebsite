#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');

dotenv.config({ path: ENV_PATH });

const SERVICES = {
  gsc: {
    label: 'Google Search Console (read-only)',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    envVar: 'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN',
    redirectUri: 'https://developers.google.com/oauthplayground',
  },
  ga4: {
    label: 'Google Analytics 4 (read-only)',
    scope: ['https://www.googleapis.com/auth/analytics.readonly'],
    envVar: 'GOOGLE_ANALYTICS_REFRESH_TOKEN',
    redirectUri: 'https://developers.google.com/oauthplayground',
  },
  ads: {
    label: 'Google Ads',
    scope: ['https://www.googleapis.com/auth/adwords'],
    envVar: 'GOOGLE_ADS_REFRESH_TOKEN',
    redirectUri: 'https://developers.google.com/oauthplayground',
  },
  gbp: {
    label: 'Google Business Profile',
    scope: ['https://www.googleapis.com/auth/business.manage'],
    envVar: 'GBP_REFRESH_TOKEN',
    redirectUri: 'https://developers.google.com/oauthplayground',
  },
};

function usage() {
  console.log('Usage: node scripts/exchange-google-oauth-code.mjs <gsc|ga4|ads|gbp>');
}

function getEnv(name, fallbacks = []) {
  const value = process.env[name] || fallbacks.map(k => process.env[k]).find(Boolean);
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.stdin;
    const onData = (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(question + '*'.repeat(rl.line.length));
          break;
      }
    };
    process.stdout.write(question);
    stdin.on('data', onData);
    rl.question('', (value) => {
      stdin.removeListener('data', onData);
      rl.close();
      console.log('');
      resolve(value.trim());
    });
  });
}

function updateEnvFile(key, value) {
  const exists = fs.existsSync(ENV_PATH);
  const original = exists ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  const lines = original ? original.split(/\r?\n/) : [];
  let found = false;

  const nextLines = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) nextLines.push(`${key}=${value}`);

  const finalText = nextLines.filter((line, idx, arr) => !(idx === arr.length - 1 && line === '')).join('\n') + '\n';
  fs.writeFileSync(ENV_PATH, finalText, { mode: 0o600 });
}

function mask(value) {
  if (!value) return '[missing]';
  if (value.length <= 10) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

async function main() {
  const serviceName = process.argv[2];
  if (!serviceName || !SERVICES[serviceName]) {
    usage();
    process.exit(1);
  }

  const service = SERVICES[serviceName];
  const clientId = getEnv('GOOGLE_SEARCH_CONSOLE_CLIENT_ID', ['GOOGLE_ADS_CLIENT_ID']);
  const clientSecret = getEnv('GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET', ['GOOGLE_ADS_CLIENT_SECRET']);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, service.redirectUri);

  console.log(`\nSecure OAuth exchange for: ${service.label}`);
  console.log(`Target env var: ${service.envVar}`);
  console.log('This keeps the auth code and refresh token local. Nothing should be pasted into chat.\n');

  const authCode = await promptHidden('Paste the authorization code here (input hidden): ');
  if (!authCode) throw new Error('No authorization code provided.');

  const { tokens } = await oauth2Client.getToken({
    code: authCode,
    redirect_uri: service.redirectUri,
  });

  if (!tokens.refresh_token) {
    throw new Error('No refresh token returned. Re-run the consent flow with prompt=consent and offline access.');
  }

  updateEnvFile(service.envVar, tokens.refresh_token);

  console.log(`\nSaved ${service.envVar} to ${ENV_PATH}`);
  console.log(`Stored token: ${mask(tokens.refresh_token)}`);
  console.log('Next step: run a local verification command, not chat copy/paste.\n');
}

main().catch((error) => {
  console.error(`\nOAuth exchange failed: ${error.message}`);
  process.exit(1);
});

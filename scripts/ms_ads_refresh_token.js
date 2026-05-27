#!/usr/bin/env node
const http = require('http');
const { URL } = require('url');
const { spawn } = require('child_process');

const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const DEFAULT_PORTS = [8080, 8081, 8082];
const REDIRECT_URI = process.env.MICROSOFT_ADS_REDIRECT_URI || '';
let activeRedirectUri = '';
const SCOPE = 'https://ads.microsoft.com/msads.manage offline_access';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing MICROSOFT_ADS_CLIENT_ID or MICROSOFT_ADS_CLIENT_SECRET in env.');
  process.exit(1);
}

function buildAuthUrl(redirectUri) {
  return (
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize' +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(SCOPE)}` +
    `&prompt=consent`
  );
}

function openBrowser(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'login.microsoftonline.com') {
    throw new Error('Refusing to open unexpected OAuth URL.');
  }

  const command = process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
      ? 'cmd'
      : 'xdg-open';
  const args = process.platform === 'win32'
    ? ['/c', 'start', '', parsed.toString()]
    : [parsed.toString()];

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    shell: false,
  });
  child.unref();
}

function assertLocalRedirectUri(redirectUri) {
  const parsed = new URL(redirectUri);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (parsed.protocol !== 'http:' || !localHosts.has(parsed.hostname)) {
    throw new Error('MICROSOFT_ADS_REDIRECT_URI must be an http:// localhost redirect URI.');
  }
}

// Local OAuth callback only; bound to 127.0.0.1 below and never deployed.
const server = http.createServer(async (req, res) => { // nosemgrep: problem-based-packs.insecure-transport.js-node.using-http-server.using-http-server
  const url = new URL(req.url, activeRedirectUri || 'http://localhost');
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing code');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Code received. You can close this tab.');

  try {
    const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: activeRedirectUri,
        scope: SCOPE,
      }),
    });

    const json = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('Token exchange failed:', json);
      process.exit(1);
    }

    console.log('\n=== NEW REFRESH TOKEN ===');
    console.log(json.refresh_token);
    console.log('=========================\n');
    console.log('Set this in Vercel: MICROSOFT_ADS_REFRESH_TOKEN');
  } catch (err) {
    console.error('Token exchange error:', err);
  } finally {
    server.close();
  }
});

function tryListen(portIndex) {
  const port = DEFAULT_PORTS[portIndex];
  if (!port) {
    console.error(
      'No available ports. Set MICROSOFT_ADS_REDIRECT_URI to a registered localhost redirect (e.g. http://localhost:8080).'
    );
    process.exit(1);
  }

  const redirectUri = REDIRECT_URI || `http://localhost:${port}`;
  assertLocalRedirectUri(redirectUri);
  const listenPort = REDIRECT_URI ? Number(new URL(redirectUri).port || 80) : port;
  activeRedirectUri = redirectUri;

  server.listen(listenPort, '127.0.0.1', () => {
    console.log(`Listening on ${redirectUri} ...`);
    console.log('Opening auth URL in your browser...');
    openBrowser(buildAuthUrl(redirectUri));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !REDIRECT_URI) {
      console.warn(`Port ${port} is in use, trying next...`);
      tryListen(portIndex + 1);
      return;
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}

tryListen(0);

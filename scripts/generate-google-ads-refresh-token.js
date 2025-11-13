/**
 * Generate Google Ads API Refresh Token
 * This script uses the Desktop OAuth flow to generate a refresh token
 */

import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const execAsync = promisify(exec);

// OAuth credentials from environment variables
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080';
const SCOPE = 'https://www.googleapis.com/auth/adwords';

// Validate credentials are loaded
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET are set in .env.local');
  process.exit(1);
}

// Generate authorization URL
function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent' // Force consent screen to get refresh token
  });

  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

// Exchange authorization code for tokens
async function getTokens(authCode) {
  const params = new URLSearchParams({
    code: authCode,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get tokens: ${error}`);
  }

  return response.json();
}

// Start the OAuth flow
async function main() {
  console.log('\n🔐 Google Ads API - Refresh Token Generator\n');
  console.log('='.repeat(50));

  // Create a local server to receive the OAuth callback
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT_URI);

    if (url.pathname === '/') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: Arial; padding: 50px; text-align: center;">
              <h1 style="color: #d82c0d;">❌ Authorization Failed</h1>
              <p>Error: ${error}</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();
        process.exit(1);
      }

      if (code) {
        try {
          console.log('\n✅ Authorization code received!');
          console.log('📡 Exchanging code for tokens...\n');

          const tokens = await getTokens(code);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial; padding: 50px; text-align: center;">
                <h1 style="color: #00a47c;">✅ Success!</h1>
                <p style="font-size: 18px;">Your refresh token has been generated.</p>
                <p style="font-size: 14px; color: #666;">Check your terminal for the token.</p>
                <p style="margin-top: 30px;">You can close this window now.</p>
              </body>
            </html>
          `);

          console.log('='.repeat(50));
          console.log('\n✅ SUCCESS! Refresh token generated:\n');
          console.log('REFRESH TOKEN:');
          console.log(tokens.refresh_token);
          console.log('\n' + '='.repeat(50));
          console.log('\n📋 Save this token - you\'ll need it for .env.local\n');

          server.close();
          process.exit(0);
        } catch (error) {
          console.error('❌ Error getting tokens:', error.message);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial; padding: 50px; text-align: center;">
                <h1 style="color: #d82c0d;">❌ Error</h1>
                <p>${error.message}</p>
                <p>Check your terminal for details.</p>
              </body>
            </html>
          `);
          server.close();
          process.exit(1);
        }
      }
    }
  });

  // Start server on port 8080
  server.listen(8080, async () => {
    console.log('🌐 Local server started on http://localhost:8080\n');

    const authUrl = getAuthUrl();
    console.log('📂 Opening browser for authorization...\n');
    console.log('If browser doesn\'t open automatically, visit this URL:\n');
    console.log(authUrl);
    console.log('\n' + '='.repeat(50) + '\n');

    // Open browser
    const openCommand = process.platform === 'darwin' ? 'open' :
                       process.platform === 'win32' ? 'start' : 'xdg-open';

    try {
      await execAsync(`${openCommand} "${authUrl}"`);
      console.log('✅ Browser opened! Please approve the authorization.\n');
      console.log('Waiting for authorization...');
    } catch (error) {
      console.log('⚠️  Could not open browser automatically.');
      console.log('Please copy and paste the URL above into your browser.\n');
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error('\n❌ Error: Port 8080 is already in use.');
      console.error('Please close any other applications using port 8080 and try again.\n');
    } else {
      console.error('\n❌ Server error:', error.message);
    }
    process.exit(1);
  });
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});

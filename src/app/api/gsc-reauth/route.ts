/**
 * One-time GSC reauthorization route
 * DELETE THIS FILE after getting the new refresh token
 *
 * Usage:
 * 1. Add https://pinkautoglass.com/api/gsc-reauth as authorized redirect URI in Google Cloud Console
 * 2. Visit /api/gsc-reauth — click the Google authorization link
 * 3. Sign in and approve access
 * 4. Google redirects back here with the code — token exchange happens automatically
 * 5. Copy the refresh token into env vars
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

function getRedirectUri(req: NextRequest): string {
  const origin = new URL(req.url).origin;
  return `${origin}/api/gsc-reauth`;
}

export async function GET(req: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Missing GOOGLE_ADS_CLIENT_ID or CLIENT_SECRET' }, { status: 500 });
  }

  const redirectUri = getRedirectUri(req);
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
  const code = new URL(req.url).searchParams.get('code');

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);

      const html = `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:700px;margin:0 auto">
        <h2 style="color:#16a34a">GSC Reauthorization Successful</h2>
        <p><strong>New Refresh Token:</strong></p>
        <textarea style="width:100%;height:80px;font-size:11px;padding:8px;border:2px solid #16a34a;border-radius:8px" readonly onclick="this.select()">${tokens.refresh_token || 'NO REFRESH TOKEN — revoke access at https://myaccount.google.com/permissions first, then retry'}</textarea>
        <h3>Next steps:</h3>
        <ol>
          <li>Copy the refresh token above</li>
          <li>Update <code>GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN</code> in <strong>Vercel env vars</strong> and <strong>.env.local</strong></li>
          <li>Redeploy on Vercel (or restart dev server)</li>
          <li>Trigger a data sync to backfill GSC data</li>
          <li>Delete <code>src/app/api/gsc-reauth/route.ts</code></li>
        </ol>
      </body></html>`;
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
    } catch (err: any) {
      return NextResponse.json({
        error: 'Token exchange failed',
        details: err.message,
        hint: 'Make sure the redirect URI in Google Cloud Console matches exactly: ' + redirectUri,
      }, { status: 500 });
    }
  }

  // Generate authorization URL — Google will redirect back to this same route with ?code=...
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:700px;margin:0 auto">
    <h2>GSC Reauthorization</h2>
    <p>The Google Search Console refresh token expired in November 2025. Organic search data stopped syncing.</p>
    <p><strong>Sign in with the Google account that owns pinkautoglass.com in Search Console.</strong></p>

    <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:16px;margin:16px 0">
      <strong>Before clicking Authorize:</strong> Make sure this redirect URI is added in
      <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console → Credentials</a>:<br/>
      <code style="background:#fff;padding:4px 8px;border-radius:4px;display:inline-block;margin-top:8px;user-select:all">${redirectUri}</code>
    </div>

    <h3>Step 1: Authorize</h3>
    <a href="${authUrl}" style="display:inline-block;background:#e91e63;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px">
      Authorize Google Search Console
    </a>
    <p style="color:#666;font-size:13px;margin-top:8px">After approving, Google redirects back here automatically — no copy-paste needed.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

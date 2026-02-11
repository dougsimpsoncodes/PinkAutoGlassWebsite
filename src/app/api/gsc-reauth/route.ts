/**
 * One-time GSC reauthorization route
 * DELETE THIS FILE after getting the new refresh token
 *
 * Usage:
 * 1. Visit /api/gsc-reauth — click the Google authorization link
 * 2. Sign in and approve access
 * 3. You'll land on the OAuth Playground — copy the auth code from the URL
 * 4. Paste it at /api/gsc-reauth?code=YOUR_CODE
 * 5. Copy the refresh token into env vars
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
// Use the OAuth Playground URI that's already authorized in Google Cloud Console
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

export async function GET(req: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Missing GOOGLE_ADS_CLIENT_ID or CLIENT_SECRET' }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
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
        hint: 'Make sure you copied the full code parameter and it has not expired (codes expire in minutes)',
      }, { status: 500 });
    }
  }

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const origin = new URL(req.url).origin;
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:700px;margin:0 auto">
    <h2>GSC Reauthorization</h2>
    <p>The Google Search Console refresh token expired in November 2025. Organic search data stopped syncing.</p>
    <p><strong>Sign in with the Google account that owns pinkautoglass.com in Search Console.</strong></p>

    <h3>Step 1: Authorize</h3>
    <a href="${authUrl}" target="_blank" style="display:inline-block;background:#e91e63;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px">
      Authorize Google Search Console
    </a>

    <h3>Step 2: Copy the code</h3>
    <p>After approving, you'll land on the OAuth Playground page. Look at the URL bar — it will have <code>?code=4/0A...</code></p>
    <p>Copy everything after <code>code=</code> (up to the next <code>&</code> if there is one).</p>

    <h3>Step 3: Paste the code</h3>
    <form method="get" action="${origin}/api/gsc-reauth">
      <input name="code" type="text" placeholder="Paste authorization code here..."
             style="width:100%;padding:12px;font-size:14px;border:2px solid #ccc;border-radius:8px;margin-bottom:12px" />
      <button type="submit" style="background:#e91e63;color:white;padding:12px 24px;border:none;border-radius:8px;font-size:16px;cursor:pointer">
        Exchange for Refresh Token
      </button>
    </form>
  </body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

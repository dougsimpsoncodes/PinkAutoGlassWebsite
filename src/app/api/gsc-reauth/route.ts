/**
 * One-time OAuth reauthorization route for GSC + Google Ads
 * DELETE THIS FILE after getting the new refresh tokens
 *
 * Usage:
 * 1. Visit /api/gsc-reauth — click the authorization link for GSC or Google Ads
 * 2. Sign in and approve access
 * 3. Google redirects back — token exchange happens automatically
 * 4. Copy the refresh token into env vars
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

const SCOPES: Record<string, { scope: string[]; envVar: string; label: string }> = {
  gsc: {
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    envVar: 'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN',
    label: 'Google Search Console (read-only)',
  },
  'gsc-write': {
    scope: [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/siteverification',
    ],
    envVar: 'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN',
    label: 'Google Search Console (write + verify)',
  },
  ads: {
    scope: ['https://www.googleapis.com/auth/adwords'],
    envVar: 'GOOGLE_ADS_REFRESH_TOKEN',
    label: 'Google Ads',
  },
};

function getRedirectUri(req: NextRequest): string {
  const origin = new URL(req.url).origin;
  return `${origin}/api/gsc-reauth`;
}

export async function GET(req: NextRequest) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Missing CLIENT_ID or CLIENT_SECRET env vars' }, { status: 500 });
  }

  const redirectUri = getRedirectUri(req);
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') as string; // Google passes state back ('gsc' or 'ads')

  // Step 2: Exchange code for tokens
  if (code) {
    const svc = SCOPES[state || 'gsc'];
    try {
      const { tokens } = await oauth2Client.getToken(code);

      const html = `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:700px;margin:0 auto">
        <h2 style="color:#16a34a">${svc.label} Reauthorization Successful</h2>
        <p><strong>New Refresh Token:</strong></p>
        <textarea style="width:100%;height:80px;font-size:11px;padding:8px;border:2px solid #16a34a;border-radius:8px" readonly onclick="this.select()">${tokens.refresh_token || 'NO REFRESH TOKEN — revoke access at https://myaccount.google.com/permissions first, then retry'}</textarea>
        <h3>Next steps:</h3>
        <ol>
          <li>Copy the refresh token above</li>
          <li>Update <code>${svc.envVar}</code> in <strong>Vercel env vars</strong> and <strong>.env.local</strong></li>
          <li><a href="${redirectUri}">Go back</a> to reauthorize the other service if needed</li>
          <li>Redeploy on Vercel after updating all tokens</li>
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

  // Step 1: Show authorization links for both services
  const links = Object.entries(SCOPES).map(([key, svc]) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: svc.scope,
      state: key,
    });
    return { key, authUrl, ...svc };
  });

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;max-width:700px;margin:0 auto">
    <h2>Google OAuth Reauthorization</h2>
    <p>The Desktop OAuth app was deleted. Both Google Ads and Search Console need new refresh tokens using the Web Client.</p>

    <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;padding:16px;margin:16px 0">
      <strong>Redirect URI configured:</strong><br/>
      <code style="background:#fff;padding:4px 8px;border-radius:4px;display:inline-block;margin-top:8px">${redirectUri}</code>
    </div>

    ${links.map(l => `
      <div style="margin:20px 0;padding:20px;border:2px solid #e5e7eb;border-radius:12px">
        <h3 style="margin-top:0">${l.label}</h3>
        <p style="color:#666;font-size:14px">Scope: <code>${l.scope.join(', ')}</code></p>
        <p style="color:#666;font-size:14px">Updates env var: <code>${l.envVar}</code></p>
        <a href="${l.authUrl}" style="display:inline-block;background:#e91e63;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-size:16px">
          Authorize ${l.label}
        </a>
      </div>
    `).join('')}

    <p style="color:#666;font-size:13px">After approving, Google redirects back here automatically — no copy-paste needed.</p>
  </body></html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

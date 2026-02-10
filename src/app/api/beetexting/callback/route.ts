import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/beetexting/callback
 *
 * One-time OAuth callback for Beetexting API authorization.
 * Exchanges the auth code for access + refresh tokens.
 * After getting the refresh token, store it in env vars and remove this route.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error, description: request.nextUrl.searchParams.get('error_description') }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  const clientId = process.env.BEETEXTING_CLIENT_ID!;
  const clientSecret = process.env.BEETEXTING_CLIENT_SECRET!;
  const redirectUri = process.env.BEETEXTING_REDIRECT_URI!;
  const tokenUrl = process.env.BEETEXTING_TOKEN_URL!;

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': process.env.BEETEXTING_API_KEY || '',
      },
      body: body.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Token exchange failed', details: tokenData }, { status: tokenResponse.status });
    }

    // Display tokens so we can store the refresh token in env vars
    // DO NOT leave this route in production after getting the token
    return new NextResponse(
      `<html><body style="font-family:monospace;padding:40px">
        <h2>Beetexting OAuth Success</h2>
        <p><strong>Access Token:</strong><br><textarea rows="3" cols="80">${tokenData.access_token || ''}</textarea></p>
        <p><strong>Refresh Token:</strong><br><textarea rows="3" cols="80">${tokenData.refresh_token || ''}</textarea></p>
        <p><strong>Expires In:</strong> ${tokenData.expires_in || 'N/A'} seconds</p>
        <p><strong>Token Type:</strong> ${tokenData.token_type || 'N/A'}</p>
        <p><strong>Scope:</strong> ${tokenData.scope || 'N/A'}</p>
        <hr>
        <p>Copy the refresh token and add it to Vercel env vars as BEETEXTING_REFRESH_TOKEN.<br>
        Then delete this callback route from the codebase.</p>
        <pre>${JSON.stringify(tokenData, null, 2)}</pre>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Token exchange exception', message: String(err) }, { status: 500 });
  }
}

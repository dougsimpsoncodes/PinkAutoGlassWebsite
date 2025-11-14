import { NextRequest, NextResponse } from 'next/server';
import { validateAdminApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;

  const client_id = process.env.GOOGLE_ADS_CLIENT_ID;
  const client_secret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refresh_token = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    return NextResponse.json({ ok: false, error: 'Missing Google Ads env vars' }, { status: 500 });
  }

  try {
    const form = new URLSearchParams();
    form.set('client_id', client_id);
    form.set('client_secret', client_secret);
    form.set('grant_type', 'refresh_token');
    form.set('refresh_token', refresh_token);

    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store'
    });

    const text = await resp.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* keep text */ }

    if (!resp.ok) {
      // Return only non-sensitive info
      const error = json?.error || resp.statusText || 'unknown_error';
      return NextResponse.json({ ok: false, error, status: resp.status }, { status: 200 });
    }

    const masked = { ...json };
    if (masked.access_token) masked.access_token = `${String(masked.access_token).slice(0,6)}...`;
    return NextResponse.json({ ok: true, token_type: masked.token_type, expires_in: masked.expires_in, scope: masked.scope, access_token_preview: masked.access_token });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'token_check_failed' }, { status: 200 });
  }
}


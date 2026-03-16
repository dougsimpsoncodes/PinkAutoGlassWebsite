import { SMSOptions, sendSMS as sendViaRingCentral } from './sms';
import { isOptedOut } from '@/lib/sms-opt-out';

// --- Token cache ---
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Acquire an OAuth2 access token from Beetexting's auth server.
 *
 * Strategy:
 *  1. If BEETEXTING_REFRESH_TOKEN is set → use refresh_token grant
 *  2. Otherwise → use client_credentials grant
 *
 * Tokens are cached in memory until 60s before expiry.
 */
async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.BEETEXTING_CLIENT_ID;
  const clientSecret = process.env.BEETEXTING_CLIENT_SECRET;
  const apiKey = process.env.BEETEXTING_API_KEY;
  const tokenUrl = process.env.BEETEXTING_TOKEN_URL;

  if (!clientId || !clientSecret || !apiKey || !tokenUrl) {
    console.error('❌ Beetexting credentials not configured');
    return null;
  }

  const refreshToken = process.env.BEETEXTING_REFRESH_TOKEN;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (refreshToken) {
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', refreshToken);
  } else {
    params.set('grant_type', 'client_credentials');
    params.set('scope', 'https://com.beetexting.scopes/SendMessage');
  }

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': apiKey,
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`❌ Beetexting token request failed (${res.status}):`, errBody);
      return null;
    }

    const data = await res.json();
    cachedToken = data.access_token;
    // expires_in is seconds; default to 3600 if missing
    const expiresInMs = (data.expires_in || 3600) * 1000;
    tokenExpiresAt = Date.now() + expiresInMs;

    console.log('✅ Beetexting access token acquired');
    return cachedToken;
  } catch (err) {
    console.error('❌ Beetexting token request exception:', err);
    return null;
  }
}

const BEETEXTING_SEND_URL = 'https://connect.beetexting.com/prod/message/sendsms';

/**
 * Send a customer-facing SMS via the Beetexting Connect API.
 *
 * Messages appear in Dan's Beetexting inbox (unlike RingCentral direct sends).
 * Uses the same SMSOptions interface as the RingCentral sendSMS for drop-in swap.
 */
export async function sendCustomerSMS(options: SMSOptions): Promise<boolean> {
  // Check SMS opt-out before sending (unless bypassed for compliance confirmations)
  if (!options.bypassOptOutCheck && options.to) {
    try {
      if (await isOptedOut(options.to)) {
        console.log(`🚫 SMS blocked: ${options.to} is opted out`);
        return false;
      }
    } catch (err) {
      // Fail-closed: if we can't verify opt-out status, block the send (TCPA safety)
      console.error('Opt-out check failed, blocking send for safety:', err);
      return false;
    }
  }

  const agentEmail = process.env.BEETEXTING_AGENT_EMAIL;
  const fromNumber = process.env.BEETEXTING_FROM_NUMBER;
  const apiKey = process.env.BEETEXTING_API_KEY;

  // Fall back to RingCentral if Beetexting is not configured.
  // This allows SMS to function while Beetexting OAuth is pending.
  if (!agentEmail || !fromNumber || !apiKey) {
    console.log('⚠️ Beetexting not configured — falling back to RingCentral');
    return sendViaRingCentral(options);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return false;
  }

  // API max is 1000 chars
  const text = options.message.slice(0, 1000);

  const url = new URL(`${BEETEXTING_SEND_URL}/${encodeURIComponent(agentEmail)}`);
  url.searchParams.set('from', fromNumber);
  url.searchParams.set('to', options.to);
  url.searchParams.set('text', text);

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`❌ Beetexting sendSMS failed (${res.status}):`, errBody);
      return false;
    }

    const data = await res.json();
    console.log(`✅ SMS sent to ${options.to} via Beetexting (status: ${data.status})`);
    return true;
  } catch (err) {
    console.error('❌ Beetexting sendSMS exception:', err);
    return false;
  }
}

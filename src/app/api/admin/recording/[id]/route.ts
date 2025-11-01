import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;

    // Step 1: Get access token
    if (!RC_JWT_TOKEN || !RC_CLIENT_ID || !RC_CLIENT_SECRET) {
      throw new Error('RingCentral credentials not configured');
    }

    const basicAuth = Buffer.from(`${RC_CLIENT_ID}:${RC_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await fetch(`${RC_SERVER_URL}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: RC_JWT_TOKEN,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to authenticate with RingCentral');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Fetch recording content
    const contentUrl = `${RC_SERVER_URL}/restapi/v1.0/account/~/recording/${recordingId}/content`;

    const recordingResponse = await fetch(contentUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!recordingResponse.ok) {
      throw new Error(`Failed to fetch recording: ${recordingResponse.statusText}`);
    }

    // Step 3: Stream the recording to the client
    const contentType = recordingResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = recordingResponse.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="recording-${recordingId}.mp3"`,
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Get the recording data
    const recordingData = await recordingResponse.arrayBuffer();

    return new NextResponse(recordingData, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Recording fetch error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

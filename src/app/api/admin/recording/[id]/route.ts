import { NextRequest, NextResponse } from 'next/server';
import { SDK } from '@ringcentral/sdk';

const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

// Initialize RingCentral SDK
function createRingCentralSDK() {
  if (!RC_JWT_TOKEN || !RC_CLIENT_ID || !RC_CLIENT_SECRET) {
    throw new Error('RingCentral credentials not configured');
  }

  const rcsdk = new SDK({
    server: RC_SERVER_URL,
    clientId: RC_CLIENT_ID.trim(),
    clientSecret: RC_CLIENT_SECRET.trim(),
  });

  return rcsdk.platform();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;
    console.log('Fetching recording:', recordingId);

    // Initialize and authenticate with SDK
    const platform = createRingCentralSDK();
    await platform.login({ jwt: RC_JWT_TOKEN!.trim() });
    console.log('✓ Successfully authenticated with RingCentral');

    // Fetch recording content using SDK
    const contentUrl = `/restapi/v1.0/account/~/recording/${recordingId}/content`;
    console.log('Fetching recording content...');

    const recordingResponse = await platform.get(contentUrl);

    if (!recordingResponse.ok()) {
      const errorText = await recordingResponse.text();
      console.error('Recording fetch error:', errorText);
      throw new Error(`Failed to fetch recording (${recordingResponse.status()}): ${errorText}`);
    }

    console.log('Recording fetched successfully');

    // Stream the recording to the client
    const contentType = recordingResponse._response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = recordingResponse._response.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="recording-${recordingId}.mp3"`,
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Get the recording data
    const recordingData = await recordingResponse._response.arrayBuffer();

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

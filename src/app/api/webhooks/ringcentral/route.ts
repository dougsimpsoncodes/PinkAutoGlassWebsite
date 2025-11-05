import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SDK } from '@ringcentral/sdk';

// Create Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Create RingCentral client
function getRingCentralClient() {
  return new SDK({
    server: process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com',
    clientId: process.env.RINGCENTRAL_CLIENT_ID!,
    clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET!
  });
}

/**
 * RingCentral Webhook Receiver
 *
 * This endpoint receives real-time call events from RingCentral via webhooks.
 * No polling needed - RingCentral pushes updates when calls happen.
 *
 * Event Filter: /restapi/v1.0/account/~/telephony/sessions
 * Receives: Call start, end, state changes for all extensions
 */

// Handle webhook validation (RingCentral sends this when registering webhook)
export async function GET(req: NextRequest) {
  const validationToken = req.headers.get('validation-token');

  if (validationToken) {
    console.log('✓ Webhook validation request received');
    console.log(`   Validation Token: ${validationToken}`);

    // RingCentral expects validation token ONLY in header with empty body
    // Response must be under 1024 bytes (per official RingCentral docs)
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Validation-Token': validationToken,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    message: 'RingCentral Webhook Endpoint'
  });
}

// Handle incoming webhook events
export async function POST(req: NextRequest) {
  // Check for validation token FIRST (before parsing body)
  // RingCentral sends validation request as POST with validation-token header
  const validationToken = req.headers.get('validation-token');
  if (validationToken) {
    console.log('✓ Webhook validation request received (POST)');
    console.log(`   Validation Token: ${validationToken}`);

    // Return validation token in header with empty body
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Validation-Token': validationToken,
      },
    });
  }

  const supabase = getSupabaseClient();

  try {
    const body = await req.json();

    console.log('📞 Webhook event received:', {
      timestamp: body.timestamp,
      event: body.event,
      uuid: body.uuid,
    });

    // Process telephony session event
    if (body.event && body.event.includes('/telephony/sessions')) {
      await processTelephonyEvent(supabase, body);
    }

    return NextResponse.json({
      ok: true,
      message: 'Event processed'
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);

    // Return 200 even on error to prevent RingCentral from retrying
    // We'll log the error for debugging
    return NextResponse.json(
      {
        ok: false,
        error: error.message
      },
      { status: 200 }
    );
  }
}

/**
 * Process telephony session events and fetch full call details from Call Log API
 * Telephony webhooks notify us when calls happen, but don't include duration
 * So we fetch the full call details from the Call Log API
 */
async function processTelephonyEvent(supabase: any, webhookBody: any) {
  const { body, timestamp } = webhookBody;

  if (!body || !body.sessionId) {
    console.log('⚠️  No session data in webhook body');
    return;
  }

  const sessionId = body.sessionId;
  const parties = body.parties || [];

  console.log(`📊 Processing session ${sessionId} with ${parties.length} parties`);

  // For each party that has ended (Disconnected status), fetch full call details
  for (const party of parties) {
    try {
      const statusCode = party.status?.code;

      // Only fetch full details when call has ended
      if (statusCode === 'Disconnected' || statusCode === 'Gone') {
        console.log(`📞 Call ended, fetching full details from Call Log API...`);

        // Initialize RingCentral client
        const rcsdk = getRingCentralClient();
        const platform = rcsdk.platform();
        await platform.login({ jwt: process.env.RINGCENTRAL_JWT_TOKEN! });

        // Fetch call log records from the last 5 minutes
        const response = await platform.get('/restapi/v1.0/account/~/call-log', {
          dateFrom: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          view: 'Detailed',
          perPage: 10
        });

        const callLogData = await response.json();

        // Find the matching call by phone number and approximate time
        const matchingCall = callLogData.records.find((record: any) => {
          const fromMatch = record.from?.phoneNumber === party.from?.phoneNumber;
          const toMatch = record.to?.phoneNumber === party.to?.phoneNumber;
          return fromMatch && toMatch;
        });

        if (matchingCall) {
          console.log(`✓ Found matching call in Call Log with duration: ${matchingCall.duration}s`);

          // Store full call details with duration
          const callData = {
            call_id: party.id,
            session_id: sessionId,
            start_time: matchingCall.startTime,
            end_time: new Date().toISOString(),
            duration: matchingCall.duration || 0,
            direction: matchingCall.direction,
            from_number: matchingCall.from?.phoneNumber || '',
            from_name: matchingCall.from?.name || null,
            to_number: matchingCall.to?.phoneNumber || '',
            to_name: matchingCall.to?.name || null,
            result: matchingCall.result || 'Unknown',
            action: matchingCall.action || 'Phone Call',
            recording_id: matchingCall.recording?.id || null,
            recording_uri: matchingCall.recording?.contentUri || null,
            recording_type: matchingCall.recording?.type || null,
            recording_content_uri: matchingCall.recording?.contentUri || null,
            transport: party.transport || null,
            sync_timestamp: new Date().toISOString(),
            raw_data: matchingCall,
          };

          const { error } = await supabase
            .from('ringcentral_calls')
            .upsert(callData, { onConflict: 'call_id' });

          if (error) {
            console.error(`❌ Failed to upsert call:`, error.message);
          } else {
            console.log(`✓ Stored call with duration ${callData.duration}s - ${callData.direction} ${callData.result}`);
          }
        } else {
          console.log(`⚠️  Call not found in Call Log yet (may take 15-30 seconds)`);
        }
      }
    } catch (err: any) {
      console.error(`❌ Error processing party:`, err.message);
    }
  }
}

/**
 * Map RingCentral party status codes to familiar result names
 */
function mapPartyStatus(statusCode?: string): string {
  if (!statusCode) return 'Unknown';

  const statusMap: Record<string, string> = {
    'Answered': 'Accepted',
    'Connected': 'Accepted',
    'Disconnected': 'Call connected',
    'Gone': 'Accepted', // Call completed successfully
    'VoiceMail': 'Voicemail',
    'Busy': 'Busy',
    'NoAnswer': 'Missed',
    'Rejected': 'Rejected',
    'Proceeding': 'Ringing',
    'Setup': 'Ringing',
  };

  return statusMap[statusCode] || statusCode;
}

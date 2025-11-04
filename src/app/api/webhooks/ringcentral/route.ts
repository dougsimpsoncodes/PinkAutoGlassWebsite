import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  const supabase = getSupabaseClient();

  try {
    const body = await req.json();

    console.log('📞 Webhook event received:', {
      timestamp: body.timestamp,
      event: body.event,
      uuid: body.uuid,
    });

    // Validate webhook signature if needed
    const validationToken = req.headers.get('validation-token');
    if (validationToken) {
      // This is the initial validation request
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Validation-Token': validationToken,
        },
      });
    }

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
 * Process telephony session events and update/create call records
 */
async function processTelephonyEvent(supabase: any, webhookBody: any) {
  const { body } = webhookBody;

  if (!body || !body.sessionId) {
    console.log('⚠️  No session data in webhook body');
    return;
  }

  const sessionId = body.sessionId;
  const parties = body.parties || [];

  console.log(`📊 Processing session ${sessionId} with ${parties.length} parties`);

  // Process each party in the session (typically 2: caller and receiver)
  for (const party of parties) {
    try {
      // Extract call details from party data
      const callData = {
        call_id: party.id, // Unique call/party ID
        session_id: sessionId,
        start_time: party.status?.startTime || new Date().toISOString(),
        end_time: party.status?.endTime || null,
        duration: party.status?.duration || 0,
        direction: party.direction, // 'Inbound' or 'Outbound'
        from_number: party.from?.phoneNumber || '',
        from_name: party.from?.name || null,
        to_number: party.to?.phoneNumber || '',
        to_name: party.to?.name || null,
        result: mapPartyStatus(party.status?.code), // Map to familiar result names
        action: party.status?.reason || 'Phone Call',
        recording_id: null, // Will be populated when recording is available
        recording_uri: null,
        recording_type: null,
        recording_content_uri: null,
        transport: party.transport || null,
        sync_timestamp: new Date().toISOString(),
        raw_data: party, // Store full party data
      };

      // Upsert call data (insert or update if exists)
      const { error } = await supabase
        .from('ringcentral_calls')
        .upsert(callData, {
          onConflict: 'call_id',
        });

      if (error) {
        console.error(`❌ Failed to upsert call ${party.id}:`, error.message);
      } else {
        console.log(`✓ Updated call ${party.id} - ${callData.direction} ${callData.result}`);
      }
    } catch (err: any) {
      console.error(`❌ Error processing party ${party.id}:`, err.message);
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

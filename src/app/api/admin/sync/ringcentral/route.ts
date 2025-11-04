import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SDK } from '@ringcentral/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// RingCentral SDK configuration - handles auth automatically
const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

// Initialize RingCentral SDK for authentication only
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

export async function POST(req: NextRequest) {
  try {
    console.log('Initializing RingCentral SDK...');
    const platform = createRingCentralSDK();

    // Step 1: Authenticate using JWT - SDK handles token refresh automatically
    console.log('Authenticating with JWT...');
    await platform.login({ jwt: RC_JWT_TOKEN!.trim() });
    console.log('✓ Successfully authenticated with RingCentral');

    // Step 2: Get the access token from the SDK
    const authData = await platform.auth().data();
    const accessToken = authData.access_token;

    // Step 3: Fetch call log data using standard fetch (we know this works)
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    const dateFromISO = dateFrom.toISOString();

    console.log(`Fetching call logs from ${dateFromISO}...`);

    const callLogResponse = await fetch(
      `${RC_SERVER_URL}/restapi/v1.0/account/~/call-log?` +
        new URLSearchParams({
          dateFrom: dateFromISO,
          perPage: '1000',
          view: 'Detailed',
        }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!callLogResponse.ok) {
      const errorText = await callLogResponse.text();
      throw new Error(`Failed to fetch call logs: ${errorText}`);
    }

    const callLogData = await callLogResponse.json();
    const records = callLogData.records || [];

    console.log(`Found ${records.length} call records`);

    // Step 4: Store calls in database
    let newCalls = 0;
    let updatedCalls = 0;
    const errors = [];

    for (const record of records) {
      try {
        // Extract call details
        const callData = {
          call_id: record.id,
          session_id: record.sessionId,
          start_time: record.startTime,
          end_time: record.endTime || null,
          duration: record.duration || 0,
          direction: record.direction, // 'Inbound' or 'Outbound'
          from_number: record.from?.phoneNumber || '',
          from_name: record.from?.name || null,
          to_number: record.to?.phoneNumber || '',
          to_name: record.to?.name || null,
          result: record.result, // 'Accepted', 'Missed', 'Voicemail', etc.
          action: record.action, // 'Phone Call', 'VoIP Call', etc.
          recording_id: record.recording?.id || null,
          recording_uri: record.recording?.uri || null,
          recording_type: record.recording?.type || null,
          recording_content_uri: record.recording?.contentUri || null,
          transport: record.transport || null,
          sync_timestamp: new Date().toISOString(),
          raw_data: record, // Store full response
        };

        // Insert or update
        const { data, error } = await supabase
          .from('ringcentral_calls')
          .upsert(callData, {
            onConflict: 'call_id',
          })
          .select();

        if (error) {
          errors.push({
            call_id: record.id,
            error: error.message,
          });
        } else if (data) {
          if (data.length > 0) {
            newCalls++;
          } else {
            updatedCalls++;
          }
        }
      } catch (err: any) {
        errors.push({
          call_id: record.id,
          error: err.message,
        });
      }
    }

    // Step 5: Calculate summary statistics with unique caller deduplication
    const { data: stats } = await supabase
      .from('ringcentral_calls')
      .select('direction, result, duration, from_number, start_time')
      .gte('start_time', dateFromISO);

    const totalCalls = stats?.length || 0;
    const inboundCalls = stats?.filter((c) => c.direction === 'Inbound').length || 0;
    const outboundCalls = stats?.filter((c) => c.direction === 'Outbound').length || 0;
    const answeredCalls = stats?.filter((c) => c.result === 'Accepted').length || 0;
    const missedCalls = stats?.filter((c) => c.result === 'Missed').length || 0;

    // Calculate unique leads: first answered inbound call per phone number in 30-day window
    const answeredInbound = stats?.filter(
      (c) => c.direction === 'Inbound' && c.result === 'Accepted'
    ) || [];

    // Group by phone number and take earliest call
    const uniqueLeadsMap = new Map<string, any>();
    answeredInbound.forEach((call) => {
      const existing = uniqueLeadsMap.get(call.from_number);
      if (!existing || new Date(call.start_time) < new Date(existing.start_time)) {
        uniqueLeadsMap.set(call.from_number, call);
      }
    });

    const uniqueLeads = uniqueLeadsMap.size;

    const avgDuration =
      stats && stats.length > 0
        ? Math.round(
            stats.reduce((sum, c) => sum + (c.duration || 0), 0) / stats.length
          )
        : 0;

    return NextResponse.json({
      ok: true,
      message: 'RingCentral call log sync completed',
      summary: {
        recordsFetched: records.length,
        newCalls,
        updatedCalls,
        errors: errors.length,
        dateRange: {
          from: dateFromISO,
          to: new Date().toISOString(),
        },
      },
      statistics: {
        totalCalls,
        inboundCalls,
        outboundCalls,
        answeredCalls,
        missedCalls,
        uniqueLeads, // Deduplicated count
        avgDuration,
        answeredRate:
          inboundCalls > 0
            ? Math.round((answeredCalls / inboundCalls) * 100)
            : 0,
        leadConversionRate:
          inboundCalls > 0
            ? Math.round((uniqueLeads / inboundCalls) * 100)
            : 0,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('RingCentral sync error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET(req: NextRequest) {
  // Auth handled by middleware

  try {
    // Get last sync time
    const { data: lastSync } = await supabase
      .from('ringcentral_calls')
      .select('sync_timestamp')
      .order('sync_timestamp', { ascending: false })
      .limit(1)
      .single();

    // Get total calls in database
    const { count } = await supabase
      .from('ringcentral_calls')
      .select('*', { count: 'exact', head: true });

    // Get calls from last 7 days with deduplication
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentCalls } = await supabase
      .from('ringcentral_calls')
      .select('direction, result, from_number, start_time')
      .gte('start_time', sevenDaysAgo.toISOString());

    // Calculate unique leads for last 7 days
    const answeredInbound = recentCalls?.filter(
      (c) => c.direction === 'Inbound' && c.result === 'Accepted'
    ) || [];

    const uniqueLeadsMap = new Map<string, any>();
    answeredInbound.forEach((call) => {
      const existing = uniqueLeadsMap.get(call.from_number);
      if (!existing || new Date(call.start_time) < new Date(existing.start_time)) {
        uniqueLeadsMap.set(call.from_number, call);
      }
    });

    return NextResponse.json({
      ok: true,
      lastSyncAt: lastSync?.sync_timestamp || null,
      totalCallsInDatabase: count || 0,
      last7Days: {
        total: recentCalls?.length || 0,
        inbound: recentCalls?.filter((c) => c.direction === 'Inbound').length || 0,
        answered:
          recentCalls?.filter((c) => c.result === 'Accepted').length || 0,
        missed: recentCalls?.filter((c) => c.result === 'Missed').length || 0,
        uniqueLeads: uniqueLeadsMap.size, // Deduplicated count
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

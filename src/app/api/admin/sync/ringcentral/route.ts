import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// RingCentral API configuration
const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

export async function POST(req: NextRequest) {
  // Check authentication
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Step 1: Exchange JWT for access token
    console.log('Authenticating with RingCentral...');

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
      const errorText = await tokenResponse.text();
      console.error('RingCentral auth error:', errorText);
      throw new Error(`RingCentral authentication failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Helpful diagnostics: verify required permission exists on the token
    const scope: string | undefined = tokenData.scope;
    console.log('RingCentral token scopes:', scope);
    if (!scope || !scope.split(' ').includes('ReadCallLog')) {
      throw new Error(
        'RingCentral token missing required permission: ReadCallLog. ' +
          'Add "Read Call Log" to your RingCentral app permissions (ensure Production app), ' +
          'then restart the server to obtain a new token.'
      );
    }

    console.log('Successfully authenticated with RingCentral');

    // Step 2: Fetch call log data (last 30 days)
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
      console.error('RingCentral call log error:', errorText);
      throw new Error(`Failed to fetch call logs: ${errorText}`);
    }

    const callLogData = await callLogResponse.json();
    const records = callLogData.records || [];

    console.log(`Found ${records.length} call records`);

    // Step 3: Store calls in database
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

    // Step 4: Calculate summary statistics
    const { data: stats } = await supabase
      .from('ringcentral_calls')
      .select('direction, result, duration')
      .gte('start_time', dateFromISO);

    const totalCalls = stats?.length || 0;
    const inboundCalls = stats?.filter((c) => c.direction === 'Inbound').length || 0;
    const outboundCalls = stats?.filter((c) => c.direction === 'Outbound').length || 0;
    const answeredCalls = stats?.filter((c) => c.result === 'Accepted').length || 0;
    const missedCalls = stats?.filter((c) => c.result === 'Missed').length || 0;
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
        avgDuration,
        answeredRate:
          inboundCalls > 0
            ? Math.round((answeredCalls / inboundCalls) * 100)
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
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

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

    // Get calls from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentCalls } = await supabase
      .from('ringcentral_calls')
      .select('direction, result')
      .gte('start_time', sevenDaysAgo.toISOString());

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
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

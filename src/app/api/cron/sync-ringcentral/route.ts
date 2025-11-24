/**
 * RingCentral Call Sync Cron Job
 * Syncs call logs from RingCentral API to database
 * Triggered by Vercel Cron every hour
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SDK } from '@ringcentral/sdk';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}

function createRingCentralSDK() {
  const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
  const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
  const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
  const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;

  if (!RC_JWT_TOKEN || !RC_CLIENT_ID || !RC_CLIENT_SECRET) {
    throw new Error('RingCentral credentials not configured');
  }

  const rcsdk = new SDK({
    server: RC_SERVER_URL,
    clientId: RC_CLIENT_ID.trim(),
    clientSecret: RC_CLIENT_SECRET.trim(),
  });

  return { platform: rcsdk.platform(), serverUrl: RC_SERVER_URL, jwtToken: RC_JWT_TOKEN };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting RingCentral call sync...');

    const supabase = getSupabaseClient();

    // Step 1: Authenticate with RingCentral
    console.log('Authenticating with RingCentral...');
    const { platform, serverUrl, jwtToken } = createRingCentralSDK();
    await platform.login({ jwt: jwtToken.trim() });
    console.log('✓ Successfully authenticated with RingCentral');

    // Step 2: Get access token
    const authData = await platform.auth().data();
    const accessToken = authData.access_token;

    // Step 3: Fetch call logs (last 7 days to catch any missed calls)
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);
    const dateFromISO = dateFrom.toISOString();

    console.log(`Fetching call logs from ${dateFromISO}...`);

    const callLogResponse = await fetch(
      `${serverUrl}/restapi/v1.0/account/~/call-log?` +
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
    let inserted = 0;
    let updated = 0;

    for (const call of records) {
      const callData = {
        call_id: call.id,
        session_id: call.sessionId,
        start_time: call.startTime,
        duration: call.duration,
        direction: call.direction,
        from_number: call.from?.phoneNumber || '',
        from_name: call.from?.name || null,
        to_number: call.to?.phoneNumber || '',
        to_name: call.to?.name || null,
        result: call.result,
        action: call.action || '',
        recording_id: call.recording?.id || null,
        recording_uri: call.recording?.contentUri || null,
        transport: call.transport || '',
        raw_data: call,
        last_modified: call.lastModifiedTime || call.startTime,
      };

      const { error } = await supabase
        .from('ringcentral_calls')
        .upsert(callData, { onConflict: 'call_id' });

      if (!error) {
        inserted++;
      } else {
        console.error(`Failed to upsert call ${call.id}:`, error);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ RingCentral sync completed in ${duration}s - ${inserted} calls synced`);

    return NextResponse.json({
      success: true,
      message: `RingCentral sync completed in ${duration}s`,
      stats: {
        total_records: records.length,
        synced: inserted,
      },
      dateRange: {
        from: dateFromISO,
        to: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ RingCentral sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

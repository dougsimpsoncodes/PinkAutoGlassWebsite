import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateGoogleAdsConfig,
  fetchCallConversions,
  fetchCallViewRange,
} from '@/lib/googleAds';
import { crossReferenceCallsToRingCentral } from '@/lib/callAttributionSync';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes — call_view loops day-by-day

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/admin/sync/google-ads-calls
 * Syncs Google Ads call conversion data + individual call records,
 * then runs cross-reference matching against RingCentral calls.
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const config = validateGoogleAdsConfig();
    if (!config.isValid) {
      return NextResponse.json(
        { ok: false, error: 'Google Ads API not configured', missingVars: config.missingVars },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '7');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`📞 Syncing Google Ads call data from ${startDateStr} to ${endDateStr}...`);

    // Step 1: Fetch aggregate call conversions
    let conversionRecords = 0;
    try {
      const conversions = await fetchCallConversions(startDateStr, endDateStr);

      if (conversions.length > 0) {
        const dbRecords = conversions.map(c => ({
          date: c.date,
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
          conversion_action_id: c.conversion_action_id,
          conversion_action_name: c.conversion_action_name,
          call_conversions: c.conversions,
          call_conversions_value: c.conversions_value,
          sync_timestamp: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('google_ads_call_conversions')
          .upsert(dbRecords, { onConflict: 'date,campaign_id,conversion_action_id' });

        if (error) {
          console.error('Error upserting call conversions:', error);
        } else {
          conversionRecords = dbRecords.length;
        }
      }
    } catch (err: any) {
      console.error('Error fetching call conversions:', err.message);
    }

    // Step 2: Fetch individual call records via call_view (day-by-day)
    let callViewRecords = 0;
    try {
      const calls = await fetchCallViewRange(startDateStr, endDateStr);

      if (calls.length > 0) {
        const dbRecords = calls.map(c => ({
          resource_name: c.resource_name,
          start_date_time: c.start_date_time,
          end_date_time: c.end_date_time,
          call_duration_seconds: c.call_duration_seconds,
          caller_area_code: c.caller_area_code,
          caller_country_code: c.caller_country_code,
          call_status: c.call_status,
          call_type: c.call_type,
          call_tracking_display_location: c.call_tracking_display_location,
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
          ad_group_id: c.ad_group_id,
          ad_group_name: c.ad_group_name,
          sync_timestamp: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('google_ads_calls')
          .upsert(dbRecords, { onConflict: 'resource_name' });

        if (error) {
          console.error('Error upserting call view records:', error);
        } else {
          callViewRecords = dbRecords.length;
        }
      }
    } catch (err: any) {
      console.error('Error fetching call_view:', err.message);
    }

    // Step 3: Cross-reference with RingCentral
    const crossRef = await crossReferenceCallsToRingCentral(supabase, startDateStr, endDateStr);

    return NextResponse.json({
      ok: true,
      message: 'Google Ads call sync completed',
      dateRange: { from: startDateStr, to: endDateStr },
      results: {
        callConversions: conversionRecords,
        callViewRecords,
        crossReference: crossRef,
      },
    });
  } catch (error: any) {
    console.error('Google Ads call sync error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

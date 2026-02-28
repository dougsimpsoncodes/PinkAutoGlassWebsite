import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateGBPConfig, fetchGBPCallMetrics } from '@/lib/googleBusinessProfile';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/admin/sync/gbp
 * Sync Google Business Profile call metrics to database.
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const config = validateGBPConfig();
    if (!config.isValid) {
      return NextResponse.json(
        { ok: false, error: 'GBP not configured', missingVars: config.missingVars },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`📞 Syncing GBP call metrics from ${startDateStr} to ${endDateStr}...`);

    const metrics = await fetchGBPCallMetrics(startDateStr, endDateStr);

    let upserted = 0;
    if (metrics.length > 0) {
      const locationName = process.env.GBP_LOCATION_ID || 'default';
      const dbRecords = metrics.map(m => ({
        date: m.date,
        location_name: locationName,
        total_calls: m.totalCalls,
        missed_calls: m.missedCalls,
        answered_calls: m.answeredCalls,
        calls_under_30s: m.callsUnder30s,
        calls_30s_to_120s: m.calls30sTo120s,
        calls_over_120s: m.callsOver120s,
        sync_timestamp: new Date().toISOString(),
        raw_data: m.rawData,
      }));

      const { error } = await supabase
        .from('gbp_call_metrics')
        .upsert(dbRecords, { onConflict: 'date,location_name' });

      if (error) {
        console.error('Error upserting GBP metrics:', error);
      } else {
        upserted = dbRecords.length;
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'GBP sync completed',
      dateRange: { from: startDateStr, to: endDateStr },
      records: upserted,
    });
  } catch (error: any) {
    console.error('GBP sync error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync/gbp
 * Check GBP configuration status.
 */
export async function GET() {
  const config = validateGBPConfig();
  return NextResponse.json({
    ok: config.isValid,
    configured: config.isValid,
    missingVars: config.missingVars,
  });
}

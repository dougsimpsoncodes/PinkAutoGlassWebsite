import { NextRequest, NextResponse } from 'next/server';
import {
  attributeAllCalls,
  saveAttributionResults,
  getAttributionBreakdown,
} from '@/lib/callAttribution';


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/attribution/match-calls
 *
 * Run call attribution matching algorithm for a date range
 *
 * Body:
 * {
 *   "startDate": "2025-10-01",
 *   "endDate": "2025-11-01",
 *   "saveToDatabase": true  // Optional, default true
 * }
 *
 * Returns:
 * {
 *   "ok": true,
 *   "summary": {
 *     "total": 144,
 *     "directMatches": 45,
 *     "timeCorrelated": 72,
 *     "unknown": 27,
 *     "avgConfidence": 73
 *   },
 *   "breakdown": {
 *     "google": { count: 65, avgConfidence: 78, directMatches: 30, timeCorrelated: 35 },
 *     "bing": { count: 35, avgConfidence: 68, directMatches: 10, timeCorrelated: 25 },
 *     "organic": { count: 17, avgConfidence: 60, directMatches: 5, timeCorrelated: 12 },
 *     "direct": { count: 27, avgConfidence: 0, directMatches: 0, timeCorrelated: 0 }
 *   },
 *   "saved": { success: 144, failed: 0 }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse body, handle empty body gracefully
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body - that's okay, we'll get dates from query params instead
    }

    // Try to get dates from body first, then query params as fallback
    const { searchParams } = new URL(req.url);
    const startDate = body.startDate || searchParams.get('startDate');
    const endDate = body.endDate || searchParams.get('endDate');
    const saveToDatabase = body.saveToDatabase !== undefined ? body.saveToDatabase : true;

    // Validate inputs
    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, error: 'startDate and endDate are required (in body or query params)' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { ok: false, error: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    console.log(`🎯 Starting call attribution for ${startDate} to ${endDate}...`);

    // Run attribution algorithm
    const { attributed, summary } = await attributeAllCalls(startDate, endDate);

    // Get breakdown by platform
    const breakdown = getAttributionBreakdown(attributed);

    // Save to database if requested
    let saved = { success: 0, failed: 0 };
    if (saveToDatabase && attributed.length > 0) {
      saved = await saveAttributionResults(attributed);
    }

    console.log(`✅ Attribution complete:`, {
      summary,
      breakdown,
      saved: saveToDatabase ? saved : 'skipped'
    });

    return NextResponse.json({
      ok: true,
      summary,
      breakdown,
      saved: saveToDatabase ? saved : null,
      sampleResults: attributed.slice(0, 5).map(r => ({
        callId: r.callId,
        fromNumber: r.fromNumber,
        callTimestamp: r.callTimestamp,
        method: r.attributionMethod,
        confidence: r.attributionConfidence,
        platform: r.adPlatform,
        campaign: r.campaignName,
        details: r.matchDetails,
      }))
    });

  } catch (error: any) {
    console.error('Attribution error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/attribution/match-calls?startDate=2025-10-01&endDate=2025-11-01
 *
 * Get attribution status for a date range (without re-running)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);

    // Get attribution stats from database
    const { data: calls, error } = await client
      .from('ringcentral_calls')
      .select('call_id, from_number, start_time, attribution_method, attribution_confidence, ad_platform, utm_campaign')
      .eq('direction', 'Inbound')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Calculate summary
    const total = calls?.length || 0;
    const directMatches = calls?.filter((c: any) => c.attribution_method === 'direct_match').length || 0;
    const timeCorrelated = calls?.filter((c: any) => c.attribution_method === 'time_correlation').length || 0;
    const unknown = calls?.filter((c: any) => c.attribution_method === 'unknown' || !c.attribution_method).length || 0;
    const avgConfidence = calls?.reduce((sum: number, c: any) =>
      sum + (c.attribution_confidence || 0), 0
    ) / total || 0;

    // Calculate platform breakdown
    const platformBreakdown: Record<string, any> = {};
    calls?.forEach((call: any) => {
      const platform = call.ad_platform || 'unknown';
      if (!platformBreakdown[platform]) {
        platformBreakdown[platform] = {
          count: 0,
          totalConfidence: 0,
          directMatches: 0,
          timeCorrelated: 0,
        };
      }
      platformBreakdown[platform].count++;
      platformBreakdown[platform].totalConfidence += call.attribution_confidence || 0;
      if (call.attribution_method === 'direct_match') platformBreakdown[platform].directMatches++;
      if (call.attribution_method === 'time_correlation') platformBreakdown[platform].timeCorrelated++;
    });

    // Calculate averages
    const breakdown: Record<string, any> = {};
    for (const [platform, data] of Object.entries(platformBreakdown)) {
      breakdown[platform] = {
        count: data.count,
        avgConfidence: Math.round(data.totalConfidence / data.count),
        directMatches: data.directMatches,
        timeCorrelated: data.timeCorrelated,
      };
    }

    return NextResponse.json({
      ok: true,
      summary: {
        total,
        directMatches,
        timeCorrelated,
        unknown,
        avgConfidence: Math.round(avgConfidence),
      },
      breakdown,
      note: 'This data is from the database. To re-run attribution, use POST request.'
    });

  } catch (error: any) {
    console.error('Attribution status error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

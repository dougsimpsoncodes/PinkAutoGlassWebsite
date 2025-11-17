import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct PostgREST probe - bypasses Supabase JS client entirely
 * This helps diagnose if stale data is from the client or database
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Direct PostgREST call with no caching
    const url = `${baseUrl}/rest/v1/ringcentral_calls?select=start_time,direction,result,call_id&order=start_time.desc&limit=5`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'count=exact',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`PostgREST request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : null;

    return NextResponse.json({
      ok: true,
      restCount: count,
      restMostRecentStart: data[0]?.start_time || null,
      recentCalls: data,
      responseHeaders: {
        'content-range': contentRange,
        'cache-control': response.headers.get('cache-control'),
        'x-kong-response-latency': response.headers.get('x-kong-response-latency'),
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('PostgREST probe error:', error);
    return NextResponse.json({
      ok: false,
      error: error.message,
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  // Create a FRESH Supabase client for THIS request only
  // No module-level caching, no session persistence
  const ts = Date.now().toString();

  const customFetch = async (input: RequestInfo, init?: RequestInit) => {
    let reqUrl = typeof input === 'string' ? input : input.url;
    const sep = reqUrl.includes('?') ? '&' : '?';
    reqUrl = `${reqUrl}${sep}__ts=${ts}`;

    return fetch(reqUrl, {
      ...init,
      cache: 'no-store',
      headers: {
        ...(init?.headers || {}),
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'X-Request-Ts': ts,
      },
    });
  };

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false, // Disable session caching
        autoRefreshToken: false,
      },
      global: {
        fetch: customFetch,
        headers: {
          'X-Client-Info': 'pink-admin-no-store',
          'X-Request-Id': ts,
        },
      },
    }
  );

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'start_time';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Fetch calls from database
    const { data: calls, error } = await supabase
      .from('ringcentral_calls')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch calls: ${error.message}`);
    }

    // Get total count
    const { count } = await supabase
      .from('ringcentral_calls')
      .select('*', { count: 'exact', head: true });

    const res = NextResponse.json({
      ok: true,
      calls: calls || [],
      total: count || 0,
      limit,
      offset,
      mostRecentStartTime:
        calls && calls.length > 0 ? (calls[0] as any).start_time ?? null : null,
    });
    // Ensure the API response itself is never cached
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error: any) {
    console.error('Fetch calls error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

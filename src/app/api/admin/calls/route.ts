import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ARIZONA_PHONE,
  COLORADO_PHONE,
  classifyCallMarket,
  isMarketFilter,
  type Market,
} from '@/lib/market';

// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

interface RingCentralCall {
  direction: string;
  from_number: string | null;
  start_time?: string | null;
  to_number: string | null;
}

const MARKET_BUSINESS_LINES: Record<Market, string[]> = {
  arizona: [ARIZONA_PHONE],
  colorado: [COLORADO_PHONE],
};

function getCallMarketNumber(call: Pick<RingCentralCall, 'direction' | 'from_number' | 'to_number'>) {
  return call.direction === 'Outbound' ? call.from_number : call.to_number;
}

function buildMarketCallFilter(market: Market) {
  return MARKET_BUSINESS_LINES[market]
    .flatMap((phoneNumber) => [
      `and(direction.eq.Inbound,to_number.eq.${phoneNumber})`,
      `and(direction.eq.Outbound,from_number.eq.${phoneNumber})`,
    ])
    .join(',');
}

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  // Create a fresh Supabase client for each request
  // Disable session caching to ensure fresh data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
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
    const market = searchParams.get('market') || 'all';

    if (!isMarketFilter(market)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid market. Must be one of: all, colorado, arizona' },
        { status: 400 }
      );
    }

    let calls: RingCentralCall[] = [];
    let total = 0;

    if (market === 'all') {
      const { data, error } = await supabase
        .from('ringcentral_calls')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch calls: ${error.message}`);
      }

      const { count } = await supabase
        .from('ringcentral_calls')
        .select('*', { count: 'exact', head: true });

      calls = data || [];
      total = count || 0;
    } else {
      const { data, count, error } = await supabase
        .from('ringcentral_calls')
        .select('*', { count: 'exact' })
        .or(buildMarketCallFilter(market))
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch calls: ${error.message}`);
      }

      calls = (data || []).filter((call) => classifyCallMarket(getCallMarketNumber(call)) === market);
      total = count || calls.length;
    }

    const res = NextResponse.json({
      ok: true,
      calls,
      total,
      limit,
      offset,
      mostRecentStartTime:
        calls.length > 0 ? calls[0].start_time ?? null : null,
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

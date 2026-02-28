import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'phoenix';
    const keyword = searchParams.get('keyword') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let query = supabase
      .from('gridscope_scans')
      .select('id, city, keyword, grid_size, solv_pct, avg_rank, node_count, created_at')
      .eq('city', city.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (keyword) {
      query = query.eq('keyword', keyword);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, scans: data || [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

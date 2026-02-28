import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Phoenix metro: 850xx–855xx | Denver metro: 800xx–806xx
const IN_MARKET_PREFIXES = ['850','851','852','853','854','855','800','801','802','803','804','805','806'];

function classifyMarket(zip: string | null | undefined): 'in_market' | 'out_of_market' | null {
  if (!zip || zip.length < 3) return null;
  const prefix = zip.replace(/\D/g, '').slice(0, 3);
  return IN_MARKET_PREFIXES.includes(prefix) ? 'in_market' : 'out_of_market';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '500');

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query all leads from national site sources
    const { data, error } = await client
      .from('leads')
      .select('id, created_at, first_name, last_name, phone_e164, zip, city, state, utm_source, status, vehicle_year, vehicle_make, vehicle_model, market_type')
      .in('utm_source', ['carwindshieldprices', 'windshieldrepairprices', 'carglassprices'])
      .eq('is_test', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // If market_type column exists, use it; otherwise classify from zip in-memory
    const leads = (data || []).map(l => ({
      ...l,
      market_type: l.market_type ?? classifyMarket(l.zip),
    }));

    const outOfMarket = leads.filter(l => l.market_type === 'out_of_market');

    return NextResponse.json({
      leads: outOfMarket,
      allNationalLeads: leads.length,
      total: outOfMarket.length,
    });
  } catch (err) {
    console.error('External leads API error:', err);
    return NextResponse.json({ error: 'Failed to fetch external leads' }, { status: 500 });
  }
}

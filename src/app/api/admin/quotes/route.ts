import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_STATUSES = new Set([
  'ready_exact',
  'ready_estimate',
  'needs_confirmation',
  'manual_review',
  'accepted',
  'declined',
  'expired',
]);

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase admin credentials are not configured.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    // Default to REAL quotes only — test/tester traffic is ~90%+ of rows and
    // buries real signal. Opt in with ?includeTest=true (the page's "Show test" toggle).
    const includeTest = searchParams.get('includeTest') === 'true';
    const limit = clampNumber(searchParams.get('limit'), 1, 200, 100);
    const offset = clampNumber(searchParams.get('offset'), 0, 10_000, 0);

    const client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let query = client
      .from('automated_quotes')
      .select(`
        id,
        quote_token,
        lead_id,
        status,
        status_reason,
        pricing_version,
        first_name,
        last_name,
        phone_e164,
        email,
        zip,
        state,
        vin,
        vehicle_year,
        vehicle_make,
        vehicle_model,
        vehicle_trim,
        selected_brand,
        selected_part_description,
        selected_product_id,
        selected_nags_prefix,
        selected_nags_number,
        selected_qty_available,
        selected_estimated_delivery_date,
        supplier_cost_cents,
        quote_total_cents,
        confidence_reasons,
        is_test,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!includeTest) {
      query = query.eq('is_test', false);
    }

    if (status && ALLOWED_STATUSES.has(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error('[admin-quotes] fetch failed:', error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      quotes: data || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[admin-quotes] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch automated quotes.' },
      { status: 500 }
    );
  }
}

function clampNumber(value: string | null, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

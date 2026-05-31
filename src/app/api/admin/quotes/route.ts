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

// Target statuses an admin may set when resolving a quote.
const EDITABLE_STATUSES = new Set(['ready_exact', 'needs_confirmation', 'manual_review', 'declined']);
// Only quotes currently in the triage queue may be edited here — don't let the
// workbench reopen/repriced an already accepted/expired/declined quote.
const EDITABLE_FROM_STATUSES = ['manual_review', 'needs_confirmation'];
const MAX_PRICE_CENTS = 100_000 * 100; // $100k sanity ceiling

/**
 * PATCH /api/admin/quotes — resolve a quote from the triage workbench:
 * set a manual price and/or change status (e.g. manual_review → ready_exact,
 * or → declined). Body: { id, quote_total_cents?, status?, status_reason? }.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ ok: false, error: 'Supabase admin credentials are not configured.' }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    const id = body?.id;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'Quote id is required.' }, { status: 400 });
    }

    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    // Load the current quote — only triage-queue quotes are editable here.
    const { data: current, error: fetchErr } = await client
      .from('automated_quotes')
      .select('id, status, quote_total_cents')
      .eq('id', id)
      .maybeSingle<{ id: string; status: string; quote_total_cents: number | null }>();
    if (fetchErr) {
      return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Quote not found.' }, { status: 404 });
    }
    if (!EDITABLE_FROM_STATUSES.includes(current.status)) {
      return NextResponse.json(
        { ok: false, error: 'Only quotes awaiting review can be edited here.' },
        { status: 409 }
      );
    }

    const updates: Record<string, unknown> = {};
    let nextPrice = current.quote_total_cents ?? 0;
    if (body.quote_total_cents !== undefined && body.quote_total_cents !== null) {
      const cents = body.quote_total_cents;
      if (typeof cents !== 'number' || !Number.isInteger(cents) || cents <= 0 || cents > MAX_PRICE_CENTS) {
        return NextResponse.json({ ok: false, error: 'Enter a valid price.' }, { status: 400 });
      }
      updates.quote_total_cents = cents;
      nextPrice = cents;
    }
    if (body.status !== undefined) {
      if (!EDITABLE_STATUSES.has(body.status)) {
        return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
      }
      // Can't mark a quote ready/bookable without a real price.
      if (body.status === 'ready_exact' && nextPrice <= 0) {
        return NextResponse.json({ ok: false, error: 'Set a positive price before marking ready.' }, { status: 400 });
      }
      updates.status = body.status;
    }
    if (typeof body.status_reason === 'string') {
      updates.status_reason = body.status_reason.slice(0, 500);
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields to update.' }, { status: 400 });
    }

    // Re-constrain the update to still-editable statuses to avoid a races where
    // the quote was resolved/booked between our read and write.
    const { data, error } = await client
      .from('automated_quotes')
      .update(updates)
      .eq('id', id)
      .in('status', EDITABLE_FROM_STATUSES)
      .select('id, status, quote_total_cents, status_reason')
      .maybeSingle();

    if (error) {
      console.error('[admin-quotes] update failed:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: 'Quote was already resolved — refresh and retry.' }, { status: 409 });
    }
    return NextResponse.json({ ok: true, quote: data });
  } catch (error) {
    console.error('[admin-quotes] PATCH failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: 'Failed to update quote.' }, { status: 500 });
  }
}

function clampNumber(value: string | null, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

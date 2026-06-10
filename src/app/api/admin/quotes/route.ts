import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDayBounds, type DateFilter } from '@/lib/dateUtils';
import { isMarketFilter } from '@/lib/market';

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

const ALLOWED_PERIODS = new Set<DateFilter>(['today', 'yesterday', '7days', '30days', 'all']);

interface LeadSummary {
  id: string;
  status: string | null;
  ad_platform: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  market: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_e164: string | null;
  email: string | null;
}

interface BookingSummary {
  id: string;
  quote_id: string;
  booking_token: string;
  status: string;
  preferred_install_date: string | null;
  preferred_install_window: string | null;
  accepted_total_cents: number | null;
  discount_pct: number | null;
}

interface NotificationEventSummary {
  quote_id: string;
  event_type: 'quote_ready' | 'quote_unbooked_5m' | 'quote_unbooked_15m_discount' | 'appointment_booked';
  status: 'pending' | 'processing' | 'sent' | 'partial' | 'failed' | 'skipped';
  customer_email_status: string | null;
  customer_sms_status: string | null;
  team_email_status: string | null;
  team_sms_status: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  last_error: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !adminKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase admin credentials are not configured.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const market = searchParams.get('market');
    const periodParam = searchParams.get('period');
    const period: DateFilter = ALLOWED_PERIODS.has(periodParam as DateFilter) ? (periodParam as DateFilter) : 'today';
    // Default to REAL quotes only — test/tester traffic is ~90%+ of rows and
    // buries real signal. Opt in with ?includeTest=true (the page's "Show test" toggle).
    const includeTest = searchParams.get('includeTest') === 'true';
    const limit = clampNumber(searchParams.get('limit'), 1, 500, 250);
    const offset = clampNumber(searchParams.get('offset'), 0, 10_000, 0);
    const bounds = getMountainDayBounds(period);

    const client = createClient(supabaseUrl, adminKey, {
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
        market,
        session_id,
        plate_last4,
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
      .gte('created_at', bounds.startUTC)
      .lte('created_at', bounds.endUTC)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!includeTest) {
      query = query.eq('is_test', false);
    }

    if (status && ALLOWED_STATUSES.has(status)) {
      query = query.eq('status', status);
    }
    if (isMarketFilter(market) && market !== 'all') {
      // Include unknown-market rows: VIN-path quotes historically carry no
      // state, so market is NULL. A geography filter must not hide quotes
      // whose geography was never captured (a customer called to book and
      // was invisible in the Denver view, 2026-06-10).
      query = query.or(`market.eq.${market},market.is.null`);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error('[admin-quotes] fetch failed:', error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const quotes = data || [];
    const leadIds = Array.from(new Set(quotes.map((quote) => quote.lead_id).filter(Boolean))) as string[];
    const quoteIds = quotes.map((quote) => quote.id);

    let leadMap = new Map<string, LeadSummary>();
    let bookingMap = new Map<string, BookingSummary>();
    let notificationEventMap = new Map<string, Record<string, NotificationEventSummary>>();

    if (leadIds.length > 0) {
      const { data: leads, error: leadsError } = await client
        .from('leads')
        .select('id, status, ad_platform, utm_source, utm_campaign, market, first_name, last_name, phone_e164, email')
        .in('id', leadIds);

      if (leadsError) {
        console.error('[admin-quotes] lead enrichment failed:', leadsError.message);
        return NextResponse.json(
          { ok: false, error: leadsError.message },
          { status: 500 }
        );
      }

      leadMap = new Map((leads || []).map((lead) => [lead.id, lead as LeadSummary]));
    }

    if (quoteIds.length > 0) {
      const { data: bookings, error: bookingsError } = await client
        .from('automated_quote_bookings')
        .select('id, quote_id, booking_token, status, preferred_install_date, preferred_install_window, accepted_total_cents, discount_pct')
        .in('quote_id', quoteIds);

      if (bookingsError) {
        console.error('[admin-quotes] booking enrichment failed:', bookingsError.message);
        return NextResponse.json(
          { ok: false, error: bookingsError.message },
          { status: 500 }
        );
      }

      bookingMap = new Map((bookings || []).map((booking) => [booking.quote_id, booking as BookingSummary]));

      const { data: notificationEvents, error: notificationEventsError } = await client
        .from('automated_quote_notification_events')
        .select('quote_id, event_type, status, customer_email_status, customer_sms_status, team_email_status, team_sms_status, sent_at, created_at, updated_at, last_error')
        .in('quote_id', quoteIds)
        .order('created_at', { ascending: true });

      if (notificationEventsError) {
        console.error('[admin-quotes] notification enrichment failed:', notificationEventsError.message);
        return NextResponse.json(
          { ok: false, error: notificationEventsError.message },
          { status: 500 }
        );
      }

      for (const event of (notificationEvents || []) as NotificationEventSummary[]) {
        const existing = notificationEventMap.get(event.quote_id) || {};
        existing[event.event_type] = event;
        notificationEventMap.set(event.quote_id, existing);
      }
    }

    const enrichedQuotes = quotes.map((quote) => {
      const lead = quote.lead_id ? leadMap.get(quote.lead_id) || null : null;
      const booking = bookingMap.get(quote.id) || null;

      return {
        ...quote,
        // Fall back to lead contact info when the quote row itself has none
        // (happens when contact is captured at booking time via QuoteBookingForm)
        first_name: quote.first_name || lead?.first_name || null,
        last_name: quote.last_name || lead?.last_name || null,
        phone_e164: quote.phone_e164 || lead?.phone_e164 || null,
        email: quote.email || lead?.email || null,
        lead_status: lead?.status || null,
        ad_platform: lead?.ad_platform || null,
        utm_source: lead?.utm_source || null,
        utm_campaign: lead?.utm_campaign || null,
        resolved_market: lead?.market || quote.market || null,
        booking_id: booking?.id || null,
        booking_token: booking?.booking_token || null,
        booking_status: booking?.status || null,
        booking_date: booking?.preferred_install_date || null,
        booking_window: booking?.preferred_install_window || null,
        booking_accepted_total_cents: booking?.accepted_total_cents ?? null,
        booking_discount_pct: booking?.discount_pct ?? null,
        notification_events: notificationEventMap.get(quote.id) || {},
      };
    });

    return NextResponse.json({
      ok: true,
      quotes: enrichedQuotes,
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

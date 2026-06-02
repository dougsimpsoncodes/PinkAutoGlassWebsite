import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !adminKey) {
    return NextResponse.json({ ok: false, error: 'Server config error' }, { status: 500 });
  }

  const leadId = req.nextUrl.searchParams.get('lead_id');
  if (!leadId) {
    return NextResponse.json({ ok: false, error: 'lead_id required' }, { status: 400 });
  }

  const client = createClient(supabaseUrl, adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find the quote linked to this lead
  const { data: quotes, error: quoteError } = await client
    .from('automated_quotes')
    .select('id, quote_token, quote_total_cents, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, status')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (quoteError) {
    return NextResponse.json({ ok: false, error: quoteError.message }, { status: 500 });
  }

  const quote = quotes?.[0] ?? null;
  if (!quote) {
    return NextResponse.json({ ok: true, booking: null });
  }

  // Find the booking for this quote
  const { data: bookings, error: bookingError } = await client
    .from('automated_quote_bookings')
    .select('id, booking_token, status, preferred_install_date, preferred_install_window, full_name, install_street')
    .eq('quote_id', quote.id)
    .limit(1);

  if (bookingError) {
    return NextResponse.json({ ok: false, error: bookingError.message }, { status: 500 });
  }

  const booking = bookings?.[0] ?? null;

  return NextResponse.json({
    ok: true,
    booking: booking ? {
      booking_token: booking.booking_token,
      status: booking.status,
      install_date: booking.preferred_install_date,
      install_window: booking.preferred_install_window,
      full_name: booking.full_name,
      install_street: booking.install_street,
      quote_token: quote.quote_token,
      quote_total_cents: quote.quote_total_cents,
      vehicle: [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim]
        .filter(Boolean).join(' '),
    } : null,
  });
}

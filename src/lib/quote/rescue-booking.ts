import { createClient } from '@supabase/supabase-js';

// Server-side data access for the /quote/book/[token] rescue page. Lives in
// lib (not the page file) so the service-role key never appears in app/
// component code — the page is a server component and only receives the
// already-fetched rows.

export interface RescueQuoteRow {
  id: string;
  quote_token: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  zip: string | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  quote_total_cents: number | null;
  discounted_total_cents: number | null;
  discount_pct: number | null;
  discount_offered_at: string | null;
  expires_at: string | null;
}

export interface RescueBookingRow {
  booking_token: string;
  preferred_install_date: string | null;
  preferred_install_window: string | null;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function loadRescueQuote(linkToken: string): Promise<{
  quote: RescueQuoteRow | null;
  booking: RescueBookingRow | null;
}> {
  const admin = getServiceClient();
  if (!admin || !/^[a-f0-9]{16}$/.test(linkToken)) {
    return { quote: null, booking: null };
  }

  const { data: quote } = await admin
    .from('automated_quotes')
    .select('id, quote_token, status, first_name, last_name, zip, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, quote_total_cents, discounted_total_cents, discount_pct, discount_offered_at, expires_at')
    .eq('booking_link_token', linkToken)
    .maybeSingle<RescueQuoteRow>();

  if (!quote) {
    return { quote: null, booking: null };
  }

  const { data: booking } = await admin
    .from('automated_quote_bookings')
    .select('booking_token, preferred_install_date, preferred_install_window')
    .eq('quote_id', quote.id)
    .maybeSingle<RescueBookingRow>();

  return { quote, booking: booking ?? null };
}

import { after, NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { isTeamOrTestContact } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendQuoteContactNotifications } from '@/lib/quote/contact-notifications';
import { buildAttributionFromSession, findOrCreateQuoteLead, splitName } from '@/lib/quote/leadSync';
import { markAnalyticsSessionTest } from '@/lib/analytics-test-server';
import { isValidCustomerPhoneE164 } from '@/lib/booking-schema';

export const runtime = 'nodejs';

const phoneSchema = z.string().trim().regex(/^(\+?1)?[\s\-.]?\(?([0-9]{3})\)?[\s\-.]?([0-9]{3})[\s\-.]?([0-9]{4})$/).transform((phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : `+${digits}`;
}).refine((phone) => isValidCustomerPhoneE164(phone), {
  message: 'Please enter a valid US phone number.',
});

const quoteContactSchema = z.object({
  quoteToken: z.string().uuid(),
  fullName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  email: z.string().trim().toLowerCase().email().max(254).optional().or(z.literal('')),
  smsConsent: z.boolean().optional().default(false),
  clientId: z.string().trim().max(100).optional().or(z.literal('')),
  sessionId: z.string().trim().max(100).optional().or(z.literal('')),
  utmSource: z.string().trim().max(100).optional().or(z.literal('')),
  utmMedium: z.string().trim().max(100).optional().or(z.literal('')),
  utmCampaign: z.string().trim().max(100).optional().or(z.literal('')),
  utmTerm: z.string().trim().max(255).optional().or(z.literal('')),
  utmContent: z.string().trim().max(255).optional().or(z.literal('')),
  gclid: z.string().trim().max(200).optional().or(z.literal('')),
  msclkid: z.string().trim().max(200).optional().or(z.literal('')),
  state: z.string().trim().max(2).optional().or(z.literal('')),
  zip: z.string().trim().max(10).optional().or(z.literal('')),
  website: z.string().max(255).optional().default(''),
});

type QuoteContactInput = z.infer<typeof quoteContactSchema>;
type PublicSupabaseClient = SupabaseClient<any, 'public', any>;

interface AutomatedQuoteRow {
  id: string;
  quote_token: string;
  lead_id: string | null;
  status: string;
  session_id: string | null;
  is_test: boolean | null;
  contact_submitted_at: string | null;
  quote_total_cents: number | null;
  booking_link_token: string | null;
  selected_brand: string | null;
  selected_part_description: string | null;
  selected_nags_number: string | null;
  supplier_cost_cents: number | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  vin: string | null;
  zip: string | null;
  state: string | null;
  confidence_reasons: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(`quote-contact:${ip}`, 5, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const parsed = quoteContactSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Enter a valid name, phone number, and email if supplied.' },
        { status: 400 }
      );
    }

    const input = parsed.data;
    if (input.website) {
      return NextResponse.json({ success: true, message: 'Quote request received.' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !serviceKey || !anonKey) {
      return NextResponse.json(
        { error: 'Quote contact is temporarily unavailable.' },
        { status: 503 }
      );
    }

    const admin: PublicSupabaseClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const anon: PublicSupabaseClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: quote, error: quoteError } = await admin
      .from('automated_quotes')
      .select('id, quote_token, lead_id, status, session_id, is_test, contact_submitted_at, quote_total_cents, booking_link_token, selected_brand, selected_part_description, selected_nags_number, supplier_cost_cents, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vin, zip, state, confidence_reasons')
      .eq('quote_token', input.quoteToken)
      .single<AutomatedQuoteRow>();

    if (quoteError || !quote) {
      console.error('[quote-contact] quote lookup failed:', {
        code: quoteError?.code,
        message: quoteError?.message,
        tokenSuffix: input.quoteToken.slice(-8),
      });
      return NextResponse.json(
        { error: 'Quote reference was not found. Please request a new quote.' },
        { status: 404 }
      );
    }

    const name = splitName(input.fullName);
    const requestSessionId = input.sessionId || request.cookies.get('session_id')?.value || null;
    const quoteSessionId = quote.session_id || requestSessionId;
    const attribution = await buildAttributionFromSession(admin, quoteSessionId, {
      bodyGclid: input.gclid?.trim() || undefined,
      bodyMsclkid: input.msclkid?.trim() || undefined,
      utmSource: input.utmSource?.trim() || undefined,
      utmMedium: input.utmMedium?.trim() || undefined,
      utmCampaign: input.utmCampaign?.trim() || undefined,
      utmTerm: input.utmTerm?.trim() || undefined,
      utmContent: input.utmContent?.trim() || undefined,
    });
    const isTest = (quote.is_test ?? false) || isTeamOrTestContact({
      phoneE164: input.phone,
      fullName: input.fullName,
      email: input.email || null,
    });
    const leadId = await findOrCreateQuoteLead(admin, anon, quote, {
      firstName: name.firstName,
      lastName: name.lastName,
      phone: input.phone,
      email: input.email || null,
      smsConsent: input.smsConsent,
      state: input.state || undefined,
      zip: input.zip || undefined,
      clientId: input.clientId || undefined,
      sessionId: quoteSessionId,
      attribution,
      isTest,
      // status omitted → preserves prior /contact behavior (no status change)
    });

    const nextQuoteStatus = quote.status === 'manual_review' ? 'needs_confirmation' : quote.status;
    const { error: updateQuoteError } = await admin
      .from('automated_quotes')
      .update({
        lead_id: leadId,
        first_name: name.firstName,
        last_name: name.lastName || null,
        phone_e164: input.phone,
        email: input.email || null,
        sms_consent: input.smsConsent,
        contact_submitted_at: quote.contact_submitted_at ?? new Date().toISOString(),
        status: nextQuoteStatus,
        ...(isTest ? { is_test: true } : {}),
      })
      .eq('id', quote.id);

    if (updateQuoteError) {
      console.error('[quote-contact] automated quote link failed:', updateQuoteError.message);
      return NextResponse.json(
        { error: 'Quote was saved, but contact linking failed. Please call us with your reference.' },
        { status: 500 }
      );
    }

    if (isTest && quoteSessionId) {
      await markAnalyticsSessionTest(admin, quoteSessionId);
    }

    after(() =>
      sendQuoteContactNotifications({
        quoteId: quote.id,
        quoteToken: quote.quote_token,
        status: quote.status,
        leadId,
        hadLeadBeforeContact: Boolean(quote.lead_id),
        isTest,
        customer: {
          firstName: name.firstName,
          lastName: name.lastName,
          phoneE164: input.phone,
          email: input.email || null,
          smsConsent: input.smsConsent,
        },
        vehicle: {
          year: quote.vehicle_year,
          make: quote.vehicle_make,
          model: quote.vehicle_model,
          trim: quote.vehicle_trim,
          vin: quote.vin,
        },
        location: {
          state: input.state || quote.state,
          zip: input.zip || quote.zip,
        },
        quote: {
          totalCents: quote.quote_total_cents,
          bookingLinkToken: quote.booking_link_token,
          selectedBrand: quote.selected_brand,
          partDescription: quote.selected_part_description,
          nagsNumber: quote.selected_nags_number,
          supplierCostCents: quote.supplier_cost_cents,
        },
      }).catch((err) => {
        console.error('[quote-contact] notification policy failed:', err instanceof Error ? err.message : err);
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Got it. We will use this quote reference when we follow up.',
      leadId,
      quoteToken: quote.quote_token,
    });
  } catch (error) {
    console.error('[quote-contact] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Quote contact is temporarily unavailable. Please call us with your reference.' },
      { status: 500 }
    );
  }
}

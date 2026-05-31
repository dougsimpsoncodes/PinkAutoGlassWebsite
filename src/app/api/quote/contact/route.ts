import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { buildAttribution } from '@/lib/attribution';
import { isExcludedPhone, isTestPhone } from '@/lib/constants';
import { sendAdminAlertEmail } from '@/lib/notifications/email';
import { sendAdminSMS } from '@/lib/notifications/sms';
import { checkRateLimit } from '@/lib/rate-limit';
import { findOrCreateQuoteLead, splitName, shortQuoteToken } from '@/lib/quote/leadSync';

export const runtime = 'nodejs';

const phoneSchema = z.string().trim().regex(/^(\+?1)?[\s\-.]?\(?([0-9]{3})\)?[\s\-.]?([0-9]{3})[\s\-.]?([0-9]{4})$/).transform((phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith('1') ? `+${digits}` : `+${digits}`;
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
  quote_total_cents: number | null;
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
      .select('id, quote_token, lead_id, status, quote_total_cents, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vin, zip, state, confidence_reasons')
      .eq('quote_token', input.quoteToken)
      .single<AutomatedQuoteRow>();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote reference was not found. Please request a new quote.' },
        { status: 404 }
      );
    }

    const name = splitName(input.fullName);
    const attribution = buildAttribution({
      bodyGclid: input.gclid?.trim() || undefined,
      bodyMsclkid: input.msclkid?.trim() || undefined,
      utmSource: input.utmSource?.trim() || undefined,
      utmMedium: input.utmMedium?.trim() || undefined,
      utmCampaign: input.utmCampaign?.trim() || undefined,
      utmTerm: input.utmTerm?.trim() || undefined,
      utmContent: input.utmContent?.trim() || undefined,
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
      sessionId: input.sessionId || request.cookies.get('session_id')?.value || null,
      attribution,
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
        status: nextQuoteStatus,
      })
      .eq('id', quote.id);

    if (updateQuoteError) {
      console.error('[quote-contact] automated quote link failed:', updateQuoteError.message);
      return NextResponse.json(
        { error: 'Quote was saved, but contact linking failed. Please call us with your reference.' },
        { status: 500 }
      );
    }

    await notifyAdmins(input, quote, name, leadId);

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

async function notifyAdmins(input: QuoteContactInput, quote: AutomatedQuoteRow, name: { firstName: string; lastName: string }, leadId: string) {
  if (isExcludedPhone(input.phone) || isTestPhone(input.phone)) return;

  const ref = shortQuoteToken(quote.quote_token);
  const vehicle = [quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim].filter(Boolean).join(' ') || 'Vehicle not captured';
  const price = quote.quote_total_cents ? `$${Math.round(quote.quote_total_cents / 100).toLocaleString()}` : 'manual confirmation needed';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Automated Quote Follow-Up</h2>
      <p><strong>Reference:</strong> ${ref}</p>
      <p><strong>Customer:</strong> ${escapeHtml([name.firstName, name.lastName].filter(Boolean).join(' '))}</p>
      <p><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>
      ${input.email ? `<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>` : ''}
      <p><strong>Vehicle:</strong> ${escapeHtml(vehicle)}</p>
      <p><strong>Price:</strong> ${escapeHtml(price)}</p>
      <p><strong>Status:</strong> ${escapeHtml(quote.status)}</p>
      <p><strong>Lead ID:</strong> ${escapeHtml(leadId)}</p>
    </div>
  `;
  const sms = `Automated quote ${ref}: ${[name.firstName, name.lastName].filter(Boolean).join(' ')} ${input.phone} | ${vehicle} | ${price}`;

  await Promise.allSettled([
    sendAdminAlertEmail(`Automated Quote ${ref}: ${name.firstName}`, html),
    sendAdminSMS(sms),
  ]);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

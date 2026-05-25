import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { buildAttribution } from '@/lib/attribution';
import { isExcludedPhone, isTestPhone } from '@/lib/constants';
import { sendAdminAlertEmail } from '@/lib/notifications/email';
import { sendAdminSMS } from '@/lib/notifications/sms';
import { checkRateLimit } from '@/lib/rate-limit';

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
  website: z.string().max(0).optional().default(''),
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
    const leadId = await findOrCreateLead({
      admin,
      anon,
      input,
      quote,
      firstName: name.firstName,
      lastName: name.lastName,
      request,
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

async function findOrCreateLead({
  admin,
  anon,
  input,
  quote,
  firstName,
  lastName,
  request,
}: {
  admin: PublicSupabaseClient;
  anon: PublicSupabaseClient;
  input: QuoteContactInput;
  quote: AutomatedQuoteRow;
  firstName: string;
  lastName: string;
  request: NextRequest;
}): Promise<string> {
  if (quote.lead_id) {
    await updateLead(admin, quote.lead_id, input, quote, firstName, lastName);
    return quote.lead_id;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: existingLead } = await admin
    .from('leads')
    .select('id')
    .eq('phone_e164', input.phone)
    .in('status', ['new', 'contacted', 'quoted', 'scheduled'])
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<{ id: string }>();

  const existingLeadId = typeof existingLead?.id === 'string' ? existingLead.id : null;
  if (existingLeadId) {
    await updateLead(admin, existingLeadId, input, quote, firstName, lastName);
    return existingLeadId;
  }

  const leadId = crypto.randomUUID();
  const attribution = buildAttribution({
    bodyGclid: emptyToUndefined(input.gclid),
    bodyMsclkid: emptyToUndefined(input.msclkid),
    utmSource: emptyToUndefined(input.utmSource),
    utmMedium: emptyToUndefined(input.utmMedium),
    utmCampaign: emptyToUndefined(input.utmCampaign),
    utmTerm: emptyToUndefined(input.utmTerm),
    utmContent: emptyToUndefined(input.utmContent),
  });

  const { error } = await anon.rpc('fn_insert_lead', {
    p_id: leadId,
    p_payload: {
      firstName,
      lastName,
      email: input.email || null,
      phoneE164: input.phone,
      vehicleYear: quote.vehicle_year,
      vehicleMake: quote.vehicle_make,
      vehicleModel: quote.vehicle_model,
      serviceType: 'replacement',
      mobileService: true,
      state: quote.state,
      zip: quote.zip,
      clientId: emptyToUndefined(input.clientId),
      sessionId: emptyToUndefined(input.sessionId) || request.cookies.get('session_id')?.value || null,
      smsConsent: input.smsConsent,
      privacyAcknowledgment: true,
      termsAccepted: true,
      isTest: isExcludedPhone(input.phone) || isTestPhone(input.phone),
      ...attribution,
    },
  });

  if (error) {
    console.error('[quote-contact] lead insert failed:', error.message);
    throw new Error('Failed to create lead for quote contact.');
  }

  await updateLead(admin, leadId, input, quote, firstName, lastName);
  return leadId;
}

async function updateLead(
  admin: PublicSupabaseClient,
  leadId: string,
  input: QuoteContactInput,
  quote: AutomatedQuoteRow,
  firstName: string,
  lastName: string
) {
  const notes = [
    `Automated quote ${shortQuoteToken(quote.quote_token)}`,
    quote.status ? `status: ${quote.status}` : null,
    quote.vehicle_year || quote.vehicle_make || quote.vehicle_model
      ? `vehicle: ${[quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim].filter(Boolean).join(' ')}`
      : null,
  ].filter(Boolean).join(' | ');

  const { error } = await admin
    .from('leads')
    .update({
      first_name: firstName,
      last_name: lastName || null,
      ...(input.email ? { email: input.email } : {}),
      phone_e164: input.phone,
      vehicle_year: quote.vehicle_year,
      vehicle_make: quote.vehicle_make,
      vehicle_model: quote.vehicle_model,
      zip: quote.zip,
      state: quote.state,
      service_type: 'replacement',
      quote_amount: quote.quote_total_cents ? quote.quote_total_cents / 100 : null,
      notes,
    })
    .eq('id', leadId);

  if (error) {
    console.error('[quote-contact] lead update failed:', error.message);
    throw new Error('Failed to update lead for quote contact.');
  }
}

async function notifyAdmins(input: QuoteContactInput, quote: AutomatedQuoteRow, name: { firstName: string; lastName: string }, leadId: string) {
  if (isExcludedPhone(input.phone)) return;

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

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Customer',
    lastName: parts.slice(1).join(' '),
  };
}

function emptyToUndefined(value?: string) {
  return value && value.trim() ? value.trim() : undefined;
}

function shortQuoteToken(token: string): string {
  return token.slice(0, 8).toUpperCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

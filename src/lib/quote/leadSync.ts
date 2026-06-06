/**
 * Shared auto-quoter → leads sync. Used by BOTH /api/quote/contact and
 * /api/quote/book so a quoter customer becomes an ordinary `form` lead exactly
 * once, with the same dedupe + attribution rules (no drift).
 *
 * - HOW: first_contact_method defaults to 'form' (the website quoter form).
 * - WHERE: attribution from the request body (contact) OR resolved server-side
 *   from the quote's session_id → user_sessions (book).
 * - Revenue: never set here. revenue_amount is attached later by the Omega
 *   invoice→lead match on completion (F09) — booking only sets status.
 * - Dedupe: quote.lead_id first, then a recent open lead by phone. Idempotent
 *   via the unique-phone constraint (re-runs update, never duplicate).
 *
 * See tasks/2026-05-30-reporting-consistency-audit.md (Item 9 / F02/F03).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildAttribution, type AttributionInput, type AttributionOutput } from '@/lib/attribution';
import { isExcludedPhone, isTestPhone } from '@/lib/constants';

export type PublicSupabaseClient = SupabaseClient<any, 'public', any>;

export interface QuoteLeadQuote {
  id: string;
  quote_token: string;
  lead_id: string | null;
  status: string | null;
  session_id?: string | null;
  quote_total_cents: number | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  zip: string | null;
  state: string | null;
}

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'scheduled';

export interface QuoteLeadContact {
  firstName: string;
  lastName: string;
  /** E.164 phone. */
  phone: string;
  email?: string | null;
  smsConsent?: boolean;
  state?: string | null;
  zip?: string | null;
  clientId?: string;
  sessionId?: string | null;
  /** Pre-built attribution fields (from buildAttribution). */
  attribution?: AttributionOutput;
  /** Force is_test (e.g. the parent quote was flagged test). OR'd with the phone check. */
  isTest?: boolean;
  /**
   * Status to set when updating an existing lead. Omitted → status left as-is
   * (the /contact path's prior behavior). /book passes 'scheduled'.
   */
  status?: LeadStatus;
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || 'Customer', lastName: parts.slice(1).join(' ') };
}

export function shortQuoteToken(token: string): string {
  return token.slice(0, 8).toUpperCase();
}

function emptyToUndefined(value?: string | null) {
  return value && value.trim() ? value.trim() : undefined;
}

/**
 * Resolve attribution for a booking from the quote's session (the booking
 * request carries no click IDs). Server-side lookup wins; falls back to an
 * empty (unattributed → direct) attribution when there is no session row.
 */
export async function buildAttributionFromSession(
  admin: PublicSupabaseClient,
  sessionId: string | null | undefined,
  fallback: AttributionInput = {}
): Promise<AttributionOutput> {
  if (!sessionId) return buildAttribution(fallback);
  const { data } = await admin
    .from('user_sessions')
    .select('gclid, msclkid, utm_source, utm_medium, utm_campaign, utm_term, utm_content')
    .eq('session_id', sessionId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return buildAttribution(fallback);
  return buildAttribution({
    lookupGclid: emptyToUndefined(data.gclid),
    lookupMsclkid: emptyToUndefined(data.msclkid),
    bodyGclid: fallback.bodyGclid,
    bodyMsclkid: fallback.bodyMsclkid,
    utmSource: emptyToUndefined(data.utm_source) ?? fallback.utmSource,
    utmMedium: emptyToUndefined(data.utm_medium) ?? fallback.utmMedium,
    utmCampaign: emptyToUndefined(data.utm_campaign) ?? fallback.utmCampaign,
    utmTerm: emptyToUndefined(data.utm_term) ?? fallback.utmTerm,
    utmContent: emptyToUndefined(data.utm_content) ?? fallback.utmContent,
  });
}

/**
 * Find-or-create the lead for a quoter customer. Returns the lead id.
 * Mirrors the prior /contact behavior exactly when contact.status is omitted.
 */
export async function findOrCreateQuoteLead(
  admin: PublicSupabaseClient,
  anon: PublicSupabaseClient,
  quote: QuoteLeadQuote,
  contact: QuoteLeadContact
): Promise<string> {
  const isTest = !!contact.isTest || isExcludedPhone(contact.phone) || isTestPhone(contact.phone);

  if (quote.lead_id) {
    await updateQuoteLead(admin, quote.lead_id, quote, contact);
    return quote.lead_id;
  }

  // Reuse a recent open lead for this phone before creating a new one.
  // Test leads intentionally bypass this branch so repeated 555/Codex QA runs
  // do not mutate one old lead and make attribution evidence look stale.
  if (!isTest) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: existingLead } = await admin
      .from('leads')
      .select('id')
      .eq('phone_e164', contact.phone)
      .in('status', ['new', 'contacted', 'quoted', 'scheduled'])
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>();

    if (existingLead?.id) {
      await updateQuoteLead(admin, existingLead.id, quote, contact);
      return existingLead.id;
    }
  }

  const leadId = crypto.randomUUID();
  const { error } = await anon.rpc('fn_insert_lead', {
    p_id: leadId,
    p_payload: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || null,
      phoneE164: contact.phone,
      vehicleYear: quote.vehicle_year,
      vehicleMake: quote.vehicle_make,
      vehicleModel: quote.vehicle_model,
      serviceType: 'replacement',
      mobileService: true,
      state: contact.state || quote.state,
      zip: contact.zip || quote.zip,
      clientId: emptyToUndefined(contact.clientId),
      sessionId: emptyToUndefined(contact.sessionId) || null,
      smsConsent: contact.smsConsent ?? false,
      privacyAcknowledgment: true,
      termsAccepted: true,
      isTest,
      ...(contact.attribution || {}),
    },
  });

  if (error) {
    // Unique-phone constraint is partial (one non-test lead per phone). On a
    // 23505 the conflicting row is THE lead with this phone + same is_test —
    // re-find it precisely (not just "most recent", which could grab a test row)
    // and enrich it rather than creating a duplicate.
    if ((error as { code?: string }).code === '23505') {
      const { data: raced } = await admin
        .from('leads')
        .select('id')
        .eq('phone_e164', contact.phone)
        .eq('is_test', isTest)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<{ id: string }>();
      if (raced?.id) {
        await updateQuoteLead(admin, raced.id, quote, contact);
        return raced.id;
      }
    }
    console.error('[quote-lead-sync] lead insert failed:', error.message);
    throw new Error('Failed to create lead for quote.');
  }

  await updateQuoteLead(admin, leadId, quote, contact);
  return leadId;
}

async function updateQuoteLead(
  admin: PublicSupabaseClient,
  leadId: string,
  quote: QuoteLeadQuote,
  contact: QuoteLeadContact
) {
  const quoteRef = shortQuoteToken(quote.quote_token);
  const newNote = [
    `Automated quote ${quoteRef}`,
    quote.status ? `status: ${quote.status}` : null,
    quote.vehicle_year || quote.vehicle_make || quote.vehicle_model
      ? `vehicle: ${[quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim].filter(Boolean).join(' ')}`
      : null,
  ].filter(Boolean).join(' | ');

  const { data: existing } = await admin
    .from('leads')
    .select('notes, gclid, msclkid, ad_platform, utm_source, utm_medium, utm_campaign, utm_term, utm_content, client_id, session_id, is_test')
    .eq('id', leadId)
    .single<{
      notes: string | null;
      gclid?: string | null;
      msclkid?: string | null;
      ad_platform?: string | null;
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
      utm_term?: string | null;
      utm_content?: string | null;
      client_id?: string | null;
      session_id?: string | null;
      is_test?: boolean | null;
    }>();
  const existingNotes = existing?.notes?.trim() || '';
  const notes = !existingNotes
    ? newNote
    : existingNotes.includes(`Automated quote ${quoteRef}`)
      ? existingNotes
      : `${existingNotes}\n${newNote}`;
  const attribution = contact.attribution;
  const attributionFill = attribution ? {
    ...(!existing?.gclid && attribution.gclid ? { gclid: attribution.gclid } : {}),
    ...(!existing?.msclkid && attribution.msclkid ? { msclkid: attribution.msclkid } : {}),
    ...(!existing?.ad_platform && attribution.ad_platform ? { ad_platform: attribution.ad_platform } : {}),
    ...(!existing?.utm_source && attribution.utm_source ? { utm_source: attribution.utm_source } : {}),
    ...(!existing?.utm_medium && attribution.utm_medium ? { utm_medium: attribution.utm_medium } : {}),
    ...(!existing?.utm_campaign && attribution.utm_campaign ? { utm_campaign: attribution.utm_campaign } : {}),
    ...(!existing?.utm_term && attribution.utm_term ? { utm_term: attribution.utm_term } : {}),
    ...(!existing?.utm_content && attribution.utm_content ? { utm_content: attribution.utm_content } : {}),
  } : {};
  const clientId = emptyToUndefined(contact.clientId);
  const sessionId = emptyToUndefined(contact.sessionId);

  const { error } = await admin
    .from('leads')
    .update({
      first_name: contact.firstName,
      last_name: contact.lastName || null,
      ...(contact.email ? { email: contact.email } : {}),
      phone_e164: contact.phone,
      vehicle_year: quote.vehicle_year,
      vehicle_make: quote.vehicle_make,
      vehicle_model: quote.vehicle_model,
      zip: contact.zip || quote.zip,
      state: contact.state || quote.state,
      service_type: 'replacement',
      quote_amount: quote.quote_total_cents ? quote.quote_total_cents / 100 : null,
      // Only advance status when the caller asks (e.g. booking → 'scheduled').
      // revenue_amount is intentionally NEVER set here — Omega completion owns it (F09).
      ...(contact.status ? { status: contact.status } : {}),
      ...(!existing?.client_id && clientId ? { client_id: clientId } : {}),
      ...(!existing?.session_id && sessionId ? { session_id: sessionId } : {}),
      ...(contact.isTest && existing?.is_test === false ? { is_test: true } : {}),
      ...attributionFill,
      notes,
    })
    .eq('id', leadId);

  if (error) {
    console.error('[quote-lead-sync] lead update failed:', error.message);
    throw new Error('Failed to update lead for quote.');
  }
}

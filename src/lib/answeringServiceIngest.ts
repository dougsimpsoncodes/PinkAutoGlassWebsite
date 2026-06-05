/**
 * Answering-service lead INGESTION (shared by the live webhook + the one-time
 * backfill, so they can never drift).
 *
 * Turns a parsed answering-service customer card into an ordinary
 * `first_contact_method = 'call'` lead, using the usual phone-based dedupe:
 *   - already a lead row        → enrich blanks only (never overwrite)
 *   - rang the main line (call)  → create a 'call' lead anchored to the real
 *                                  call's time + attribution (callLeadSync-safe)
 *   - neither (net-new)          → create a 'call' lead; WHERE defaults to
 *                                  'direct' (never fabricate a paid source)
 *
 * Idempotent: one lead per customer phone, backed by the DB unique constraint
 * on non-test phones — re-running the webhook or backfill is safe (re-inserts
 * collapse to enrich/no-op). See tasks/2026-05-30-reporting-consistency-audit.md
 * (Item 2). The raw text is excluded from all reporting; only the call lead counts.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { isExcludedPhone, isTestPhone } from './constants';
import { classifyCallMarket } from './market';
import {
  parseAnsweringServiceMessage,
  type ParsedAnsweringServiceCustomer,
} from './answeringService';

export type IngestAction =
  | 'created'
  | 'created_from_call'
  | 'enriched'
  | 'noop_complete'
  | 'skip_non_lead'
  | 'manual_review';

export interface IngestOutcome {
  phone: string | null;
  action: IngestAction;
  fills?: string[];
  reasonCode?: string | null;
}

export interface IngestResult {
  outcomes: IngestOutcome[];
  created: number;
  enriched: number;
  skippedNonLead: number;
  manualReview: number;
}

interface CallAnchor {
  start_time: string;
  ad_platform: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  gclid: string | null;
  msclkid: string | null;
  website_session_id: string | null;
  to_number: string | null;
}

/** Build an enrich patch that ONLY fills currently-blank columns. Never overwrites. */
function buildEnrichPatch(
  existing: Record<string, unknown>,
  c: ParsedAnsweringServiceCustomer
): { patch: Record<string, unknown>; fills: string[] } {
  const patch: Record<string, unknown> = {};
  const fills: string[] = [];
  const blank = (v: unknown) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');

  if (blank(existing.first_name) && c.firstName) { patch.first_name = c.firstName; fills.push('first_name'); }
  if (blank(existing.last_name) && c.lastName) { patch.last_name = c.lastName; fills.push('last_name'); }
  if (blank(existing.vehicle_year) && c.vehicleYear) { patch.vehicle_year = c.vehicleYear; fills.push('vehicle_year'); }
  if (blank(existing.vehicle_make) && c.vehicleMake) { patch.vehicle_make = c.vehicleMake; fills.push('vehicle_make'); }
  if (blank(existing.vehicle_model) && c.vehicleModel) { patch.vehicle_model = c.vehicleModel; fills.push('vehicle_model'); }

  // Always preserve the receptionist's note as provenance — append, never replace.
  if (c.message) {
    const tag = `[answering service] ${c.message}`;
    const prevNotes = typeof existing.notes === 'string' ? existing.notes : '';
    if (!prevNotes.includes(c.message)) {
      patch.notes = prevNotes ? `${prevNotes}\n${tag}` : tag;
      if (!fills.includes('notes')) fills.push('notes');
    }
  }
  return { patch, fills };
}

/**
 * Ingest one inbound answering-service SMS body. Pure DB side-effects via the
 * injected client; returns a structured outcome for reconciliation/logging.
 */
export async function ingestAnsweringServiceMessage(
  supabase: SupabaseClient,
  message: { messageText: string | null | undefined; messageTime?: string | null },
  opts: { dryRun?: boolean } = {}
): Promise<IngestResult> {
  const dryRun = !!opts.dryRun;
  const customers = parseAnsweringServiceMessage(message.messageText);
  const result: IngestResult = { outcomes: [], created: 0, enriched: 0, skippedNonLead: 0, manualReview: 0 };

  for (const c of customers) {
    if (c.classification === 'non_lead') {
      result.skippedNonLead++;
      result.outcomes.push({ phone: c.phoneE164, action: 'skip_non_lead', reasonCode: c.reasonCode });
      continue;
    }
    if (c.classification === 'manual_review' || !c.phoneE164) {
      result.manualReview++;
      result.outcomes.push({ phone: c.phoneE164, action: 'manual_review', reasonCode: c.reasonCode ?? 'no_valid_phone' });
      continue;
    }

    const phone = c.phoneE164;
    const isTest = isExcludedPhone(phone) || isTestPhone(phone);

    // 1) Existing lead row for this customer → enrich blanks only.
    const { data: existing } = await supabase
      .from('leads')
      .select('id, first_name, last_name, vehicle_year, vehicle_make, vehicle_model, notes')
      .eq('phone_e164', phone)
      .eq('is_test', isTest)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { patch, fills } = buildEnrichPatch(existing as Record<string, unknown>, c);
      if (fills.length === 0) {
        result.outcomes.push({ phone, action: 'noop_complete' });
        continue;
      }
      if (!dryRun) {
        const { error: upErr } = await supabase.from('leads').update(patch).eq('id', (existing as { id: string }).id);
        if (upErr) {
          result.manualReview++;
          result.outcomes.push({ phone, action: 'manual_review', reasonCode: `enrich_error:${upErr.message}` });
          continue;
        }
      }
      result.enriched++;
      result.outcomes.push({ phone, action: 'enriched', fills });
      continue;
    }

    // 2) No lead row — did they ring the main line? Anchor to the REAL call that
    // triggered this card: the customer's number (Phone or the line they called
    // from), inbound, at-or-before the text time and within a bounded lookback —
    // so we never copy a later/unrelated call's paid attribution. Unmatched → net-new.
    const callNumbers = [phone, c.callerIdE164].filter((n): n is string => !!n);
    let callQuery = supabase
      .from('ringcentral_calls')
      // to_number is needed to derive the lead's market (codex pre-deploy
      // F-market-5, 2026-05-31) — same signal callLeadSync uses.
      .select('start_time, ad_platform, utm_source, utm_medium, utm_campaign, utm_term, gclid, msclkid, website_session_id, to_number')
      .in('from_number', callNumbers)
      .eq('direction', 'Inbound')
      .order('start_time', { ascending: false })
      .limit(1);
    if (message.messageTime) {
      const upper = message.messageTime;
      const lower = new Date(new Date(upper).getTime() - 24 * 60 * 60 * 1000).toISOString();
      callQuery = callQuery.lte('start_time', upper).gte('start_time', lower);
    }
    const { data: call } = await callQuery.maybeSingle();

    const insert: Record<string, unknown> = {
      phone_e164: phone,
      first_contact_method: 'call',
      first_name: c.firstName ?? '',
      last_name: c.lastName ?? '',
      vehicle_year: c.vehicleYear,
      vehicle_make: c.vehicleMake,
      vehicle_model: c.vehicleModel,
      status: 'new',
      is_test: isTest,
      notes: c.message ? `[answering service] ${c.message}` : null,
    };

    if (call) {
      // Anchor attribution + time to the real call (the actual customer action).
      insert.created_at = (call as CallAnchor).start_time;
      insert.ad_platform = (call as CallAnchor).ad_platform ?? 'direct';
      insert.utm_source = (call as CallAnchor).utm_source ?? null;
      insert.utm_medium = (call as CallAnchor).utm_medium ?? null;
      insert.utm_campaign = (call as CallAnchor).utm_campaign ?? null;
      // Pass click IDs so this lead is eligible for offline conversion upload.
      // utm_term required for keyword-level call reporting.
      if ((call as CallAnchor).gclid) insert.gclid = (call as CallAnchor).gclid;
      if ((call as CallAnchor).msclkid) insert.msclkid = (call as CallAnchor).msclkid;
      if ((call as CallAnchor).utm_term) insert.utm_term = (call as CallAnchor).utm_term;
      if ((call as CallAnchor).website_session_id) insert.website_session_id = (call as CallAnchor).website_session_id;
      // Derive market from the inbound call's to_number, like callLeadSync —
      // otherwise CO/AZ lead+revenue filters drop these calls (F-market-5).
      const callMarket = classifyCallMarket((call as CallAnchor).to_number);
      if (callMarket) insert.market = callMarket;
    } else {
      // Net-new (service-only). Never fabricate a paid source — default to direct.
      insert.ad_platform = 'direct';
      if (message.messageTime) insert.created_at = message.messageTime;
    }

    if (!dryRun) {
      const { error } = await supabase.from('leads').insert(insert);
      if (error) {
        // Unique-phone race (e.g. callLeadSync inserted first) → fall back to enrich.
        if ((error as { code?: string }).code === '23505') {
          const { data: nowExisting } = await supabase
            .from('leads')
            .select('id, first_name, last_name, vehicle_year, vehicle_make, vehicle_model, notes')
            .eq('phone_e164', phone)
            .eq('is_test', isTest)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (nowExisting) {
            const { patch, fills } = buildEnrichPatch(nowExisting as Record<string, unknown>, c);
            if (fills.length) {
              const { error: upErr } = await supabase.from('leads').update(patch).eq('id', (nowExisting as { id: string }).id);
              if (upErr) {
                result.manualReview++;
                result.outcomes.push({ phone, action: 'manual_review', reasonCode: `enrich_error:${upErr.message}` });
                continue;
              }
            }
            result.enriched++;
            result.outcomes.push({ phone, action: 'enriched', fills });
            continue;
          }
        }
        result.outcomes.push({ phone, action: 'manual_review', reasonCode: `insert_error:${(error as { message?: string }).message ?? 'unknown'}` });
        result.manualReview++;
        continue;
      }
    }

    result.created++;
    result.outcomes.push({ phone, action: call ? 'created_from_call' : 'created' });
  }

  return result;
}

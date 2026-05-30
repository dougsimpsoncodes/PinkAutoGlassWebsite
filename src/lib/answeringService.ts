/**
 * Answering-service inbound SMS parsing.
 *
 * Doug's after-hours / overflow answering service (a virtual receptionist)
 * texts the business RingCentral line a structured "lead card" for every
 * customer who phones in. These texts are an INTAKE / accounting mechanism —
 * NOT customer texts. Each card represents a real phone customer who called.
 *
 * Policy (decided 2026-05-30, council-confirmed — see
 * tasks/2026-05-30-reporting-consistency-audit.md, Item 2):
 *  - The text itself is excluded from all reporting (never an 'sms' lead, never
 *    a conversion/click event). Only the resulting CALL lead counts.
 *  - Each parsed customer becomes an ordinary `first_contact_method = 'call'`
 *    lead, deduped on the customer's real phone, enriched-blanks-only, with
 *    WHERE (ad_platform/utm) set by the normal call-attribution pipeline.
 *  - No new schema fields: customers are recorded with the same WHERE + HOW as
 *    any other call lead.
 */
import { normalizePhoneDigits } from './market';

/**
 * Answering-service sender numbers (extensible). Inbound SMS from these numbers
 * is an intake feed, not a customer text. Confirmed 2026-05-30 — an Oklahoma
 * virtual-receptionist service. Add new agent/location numbers here.
 */
export const ANSWERING_SERVICE_NUMBERS: readonly string[] = [
  '+14052664647',
  '+14058606684',
];

export function isAnsweringServiceNumber(num?: string | null): boolean {
  return !!num && ANSWERING_SERVICE_NUMBERS.includes(num);
}

export type ParsedClassification = 'lead' | 'non_lead' | 'manual_review';

export interface ParsedAnsweringServiceCustomer {
  /** Customer's callback number (from "Phone:", fallback "Caller ID:"), E.164 +1XXXXXXXXXX. */
  phoneE164: string | null;
  /** The line they actually called from, when it differs from the callback number. */
  callerIdE164: string | null;
  firstName: string | null;
  lastName: string | null;
  vehicleYear: number | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  licensePlate: string | null;
  /** Glass / service requested. */
  glass: string | null;
  /** Reason for the call (the receptionist's note). */
  message: string | null;
  classification: ParsedClassification;
  /** Why this block was classed non_lead / manual_review (null for a clean lead). */
  reasonCode: string | null;
  /** The raw text block this customer was parsed from (provenance). */
  raw: string;
}

/** Patterns that mark a card as a non-sales-lead (insurance/claims dispatch, solicitation). */
const NON_LEAD_PATTERNS: { code: string; re: RegExp }[] = [
  { code: 'insurance_claim', re: /state\s*farm|claims?\b|insurance company|adjuster|referral for service that has already been (completed|replaced)|already been (completed|replaced)/i },
  { code: 'solicitation', re: /\bppc\b|regarding your (ppc|google|marketing|ad|seo)\b|cold call|sales (call|pitch)|web ?design|rank(ing)? your|marketing (services|agency)/i },
];

/** Format a raw phone-ish string to E.164 +1XXXXXXXXXX, or null if not a real US 10-digit number. */
function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Reject explicit non-US international numbers (e.g. "+60 6-653 9117", "+31 5966506")
  // before digit-normalization collapses the country code into a fake US number.
  const intl = raw.trim().match(/^\+\s*(\d{1,3})/);
  if (intl && intl[1] !== '1') return null;
  const norm = normalizePhoneDigits(raw); // -> "1XXXXXXXXXX" | "XXXXXXXXXX" | digits | null
  if (!norm) return null;
  // Must be a US 11-digit (1 + 10). Reject anything else (international, short, garbage).
  if (norm.length !== 11 || !norm.startsWith('1')) return null;
  const ten = norm.slice(1);
  // Reject obvious placeholders (0000000000, 1111111111, etc.).
  if (/^(\d)\1{9}$/.test(ten)) return null;
  // Reject NANP numbers with an invalid area/exchange code (must start 2-9).
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null;
  return `+${norm}`;
}

/** Pull a single labeled field's value (to end of line) from a block, case-insensitive. */
function field(block: string, label: string): string | null {
  const re = new RegExp(`${label}\\s*:\\s*(.+)`, 'i');
  const m = block.match(re);
  if (!m) return null;
  const v = m[1].trim();
  if (!v) return null;
  // Treat common "no value" placeholders as null.
  if (/^(n\/?a|none|not provided|unknown|unavailable|declined|does not have|doesn'?t have|not sure|unsure|na)\.?$/i.test(v)) {
    return null;
  }
  return v;
}

function parseYear(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/\b(19|20)\d{2}\b/);
  if (!m) return null;
  const y = parseInt(m[0], 10);
  return y >= 1950 && y <= 2030 ? y : null;
}

/**
 * Parse one inbound answering-service SMS body into one or more customer cards.
 * Multiple customers in a single message are separated by a "---" delimiter line.
 */
export function parseAnsweringServiceMessage(text: string | null | undefined): ParsedAnsweringServiceCustomer[] {
  if (!text || !text.trim()) return [];

  // Split on delimiter lines made of 2+ dashes (handles "---", "-----", surrounding whitespace).
  const blocks = text
    .split(/\n\s*-{2,}\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  return blocks.map(parseBlock).filter((c): c is ParsedAnsweringServiceCustomer => c !== null);
}

function parseBlock(block: string): ParsedAnsweringServiceCustomer | null {
  // A block with no recognizable lead-card label is not parseable — skip entirely
  // (avoids turning stray chatter into manual-review noise).
  if (!/\b(phone|caller id|first name|last name|vehicle)\s*:/i.test(block)) {
    return null;
  }

  const phoneE164 = toE164(field(block, 'Phone'));
  const callerIdE164 = toE164(field(block, 'Caller ID'));
  const customerPhone = phoneE164 ?? callerIdE164;

  const customer: ParsedAnsweringServiceCustomer = {
    phoneE164: customerPhone,
    callerIdE164: callerIdE164 && callerIdE164 !== phoneE164 ? callerIdE164 : null,
    firstName: field(block, 'First Name'),
    lastName: field(block, 'Last Name'),
    vehicleYear: parseYear(field(block, 'Vehicle Year')),
    vehicleMake: field(block, 'Vehicle Make'),
    vehicleModel: field(block, 'Vehicle Model'),
    licensePlate: field(block, 'License Plate'),
    glass: field(block, 'Glass'),
    message: field(block, 'Message') ?? field(block, 'Call Conclusion'),
    classification: 'lead',
    reasonCode: null,
    raw: block,
  };

  // Classify: non-lead (insurance/solicitation) takes precedence; then missing phone.
  const nonLead = NON_LEAD_PATTERNS.find(p => p.re.test(block));
  if (nonLead) {
    customer.classification = 'non_lead';
    customer.reasonCode = nonLead.code;
  } else if (!customerPhone) {
    customer.classification = 'manual_review';
    customer.reasonCode = 'no_valid_phone';
  }

  return customer;
}

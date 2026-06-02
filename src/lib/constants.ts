/**
 * Shared business constants
 *
 * Single source of truth for values used across dashboard metrics,
 * lead processing, offline conversion sync, and cron jobs.
 *
 * LEAD vs CONVERSION EVENT distinction:
 *   - "Leads" = actual contacts: completed calls (30s+) and form submissions.
 *     Counted by fetchUnifiedLeads() and displayed on the dashboard.
 *   - "Conversion events" = website button clicks (phone_click, text_click).
 *     These are user intent signals, not confirmed contacts. Tracked in the
 *     conversion_events table and reported separately in the daily email.
 */

export const BUSINESS_PHONE_NUMBER = '+17209187465';

// Minimum call duration to count as a qualifying lead (in seconds).
// Calls shorter than this are excluded from lead counts (hangups, robocalls).
export const MIN_CALL_DURATION_SECONDS = 30;

// Dedup window (in minutes): how close a phone_click must be to a
// RingCentral call to consider them the same event. When matched,
// the offline upload is skipped because the phone click already
// fired a real-time conversion. Data shows 93% of click-to-call
// happens within 60 seconds; 3 min captures 96.7%.
export const DEDUP_WINDOW_MINUTES = 3;

// Attribution window for session-based matching (in minutes).
// For calls WITHOUT a phone_click, how far back we look for a
// website session with a GCLID/MSCLKID to attribute the call
// to an ad. 60 min captures the browse-then-call funnel.
export const ATTRIBUTION_WINDOW_MINUTES = 60;

// Customer-facing SMS kill switch. Set ENABLE_CUSTOMER_SMS=false to disable all
// automated SMS to customers (instant replies, drip follow-ups, review requests,
// inbound auto-replies). Admin SMS notifications are NOT affected.
// See docs/BEETEXTING_MIGRATION.md for context and re-enablement steps.
export function isCustomerSmsEnabled(): boolean {
  return process.env.ENABLE_CUSTOMER_SMS !== 'false';
}

// Team member personal phone numbers excluded from all auto-respond messages
// (instant SMS/email, drip sequences, review requests, inbound SMS auto-replies).
// Leads ARE saved to DB but tagged is_test=true — excluded from all attribution/reporting.
let _excludedPhones: Set<string> | null = null;

export function isExcludedPhone(phoneE164: string): boolean {
  if (!_excludedPhones) {
    _excludedPhones = new Set(
      (process.env.EXCLUDED_DRIP_PHONES || '')
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
    );
  }
  return _excludedPhones.has(phoneE164);
}

// Test phone numbers: receive full customer comms (SMS, email, drip) but are
// tagged is_test=true in the DB and excluded from all attribution/reporting.
// Use for internal team members who need to test the full customer experience.
let _testPhones: Set<string> | null = null;

export function isTestPhone(phoneE164: string): boolean {
  if (!_testPhones) {
    _testPhones = new Set(
      (process.env.TEST_PHONES || '')
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
    );
  }
  return _testPhones.has(phoneE164);
}

// US "555" exchange (XXX-555-XXXX) is reserved for fiction — real numbers
// effectively never use it, so it is a safe ad-hoc test marker.
const TEST_555_PHONE = /^\+1\d{3}555\d{4}$/;
const TEAM_EMAIL_DOMAIN = '@pinkautoglass.com';

/**
 * Detect a team-member or test submission from the customer details captured at
 * booking/lead time, so it can be tagged is_test=true and kept out of reporting.
 *
 * Combines the env-list phone checks (EXCLUDED_DRIP_PHONES / TEST_PHONES) with a
 * few strong, unambiguous markers, because env lists miss ad-hoc tests (a "Test"
 * booking, a 555 number) and team members using a number not yet on the list.
 *
 * Deliberately CONSERVATIVE — it only fires on signals a real customer would
 * essentially never produce, because a false positive HIDES a real booking from
 * reporting. is_test is a reversible reporting flag, never a hard block.
 *
 * Fires when ANY of:
 *  - phone is in EXCLUDED_DRIP_PHONES / TEST_PHONES, or uses the 555 test exchange
 *  - the name contains "test" as a standalone word (e.g. "Kody Test", "Test")
 *  - the install street is literally "TEST"
 *  - the email is on the @pinkautoglass.com team domain
 */
export function isTeamOrTestContact(contact: {
  phoneE164?: string | null;
  fullName?: string | null;
  email?: string | null;
  street?: string | null;
}): boolean {
  const phone = (contact.phoneE164 || '').trim();
  if (phone && (isExcludedPhone(phone) || isTestPhone(phone) || TEST_555_PHONE.test(phone))) {
    return true;
  }
  if (/\btest\b/.test((contact.fullName || '').toLowerCase())) return true;
  if ((contact.street || '').trim().toLowerCase() === 'test') return true;
  const email = (contact.email || '').trim().toLowerCase();
  if (email && email.endsWith(TEAM_EMAIL_DOMAIN)) return true;
  return false;
}

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

// Attribution window for session-based matching (in minutes).
// If an ad click session started within this window before a call,
// the call is attributed to that ad platform.
export const ATTRIBUTION_WINDOW_MINUTES = 15;

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

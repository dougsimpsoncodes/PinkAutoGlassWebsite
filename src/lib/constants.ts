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
export const ATTRIBUTION_WINDOW_MINUTES = 5;

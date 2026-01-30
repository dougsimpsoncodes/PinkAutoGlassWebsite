/**
 * Shared business constants
 *
 * Single source of truth for values used across dashboard metrics,
 * lead processing, offline conversion sync, and cron jobs.
 */

export const BUSINESS_PHONE_NUMBER = '+17209187465';

// Minimum call duration to count as a qualifying lead (in seconds)
export const MIN_CALL_DURATION_SECONDS = 30;

// Attribution window for session-based matching (in minutes)
export const ATTRIBUTION_WINDOW_MINUTES = 5;

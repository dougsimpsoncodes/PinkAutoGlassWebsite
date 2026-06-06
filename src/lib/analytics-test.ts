import type { UTMParams } from './tracking';

const TEST_TEXT_PATTERNS = [
  /\bcodex\b/i,
  /\bpreview(?:\.|-|_|\b)/i,
  /\bqa(?:\.|-|_|\b)/i,
  /\bsmoke(?:\.|-|_|\b)/i,
  /\bringcentral-cleanup\b/i,
  /\bprod_[a-z0-9_]*capture\b/i,
  /\bcapture_\d{6,}\b/i,
  /\bnotification[_-]?capture\b/i,
  /\bexample\.(?:com|invalid)\b/i,
  /\bgoblue12@aol\.com\b/i,
  /\b3107348934\b/,
  /\b13107348934\b/,
];

const TEST_555_PHONE = /\b(?:\+?1)?\D*\d{3}\D*555\D*\d{4}\b/;

function stringify(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function isAnalyticsTestTraffic(input: {
  sessionId?: string | null;
  visitorId?: string | null;
  landingPage?: string | null;
  pagePath?: string | null;
  referrer?: string | null;
  utmParams?: UTMParams | null;
  metadata?: Record<string, unknown> | null;
  phone?: string | null;
  email?: string | null;
}): boolean {
  const utm = input.utmParams || {};
  const haystack = [
    input.sessionId,
    input.visitorId,
    input.landingPage,
    input.pagePath,
    input.referrer,
    utm.source,
    utm.medium,
    utm.campaign,
    utm.term,
    utm.content,
    input.email,
    input.phone,
    stringify(input.metadata),
  ].filter(Boolean).join(' ');

  if (TEST_555_PHONE.test(haystack)) return true;
  return TEST_TEXT_PATTERNS.some((pattern) => pattern.test(haystack));
}

/**
 * Comprehensive Analytics Tracking System
 * Tracks events to both database and Google Analytics
 *
 * Attribution Features:
 * - Click IDs (gclid, msclkid, fbclid) stored in localStorage with 90-day expiration
 * - Deduplication using session_id to prevent duplicate conversions
 * - UTM parameters persisted for cross-page attribution
 */

import { createClient } from '@supabase/supabase-js';
import * as analytics from './analytics';
import { classifySessionMarket, type Market } from './market';

// Market is computed at session start and persisted in sessionStorage so
// child events (page_views, conversion_events) can denormalize from the
// session without doubling DB calls. Clearing sessionStorage falls back
// to recomputing from current request inputs (best-effort).
const SESSION_MARKET_KEY = 'pag_session_market';

function getSessionMarket(): Market | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(SESSION_MARKET_KEY);
    if (stored === 'colorado' || stored === 'arizona') return stored;
  } catch {
    // sessionStorage may be blocked (incognito strict mode); fall through
  }
  return null;
}

function setSessionMarket(market: Market | null): void {
  if (typeof window === 'undefined' || market === null) return;
  try {
    sessionStorage.setItem(SESSION_MARKET_KEY, market);
  } catch {
    // sessionStorage write may fail; child events will fall back to NULL
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// During build time (CI/CD), environment variables may not be available
const isBuildTime = !supabaseUrl || !supabaseKey;

if (!isBuildTime && typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.error('❌ Supabase environment variables not loaded!', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
}

const supabase = isBuildTime ? null as any : createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CLICK ID STORAGE WITH EXPIRATION
// ============================================================================

// Attribution windows: Google=90 days, Microsoft=90 days, Facebook=28 days
const CLICK_ID_EXPIRY_DAYS = 90;

interface StoredClickId {
  value: string;
  timestamp: number;
  landingPage: string;
}

/**
 * Store a click ID in localStorage with expiration metadata
 */
function storeClickId(key: string, value: string): void {
  if (typeof window === 'undefined') return;

  const data: StoredClickId = {
    value,
    timestamp: Date.now(),
    landingPage: window.location.pathname + window.location.search,
  };
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Retrieve a click ID from localStorage, checking expiration
 */
function getStoredClickId(key: string, expiryDays: number = CLICK_ID_EXPIRY_DAYS): string | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const data: StoredClickId = JSON.parse(stored);
    const expiryMs = expiryDays * 24 * 60 * 60 * 1000;

    if (Date.now() - data.timestamp > expiryMs) {
      // Expired - remove and return null
      localStorage.removeItem(key);
      return null;
    }

    return data.value;
  } catch {
    // Invalid JSON - remove corrupted data
    localStorage.removeItem(key);
    return null;
  }
}

// ============================================================================
// DEDUPLICATION TRACKING
// ============================================================================

/**
 * Track which conversion types have been fired in this session.
 * Prevents duplicate conversions from double-clicks, page refreshes, etc.
 * Uses sessionStorage — scoped to the current tab/session.
 */
function hasConversionFired(eventType: string): boolean {
  if (typeof window === 'undefined') return false;

  const sessionId = getSessionId();
  const key = `conversion_fired_${sessionId}_${eventType}`;
  return sessionStorage.getItem(key) === 'true';
}

function markConversionFired(eventType: string): void {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const key = `conversion_fired_${sessionId}_${eventType}`;
  sessionStorage.setItem(key, 'true');
}

/**
 * Durable booking-level dedup keyed by bookingToken (localStorage).
 *
 * sessionStorage dedup clears on tab close, so a user who gets a price,
 * closes the browser, and returns to book in a new session would re-fire
 * all conversion events — corrupting ad platform bidding signals.
 * Using localStorage + bookingToken as the key means each unique booking
 * fires exactly once regardless of how many sessions or tab reloads occur.
 */
function hasBookingFired(bookingToken: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`booking_event_fired_${bookingToken}`) === 'true';
  } catch {
    return false;
  }
}

function markBookingFired(bookingToken: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`booking_event_fired_${bookingToken}`, 'true');
  } catch {
    // localStorage write may be blocked (private browsing, storage quota); fall through
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface SessionData {
  sessionId: string;
  visitorId: string;
  startedAt: Date;
  utmParams: UTMParams;
  deviceInfo: DeviceInfo;
  geoInfo: GeoInfo;
}

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  userAgent: string;
}

export interface GeoInfo {
  country?: string;
  region?: string;
  city?: string;
}

/**
 * Generate or retrieve session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
    sessionStorage.setItem('session_start', new Date().toISOString());
  }
  return sessionId;
}

/**
 * Generate or retrieve visitor ID
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('analytics_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_visitor_id', visitorId);
  }
  return visitorId;
}

/**
 * Extract UTM parameters and gclid from URL
 */
export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };

  // Store UTM params in session for attribution
  if (utmParams.source) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  } else {
    // Retrieve stored UTM params
    const stored = sessionStorage.getItem('utm_params');
    if (stored) {
      return JSON.parse(stored);
    }
  }

  return utmParams;
}

/**
 * Get Google Click ID (gclid) from URL or localStorage
 * Persists for 90 days to match Google Ads attribution window
 */
export function getGclid(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const gclid = params.get('gclid');

  // If fresh gclid in URL, store it with timestamp
  if (gclid) {
    storeClickId('gclid', gclid);
    // Also store in session for backward compatibility
    sessionStorage.setItem('gclid', gclid);
    return gclid;
  }

  // Check localStorage first (persists across sessions)
  const storedGclid = getStoredClickId('gclid', 90);
  if (storedGclid) return storedGclid;

  // Fall back to sessionStorage for backward compatibility
  return sessionStorage.getItem('gclid');
}

/**
 * Get Microsoft/Bing Click ID (msclkid) from URL or localStorage
 * Persists for 90 days to match Microsoft Ads attribution window
 */
export function getMsclkid(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const msclkid = params.get('msclkid');

  // If fresh msclkid in URL, store it with timestamp
  if (msclkid) {
    storeClickId('msclkid', msclkid);
    sessionStorage.setItem('msclkid', msclkid);
    return msclkid;
  }

  // Check localStorage first (persists across sessions)
  const storedMsclkid = getStoredClickId('msclkid', 90);
  if (storedMsclkid) return storedMsclkid;

  // Fall back to sessionStorage
  return sessionStorage.getItem('msclkid');
}

/**
 * Get Facebook Click ID (fbclid) from URL or localStorage
 * Persists for 28 days to match Facebook's attribution window
 */
export function getFbclid(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');

  // If fresh fbclid in URL, store it with timestamp
  if (fbclid) {
    storeClickId('fbclid', fbclid);
    sessionStorage.setItem('fbclid', fbclid);
    return fbclid;
  }

  // Check localStorage first (persists across sessions) - 28 day window for Facebook
  const storedFbclid = getStoredClickId('fbclid', 28);
  if (storedFbclid) return storedFbclid;

  // Fall back to sessionStorage
  return sessionStorage.getItem('fbclid');
}

/**
 * Get device information
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      browser: 'unknown',
      os: 'unknown',
      userAgent: '',
    };
  }

  const userAgent = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);

  return {
    deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
    userAgent,
  };
}

function getBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Win')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Other';
}

// ============================================================================
// SESSION INITIALIZATION
// ============================================================================

/**
 * Initialize or retrieve session
 */
export async function initializeSession(): Promise<SessionData> {
  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const utmParams = getUTMParams();
  const gclid = getGclid();
  const deviceInfo = getDeviceInfo();

  const sessionData: SessionData = {
    sessionId,
    visitorId,
    startedAt: new Date(),
    utmParams,
    deviceInfo,
    geoInfo: {},
  };

  // Check if we already inserted this session (prevents duplicate requests)
  const sessionInsertedKey = `session_inserted_${sessionId}`;
  if (typeof window !== 'undefined' && sessionStorage.getItem(sessionInsertedKey)) {
    // Session already inserted in this browser session, skip DB call
    return sessionData;
  }

  const landingPage = window.location.pathname + window.location.search;

  // Classify market once at session creation; persist to sessionStorage so
  // child page_views/conversion_events can denormalize from the same value
  // without re-running the classifier (and without risking inconsistency).
  const market = classifySessionMarket({
    utm_campaign: utmParams.campaign,
    utm_source: utmParams.source,
    referrer: document.referrer || null,
    landing_page: landingPage,
  });
  setSessionMarket(market);

  // Use simple INSERT instead of UPSERT (RLS policy allows INSERT but not UPDATE for anon)
  // Duplicates will fail with unique constraint error, which we tolerate
  const { error: sessionInsertError } = await supabase
    .from('user_sessions')
    .insert({
      session_id: sessionId,
      visitor_id: visitorId,
      landing_page: landingPage,
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_term: utmParams.term,
      utm_content: utmParams.content,
      gclid: getGclid(),
      msclkid: getMsclkid(),
      fbclid: getFbclid(),
      referrer: document.referrer || null,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      market,
    });

  // Tolerate duplicates due to races or multiple calls
  // Duplicate error codes: 23505 (Postgres unique_violation) or PGRST409 (PostgREST conflict)
  if (sessionInsertError) {
    const isDuplicate =
      sessionInsertError.code === '23505' ||
      sessionInsertError.code === 'PGRST409' ||
      sessionInsertError.message?.includes('duplicate') ||
      sessionInsertError.message?.includes('unique constraint') ||
      sessionInsertError.message?.includes('already exists');

    if (!isDuplicate) {
      console.warn('Failed to insert user_session:', sessionInsertError.message);
    }
    // Silently ignore duplicates - session already exists which is fine
  }

  // Mark session as inserted so we don't try again on this page
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(sessionInsertedKey, 'true');
  }

  return sessionData;
}

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

/**
 * Track page view
 */
export async function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const utmParams = getUTMParams();
  const deviceInfo = getDeviceInfo();

  // Track in database — denormalize market from the parent session
  await supabase.from('page_views').insert({
    session_id: sessionId,
    visitor_id: visitorId,
    page_path: pagePath,
    page_title: pageTitle || document.title,
    referrer: document.referrer || null,
    utm_source: utmParams.source,
    utm_medium: utmParams.medium,
    utm_campaign: utmParams.campaign,
    utm_term: utmParams.term,
    utm_content: utmParams.content,
    gclid: getGclid(),
    msclkid: getMsclkid(),
    fbclid: getFbclid(),
    user_agent: deviceInfo.userAgent,
    device_type: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    market: getSessionMarket(),
  });

  // Track in Google Analytics
  analytics.pageview(pagePath);
}

// ============================================================================
// CONVERSION TRACKING
// ============================================================================

export interface ConversionEvent {
  eventType: 'phone_click' | 'text_click' | 'form_submit' | 'quote_generated';
  buttonText?: string;
  buttonLocation?: string;
  eventValue?: number;
  phoneNumber?: string; // The phone number that was clicked
  metadata?: Record<string, any>;
}

/**
 * Track conversion event with deduplication
 * Returns true if event was tracked, false if it was a duplicate
 */
export async function trackConversion(event: ConversionEvent): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const utmParams = getUTMParams();
  const deviceInfo = getDeviceInfo();

  // Per-stage de-dup for form_submit. Each funnel stage (priced / booked /
  // ymm_text_capture / default) records its OWN conversion_events row.
  // Phone/text clicks allow multiple per session (user might call more than once).
  //
  // The 'booked' stage uses localStorage + bookingToken as the dedup key so that
  // a user who gets a price, closes the browser, and books in a new session still
  // fires exactly once. sessionStorage-based dedup (used for other stages) clears
  // on tab close and was previously causing split-brain attribution: trackPurchase()
  // (which bypasses sessionStorage) would fire while form_submit was blocked.
  // (council 2026-06-04, unanimously agreed server-side/token-keyed dedup needed)
  const formSubmitStage = (event.metadata?.stage as string) || 'default';

  if (event.eventType === 'form_submit') {
    if (formSubmitStage === 'booked') {
      const bookingToken = (event.metadata?.booking_token as string) || null;
      if (bookingToken && hasBookingFired(bookingToken)) {
        console.log('⚠️ Duplicate booking form_submit blocked for token:', bookingToken);
        return false;
      }
    } else if (hasConversionFired('form_submit_' + formSubmitStage)) {
      console.log('⚠️ Duplicate form_submit blocked for session/stage:', sessionId, formSubmitStage);
      return false;
    }
  }

  // Use a distinct event_type for the quoter 'priced' diagnostic so every
  // existing form_submit counter is unaffected without retrofitting filters.
  // fn_quoter_funnel detects this as sig_priced via 'quote_priced' event_type.
  const dbEventType = (event.eventType === 'form_submit' && formSubmitStage === 'priced')
    ? 'quote_priced'
    : event.eventType;

  // Track in database — denormalize market from the parent session
  const { data, error } = await supabase.from('conversion_events').insert({
    session_id: sessionId,
    visitor_id: visitorId,
    event_type: dbEventType,
    event_category: 'conversion',
    page_path: window.location.pathname,
    button_text: event.buttonText,
    button_location: event.buttonLocation,
    phone_number: event.phoneNumber,
    utm_source: utmParams.source,
    utm_medium: utmParams.medium,
    utm_campaign: utmParams.campaign,
    utm_term: utmParams.term,
    utm_content: utmParams.content,
    gclid: getGclid(),
    msclkid: getMsclkid(),
    fbclid: getFbclid(),
    device_type: deviceInfo.deviceType,
    event_value: event.eventValue,
    metadata: event.metadata,
    market: getSessionMarket(),
  });

  if (error) {
    console.error('❌ Failed to track conversion in DB (ad conversions will still fire):', error);
    // Don't return false here — DB failure shouldn't block ad platform conversions.
    // Only duplicate blocking (above) should suppress ad conversions.
  }

  // Mark THIS form_submit stage as fired (stage-aware de-dup, see above).
  if (event.eventType === 'form_submit') {
    if (formSubmitStage === 'booked') {
      const bookingToken = (event.metadata?.booking_token as string) || null;
      if (bookingToken) {
        markBookingFired(bookingToken);
      } else {
        // No bookingToken available — fall back to sessionStorage so we don't
        // skip dedup entirely. Logged so the gap is detectable.
        console.warn('⚠️ form_submit booked has no booking_token — falling back to session dedup');
        markConversionFired('form_submit_booked');
      }
    } else {
      markConversionFired('form_submit_' + formSubmitStage);
    }
  }

  console.log('✅ Conversion tracked:', event.eventType, event.buttonLocation);

  // Track in Google Analytics
  const gaEventMap = {
    phone_click: 'click_to_call',
    text_click: 'click_to_text',
    form_submit: 'form_submit',
    quote_generated: 'quote_generated',
  };

  // Skip GA4 form_submit for quoter-path stages — 'purchase' is the canonical
  // GA4 booking signal (fired via trackPurchase in QuoteBookingForm). Firing
  // form_submit here too would create double-counting in GA4 audiences and
  // conversion reports. DB rows and Ads bidding conversions still fire above/below.
  //
  //   priced  → diagnostic only; GA4 form_submit here trains bidding on curiosity
  //   booked  → purchase event already covers this in GA4 (council 2026-06-04)
  if (event.eventType === 'form_submit' && (
    (event.metadata as any)?.stage === 'priced' ||
    (event.metadata as any)?.stage === 'booked'
  )) {
    return true;
  }

  // Fire GA4 event with all available custom dimensions from metadata.
  // These parameterNames match the 7 registered custom dimensions on GA4
  // property 507414450 (confirmed by verify-ga4-setup.mjs). Values are only
  // attached when present in metadata so existing events without rich metadata
  // (phone_click, legacy form_submit) are unaffected in GA4 reports.
  if (typeof window !== 'undefined' && window.gtag) {
    const gaParams: Record<string, unknown> = {
      event_category: 'conversion',
      event_label: event.buttonLocation || window.location.pathname,
      value: event.eventValue,
    };
    const CUSTOM_DIMS = [
      'stage', 'flow_mode', 'market', 'surface',
      'vehicle_make', 'vehicle_model', 'vehicle_year',
    ] as const;
    for (const dim of CUSTOM_DIMS) {
      const val = (event.metadata as Record<string, unknown> | undefined)?.[dim];
      if (val != null) gaParams[dim] = val;
    }
    window.gtag('event', gaEventMap[event.eventType], gaParams);
  }

  return true;
}

// ============================================================================
// GENERAL EVENT TRACKING
// ============================================================================

export interface AnalyticsEvent {
  eventName: string;
  eventCategory?: string;
  eventLabel?: string;
  eventValue?: number;
  metadata?: Record<string, any>;
}

/**
 * Track general analytics event
 */
export async function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const visitorId = getVisitorId();

  // Track in database
  await supabase.from('analytics_events').insert({
    session_id: sessionId,
    visitor_id: visitorId,
    event_name: event.eventName,
    event_category: event.eventCategory,
    event_label: event.eventLabel,
    event_value: event.eventValue,
    page_path: window.location.pathname,
    metadata: event.metadata,
  });

  // Track in Google Analytics
  if (event.eventCategory) {
    analytics.event({
      action: event.eventName,
      category: event.eventCategory,
      label: event.eventLabel,
      value: event.eventValue,
    });
  }
}

// ============================================================================
// SCROLL DEPTH TRACKING
// ============================================================================

let scrollDepthTracked = new Set<number>();

export function trackScrollDepth() {
  if (typeof window === 'undefined') return;

  const scrollPercentage = Math.round(
    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
  );

  // Track at 25%, 50%, 75%, 100%
  [25, 50, 75, 100].forEach((threshold) => {
    if (scrollPercentage >= threshold && !scrollDepthTracked.has(threshold)) {
      scrollDepthTracked.add(threshold);

      trackEvent({
        eventName: 'scroll_depth',
        eventCategory: 'engagement',
        eventLabel: window.location.pathname,
        eventValue: threshold,
      });
      // Note: trackEvent already fires analytics.event() via eventCategory check
      // so we don't call analytics.trackPageScroll() to avoid duplicate GA events
    }
  });
}

// Reset scroll tracking on page change
export function resetScrollTracking() {
  scrollDepthTracked.clear();
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Track phone click
 */
export function trackPhoneClick(source: string, buttonText?: string, phoneNumber?: string) {
  trackConversion({
    eventType: 'phone_click',
    buttonText,
    buttonLocation: source,
    phoneNumber,
  });
  // Note: trackConversion already fires analytics.event() via gaEventMap
  // so we don't call analytics.trackPhoneClick() to avoid duplicate GA events

  // Fire Google Ads call conversion with session_id as transaction_id
  // This prevents duplicate conversions from the same session
  const sessionId = getSessionId();
  if (sessionId) {
    analytics.trackCallClickConversion(sessionId);
  }

  // Fire Microsoft Ads UET phone call conversion (dedup by session)
  analytics.trackMicrosoftAdsCallClick(source, sessionId ? `call_${sessionId}` : undefined);
}

/**
 * Track text click
 */
export function trackTextClick(source: string, buttonText?: string) {
  trackConversion({
    eventType: 'text_click',
    buttonText,
    buttonLocation: source,
  });
  // Note: trackConversion already fires analytics.event() via gaEventMap
  // so we don't call analytics.trackTextClick() to avoid duplicate GA events

  // Fire Google Ads text conversion with session_id as transaction_id
  // This prevents duplicate conversions from the same session
  const sessionId = getSessionId();
  if (sessionId) {
    analytics.trackTextClickConversion(sessionId);
  }

  // Fire Microsoft Ads UET text click conversion (dedup by session)
  const textSessionId = getSessionId();
  analytics.trackMicrosoftAdsTextClick(source, textSessionId ? `text_${textSessionId}` : undefined);
}

/**
 * Track form submission
 */
export async function trackFormSubmission(
  formName: string,
  metadata?: Record<string, any>,
  opts?: { fireAds?: boolean }
) {
  // Always log the conversion_events row (stage-aware de-dup) so the quoter funnel
  // sees every stage. The Ads BIDDING conversion is gated separately below.
  const tracked = await trackConversion({
    eventType: 'form_submit',
    buttonLocation: formName,
    metadata,
  });
  // Note: trackConversion already fires analytics.event() via gaEventMap
  // so we don't call analytics.trackFormSubmit() to avoid duplicate GA events

  if (!tracked) return; // DB insert failed or duplicate stage — nothing more to do

  // Ads bidding conversion: fire ONLY for contact-captured steps (booking +
  // lead-capture), NEVER for price-shown (a non-contact, window-shopping event).
  // Firing it at price-shown trained Google/Microsoft toward price curiosity
  // instead of bookable leads; price-shown now passes opts.fireAds=false and
  // stays a diagnostic-only funnel event. (council 2026-06-01, unanimous)
  if (opts?.fireAds === false) return;

  // Resolve transaction id for Ads dedup.
  // Preference order: booking_token (stable across sessions, set by QuoteBookingForm)
  // → leadId / lead_id (legacy lead forms) → sessionId (last-resort fallback).
  // booking_token is critical: without it, a returning user who books in a new
  // session would re-fire the Ads conversion because sessionId changes per tab.
  const transactionId = metadata?.booking_token || metadata?.leadId || metadata?.lead_id || getSessionId();
  const stage = (metadata?.stage as string) || 'default';

  // Booking stage ($150) or legacy lead form ($91 default).
  const conversionValue = stage === 'booked' ? analytics.BOOKING_CONVERSION_VALUE_USD : undefined;
  const email = metadata?.email;
  const phone = metadata?.phone;
  analytics.trackLeadFormConversion(transactionId, { email, phone }, conversionValue);
  analytics.trackMicrosoftAdsLeadForm(formName, conversionValue, transactionId ? `form_${transactionId}` : undefined);
}

/**
 * Track quote_generated — writes to DB AND fires GA4.
 *
 * Previously only analytics.trackQuoteGenerated() was called at price-shown,
 * which sent to GA4 only (no DB row). This meant the server-side funnel
 * (fn_quoter_funnel, Supabase queries) had no visibility into the middle step.
 *
 * Use this in place of analytics.trackQuoteGenerated(). The existing
 * trackFormSubmission(stage='priced') call stays in place — it writes a
 * 'quote_priced' DB row that fn_quoter_funnel.sql depends on for its own
 * stage detection. Once the funnel SQL is updated to use 'quote_generated',
 * the quote_priced row can be retired.
 *
 * Ad fire: an OBSERVATION-ONLY "Quote priced" conversion fires here — Google Ads
 * REQUEST_QUOTE (secondary, not biddable) + Microsoft UET. It powers funnel
 * reporting and RLSA "quoted, didn't book" audiences but does NOT feed Smart
 * Bidding today (booking stays the only biddable lead signal). Gated to the main
 * site: satellite embeds (which carry metadata.siteKey) don't host Pink's gtag/
 * UET, so the ad fire is skipped there while the GA4 + DB funnel rows still write.
 */
export async function trackQuoteGeneratedConversion(
  serviceType: string,
  vehicleInfo: string,
  metadata?: Record<string, any>,
): Promise<void> {
  await trackConversion({
    eventType: 'quote_generated',
    // Preserve the label format analytics.trackQuoteGenerated() used for GA4.
    buttonLocation: vehicleInfo ? `${serviceType}:${vehicleInfo}` : serviceType,
    eventValue: metadata?.quote_total_cents != null
      ? (metadata.quote_total_cents as number) / 100
      : undefined,
    metadata,
  });

  // Observation-only ad conversions — main site only. Satellite embeds carry a
  // siteKey and run on third-party domains without Pink's gtag/UET, so firing
  // there would be a cross-origin no-op at best; skip it. Session-keyed dedup
  // (quote_{sessionId}) keeps it to one quote conversion per session.
  if (!metadata?.siteKey) {
    const sessionId = getSessionId();
    if (sessionId) {
      analytics.trackQuoteConversion(sessionId);
      const surface = (metadata?.surface as string) || 'quote';
      analytics.trackMicrosoftAdsQuoteGenerated(surface, `quote_${sessionId}`);
    }
  }
}

/**
 * Track form start
 */
export function trackFormStart(formName: string) {
  trackEvent({
    eventName: 'form_start',
    eventCategory: 'lead_generation',
    eventLabel: formName,
  });
  // Note: trackEvent already fires analytics.event() via eventCategory check
  // so we don't call analytics.trackFormStart() to avoid duplicate GA events
}

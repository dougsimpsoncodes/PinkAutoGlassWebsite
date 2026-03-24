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
 * Track which conversion types have been fired in this session
 * Prevents duplicate conversions from double-clicks, page refreshes, etc.
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

  // Track in database
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

  // Check for duplicate conversion in this session (for form_submit only)
  // Phone/text clicks allow multiple per session since user might call multiple times
  if (event.eventType === 'form_submit' && hasConversionFired('form_submit')) {
    console.log('⚠️ Duplicate form_submit blocked for session:', sessionId);
    return false;
  }

  // Track in database
  const { data, error } = await supabase.from('conversion_events').insert({
    session_id: sessionId,
    visitor_id: visitorId,
    event_type: event.eventType,
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
  });

  if (error) {
    console.error('❌ Failed to track conversion in DB (ad conversions will still fire):', error);
    // Don't return false here — DB failure shouldn't block ad platform conversions.
    // Only duplicate blocking (above) should suppress ad conversions.
  }

  // Mark form submissions as fired to prevent duplicates
  if (event.eventType === 'form_submit') {
    markConversionFired('form_submit');
  }

  console.log('✅ Conversion tracked:', event.eventType, event.buttonLocation);

  // Track in Google Analytics
  const gaEventMap = {
    phone_click: 'click_to_call',
    text_click: 'click_to_text',
    form_submit: 'form_submit',
    quote_generated: 'quote_generated',
  };

  analytics.event({
    action: gaEventMap[event.eventType],
    category: 'conversion',
    label: event.buttonLocation || window.location.pathname,
    value: event.eventValue,
  });

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
export async function trackFormSubmission(formName: string, metadata?: Record<string, any>) {
  // Await trackConversion — only fire ad platform conversions if DB insert succeeds
  const tracked = await trackConversion({
    eventType: 'form_submit',
    buttonLocation: formName,
    metadata,
  });
  // Note: trackConversion already fires analytics.event() via gaEventMap
  // so we don't call analytics.trackFormSubmit() to avoid duplicate GA events

  if (!tracked) return; // DB insert failed or duplicate — don't fire ad conversions

  // Fire Google Ads form conversion with leadId or session as transaction_id
  const transactionId = metadata?.leadId || getSessionId();
  if (transactionId) {
    const email = metadata?.email;
    const phone = metadata?.phone;
    analytics.trackLeadFormConversion(transactionId, { email, phone });
  }

  // Fire Microsoft Ads UET form submission conversion (dedup by leadId or session)
  analytics.trackMicrosoftAdsLeadForm(formName, undefined, transactionId ? `form_${transactionId}` : undefined);
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

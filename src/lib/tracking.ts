/**
 * Comprehensive Analytics Tracking System
 * Tracks events to both database and Google Analytics
 */

import { createClient } from '@supabase/supabase-js';
import * as analytics from './analytics';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.error('❌ Supabase environment variables not loaded!', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
 * Get Google Click ID (gclid) from URL
 */
export function getGclid(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const gclid = params.get('gclid');

  // Store gclid in session for attribution (it persists across page views in the same session)
  if (gclid) {
    sessionStorage.setItem('gclid', gclid);
    return gclid;
  }

  // Retrieve stored gclid
  return sessionStorage.getItem('gclid');
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

  // Check if session already exists in database
  const { data: existingSession } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (!existingSession) {
    // Create new session in database
    // Include full URL with query parameters in landing_page
    const landingPage = window.location.pathname + window.location.search;

    await supabase.from('user_sessions').insert({
      session_id: sessionId,
      visitor_id: visitorId,
      landing_page: landingPage,
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_term: utmParams.term,
      utm_content: utmParams.content,
      referrer: document.referrer || null,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });
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
  metadata?: Record<string, any>;
}

/**
 * Track conversion event
 */
export async function trackConversion(event: ConversionEvent) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const utmParams = getUTMParams();
  const deviceInfo = getDeviceInfo();

  // Track in database
  const { data, error } = await supabase.from('conversion_events').insert({
    session_id: sessionId,
    visitor_id: visitorId,
    event_type: event.eventType,
    event_category: 'conversion',
    page_path: window.location.pathname,
    button_text: event.buttonText,
    button_location: event.buttonLocation,
    utm_source: utmParams.source,
    utm_medium: utmParams.medium,
    utm_campaign: utmParams.campaign,
    utm_term: utmParams.term,
    utm_content: utmParams.content,
    device_type: deviceInfo.deviceType,
    event_value: event.eventValue,
    metadata: event.metadata,
  });

  if (error) {
    console.error('❌ Failed to track conversion:', error);
  } else {
    console.log('✅ Conversion tracked:', event.eventType, event.buttonLocation);
  }

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

      analytics.trackPageScroll(threshold, window.location.pathname);
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
export function trackPhoneClick(source: string, buttonText?: string) {
  trackConversion({
    eventType: 'phone_click',
    buttonText,
    buttonLocation: source,
  });
  analytics.trackPhoneClick(source);
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
  analytics.trackTextClick(source);
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, metadata?: Record<string, any>) {
  trackConversion({
    eventType: 'form_submit',
    buttonLocation: formName,
    metadata,
  });
  analytics.trackFormSubmit(formName);
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
  analytics.trackFormStart(formName);
}

// Google Analytics and Google Ads event tracking helper

export const GA_MEASUREMENT_ID = 'G-F7WMMDK4H4';

// Google Ads Conversion IDs
export const GOOGLE_ADS_CONVERSION_ID = 'AW-17667607828';
// "Booking" — the original "Submit lead form" action, repurposed for confirmed bookings only.
export const GOOGLE_ADS_LEAD_FORM_LABEL = '3CXNCJaG9cEbEJSayehB';
export const GOOGLE_ADS_TEXT_LABEL = 'zs3xCJyG9cEbEJSayehB';
export const GOOGLE_ADS_CALL_LABEL = 'NRHDCJmG9cEbEJSayehB';
// "Callback (text-me-price)" — secondary action, ID 7633459171. Paused: YMM tab removed.
// Keep constant + action alive for future re-use if a callback path is re-introduced.
export const GOOGLE_ADS_CALLBACK_LABEL = 'snihCOOv9bccEJSayehB';
// "Quote priced (web)" — REQUEST_QUOTE secondary action, ID 7636293598.
// Observation-only: primary_for_goal=false and NOT biddable at campaign level,
// so it never feeds Smart Bidding today. Fires at price-shown to power funnel
// reporting + RLSA "quoted, didn't book" audiences. Promoting it to biddable is
// a deliberate future decision that also requires moving the campaigns to
// value-based bidding (under MaxConversions a quote would count == a booking).
// See tasks/2026-06-04-ads-tracking-review.md.
export const GOOGLE_ADS_QUOTE_LABEL = 'RRJECN6vorkcEJSayehB';

// Tiered conversion values (USD) — each stage signals a different intent level.
// Booking: confirmed appointment. Callback: gave name+phone, no booking. Lead: form/call/text.
// offlineConversionSync.ts DEFAULT_FORM_VALUE must stay in sync with BOOKING_CONVERSION_VALUE_USD.
export const BOOKING_CONVERSION_VALUE_USD = 150;
export const CALLBACK_CONVERSION_VALUE_USD = 75;
export const FORM_CONVERSION_VALUE_USD = 91;  // legacy lead forms (non-quoter paths)
export const CALL_CONVERSION_VALUE_USD = 55;
export const TEXT_CONVERSION_VALUE_USD = 55;
// Quote priced (mid-funnel). ~15% quote→book rate × $150 booking ≈ $20 expected
// value. The Google action forces this value (always_use_default_value), so it's
// a fixed per-quote signal, not the (misleading) actual quoted price. Only
// matters if/when bidding moves value-based; ignored under MaxConversions.
export const QUOTE_CONVERSION_VALUE_USD = 20;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Conversion tracking helpers
export const trackPhoneClick = (source: string) => {
  event({
    action: 'click_to_call',
    category: 'conversion',
    label: source,
  });
};

export const trackTextClick = (source: string) => {
  event({
    action: 'click_to_text',
    category: 'conversion',
    label: source,
  });
};

export const trackBookingClick = (source: string) => {
  event({
    action: 'click_book_online',
    category: 'conversion',
    label: source,
  });
};

export const trackFormSubmit = (formName: string) => {
  event({
    action: 'form_submit',
    category: 'lead_generation',
    label: formName,
  });
};

export const trackFormStart = (formName: string) => {
  event({
    action: 'form_start',
    category: 'lead_generation',
    label: formName,
  });
};

// Enhanced tracking functions for conversion optimization

export const trackCTAClick = (ctaType: 'call' | 'text' | 'book', location: string) => {
  event({
    action: `cta_${ctaType}_click`,
    category: 'conversion',
    label: location,
  });
};

export const trackFormFieldFocus = (formName: string, fieldName: string) => {
  event({
    action: 'form_field_focus',
    category: 'engagement',
    label: `${formName}:${fieldName}`,
  });
};

export const trackFormAbandonment = (formName: string, lastField: string) => {
  event({
    action: 'quote_form_abandoned',
    category: 'lead_generation',
    label: `${formName}:${lastField}`,
  });
};

export const trackVehicleSelected = (make: string, model: string, source: string) => {
  event({
    action: 'vehicle_selected',
    category: 'lead_generation',
    label: `${make} ${model}`,
    value: 1,
  });

  // Also track as separate event for easier filtering
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_vehicle', {
      vehicle_make: make,
      vehicle_model: model,
      source: source,
    });
  }
};

export const trackServiceSelected = (serviceType: 'repair' | 'replacement', source: string) => {
  event({
    action: 'service_selected',
    category: 'lead_generation',
    label: serviceType,
  });

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_service', {
      service_type: serviceType,
      source: source,
    });
  }
};

export const trackLocationEntered = (zipCode: string, city?: string) => {
  event({
    action: 'location_entered',
    category: 'lead_generation',
    label: city || zipCode,
  });

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'enter_location', {
      zip_code: zipCode,
      city: city,
    });
  }
};

/**
 * Fire GA4 standard purchase event at booking confirmation.
 * Enables ROAS bidding in Google Ads — tells Smart Bidding the revenue
 * value of each booking, not just that a conversion happened.
 * transaction_id deduplicates if the component re-renders after success.
 */
export const trackPurchase = (
  transactionId: string,
  valueDollars: number,
  vehicleInfo: string,
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: valueDollars,
    currency: 'USD',
    items: [{
      item_id: 'windshield_service',
      item_name: `Windshield Service — ${vehicleInfo}`,
      price: valueDollars,
      quantity: 1,
    }],
  });
};

export const trackQuoteGenerated = (serviceType: string, vehicleInfo: string, estimatedPrice?: number) => {
  event({
    action: 'quote_generated',
    category: 'conversion',
    label: `${serviceType}:${vehicleInfo}`,
    value: estimatedPrice,
  });
};

export const trackPageScroll = (percentage: number, pageName: string) => {
  if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
    event({
      action: 'scroll_depth',
      category: 'engagement',
      label: pageName,
      value: percentage,
    });
  }
};

export const trackOutboundClick = (url: string, linkText: string) => {
  event({
    action: 'outbound_click',
    category: 'engagement',
    label: `${linkText} -> ${url}`,
  });
};

// E-commerce tracking for quote values
export const trackQuoteValue = (
  serviceType: string,
  price: number,
  vehicle: string,
  location: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'USD',
      value: price,
      service_type: serviceType,
      vehicle: vehicle,
      location: location,
    });
  }
};

// Google Ads Conversion Tracking with Transaction ID
// Transaction ID prevents duplicate conversions when the same form is submitted multiple times
export const trackGoogleAdsConversion = (
  transactionId: string,
  conversionLabel: string,
  value: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_CONVERSION_ID}/${conversionLabel}`,
      'transaction_id': transactionId,
      'value': value,
      'currency': 'USD',
    });
  }
};

// Enhanced Conversions (hashed automatically by gtag)
export const setEnhancedConversionData = (userData: { email?: string; phone?: string }) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const normalizedEmail = userData.email?.trim().toLowerCase();
  const digits = userData.phone?.replace(/\D/g, '') || '';
  let normalizedPhone: string | undefined;
  if (digits.length === 10) normalizedPhone = `+1${digits}`;
  else if (digits.length === 11 && digits.startsWith('1')) normalizedPhone = `+${digits}`;
  else if (digits.length > 11) normalizedPhone = `+${digits}`;

  const payload: Record<string, string> = {};
  if (normalizedEmail) payload.email = normalizedEmail;
  if (normalizedPhone) payload.phone_number = normalizedPhone;

  if (Object.keys(payload).length > 0) {
    window.gtag('set', 'user_data', payload);
  }
};

// Track lead form submission conversion (booking form, quote form)
export const trackLeadFormConversion = (leadId: string, userData?: { email?: string; phone?: string }, value: number = FORM_CONVERSION_VALUE_USD) => {
  if (userData) setEnhancedConversionData(userData);
  trackGoogleAdsConversion(leadId, GOOGLE_ADS_LEAD_FORM_LABEL, value);
};

// Track callback conversion — secondary action, $75. Available for future re-use.
export const trackCallbackConversion = (transactionId: string) => {
  trackGoogleAdsConversion(transactionId, GOOGLE_ADS_CALLBACK_LABEL, CALLBACK_CONVERSION_VALUE_USD);
};

// Track text/SMS click conversion
// Uses session-based transaction_id to prevent duplicate conversions from same session
export const trackTextClickConversion = (sessionId: string) => {
  trackGoogleAdsConversion(`text_${sessionId}`, GOOGLE_ADS_TEXT_LABEL, TEXT_CONVERSION_VALUE_USD);
};

// Track phone call click conversion
// Uses session-based transaction_id to prevent duplicate conversions from same session
export const trackCallClickConversion = (sessionId: string) => {
  trackGoogleAdsConversion(`call_${sessionId}`, GOOGLE_ADS_CALL_LABEL, CALL_CONVERSION_VALUE_USD);
};

// Track quote-priced (mid-funnel) conversion — REQUEST_QUOTE, observation-only.
// Session-keyed transaction_id so each session counts at most one quote, matching
// the call/text pattern (Google dedups server-side by transaction_id).
export const trackQuoteConversion = (sessionId: string) => {
  trackGoogleAdsConversion(`quote_${sessionId}`, GOOGLE_ADS_QUOTE_LABEL, QUOTE_CONVERSION_VALUE_USD);
};

// ============================================================================
// MICROSOFT ADS UET CONVERSION TRACKING
// ============================================================================

declare global {
  interface Window {
    uetq?: any[];
  }
}

/**
 * Track Microsoft Ads UET conversion event
 * @param eventAction - The action name (e.g., 'phone_click', 'text_click', 'form_submit')
 * @param eventCategory - Category for the event (default: 'conversion')
 * @param eventLabel - Optional label for additional context
 * @param eventValue - Optional revenue value
 */
export const trackMicrosoftAdsEvent = (
  eventAction: string,
  eventCategory: string = 'conversion',
  eventLabel?: string,
  eventValue?: number,
  transactionId?: string
) => {
  if (typeof window !== 'undefined' && window.uetq) {
    const eventData: Record<string, any> = {
      event_category: eventCategory,
      event_label: eventLabel,
      event_value: eventValue,
    };
    if (transactionId) {
      eventData.event_id = transactionId;
    }
    window.uetq.push('event', eventAction, eventData);
  }
};

/**
 * Track phone call click for Microsoft Ads
 * Maps to "Phone call website click" conversion goal in Microsoft Ads (ActionExpression: phone_click)
 * IMPORTANT: Action name must match the goal's ActionExpression exactly
 */
export const trackMicrosoftAdsCallClick = (source: string, transactionId?: string) => {
  // Send the same value Google gets so Microsoft value-based bidding doesn't train on $0.
  trackMicrosoftAdsEvent('phone_click', 'conversion', source, CALL_CONVERSION_VALUE_USD, transactionId);
};

/**
 * Track text/SMS click for Microsoft Ads
 * Maps to "Text_click" conversion goal in Microsoft Ads (ActionExpression: text_click)
 * IMPORTANT: Action name must match the goal's ActionExpression exactly
 */
export const trackMicrosoftAdsTextClick = (source: string, transactionId?: string) => {
  // Send the same value Google gets so Microsoft value-based bidding doesn't train on $0.
  trackMicrosoftAdsEvent('text_click', 'conversion', source, TEXT_CONVERSION_VALUE_USD, transactionId);
};

/**
 * Track lead form submission for Microsoft Ads
 * Maps to "Quick quote" conversion goal in Microsoft Ads (ActionExpression: form_submit)
 * IMPORTANT: Action name must match the goal's ActionExpression exactly
 */
export const trackMicrosoftAdsLeadForm = (formName: string, value: number = FORM_CONVERSION_VALUE_USD, transactionId?: string) => {
  // Default to the shared form value so callers passing undefined (e.g. tracking.ts)
  // still send a real value — Microsoft was training on $0 while Google got $91.
  trackMicrosoftAdsEvent('form_submit', 'conversion', formName, value, transactionId);
};

/**
 * Track quote-priced (mid-funnel) for Microsoft Ads.
 * Intended to map to a "Quote priced" Event goal (ActionExpression: quote_generated).
 *
 * NOTE: that MS goal is intentionally NOT created yet — the active MS Search
 * campaign runs MaxConversions, so a new biddable goal would distort count-based
 * bidding (a quote would count == a booking). Until the goal exists this push is
 * a harmless no-op. Create the goal only alongside the value-based bidding switch.
 * IMPORTANT: action name must match the goal's ActionExpression exactly.
 */
export const trackMicrosoftAdsQuoteGenerated = (source: string, transactionId?: string) => {
  trackMicrosoftAdsEvent('quote_generated', 'conversion', source, QUOTE_CONVERSION_VALUE_USD, transactionId);
};

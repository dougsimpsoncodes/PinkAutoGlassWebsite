// Google Analytics and Google Ads event tracking helper

export const GA_MEASUREMENT_ID = 'G-F7WMMDK4H4';

// Google Ads Conversion IDs
export const GOOGLE_ADS_CONVERSION_ID = 'AW-17667607828';
export const GOOGLE_ADS_LEAD_FORM_LABEL = '3CXNCJaG9cEbEJSayehB';
export const GOOGLE_ADS_TEXT_LABEL = 'zs3xCJyG9cEbEJSayehB';
export const GOOGLE_ADS_CALL_LABEL = 'NRHDCJmG9cEbEJSayehB';

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
  conversionLabel: string = GOOGLE_ADS_LEAD_FORM_LABEL
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_CONVERSION_ID}/${conversionLabel}`,
      'transaction_id': transactionId,
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
export const trackLeadFormConversion = (leadId: string, userData?: { email?: string; phone?: string }) => {
  if (userData) setEnhancedConversionData(userData);
  trackGoogleAdsConversion(leadId, GOOGLE_ADS_LEAD_FORM_LABEL);
};

// Track text/SMS click conversion
// Uses session-based transaction_id to prevent duplicate conversions from same session
export const trackTextClickConversion = (sessionId: string) => {
  trackGoogleAdsConversion(`text_${sessionId}`, GOOGLE_ADS_TEXT_LABEL);
};

// Track phone call click conversion
// Uses session-based transaction_id to prevent duplicate conversions from same session
export const trackCallClickConversion = (sessionId: string) => {
  trackGoogleAdsConversion(`call_${sessionId}`, GOOGLE_ADS_CALL_LABEL);
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
  eventValue?: number
) => {
  if (typeof window !== 'undefined' && window.uetq) {
    window.uetq.push('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      event_value: eventValue,
    });
  }
};

/**
 * Track phone call click for Microsoft Ads
 * Maps to "Phone call website click" conversion goal in Microsoft Ads
 * IMPORTANT: Event name must match EXACTLY what's configured in Microsoft Ads dashboard
 */
export const trackMicrosoftAdsCallClick = (source: string) => {
  trackMicrosoftAdsEvent('Phone call website click', 'conversion', source);
};

/**
 * Track text/SMS click for Microsoft Ads
 * Maps to "Text_click" conversion goal in Microsoft Ads
 * IMPORTANT: Event name must match EXACTLY what's configured in Microsoft Ads dashboard
 */
export const trackMicrosoftAdsTextClick = (source: string) => {
  trackMicrosoftAdsEvent('Text_click', 'conversion', source);
};

/**
 * Track lead form submission for Microsoft Ads
 * Maps to "Quick quote" conversion goal in Microsoft Ads
 * IMPORTANT: Event name must match EXACTLY what's configured in Microsoft Ads dashboard
 */
export const trackMicrosoftAdsLeadForm = (formName: string, value?: number) => {
  trackMicrosoftAdsEvent('Quick quote', 'conversion', formName, value);
};

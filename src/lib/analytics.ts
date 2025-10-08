// Google Analytics event tracking helper

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

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

/**
 * Schema Markup Helpers for SEO
 *
 * Generates JSON-LD structured data for Google rich results
 * https://schema.org/
 */

interface FAQItem {
  question: string;
  answer: string;
}

interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

/**
 * Organization Schema - Use on all pages
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "Pink Auto Glass",
    "image": "https://pinkautoglass.com/pink-logo-horizontal.png",
    "@id": "https://pinkautoglass.com",
    "url": "https://pinkautoglass.com",
    "telephone": "+17209187465",
    "priceRange": "$89-$500",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Denver",
      "addressRegion": "CO",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 39.7392,
      "longitude": -104.9903
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "07:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.facebook.com/PinkAutoGlassDenver",
      "https://www.instagram.com/pinkautoglassdenver"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200"
    }
  };
}

/**
 * Service Schema - Use on service pages
 */
export function generateServiceSchema(params: {
  serviceName: string;
  description: string;
  price?: number;
  priceRange?: string;
  serviceType: string;
  areaServed?: string[];
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": params.serviceType,
    "name": params.serviceName,
    "description": params.description,
    "provider": {
      "@type": "AutoRepair",
      "name": "Pink Auto Glass",
      "telephone": "+17209187465",
      "url": "https://pinkautoglass.com"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://pinkautoglass.com/book",
      "servicePhone": "+17209187465",
      "name": "Mobile and In-Shop Service"
    }
  };

  if (params.price) {
    schema.offers = {
      "@type": "Offer",
      "price": params.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://pinkautoglass.com/book"
    };
  } else if (params.priceRange) {
    schema.offers = {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": params.priceRange.split('-')[0],
      "highPrice": params.priceRange.split('-')[1],
      "availability": "https://schema.org/InStock"
    };
  }

  if (params.areaServed && params.areaServed.length > 0) {
    schema.areaServed = params.areaServed.map(city => ({
      "@type": "City",
      "name": city
    }));
  }

  return schema;
}

/**
 * LocalBusiness Schema - Use on location pages
 */
export function generateLocalBusinessSchema(params: {
  city: string;
  state: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `Pink Auto Glass - ${params.city}`,
    "image": "https://pinkautoglass.com/pink-logo-horizontal.png",
    "url": `https://pinkautoglass.com/locations/${params.city.toLowerCase().replace(/\s+/g, '-')}-${params.state.toLowerCase()}`,
    "telephone": "+17209187465",
    "priceRange": "$89-$500",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": params.city,
      "addressRegion": params.state,
      "postalCode": params.zipCode,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": params.latitude,
      "longitude": params.longitude
    },
    "areaServed": {
      "@type": "City",
      "name": params.city
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "07:00",
      "closes": "19:00"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Auto Glass Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Windshield Repair",
            "description": `Professional windshield chip and crack repair in ${params.city}`
          },
          "price": "89",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Windshield Replacement",
            "description": `Full windshield replacement with OEM quality glass in ${params.city}`
          },
          "price": "299",
          "priceCurrency": "USD"
        }
      ]
    }
  };
}

/**
 * FAQPage Schema - Use on pages with FAQ sections
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Product Schema - Use on vehicle-specific pages (windshield as product)
 */
export function generateProductSchema(params: {
  vehicleMake: string;
  vehicleModel: string;
  price: number;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${params.vehicleMake} ${params.vehicleModel} Windshield Replacement`,
    "description": params.description,
    "brand": {
      "@type": "Brand",
      "name": params.vehicleMake
    },
    "offers": {
      "@type": "Offer",
      "price": params.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Pink Auto Glass"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200"
    }
  };
}

/**
 * Article Schema - Use on blog posts
 */
export function getArticleSchema(params: {
  headline: string;
  description: string;
  datePublished: string;
  author: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": params.headline,
    "description": params.description,
    "datePublished": params.datePublished,
    "dateModified": params.dateModified || params.datePublished,
    "author": {
      "@type": "Person",
      "name": params.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pink Auto Glass",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pinkautoglass.com/pink-logo-horizontal.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://pinkautoglass.com"
    }
  };
}

/**
 * BreadcrumbList Schema - Use on all deep pages
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}

// Alias for consistency
export const getBreadcrumbSchema = generateBreadcrumbSchema;

/**
 * Review Schema - Use for customer testimonials
 */
export function generateReviewSchema(review: Review) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "datePublished": review.date,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.text,
    "itemReviewed": {
      "@type": "LocalBusiness",
      "name": "Pink Auto Glass"
    }
  };
}

/**
 * AggregateRating Schema - Use for overall ratings
 */
export function generateAggregateRatingSchema(params: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": params.ratingValue,
    "reviewCount": params.reviewCount,
    "bestRating": params.bestRating || 5
  };
}

/**
 * HowTo Schema - Use for process/instruction pages
 */
export function generateHowToSchema(params: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": params.name,
    "description": params.description,
    "totalTime": params.totalTime,
    "step": params.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "image": step.image
    }))
  };
}

/**
 * Helper to combine multiple schemas into one script tag
 */
export function combineSchemas(...schemas: any[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas
  };
}

/**
 * Helper to render schema as JSON-LD script tag
 * Note: Use this directly in your component JSX instead
 */
export function getSchemaJSON(schema: any): string {
  return JSON.stringify(schema);
}

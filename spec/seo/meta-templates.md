# Pink Auto Glass Meta Tag Template System

## Overview
This document provides complete meta tag templates for scaling across 7,500+ pages with consistent SEO optimization and brand messaging.

## Template Variables

### Core Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `{city}` | City name, title case | Denver |
| `{city_slug}` | City URL slug | denver-co |
| `{state}` | State abbreviation | CO |
| `{state_full}` | Full state name | Colorado |
| `{zip}` | 5-digit ZIP code | 80202 |
| `{make}` | Vehicle manufacturer | Honda |
| `{model}` | Vehicle model | Civic |
| `{year}` | Vehicle year | 2024 |
| `{year_range}` | Year range | 2018-2024 |
| `{service}` | Service name | Windshield Replacement |
| `{service_slug}` | Service URL slug | windshield-replacement |
| `{area_served}` | Service area description | Denver Metro Area |
| `{price_from}` | Starting price | $89 |

---

## Page Templates

### HOME Page
```html
<title>Mobile Windshield Repair & Replacement Denver | Pink Auto Glass</title>
<meta name="description" content="Next-day mobile windshield service in Denver. Professional repair & replacement with lifetime warranty. We come to you! Call (303) 555-PINK for same-day quotes.">
<meta property="og:title" content="Pink Auto Glass - Mobile Windshield Service Denver">
<meta property="og:description" content="Denver's trusted mobile auto glass service. Next-day appointments, lifetime warranty, insurance approved. We come to you!">
<meta property="og:image" content="https://pinkautoglass.com/public/og/og-default.png">
<meta property="og:type" content="website">
<meta property="og:url" content="https://pinkautoglass.com">
<meta property="og:site_name" content="Pink Auto Glass">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Mobile Windshield Service Denver | Pink Auto Glass">
<meta name="twitter:description" content="Next-day mobile windshield repair & replacement. We come to you! Lifetime warranty.">
<meta name="twitter:image" content="https://pinkautoglass.com/public/og/og-default.png">
<link rel="canonical" href="https://pinkautoglass.com">
```

### SERVICE Page Template
```html
<title>{service} in Denver | Mobile Service | Pink Auto Glass</title>
<meta name="description" content="Professional {service} service in Denver. Mobile service available - we come to you! Starting at {price_from}. Lifetime warranty. Call (303) 555-PINK.">
<meta property="og:title" content="{service} Denver | Pink Auto Glass">
<meta property="og:description" content="Expert {service} with mobile service throughout Denver Metro. Next-day appointments available. Insurance approved.">
<meta property="og:image" content="https://pinkautoglass.com/public/og/services/{service_slug}.png">
<meta property="og:type" content="service">
<meta property="og:url" content="https://pinkautoglass.com/services/{service_slug}">
<link rel="canonical" href="https://pinkautoglass.com/services/{service_slug}">
```

#### Service Examples:
- **Windshield Replacement**: 
  - Title: "Windshield Replacement in Denver | Mobile Service | Pink Auto Glass"
  - Description: "Professional windshield replacement service in Denver. Mobile service available - we come to you! Starting at $299. Lifetime warranty. Call (303) 555-PINK."

- **Rock Chip Repair**:
  - Title: "Rock Chip Repair in Denver | Mobile Service | Pink Auto Glass"
  - Description: "Professional rock chip repair service in Denver. Mobile service available - we come to you! Starting at $89. Lifetime warranty. Call (303) 555-PINK."

- **ADAS Calibration**:
  - Title: "ADAS Calibration in Denver | Mobile Service | Pink Auto Glass"
  - Description: "Professional ADAS calibration service in Denver. Mobile service available - we come to you! Starting at $249. Lifetime warranty. Call (303) 555-PINK."

### LOCATION Page Template
```html
<title>Mobile Windshield Service in {city}, {state} | Pink Auto Glass</title>
<meta name="description" content="Mobile windshield repair & replacement in {city}, {state}. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK.">
<meta property="og:title" content="Auto Glass Service {city}, {state} | Pink Auto Glass">
<meta property="og:description" content="Trusted mobile windshield service in {city}. Professional technicians, insurance approved, lifetime warranty.">
<meta property="og:image" content="https://pinkautoglass.com/public/og/locations/{city_slug}.png">
<meta property="og:type" content="local.business">
<meta property="og:url" content="https://pinkautoglass.com/locations/{city_slug}">
<meta name="geo.region" content="US-{state}">
<meta name="geo.placename" content="{city}">
<link rel="canonical" href="https://pinkautoglass.com/locations/{city_slug}">
```

#### Location Examples (Top 10 Cities):

1. **Denver, CO**:
   - Title: "Mobile Windshield Service in Denver, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Denver, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

2. **Aurora, CO**:
   - Title: "Mobile Windshield Service in Aurora, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Aurora, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

3. **Lakewood, CO**:
   - Title: "Mobile Windshield Service in Lakewood, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Lakewood, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

4. **Westminster, CO**:
   - Title: "Mobile Windshield Service in Westminster, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Westminster, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

5. **Littleton, CO**:
   - Title: "Mobile Windshield Service in Littleton, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Littleton, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

6. **Arvada, CO**:
   - Title: "Mobile Windshield Service in Arvada, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Arvada, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

7. **Centennial, CO**:
   - Title: "Mobile Windshield Service in Centennial, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Centennial, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

8. **Boulder, CO**:
   - Title: "Mobile Windshield Service in Boulder, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Boulder, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

9. **Highlands Ranch, CO**:
   - Title: "Mobile Windshield Service in Highlands Ranch, CO | Pink Auto Glass"
   - Description: "Mobile windshield repair & replacement in Highlands Ranch, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

10. **Parker, CO**:
    - Title: "Mobile Windshield Service in Parker, CO | Pink Auto Glass"
    - Description: "Mobile windshield repair & replacement in Parker, CO. We come to your home or office! Next-day service, lifetime warranty. Call (303) 555-PINK."

### VEHICLE Page Template
```html
<title>{make} {model} Windshield Replacement | Denver | Pink Auto Glass</title>
<meta name="description" content="{year_range} {make} {model} windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK.">
<meta property="og:title" content="{make} {model} Auto Glass Service | Pink Auto Glass">
<meta property="og:description" content="Expert windshield service for {make} {model}. Mobile service throughout Denver Metro. Insurance approved.">
<meta property="og:image" content="https://pinkautoglass.com/public/og/vehicles/{make}-{model}.png">
<meta property="og:type" content="product">
<meta property="og:url" content="https://pinkautoglass.com/vehicles/{make}/{model}">
<link rel="canonical" href="https://pinkautoglass.com/vehicles/{make}/{model}">
```

#### Vehicle Examples (Top 10 Models):

1. **Honda Civic**:
   - Title: "Honda Civic Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Honda Civic windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

2. **Toyota Camry**:
   - Title: "Toyota Camry Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Toyota Camry windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

3. **Ford F-150**:
   - Title: "Ford F-150 Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Ford F-150 windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

4. **Chevrolet Silverado**:
   - Title: "Chevrolet Silverado Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Chevrolet Silverado windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

5. **Toyota RAV4**:
   - Title: "Toyota RAV4 Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Toyota RAV4 windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

6. **Honda CR-V**:
   - Title: "Honda CR-V Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Honda CR-V windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

7. **Nissan Altima**:
   - Title: "Nissan Altima Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Nissan Altima windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

8. **Jeep Grand Cherokee**:
   - Title: "Jeep Grand Cherokee Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Jeep Grand Cherokee windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

9. **Subaru Outback**:
   - Title: "Subaru Outback Windshield Replacement | Denver | Pink Auto Glass"
   - Description: "2018-2024 Subaru Outback windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

10. **Tesla Model 3**:
    - Title: "Tesla Model 3 Windshield Replacement | Denver | Pink Auto Glass"
    - Description: "2018-2024 Tesla Model 3 windshield repair & replacement in Denver. ADAS calibration available. Mobile service, lifetime warranty. Call (303) 555-PINK."

### Combined Page Templates

#### SERVICE + LOCATION
```html
<title>{service} in {city}, {state} | Mobile Service | Pink Auto Glass</title>
<meta name="description" content="{service} service in {city}, {state}. We come to you! Next-day appointments, lifetime warranty. Starting at {price_from}. Call (303) 555-PINK.">
<link rel="canonical" href="https://pinkautoglass.com/services/{service_slug}/{city_slug}">
```

#### VEHICLE + LOCATION
```html
<title>{make} {model} Windshield Service in {city} | Pink Auto Glass</title>
<meta name="description" content="{make} {model} windshield repair & replacement in {city}, {state}. Mobile service, ADAS calibration available. Call (303) 555-PINK.">
<link rel="canonical" href="https://pinkautoglass.com/vehicles/{make}/{model}/{city_slug}">
```

#### SERVICE + VEHICLE + LOCATION
```html
<title>{make} {model} {service} in {city} | Pink Auto Glass</title>
<meta name="description" content="Professional {service} for {make} {model} in {city}, {state}. Mobile service available. Insurance approved. Call (303) 555-PINK.">
<link rel="canonical" href="https://pinkautoglass.com/services/{service_slug}/{make}/{model}/{city_slug}">
```

---

## Open Graph Image Strategy

### Default OG Image
- Path: `/public/og/og-default.png`
- Size: 1200x630px
- Content: Pink Auto Glass logo on navy background with tagline "Next-day Mobile Windshield Service in Denver"

### Dynamic OG Images
- **Services**: `/public/og/services/{service_slug}.png`
- **Locations**: `/public/og/locations/{city_slug}.png`
- **Vehicles**: `/public/og/vehicles/{make}-{model}.png`

### OG Image Fallback Chain
1. Try specific page OG image
2. Fall back to category OG image
3. Fall back to default OG image

---

## Character Length Guidelines

### Title Tags
- **Optimal**: 50-60 characters
- **Maximum**: 70 characters
- **Pattern**: `{Primary Keyword} | {Location} | Pink Auto Glass`

### Meta Descriptions
- **Optimal**: 150-160 characters
- **Maximum**: 165 characters
- **Include**: Service, location, USP, CTA, phone number

### OG Titles
- **Optimal**: 40-60 characters
- **Maximum**: 88 characters

### OG Descriptions
- **Optimal**: 100-120 characters
- **Maximum**: 200 characters

---

## Implementation Code

### Next.js generateMetadata Function
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, service, make, model } = params;
  
  // Template selection logic
  let template = templates.HOME;
  
  if (service && city) {
    template = templates.SERVICE_LOCATION;
  } else if (make && model) {
    template = templates.VEHICLE;
  } else if (city) {
    template = templates.LOCATION;
  } else if (service) {
    template = templates.SERVICE;
  }
  
  // Variable replacement
  const metadata = replaceVariables(template, {
    city: cities[city]?.name || '',
    city_slug: city || '',
    state: cities[city]?.state || 'CO',
    service: services[service]?.name || '',
    service_slug: service || '',
    make: vehicles[make]?.name || '',
    model: vehicles[make]?.[model]?.name || '',
    price_from: services[service]?.price || '$89',
    year_range: '2018-2024'
  });
  
  return metadata;
}
```

### Variable Replacement Function
```typescript
function replaceVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return variables[key] || match;
  });
}
```

---

## Quality Assurance Checklist

### For Every Page
- [ ] Title tag length within 50-70 characters
- [ ] Meta description length within 150-165 characters
- [ ] Canonical URL is absolute and lowercase
- [ ] OG image exists and is 1200x630px
- [ ] All variables properly replaced (no `{variable}` in output)
- [ ] Phone number is consistent: (303) 555-PINK
- [ ] Brand name is consistent: Pink Auto Glass

### SEO Validation
- [ ] Primary keyword appears in title
- [ ] Location appears in title and description for local pages
- [ ] USPs mentioned: mobile service, lifetime warranty, next-day
- [ ] Call-to-action included in description
- [ ] No duplicate titles or descriptions across pages

### Technical Validation
- [ ] HTML entities properly encoded
- [ ] UTF-8 character encoding specified
- [ ] No broken variable references
- [ ] Trailing slashes removed from canonical URLs
- [ ] HTTPS protocol used in all absolute URLs

---

## Monitoring & Maintenance

### Monthly Audits
1. Check for missing meta tags using Screaming Frog
2. Validate character lengths across all pages
3. Ensure OG images are loading correctly
4. Check for duplicate titles/descriptions
5. Verify canonical tags are self-referencing

### Performance Tracking
- Monitor CTR changes in Google Search Console
- Track social sharing metrics for OG optimization
- A/B test different description formats
- Analyze which templates drive highest engagement

### Update Triggers
- New service offerings
- New location expansion
- Vehicle model year updates
- Seasonal promotions
- Algorithm updates affecting meta tag best practices

---

## Notes

- All templates use the Pink Auto Glass phone number: (303) 555-PINK
- Insurance approval messaging included where relevant
- Mobile service emphasized as primary differentiator
- Lifetime warranty mentioned in descriptions
- Local focus maintained with city/state mentions
- ADAS calibration highlighted for 2018+ vehicles
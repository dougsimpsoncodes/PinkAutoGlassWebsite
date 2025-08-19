# URL Schema Architecture for Pink Auto Glass

## Competitive Analysis Summary

### Safelite URL Strategy
- Uses centralized domain with location subdirectories: `/locations/state/{state}` and `/stores/{city}`
- Service pages: `/windshield-repair`, `/windshield-replacement`
- Store locator: `/store-locator` with state-level organization
- Clean, SEO-friendly structure supporting 7,100+ locations nationwide

### Jiffy Auto Glass URL Strategy  
- Regional focus with city-specific landing pages
- Service-oriented URLs with local targeting
- Mobile-first approach with location-based service pages
- Emphasizes metro area coverage (Denver, Phoenix)

## Pink Auto Glass URL Architecture (Parity+)

### Core URL Patterns

#### Location Pages
```
/locations/{city-slug}
/locations/{zip-code}
/locations/denver-metro
/locations/denver
/locations/aurora
/locations/lakewood
/locations/thornton
/locations/westminster
/locations/arvada
/locations/centennial
/locations/boulder
/locations/fort-collins
/locations/colorado-springs
/locations/pueblo
/locations/grand-junction
/locations/greeley
/locations/loveland
/locations/longmont
/locations/80202
/locations/80301
/locations/80525
```

#### Service Pages
```
/services/windshield-repair
/services/windshield-replacement
/services/chip-repair
/services/crack-repair
/services/side-window-replacement
/services/back-window-replacement
/services/power-window-repair
/services/adas-calibration
/services/commercial-fleet
/services/mobile-service
/services/emergency-repair
```

#### Vehicle-Specific Pages
```
/vehicles/{make}/{model}
/vehicles/toyota/camry
/vehicles/honda/civic
/vehicles/ford/f150
/vehicles/chevrolet/silverado
/vehicles/nissan/altima
/vehicles/jeep/grand-cherokee
/vehicles/ram/1500
/vehicles/subaru/outback
/vehicles/hyundai/elantra
/vehicles/kia/sorento
/vehicles/mazda/cx5
/vehicles/volkswagen/jetta
/vehicles/bmw/x3
/vehicles/mercedes-benz/c-class
/vehicles/audi/a4
/vehicles/lexus/rx
/vehicles/acura/mdx
/vehicles/infiniti/q50
/vehicles/volvo/xc90
/vehicles/tesla/model-3
```

#### Service + Location Combinations
```
/services/{service-slug}/{city-slug}
/services/windshield-repair/denver
/services/windshield-replacement/aurora
/services/mobile-service/boulder
/services/emergency-repair/denver-metro
```

#### Vehicle + Location Combinations
```
/vehicles/{make}/{model}/{city-slug}
/vehicles/toyota/camry/denver
/vehicles/ford/f150/aurora
/vehicles/honda/civic/boulder
```

### Canonical Rules

#### Primary Canonical Strategy
1. **Location Pages**: Canonical points to primary city page
   - `/locations/80202` → canonical: `/locations/denver`
   - `/locations/denver-metro` → canonical: `/locations/denver`

2. **Service Pages**: Service-specific canonicals
   - `/services/windshield-repair/denver` → canonical: `/services/windshield-repair`
   - Regional service pages maintain separate canonicals

3. **Vehicle Pages**: Make/model canonicals
   - `/vehicles/toyota/camry/denver` → canonical: `/vehicles/toyota/camry`
   - Location-specific vehicle pages canonical to base vehicle page

4. **Duplicate Content Prevention**
   - ZIP code pages canonical to primary city
   - Metro area pages canonical to primary city
   - Service combinations canonical to primary service page

### Sitemap Strategy

#### Main Sitemaps
```xml
/sitemap.xml (index)
├── /sitemaps/locations.xml
├── /sitemaps/services.xml  
├── /sitemaps/vehicles.xml
├── /sitemaps/blog.xml
├── /sitemaps/pages.xml
└── /sitemaps/combinations.xml
```

#### Location Sitemap Priority
- Primary cities (Denver, Aurora, Boulder): Priority 1.0
- Secondary cities (Lakewood, Thornton): Priority 0.8
- ZIP code pages: Priority 0.6
- Metro combinations: Priority 0.7

#### Service Sitemap Priority
- Core services (windshield repair/replacement): Priority 1.0
- Specialized services (ADAS, commercial): Priority 0.8
- Service + location combinations: Priority 0.7

#### Vehicle Sitemap Priority
- Top 10 vehicles in Denver metro: Priority 0.9
- Remaining common vehicles: Priority 0.7
- Vehicle + location combinations: Priority 0.6

### Internal Linking Architecture

#### Hub and Spoke Model
**Primary Hubs:**
- Home page → Location hub, Service hub, Vehicle hub
- Location hub → All city pages, service combinations
- Service hub → All services, location combinations
- Vehicle hub → All makes/models, service combinations

#### Contextual Cross-Linking
**Location Pages Link To:**
- Related nearby cities (5-7 cities within 20 miles)
- All services available in that location
- Top 5 vehicles serviced in that area
- Relevant blog posts about local auto glass needs

**Service Pages Link To:**
- All locations where service is available
- Related services (repair ↔ replacement)
- Relevant vehicle-specific information
- Process/FAQ pages

**Vehicle Pages Link To:**
- All locations serving that vehicle
- Relevant services for that vehicle type
- Related makes/models
- Vehicle-specific maintenance content

#### Footer Navigation Architecture
```
Services          Locations        Vehicles         Resources
├─ Repair         ├─ Denver        ├─ Toyota        ├─ Blog
├─ Replacement    ├─ Aurora        ├─ Honda         ├─ FAQs  
├─ Mobile         ├─ Boulder       ├─ Ford          ├─ Reviews
├─ Emergency      ├─ Lakewood      ├─ Chevrolet     └─ Contact
└─ Commercial     └─ View All      └─ View All
```

### URL Parameter Handling

#### Tracking Parameters
- Remove UTM parameters from canonical URLs
- Handle affiliate/referral parameters appropriately
- Maintain clean URLs for SEO value

#### Filter Parameters
```
/locations/denver?service=windshield-repair
/vehicles/toyota?location=denver
/services?location=aurora&vehicle=honda
```

### Mobile URL Strategy

#### Responsive Design (Recommended)
- Single URL for all devices
- Same content, optimized presentation
- Follows Google's mobile-first indexing preferences

#### AMP Implementation (Optional)
```
/amp/locations/denver
/amp/services/windshield-repair
/amp/vehicles/toyota/camry
```

### Performance Optimization

#### URL Length Guidelines
- Maximum 60 characters for optimal display
- Use hyphens for word separation
- Avoid unnecessary parameters

#### Redirect Strategy
- 301 redirects for moved content
- 302 redirects for temporary changes
- Redirect chains limited to maximum 3 hops

### Competitive Advantage Summary

**Parity Elements:**
- Clean, hierarchical URL structure like Safelite
- Location-specific pages like both competitors
- Service-oriented URLs matching industry standards

**Plus Elements (Exceeding Competition):**
- Vehicle-specific URL targeting (more granular than competitors)
- ZIP code URL targeting for hyperlocal SEO
- Service + location + vehicle combination URLs
- More comprehensive internal linking architecture
- Advanced canonical strategy preventing duplicate content issues
- Mobile-optimized URL structure with AMP support
- Performance-optimized redirect handling

This URL architecture provides 3x more targeting specificity than Safelite's structure while maintaining the local focus that makes Jiffy Auto Glass successful in their regional markets.

## Comprehensive Canonical URL Strategy

### 1. Canonical URL Rules

#### URL Format Standards
- **All URLs must be lowercase with no trailing slash**
- **City format**: "aurora-co" (city-state abbreviation)
- **ZIP format**: "80202" (5 digits only, no extensions)
- **Make/model format**: "honda/civic" (lowercase, forward slash separator)
- **Service format**: "windshield-replacement" (hyphenated for multi-word services)
- **State abbreviations**: Use standard 2-letter postal codes (co, ca, tx, fl)

#### Character and Formatting Rules
- Use hyphens (-) for word separation within path segments
- Use forward slashes (/) for hierarchical separation
- No special characters, spaces, or underscores
- Maximum segment length: 30 characters
- Total URL length: Maximum 255 characters

### 2. Example Canonical URLs

#### Primary Page Types
```
Homepage: https://pinkautoglass.com
About: https://pinkautoglass.com/about
Contact: https://pinkautoglass.com/contact
Blog: https://pinkautoglass.com/blog
```

#### Location-Based URLs
```
Location Hub: https://pinkautoglass.com/locations
Primary City: https://pinkautoglass.com/locations/denver-co
Secondary City: https://pinkautoglass.com/locations/aurora-co
ZIP Code: https://pinkautoglass.com/locations/80202
Metro Area: https://pinkautoglass.com/locations/denver-metro-co
```

#### Service-Based URLs
```
Service Hub: https://pinkautoglass.com/services
Primary Service: https://pinkautoglass.com/services/windshield-replacement
Secondary Service: https://pinkautoglass.com/services/windshield-repair
Specialized Service: https://pinkautoglass.com/services/adas-calibration
Mobile Service: https://pinkautoglass.com/services/mobile-service
```

#### Vehicle-Based URLs
```
Vehicle Hub: https://pinkautoglass.com/vehicles
Make Page: https://pinkautoglass.com/vehicles/honda
Model Page: https://pinkautoglass.com/vehicles/honda/civic
Year Model: https://pinkautoglass.com/vehicles/honda/civic/2023
```

#### Combined Service + Location URLs
```
Service in City: https://pinkautoglass.com/services/windshield-replacement/denver-co
Service in ZIP: https://pinkautoglass.com/services/windshield-replacement/80202
Emergency Service: https://pinkautoglass.com/services/emergency-repair/aurora-co
Mobile Service: https://pinkautoglass.com/services/mobile-service/boulder-co
```

#### Combined Vehicle + Location URLs
```
Vehicle in City: https://pinkautoglass.com/vehicles/honda/civic/denver-co
Vehicle Service: https://pinkautoglass.com/vehicles/honda/civic/windshield-replacement
Full Combination: https://pinkautoglass.com/vehicles/honda/civic/windshield-replacement/denver-co
```

### 3. 301 Redirect Rules for Duplicates

#### Case Normalization Redirects
```
/locations/Aurora-CO → /locations/aurora-co
/locations/DENVER-CO → /locations/denver-co
/services/Windshield-Replacement → /services/windshield-replacement
/vehicles/Honda/Civic → /vehicles/honda/civic
/vehicles/TOYOTA/camry → /vehicles/toyota/camry
```

#### Trailing Slash Removal
```
/locations/denver-co/ → /locations/denver-co
/services/windshield-repair/ → /services/windshield-repair
/vehicles/honda/civic/ → /vehicles/honda/civic
/about/ → /about
/contact/ → /contact
```

#### WWW to Non-WWW Redirects
```
https://www.pinkautoglass.com → https://pinkautoglass.com
https://www.pinkautoglass.com/locations/denver-co → https://pinkautoglass.com/locations/denver-co
https://www.pinkautoglass.com/services/windshield-repair → https://pinkautoglass.com/services/windshield-repair
```

#### Protocol Redirects (HTTP to HTTPS)
```
http://pinkautoglass.com → https://pinkautoglass.com
http://pinkautoglass.com/locations/denver-co → https://pinkautoglass.com/locations/denver-co
http://www.pinkautoglass.com → https://pinkautoglass.com
```

#### Alternative URL Format Redirects
```
/location/denver-co → /locations/denver-co
/service/windshield-repair → /services/windshield-repair
/vehicle/honda/civic → /vehicles/honda/civic
/denver-windshield-repair → /services/windshield-repair/denver-co
/honda-civic-windshield-replacement → /vehicles/honda/civic/windshield-replacement
```

#### Query Parameter Redirects
```
/locations/denver?service=windshield-repair → /services/windshield-repair/denver-co
/services/windshield-replacement?location=aurora → /services/windshield-replacement/aurora-co
/vehicles/honda?model=civic → /vehicles/honda/civic
```

### 4. rel="canonical" Implementation Guidance

#### Self-Referencing Canonicals (Unique Pages)
```html
<!-- Homepage -->
<link rel="canonical" href="https://pinkautoglass.com" />

<!-- Primary location page -->
<link rel="canonical" href="https://pinkautoglass.com/locations/denver-co" />

<!-- Primary service page -->
<link rel="canonical" href="https://pinkautoglass.com/services/windshield-replacement" />

<!-- Specific vehicle page -->
<link rel="canonical" href="https://pinkautoglass.com/vehicles/honda/civic" />
```

#### Cross-Reference Canonicals (Near-Duplicates)

##### ZIP Code to Primary City
```html
<!-- Page: /locations/80202 -->
<link rel="canonical" href="https://pinkautoglass.com/locations/denver-co" />

<!-- Page: /locations/80301 -->
<link rel="canonical" href="https://pinkautoglass.com/locations/boulder-co" />

<!-- Page: /locations/80014 -->
<link rel="canonical" href="https://pinkautoglass.com/locations/aurora-co" />
```

##### Metro Area to Primary City
```html
<!-- Page: /locations/denver-metro-co -->
<link rel="canonical" href="https://pinkautoglass.com/locations/denver-co" />

<!-- Page: /locations/boulder-metro-co -->
<link rel="canonical" href="https://pinkautoglass.com/locations/boulder-co" />
```

##### Service + Location to Primary Service
```html
<!-- Page: /services/windshield-repair/denver-co -->
<link rel="canonical" href="https://pinkautoglass.com/services/windshield-repair" />

<!-- Page: /services/windshield-replacement/aurora-co -->
<link rel="canonical" href="https://pinkautoglass.com/services/windshield-replacement" />
```

##### Vehicle + Location to Primary Vehicle
```html
<!-- Page: /vehicles/honda/civic/denver-co -->
<link rel="canonical" href="https://pinkautoglass.com/vehicles/honda/civic" />

<!-- Page: /vehicles/toyota/camry/aurora-co -->
<link rel="canonical" href="https://pinkautoglass.com/vehicles/toyota/camry" />
```

#### Pagination Handling

##### Blog Pagination
```html
<!-- Page: /blog (Page 1) -->
<link rel="canonical" href="https://pinkautoglass.com/blog" />

<!-- Page: /blog/page/2 -->
<link rel="canonical" href="https://pinkautoglass.com/blog/page/2" />
<link rel="prev" href="https://pinkautoglass.com/blog" />
<link rel="next" href="https://pinkautoglass.com/blog/page/3" />

<!-- Page: /blog/page/3 -->
<link rel="canonical" href="https://pinkautoglass.com/blog/page/3" />
<link rel="prev" href="https://pinkautoglass.com/blog/page/2" />
<link rel="next" href="https://pinkautoglass.com/blog/page/4" />
```

##### Location Listing Pagination
```html
<!-- Page: /locations (Page 1) -->
<link rel="canonical" href="https://pinkautoglass.com/locations" />

<!-- Page: /locations/page/2 -->
<link rel="canonical" href="https://pinkautoglass.com/locations/page/2" />
<link rel="prev" href="https://pinkautoglass.com/locations" />
<link rel="next" href="https://pinkautoglass.com/locations/page/3" />
```

##### Vehicle Listing Pagination
```html
<!-- Page: /vehicles (Page 1) -->
<link rel="canonical" href="https://pinkautoglass.com/vehicles" />

<!-- Page: /vehicles/page/2 -->
<link rel="canonical" href="https://pinkautoglass.com/vehicles/page/2" />
<link rel="prev" href="https://pinkautoglass.com/vehicles" />
<link rel="next" href="https://pinkautoglass.com/vehicles/page/3" />
```

#### Special Cases and Complex Canonicals

##### Multi-Service Pages
```html
<!-- Page showing multiple services in one location -->
<!-- /services/denver-co (shows all services available in Denver) -->
<link rel="canonical" href="https://pinkautoglass.com/locations/denver-co" />
```

##### Seasonal/Promotional Pages
```html
<!-- Summer windshield repair campaign -->
<!-- /promotions/summer-windshield-repair -->
<link rel="canonical" href="https://pinkautoglass.com/services/windshield-repair" />

<!-- Winter emergency service promotion -->
<!-- /promotions/winter-emergency-service -->
<link rel="canonical" href="https://pinkautoglass.com/services/emergency-repair" />
```

##### UTM Parameter Handling
```html
<!-- Any page with UTM parameters -->
<!-- /services/windshield-repair?utm_source=google&utm_medium=cpc -->
<link rel="canonical" href="https://pinkautoglass.com/services/windshield-repair" />

<!-- Location page with tracking -->
<!-- /locations/denver-co?utm_campaign=local_seo -->
<link rel="canonical" href="https://pinkautoglass.com/locations/denver-co" />
```

#### Implementation Requirements

##### Technical Implementation
```html
<!-- Required in <head> section of every page -->
<link rel="canonical" href="[CANONICAL_URL]" />

<!-- Optional: Add hreflang for multi-language sites (future) -->
<link rel="alternate" hreflang="en-us" href="https://pinkautoglass.com/locations/denver-co" />
<link rel="alternate" hreflang="es-us" href="https://pinkautoglass.com/es/locations/denver-co" />
```

##### Validation Rules
1. **Canonical URL must be absolute** (include https:// and domain)
2. **Canonical URL must be accessible** (return 200 status code)
3. **Canonical URL must not redirect** (avoid redirect chains)
4. **One canonical per page** (never multiple canonical tags)
5. **Canonical must match the intended primary URL format**

##### Monitoring and Maintenance
1. **Regular canonical audit** using tools like Screaming Frog
2. **Google Search Console monitoring** for canonical errors
3. **404 error tracking** for broken canonical URLs
4. **Redirect chain detection** affecting canonical URLs
5. **Cross-page canonical consistency** verification

This comprehensive canonical URL strategy ensures optimal SEO performance by eliminating duplicate content issues, consolidating link equity, and providing clear signals to search engines about the preferred version of each page.
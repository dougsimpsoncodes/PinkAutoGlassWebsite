# Pink Auto Glass Robots.txt & Sitemap Strategy

## Robots.txt Configuration

### Production robots.txt
```txt
User-agent: *
Allow: /

# Disallow staging/development paths
Disallow: /staging
Disallow: /dev
Disallow: /test
Disallow: /admin
Disallow: /api/internal

# Disallow duplicate content paths
Disallow: /*?utm_*
Disallow: /*?ref=*
Disallow: /*?share=*

# Allow important API endpoints for crawling
Allow: /api/vehicles/makes
Allow: /api/vehicles/models
Allow: /api/locations

# Sitemap location
Sitemap: https://pinkautoglass.com/sitemap.xml

# Crawl-delay for specific bots (optional)
User-agent: Bingbot
Crawl-delay: 1

# Block problematic bots (if needed)
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /
```

### Development/Staging robots.txt
```txt
User-agent: *
Disallow: /

# Completely block crawling of non-production environments
```

## Sitemap Strategy

### Sitemap Index Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://pinkautoglass.com/sitemap-main.xml</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pinkautoglass.com/sitemap-locations.xml</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pinkautoglass.com/sitemap-vehicles.xml</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pinkautoglass.com/sitemap-services.xml</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pinkautoglass.com/sitemap-content.xml</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
  </sitemap>
</sitemapindex>
```

### Sitemap Prioritization & Frequency

#### Main Pages Sitemap (sitemap-main.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pinkautoglass.com</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/book</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/services</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/vehicles</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/about</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/contact</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

#### Locations Sitemap (sitemap-locations.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Primary Cities (High Priority) -->
  <url>
    <loc>https://pinkautoglass.com/locations/denver-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations/aurora-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations/lakewood-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations/boulder-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations/littleton-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- ZIP Codes (Medium Priority) -->
  <url>
    <loc>https://pinkautoglass.com/locations/80202</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations/80014</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/locations/80215</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

#### Services Sitemap (sitemap-services.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Primary Services -->
  <url>
    <loc>https://pinkautoglass.com/services/windshield-replacement</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/services/windshield-repair</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/services/mobile-service</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/services/adas-calibration</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Service + Location Combinations (High Value) -->
  <url>
    <loc>https://pinkautoglass.com/services/windshield-replacement/denver-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/services/windshield-repair/denver-co</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

#### Vehicles Sitemap (sitemap-vehicles.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Vehicle Hub -->
  <url>
    <loc>https://pinkautoglass.com/vehicles</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Top Makes -->
  <url>
    <loc>https://pinkautoglass.com/vehicles/honda</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/vehicles/toyota</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/vehicles/ford</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Top Models -->
  <url>
    <loc>https://pinkautoglass.com/vehicles/honda/civic</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/vehicles/toyota/camry</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/vehicles/ford/f-150</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

#### Content Sitemap (sitemap-content.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blog/Content Hub -->
  <url>
    <loc>https://pinkautoglass.com/blog</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- High-Value Content Articles -->
  <url>
    <loc>https://pinkautoglass.com/blog/denver-windshield-repair-service</loc>
    <lastmod>2024-03-15T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/blog/adas-calibration-denver</loc>
    <lastmod>2024-03-10T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/blog/honda-civic-windshield-replacement</loc>
    <lastmod>2024-03-05T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Category Pages -->
  <url>
    <loc>https://pinkautoglass.com/blog/category/windshield-repair</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://pinkautoglass.com/blog/category/auto-glass-tips</loc>
    <lastmod>2024-03-20T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

## Update Cadence & Automation

### Automated Generation Schedule
- **Daily**: Main pages and new content
- **Weekly**: Location pages and service combinations
- **Monthly**: Vehicle pages and blog archives
- **On-demand**: When new services or locations are added

### Dynamic Sitemap Generation
```javascript
// Example Next.js sitemap generation
export async function generateSitemaps() {
  const locations = await getLocations();
  const services = await getServices();
  const vehicles = await getVehicles();
  
  return [
    { id: 'main' },
    { id: 'locations' },
    { id: 'services' },
    { id: 'vehicles' },
    { id: 'content' }
  ];
}

export default async function sitemap({ id }) {
  const baseUrl = 'https://pinkautoglass.com';
  
  switch (id) {
    case 'main':
      return generateMainSitemap(baseUrl);
    case 'locations':
      return generateLocationsSitemap(baseUrl);
    case 'services':
      return generateServicesSitemap(baseUrl);
    case 'vehicles':
      return generateVehiclesSitemap(baseUrl);
    case 'content':
      return generateContentSitemap(baseUrl);
  }
}
```

## Priority Guidelines

### Priority Scoring (0.0 - 1.0)
- **1.0**: Homepage only
- **0.9**: Primary service pages, booking page, top location (Denver)
- **0.8**: Main category pages, top 5 locations, service+location combinations
- **0.7**: Secondary locations, vehicle makes, important content
- **0.6**: ZIP codes, vehicle models, general blog posts
- **0.5**: Category pages, tag pages
- **0.4**: Archive pages, older content
- **0.3**: Low-priority utility pages

### Change Frequency Guidelines
- **Daily**: News, blog posts (first week after publication)
- **Weekly**: Homepage, main service pages, top locations
- **Monthly**: Vehicle pages, service descriptions, established content
- **Yearly**: About page, contact info, legal pages

## Implementation Checklist

### Technical Setup
- [ ] Configure robots.txt for production vs staging environments
- [ ] Set up automated sitemap generation
- [ ] Implement sitemap compression (gzip)
- [ ] Configure sitemap caching headers
- [ ] Set up sitemap monitoring and alerts

### SEO Validation
- [ ] Submit sitemaps to Google Search Console
- [ ] Submit sitemaps to Bing Webmaster Tools
- [ ] Validate XML syntax and structure
- [ ] Check for broken URLs in sitemaps
- [ ] Monitor crawl stats and indexing rates

### Maintenance Tasks
- [ ] Weekly sitemap validation
- [ ] Monthly priority and frequency review
- [ ] Quarterly comprehensive audit
- [ ] Update lastmod dates when content changes
- [ ] Remove outdated or deleted pages

## Monitoring & Analytics

### Key Metrics
- Sitemap submission status in Search Console
- Pages indexed vs pages submitted
- Crawl errors and warnings
- Average time to index new pages
- Sitemap download frequency by search engines

### Automated Alerts
- Sitemap generation failures
- Broken URLs in sitemaps
- Large changes in indexed page count
- XML validation errors
- Server errors for sitemap requests

This comprehensive sitemap strategy ensures all Pink Auto Glass pages are efficiently discoverable and indexed while maintaining optimal crawl budget allocation across the most valuable content.
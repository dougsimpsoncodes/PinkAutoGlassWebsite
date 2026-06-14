/**
 * Validate environment variables before build
 * Prevents deploying with placeholder/example API keys
 */
function validateEnvironmentVariables() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

  // VERCEL_ENV: 'production' | 'preview' | 'development'
  // Only enforce on true production builds (not preview/staging)
  const isVercelProduction = process.env.VERCEL_ENV === 'production';
  const isNodeProduction = process.env.NODE_ENV === 'production';

  // Skip validation during:
  // - Development (NODE_ENV !== production)
  // - Preview/staging builds (VERCEL_ENV !== production)
  // - Non-build phases
  if (!isBuild || !(isVercelProduction || isNodeProduction)) {
    return;
  }

  // If on Vercel but not production, skip (allows preview builds)
  if (process.env.VERCEL && !isVercelProduction) {
    console.log('⏭️  Skipping credential validation for Vercel preview build');
    return;
  }

  const placeholderPatterns = [
    /^pag_(public|admin|internal)_dev_\d{4}$/,  // Dev fallback keys
    /your-random-key-here/i,                      // Example placeholder
    /pag_(public|admin|internal)_your-/i,         // .env.example pattern
    /^changeme$/i,                                 // Common placeholder
    /^admin$/,                                     // Default admin username
  ];

  const errors = [];

  // Check API keys
  const apiKeys = {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    API_KEY_ADMIN: process.env.API_KEY_ADMIN,
    API_KEY_INTERNAL: process.env.API_KEY_INTERNAL,
  };

  for (const [name, value] of Object.entries(apiKeys)) {
    if (!value) {
      errors.push(`${name} is not set`);
      continue;
    }

    for (const pattern of placeholderPatterns) {
      if (pattern.test(value)) {
        errors.push(`${name} contains placeholder/example value: ${value.substring(0, 20)}...`);
        break;
      }
    }
  }

  // Check admin credentials
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || placeholderPatterns.some(p => p.test(adminUsername))) {
    errors.push('ADMIN_USERNAME is missing or contains placeholder value');
  }

  if (!adminPassword || placeholderPatterns.some(p => p.test(adminPassword))) {
    errors.push('ADMIN_PASSWORD is missing or contains placeholder value');
  }

  if (errors.length > 0) {
    console.error('\n❌ BUILD FAILED: Invalid environment variables detected\n');
    console.error('Production builds cannot use placeholder or example values:\n');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease set proper production environment variables in your hosting dashboard (Vercel, etc.)\n');
    console.error('See .env.example for required variables.\n');
    process.exit(1);
  }

  console.log('✅ Environment variable validation passed');
}

// Run validation before build
validateEnvironmentVariables();

// ============================================================================
// Franchise URL migration (2026-06-14)
// Old structure (/locations, /services, /insurance, /phoenix) → franchise
// subfolder structure (/colorado/*, /arizona/*). Every entry below has a
// VERIFIED live target page. One page is intentionally NOT migrated because its
// franchise version doesn't exist yet (it resolves to the old URL via a reverse
// redirect, so it isn't cannibalizing):
//   - /services/adas-calibration
// Build that franchise page later, then add its redirect here.
// Source of truth: data/url-restructure-redirect-map.md
// ============================================================================

// CO cities that have a live /colorado/<city> page
const CO_CITIES = [
  'arvada', 'aurora', 'black-forest', 'boulder', 'brighton', 'broomfield', 'castle-rock',
  'centennial', 'cherry-hills-village', 'colorado-springs', 'commerce-city',
  'denver', 'englewood', 'erie', 'evergreen', 'federal-heights', 'firestone',
  'fort-collins', 'fountain', 'frederick', 'golden', 'greeley',
  'greenwood-village', 'highlands-ranch', 'johnstown', 'lafayette', 'lakewood',
  'littleton', 'lone-tree', 'longmont', 'louisville', 'loveland',
  'manitou-springs', 'northglenn', 'parker', 'security-widefield', 'sheridan',
  'superior', 'thornton', 'timnath', 'wellington', 'westminster', 'wheat-ridge',
  'windsor',
];

// CO cities with a live /colorado/<city>/[neighborhood] route
const CO_NEIGHBORHOOD_CITIES = [
  'aurora', 'boulder', 'colorado-springs', 'denver', 'fort-collins', 'lakewood',
];

// AZ cities with a live /arizona/<city> page (slug strips the -az suffix)
const AZ_CITIES = [
  'ahwatukee', 'apache-junction', 'avondale', 'buckeye', 'cave-creek',
  'chandler', 'el-mirage', 'fountain-hills', 'gilbert', 'glendale', 'goodyear',
  'litchfield-park', 'maricopa', 'mesa', 'peoria', 'phoenix', 'queen-creek',
  'scottsdale', 'surprise', 'tempe',
];

// Service pages with a live /colorado/services/<slug> page (adas-calibration excluded)
const CO_SERVICES = [
  'windshield-replacement', 'windshield-repair', 'mobile-service',
  'insurance-claims', 'emergency-windshield-repair',
];

// Insurance carriers with a live /colorado/insurance/<carrier> page
const INSURANCE_CARRIERS = [
  'aaa', 'allstate', 'esurance', 'farmers', 'geico', 'liberty-mutual',
  'progressive', 'safeco', 'state-farm', 'usaa',
];

const franchiseRedirects = [
  // CO location pages: /locations/<city>-co → /colorado/<city>
  ...CO_CITIES.map((c) => ({
    source: `/locations/${c}-co`,
    destination: `/colorado/${c}`,
    permanent: true,
  })),
  // CO neighborhood pages: /locations/<city>-co/<n> → /colorado/<city>/<n>
  ...CO_NEIGHBORHOOD_CITIES.map((c) => ({
    source: `/locations/${c}-co/:neighborhood`,
    destination: `/colorado/${c}/:neighborhood`,
    permanent: true,
  })),
  // AZ location pages: /locations/<city>-az → /arizona/<city>
  ...AZ_CITIES.map((c) => ({
    source: `/locations/${c}-az`,
    destination: `/arizona/${c}`,
    permanent: true,
  })),
  // Service pages: /services/<slug> → /colorado/services/<slug>
  ...CO_SERVICES.map((s) => ({
    source: `/services/${s}`,
    destination: `/colorado/services/${s}`,
    permanent: true,
  })),
  { source: '/services', destination: '/colorado/services', permanent: true },
  // Insurance pages: /insurance/<carrier> → /colorado/insurance/<carrier>
  ...INSURANCE_CARRIERS.map((c) => ({
    source: `/insurance/${c}`,
    destination: `/colorado/insurance/${c}`,
    permanent: true,
  })),
  // High-intent content pages → /colorado equivalents
  { source: '/pricing', destination: '/colorado/pricing', permanent: true },
  { source: '/does-insurance-cover-windshield-replacement', destination: '/colorado/insurance-coverage-guide', permanent: true },
  { source: '/how-long-does-windshield-replacement-take', destination: '/colorado/how-long-windshield-replacement', permanent: true },
  { source: '/adas-calibration-cost', destination: '/colorado/adas-calibration-cost', permanent: true },
  // State hub + location index
  { source: '/phoenix', destination: '/arizona', permanent: true },
  { source: '/locations', destination: '/colorado', permanent: true },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization configuration
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  async headers() {
    return [
      {
        // Satellite quoter embed bundle — must always revalidate so satellite
        // sites pick up bundle updates without waiting for browser cache expiry.
        // Vercel edge cache is purged on each deploy; this closes the browser-side
        // gap. Access-Control-Allow-Origin allows satellite domains to load the
        // bundle cross-origin without CORS errors.
        source: '/embed/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), fullscreen=(self)' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://fonts.googleapis.com https://*.googleapis.com https://*.supabase.co https://www.googletagmanager.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://*.google.com https://bat.bing.com https://*.bing.com https://bat.bing.net https://*.bing.net https://*.clarity.ms https://va.vercel-scripts.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://*.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.supabase.io https://www.google-analytics.com https://*.googleapis.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://*.google.com https://bat.bing.com https://*.bing.com https://bat.bing.net https://*.bing.net https://*.clarity.ms",
              "frame-src 'self' https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://www.googletagmanager.com https://*.google.com https://*.clarity.ms https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
            ].join('; '),
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Consolidate www → non-www (301) to unify domain authority
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.pinkautoglass.com' }],
        destination: 'https://pinkautoglass.com/:path*',
        permanent: true,
      },
      // Blog topic consolidation - redirect older posts to newer canonicals
      {
        source: '/blog/windshield-repair-vs-replacement-decision-guide',
        destination: '/blog/windshield-repair-vs-replacement-when-to-choose',
        permanent: true,
      },
      {
        source: '/blog/windshield-replacement-cost-guide-colorado',
        destination: '/blog/windshield-replacement-cost-colorado-insurance-guide',
        permanent: true,
      },
      // Redirect old /vehicles/make/:make to canonical /vehicles/brands/:make
      {
        source: '/vehicles/make/:make',
        destination: '/vehicles/brands/:make',
        permanent: true, // 301 redirect
      },
      // Redirect privacy-policy to privacy
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true, // 301 redirect
      },
      // Legacy insurance claims pages → franchise /colorado/insurance/[carrier]
      {
        source: '/services/insurance-claims/:carrier(progressive|geico|state-farm|allstate|usaa|aaa|farmers|liberty-mutual|nationwide|travelers)',
        destination: '/colorado/insurance/:carrier',
        permanent: true,
      },
      // Windshield replacement cost → franchise pricing page
      {
        source: '/windshield-replacement-cost',
        destination: '/colorado/pricing',
        permanent: true,
      },
      // Rock chip repair consolidated into windshield repair (franchise)
      {
        source: '/services/rock-chip-repair',
        destination: '/colorado/services/windshield-repair',
        permanent: true, // 301 redirect
      },
      // Homepage migration 2026-05-28: the auto-quoter moved from /quote to /.
      // Any inbound link to /quote (legacy bookmarks, SMS history, internal
      // /pricing CTA, QuoteCalculator widget) now lands on the homepage.
      {
        source: '/quote',
        destination: '/',
        permanent: true,
      },
      // Common 404 URLs Google tries to crawl → redirect to relevant pages
      {
        source: '/get-quote',
        destination: '/',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/',
        permanent: true,
      },
      {
        source: '/reviews',
        destination: '/about',
        permanent: true,
      },
      // Consolidate duplicate ADAS page → canonical /services/adas-calibration
      {
        source: '/colorado/services/adas-calibration',
        destination: '/services/adas-calibration',
        permanent: true,
      },
      // Location shorthand → franchise slugs
      {
        source: '/locations/denver',
        destination: '/colorado/denver',
        permanent: true,
      },
      {
        source: '/locations/boulder',
        destination: '/colorado/boulder',
        permanent: true,
      },
      {
        source: '/locations/phoenix',
        destination: '/arizona/phoenix',
        permanent: true,
      },
      // Franchise URL migration: old structure → /colorado/* and /arizona/*
      ...franchiseRedirects,
    ];
  },
}

module.exports = nextConfig

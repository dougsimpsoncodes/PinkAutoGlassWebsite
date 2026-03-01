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
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  async headers() {
    return [
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
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://fonts.googleapis.com https://*.googleapis.com https://*.supabase.co https://www.googletagmanager.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://*.google.com https://bat.bing.com https://*.bing.com https://bat.bing.net https://*.bing.net https://*.clarity.ms`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://*.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.supabase.io https://www.google-analytics.com https://*.googleapis.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://*.google.com https://bat.bing.com https://*.bing.com https://bat.bing.net https://*.bing.net https://*.clarity.ms",
              "frame-src 'self' https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://www.googletagmanager.com https://*.google.com https://*.clarity.ms https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
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
      // Legacy insurance claims pages → new /insurance/[carrier] pages
      {
        source: '/services/insurance-claims/:carrier(progressive|geico|state-farm|allstate|usaa|aaa|farmers|liberty-mutual|nationwide|travelers)',
        destination: '/insurance/:carrier',
        permanent: true,
      },
      // Common 404 URLs Google tries to crawl → redirect to relevant pages
      {
        source: '/quote',
        destination: '/book',
        permanent: true,
      },
      {
        source: '/get-quote',
        destination: '/book',
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
      // Location shorthand → proper slugs
      {
        source: '/locations/denver',
        destination: '/locations/denver-co',
        permanent: true,
      },
      {
        source: '/locations/boulder',
        destination: '/locations/boulder-co',
        permanent: true,
      },
      {
        source: '/locations/phoenix',
        destination: '/locations/phoenix-az',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig

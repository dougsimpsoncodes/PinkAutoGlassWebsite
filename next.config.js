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
  swcMinify: true,

  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  async redirects() {
    return [
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
    ];
  },
}

module.exports = nextConfig

/**
 * Next.js Middleware - Runs on Edge Runtime
 *
 * Security Features:
 * - HTTP Basic Auth for /admin routes
 * - Security headers (CSP, HSTS, etc.)
 * - CORS configuration (public APIs only)
 *
 * Note: Uses globalThis.atob() for Edge runtime compatibility.
 * For Node.js unit tests, atob is available globally via test environment.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if this is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin');
  const isHealthApi = request.nextUrl.pathname.startsWith('/api/health');

  // Protect admin routes with HTTP Basic Auth
  if (isAdminRoute || isAdminApi || isHealthApi) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }

    // Decode credentials (Edge-safe - use Web APIs instead of Node.js Buffer)
    const base64Credentials = authHeader.split(' ')[1];

    let credentials: string;
    try {
      credentials = globalThis.atob(base64Credentials);
    } catch (e) {
      // Malformed Base64 - reject immediately
      return new NextResponse('Invalid authentication header', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }

    const [username, password] = credentials.split(':');

    // Verify credentials
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    // In production, credentials MUST be set
    if (!validUsername || !validPassword) {
      if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: ADMIN_USERNAME and ADMIN_PASSWORD must be set in production');
        return new NextResponse('Server configuration error', { status: 500 });
      }
      // In development, use fallbacks with warning
      console.warn('⚠️  WARNING: Using default admin credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env.local');
    }

    const effectiveUsername = validUsername || 'admin';
    const effectivePassword = validPassword || 'changeme';

    if (username !== effectiveUsername || password !== effectivePassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }
  }

  // Create response
  const response = NextResponse.next();

  // Block search engines from indexing admin pages
  if (isAdminRoute || isAdminApi) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Skip security headers in development for mobile testing
  if (process.env.NODE_ENV === 'development') {
    return response;
  }

  // Security Headers (updated to include Google Ads domains)
  const securityHeaders = {
    // Content Security Policy - Prevent XSS attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.supabase.co https://www.googletagmanager.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://*.google.com https://bat.bing.com https://*.bing.com https://bat.bing.net https://*.bing.net https://*.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://*.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.supabase.io https://www.google-analytics.com https://*.googleapis.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://*.google.com https://bat.bing.com https://*.bing.com https://bat.bing.net https://*.bing.net https://*.clarity.ms",
      "frame-src 'self' https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googleadservices.com https://www.googletagmanager.com https://*.google.com https://*.clarity.ms",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),

    // HTTP Strict Transport Security - Force HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // X-Frame-Options - Allow Clerk iframes
    'X-Frame-Options': 'DENY',

    // X-Content-Type-Options - Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer Policy - Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Cross-Origin-Opener-Policy - Isolate browsing context
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Permissions Policy - Control browser features
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'fullscreen=(self)'
    ].join(', ')
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CORS headers for public API routes only (exclude admin routes - same-origin only)
  if (request.nextUrl.pathname.startsWith('/api/') && !isAdminApi) {
    // Allow specific origins (customize as needed)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://pinkautoglass.com',
      'https://www.pinkautoglass.com'
    ];

    const origin = request.headers.get('origin');

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if this is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin');

  // Protect admin routes with HTTP Basic Auth
  if (isAdminRoute || isAdminApi) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }

    // Decode credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Verify credentials
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'changeme';

    if (username !== validUsername || password !== validPassword) {
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

  // Skip security headers in development for mobile testing
  if (process.env.NODE_ENV === 'development') {
    return response;
  }

  // Security Headers (updated to include Clerk domains)
  const securityHeaders = {
    // Content Security Policy - Prevent XSS attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://*.supabase.co https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.supabase.io https://www.google-analytics.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),

    // HTTP Strict Transport Security - Force HTTPS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // X-Frame-Options - Allow Clerk iframes
    'X-Frame-Options': 'SAMEORIGIN',

    // X-Content-Type-Options - Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer Policy - Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

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

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
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

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
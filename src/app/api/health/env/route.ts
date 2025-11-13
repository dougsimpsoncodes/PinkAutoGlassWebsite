import { NextResponse } from 'next/server';

/**
 * Health check endpoint to verify critical environment variables are loaded
 * GET /api/health/env
 */
export async function GET() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RINGCENTRAL_CLIENT_ID',
    'RINGCENTRAL_CLIENT_SECRET',
    'RINGCENTRAL_JWT_TOKEN',
    'RINGCENTRAL_SERVER_URL',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'ADMIN_EMAIL',
  ];

  const envStatus = requiredEnvVars.map((key) => ({
    key,
    loaded: !!process.env[key],
    // Show first 10 chars for debugging (never show full secrets)
    preview: process.env[key] ? `${process.env[key]?.substring(0, 10)}...` : 'MISSING',
  }));

  const allLoaded = envStatus.every((env) => env.loaded);
  const missingVars = envStatus.filter((env) => !env.loaded);

  return NextResponse.json({
    status: allLoaded ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envFile: process.env.NEXT_PUBLIC_SUPABASE_URL ? '.env.local detected' : 'No .env.local',
    variables: envStatus,
    ...(missingVars.length > 0 && {
      missing: missingVars.map((v) => v.key),
      warning: 'Some required environment variables are missing. Restart the dev server if you recently updated .env.local',
    }),
  }, {
    status: allLoaded ? 200 : 503,
  });
}

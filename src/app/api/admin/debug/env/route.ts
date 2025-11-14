import { NextRequest, NextResponse } from 'next/server';
import { validateAdminApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;
  // Show environment variable info (safely)
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...',
    supabase_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
  });
}

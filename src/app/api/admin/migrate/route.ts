import { NextRequest, NextResponse } from "next/server";
import { validateAdminApiKey } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;

  return NextResponse.json({ ok: false, error: "Migration disabled" }, { status: 501 });
}


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

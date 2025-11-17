import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

  return NextResponse.json({ ok: false, error: "Migration disabled" }, { status: 501 });
}


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

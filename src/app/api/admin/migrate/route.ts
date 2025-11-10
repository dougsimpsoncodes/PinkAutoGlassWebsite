import { NextResponse } from "next/server"; export async function POST() { return NextResponse.json({ ok: false, error: "Migration disabled" }, { status: 501 }); }


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

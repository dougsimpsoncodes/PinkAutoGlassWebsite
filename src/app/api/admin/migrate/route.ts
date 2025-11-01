import { NextResponse } from "next/server"; export async function POST() { return NextResponse.json({ ok: false, error: "Migration disabled" }, { status: 501 }); }

import { NextResponse } from 'next/server';

export async function GET() {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  return NextResponse.json({
    hasHash: !!hash,
    fullHash: hash,
    hashLength: hash?.length,
    hasSessionSecret: !!process.env.ADMIN_SESSION_SECRET,
    allAdminEnvKeys: Object.keys(process.env).filter(k => k.includes('ADMIN'))
  });
}

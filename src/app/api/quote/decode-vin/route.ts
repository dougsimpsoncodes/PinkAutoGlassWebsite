import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { decodeVin } from '@/lib/nhtsa/vin';

export const runtime = 'nodejs';

const decodeVinSchema = z.object({
  vin: z.string().trim().regex(/^[A-HJ-NPR-Z0-9]{17}$/i),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(`quote-decode-vin:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many VIN lookups. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = decodeVinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Enter a valid 17-character VIN.' },
        { status: 400 }
      );
    }

    const result = await decodeVin(parsed.data.vin);
    if (!result.success || !result.vehicle) {
      return NextResponse.json({
        success: false,
        status: 'manual_entry_required',
        message: 'We could not decode that VIN. Please enter the vehicle year, make, and model.',
      });
    }

    return NextResponse.json({
      success: true,
      status: 'vehicle_found',
      vehicle: result.vehicle,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'VIN decode failed.';
    console.error('[quote-decode-vin] decode failed:', message);
    return NextResponse.json(
      { error: 'VIN lookup is temporarily unavailable. Please enter your vehicle details manually.' },
      { status: 503 }
    );
  }
}

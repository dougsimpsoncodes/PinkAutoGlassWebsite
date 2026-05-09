import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlateToVinClient, normalizePlate, normalizeState } from '@/lib/platelookup/client';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const identifySchema = z.object({
  plate: z.string().min(2).max(16).transform((value, ctx) => {
    try {
      return normalizePlate(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid US license plate.',
      });
      return z.NEVER;
    }
  }),
  state: z.string().length(2).transform((value, ctx) => {
    try {
      return normalizeState(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid 2-letter state.',
      });
      return z.NEVER;
    }
  }),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(`quote-identify:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many lookup attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = identifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Enter a valid license plate, state, and ZIP code.' },
        { status: 400 }
      );
    }

    const { plate, state } = parsed.data;
    // ZIP is validated here because the quote flow needs service-area context
    // after identification, but this endpoint only performs vehicle lookup.
    const result = await getPlateToVinClient().lookupPlate({ plate, state });

    if (!result.success || !result.vehicle?.vin) {
      return NextResponse.json({
        success: false,
        status: 'manual_entry_required',
        message: 'We could not identify that plate. Please enter the VIN or vehicle details manually.',
      });
    }

    return NextResponse.json({
      success: true,
      status: 'vehicle_found',
      vehicle: {
        vin: result.vehicle.vin,
        year: result.vehicle.year,
        make: result.vehicle.make,
        model: result.vehicle.model,
        trim: result.vehicle.trim,
        name: result.vehicle.name,
        style: result.vehicle.style,
        engine: result.vehicle.engine,
        driveType: result.vehicle.driveType,
        transmission: result.vehicle.transmission,
        fuel: result.vehicle.fuel,
        color: result.vehicle.color,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vehicle lookup failed.';
    console.error('[quote-identify] lookup failed:', message);
    return NextResponse.json(
      { error: 'Vehicle lookup is temporarily unavailable. Please enter your vehicle details manually.' },
      { status: 503 }
    );
  }
}

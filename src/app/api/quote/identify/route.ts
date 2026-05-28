import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { AutoBoltError, getAutoBoltClient } from '@/lib/autobolt/client';

export const runtime = 'nodejs';

// Plate normalization is light because AutoBolt accepts uppercase alphanumeric
// already; we strip whitespace/punctuation in the schema transform to match
// what the form would send.
const identifySchema = z.object({
  plate: z.string()
    .min(2)
    .max(16)
    .transform(v => v.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')),
  state: z.string()
    .length(2)
    .transform(v => v.trim().toUpperCase()),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional().or(z.literal('')),
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
        { error: 'Enter a valid license plate and state.' },
        { status: 400 }
      );
    }

    const { plate, state } = parsed.data;

    let summary;
    try {
      summary = await getAutoBoltClient().decodePlate({
        plateNumber: plate,
        plateState: state,
      });
    } catch (err) {
      if (err instanceof AutoBoltError) {
        if (err.code === 'NotFound') {
          // AutoBolt returned 204 — plate isn't in their database. Common in TX
          // where AutoBolt has limited coverage. Tell the customer to enter
          // the VIN or vehicle details manually rather than guessing.
          return NextResponse.json({
            success: false,
            status: 'manual_entry_required',
            message: 'We could not find that plate. Please enter the VIN or vehicle details manually.',
          });
        }
        // Auth / rate-limit / server errors propagate as 503 so the form
        // surfaces a meaningful message and falls back to manual entry.
        throw err;
      }
      throw err;
    }

    // AutoBolt returns the full decode response; the form only needs
    // VIN + Y/M/M, but we surface bodyStyle too because the manual review
    // path stores it for later inspection.
    if (!summary?.vin || !summary?.year || !summary?.make || !summary?.model) {
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
        vin: summary.vin,
        year: summary.year,
        make: summary.make,
        model: summary.model,
        trim: '',
        bodyStyle: summary.bodyStyle ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vehicle lookup failed.';
    console.error('[quote-identify] lookup failed:', message);
    return NextResponse.json(
      { error: 'Vehicle lookup is temporarily unavailable. Please enter your VIN or vehicle details manually.' },
      { status: 503 }
    );
  }
}

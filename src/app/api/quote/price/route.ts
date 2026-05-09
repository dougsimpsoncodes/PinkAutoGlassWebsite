import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getMygrantClient, type MygrantResponseItem } from '@/lib/mygrant/client';
import { buildCashWindshieldQuote, dollarsToCents, type CashWindshieldQuote } from '@/lib/quote/pricing';

export const runtime = 'nodejs';

const currentYear = new Date().getFullYear() + 1;

const quotePriceSchema = z.object({
  vehicle: z.object({
    vin: z.string().trim().regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Enter a valid 17-character VIN.').optional().or(z.literal('')),
    year: z.coerce.number().int().min(1981).max(currentYear),
    make: z.string().trim().min(2).max(40),
    model: z.string().trim().min(1).max(60),
    trim: z.string().trim().max(80).optional().or(z.literal('')),
  }),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional().or(z.literal('')),
  state: z.string().trim().length(2).optional().or(z.literal('')),
  hasAdas: z.boolean().optional(),
  plateLast4: z.string().trim().max(4).optional(),
});

type QuotePriceInput = z.infer<typeof quotePriceSchema>;

interface StoredQuoteResult {
  quoteId?: string;
  quoteToken?: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = checkRateLimit(`quote-price:${ip}`, 8, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many quote attempts. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = quotePriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Enter a valid year, make, model, ZIP code, and VIN if supplied.' },
        { status: 400 }
      );
    }

    const input = normalizeQuoteInput(parsed.data);
    const mygrantResult = await getMygrantQuoteCandidates(input);
    const selectedPart = selectBestWindshieldPart(mygrantResult.items);

    if (!selectedPart?.customerUnitPrice) {
      const stored = await storeAutomatedQuote(input, {
        status: 'manual_review',
        pricingVersion: 'cash-windshield-v1',
        totalCents: 0,
        lineItems: [],
        confidenceReasons: [
          selectedPart ? 'missing_customer_unit_price' : 'no_confident_windshield_part_match',
          ...mygrantResult.reasons,
        ],
      }, selectedPart, mygrantResult.safeSnapshot);

      return NextResponse.json({
        success: true,
        status: 'manual_review',
        quoteToken: stored.quoteToken,
        vehicle: input.vehicle,
        message: 'We found your vehicle, but this glass needs a manual price confirmation.',
        confidenceReasons: [
          selectedPart ? 'missing_customer_unit_price' : 'no_confident_windshield_part_match',
          ...mygrantResult.reasons,
        ],
      });
    }

    const quote = buildCashWindshieldQuote({
      glassCostCents: dollarsToCents(selectedPart.customerUnitPrice),
      calibrationCents: shouldIncludeCalibration(input)
        ? Number.parseInt(process.env.QUOTE_ADAS_CALIBRATION_CENTS || '22500', 10)
        : 0,
      taxRate: Number.parseFloat(process.env.QUOTE_TAX_RATE || '0'),
    });

    const stored = await storeAutomatedQuote(input, quote, selectedPart, mygrantResult.safeSnapshot);

    return NextResponse.json({
      success: true,
      status: quote.status,
      quoteToken: stored.quoteToken,
      vehicle: input.vehicle,
      pricing: {
        pricingVersion: quote.pricingVersion,
        totalCents: quote.totalCents,
        totalDollars: quote.totalCents / 100,
        lineItems: quote.lineItems,
        confidenceReasons: quote.confidenceReasons,
      },
      selectedPart: publicPartSnapshot(selectedPart),
      message: quote.status === 'ready_exact'
        ? 'Your installed cash price is ready.'
        : 'Your installed price includes the expected calibration allowance.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Quote pricing failed.';
    console.error('[quote-price] pricing failed:', message);
    return NextResponse.json(
      {
        success: false,
        status: 'manual_review',
        error: 'Automated pricing is temporarily unavailable. We can still confirm this quote manually.',
      },
      { status: 503 }
    );
  }
}

function normalizeQuoteInput(input: QuotePriceInput): QuotePriceInput {
  return {
    ...input,
    state: input.state ? input.state.trim().toUpperCase() : '',
    zip: input.zip || '',
    vehicle: {
      ...input.vehicle,
      vin: input.vehicle.vin ? input.vehicle.vin.trim().toUpperCase() : '',
      make: input.vehicle.make.trim(),
      model: input.vehicle.model.trim(),
      trim: input.vehicle.trim?.trim() || '',
    },
    plateLast4: input.plateLast4?.replace(/[^A-Z0-9]/gi, '').slice(-4).toUpperCase(),
  };
}

async function getMygrantQuoteCandidates(input: QuotePriceInput): Promise<{
  items: MygrantResponseItem[];
  reasons: string[];
  safeSnapshot: Record<string, unknown>;
}> {
  try {
    const response = await getMygrantClient().inquireByVehicle([
      {
        vehicleYear: input.vehicle.year,
        vehicleMake: input.vehicle.make,
        vehicleModel: input.vehicle.model,
      },
    ]);

    const items = response.requestItems.flatMap(item => item.responses);
    return {
      items,
      reasons: response.requestStatusCode && response.requestStatusCode !== '0'
        ? [`mygrant_status_${response.requestStatusCode}`]
        : [],
      safeSnapshot: {
        requestStatusCode: response.requestStatusCode,
        requestStatusText: response.requestStatusText,
        responseCount: items.length,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    return {
      items: [],
      reasons: ['mygrant_lookup_failed'],
      safeSnapshot: { error: message.slice(0, 300) },
    };
  }
}

function selectBestWindshieldPart(items: MygrantResponseItem[]): MygrantResponseItem | undefined {
  const windshieldItems = items.filter((item) => {
    const descriptor = [
      item.productType,
      item.partDesc,
      item.part,
      item.nagsPrefix,
    ].filter(Boolean).join(' ').toLowerCase();

    return descriptor.includes('windshield')
      || descriptor.includes('w/shield')
      || ['dw', 'fw', 'ws'].includes((item.nagsPrefix || '').toLowerCase());
  });

  return windshieldItems
    .filter(item => item.customerUnitPrice || item.listUnitPrice)
    .sort((a, b) => {
      const aAvailable = a.qtyAvailable && a.qtyAvailable > 0 ? 0 : 1;
      const bAvailable = b.qtyAvailable && b.qtyAvailable > 0 ? 0 : 1;
      if (aAvailable !== bAvailable) return aAvailable - bAvailable;
      return (a.customerUnitPrice || a.listUnitPrice || Number.MAX_SAFE_INTEGER)
        - (b.customerUnitPrice || b.listUnitPrice || Number.MAX_SAFE_INTEGER);
    })[0] || windshieldItems[0];
}

function shouldIncludeCalibration(input: QuotePriceInput): boolean {
  if (input.hasAdas !== undefined) return input.hasAdas;
  return input.vehicle.year >= 2018;
}

async function storeAutomatedQuote(
  input: QuotePriceInput,
  quote: CashWindshieldQuote,
  selectedPart: MygrantResponseItem | undefined,
  mygrantSnapshot: Record<string, unknown>
): Promise<StoredQuoteResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return {};

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('automated_quotes')
      .insert({
        status: quote.status,
        status_reason: quote.confidenceReasons.join(','),
        pricing_version: quote.pricingVersion,
        zip: input.zip || null,
        state: input.state || null,
        plate_last4: input.plateLast4 || null,
        vin: input.vehicle.vin || null,
        vehicle_year: input.vehicle.year,
        vehicle_make: input.vehicle.make,
        vehicle_model: input.vehicle.model,
        vehicle_trim: input.vehicle.trim || null,
        selected_nags_prefix: selectedPart?.nagsPrefix || null,
        selected_nags_number: selectedPart?.nagsNumber || null,
        selected_nags_color: selectedPart?.nagsColor || null,
        selected_nags_hardware_indicator: selectedPart?.hardwareIndicator || null,
        selected_nags_premium_indicator: selectedPart?.premiumIndicator || null,
        selected_product_id: selectedPart?.productId || null,
        selected_brand: selectedPart?.brand || null,
        selected_part_description: selectedPart?.partDesc || selectedPart?.part || null,
        selected_ship_from_branch_id: selectedPart?.shipFromBranchId || null,
        selected_ship_from_branch_name: selectedPart?.shipFromBranchName || null,
        selected_qty_available: selectedPart?.qtyAvailable || null,
        selected_estimated_delivery_date: selectedPart?.estimatedDeliveryDate || null,
        selected_estimated_delivery_time: selectedPart?.estimatedDeliveryTime || null,
        supplier_cost_cents: selectedPart?.customerUnitPrice ? dollarsToCents(selectedPart.customerUnitPrice) : null,
        quote_total_cents: quote.totalCents || null,
        confidence_reasons: quote.confidenceReasons,
        mygrant_request: {
          vehicleYear: input.vehicle.year,
          vehicleMake: input.vehicle.make,
          vehicleModel: input.vehicle.model,
        },
        mygrant_response: mygrantSnapshot,
      })
      .select('id, quote_token')
      .single();

    if (error || !data) {
      console.error('[quote-price] automated quote insert failed:', error?.message);
      return {};
    }

    if (quote.lineItems.length > 0) {
      const { error: lineError } = await supabase
        .from('automated_quote_line_items')
        .insert(quote.lineItems.map((item, index) => ({
          quote_id: data.id,
          sort_order: index + 1,
          kind: item.kind,
          description: item.description,
          amount_cents: item.amountCents,
          taxable: item.taxable || false,
          vendor_part_number: selectedPart?.productId || selectedPart?.nagsNumber || null,
          metadata: item.metadata || {},
        })));
      if (lineError) console.error('[quote-price] quote line insert failed:', lineError.message);
    }

    return { quoteId: data.id, quoteToken: data.quote_token };
  } catch (error) {
    console.error('[quote-price] automated quote persistence failed:', error);
    return {};
  }
}

function publicPartSnapshot(part: MygrantResponseItem) {
  return {
    nagsPrefix: part.nagsPrefix,
    nagsNumber: part.nagsNumber,
    color: part.nagsColor,
    brand: part.brand,
    description: part.partDesc || part.part,
    qtyAvailable: part.qtyAvailable,
    estimatedDeliveryDate: part.estimatedDeliveryDate,
    estimatedDeliveryTime: part.estimatedDeliveryTime,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getMygrantClient, type MygrantResponseItem } from '@/lib/mygrant/client';
import { evaluateMygrantWindshieldCandidates, publicScoredMygrantCandidate } from '@/lib/quote/mygrant-scoring';
import { buildCashWindshieldQuote, dollarsToCents, type CashWindshieldQuote } from '@/lib/quote/pricing';
import { AutoBoltError, getAutoBoltClient } from '@/lib/autobolt/client';
import { plateLookupKey, readCachedNagsLookup, vinLookupKey, writeCachedNagsLookup, type CachedNagsLookup } from '@/lib/autobolt/cache';

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

interface CreateAutomatedQuoteResult {
  id: string;
  quote_token: string;
}

interface PersistenceContext {
  ipAddress?: string;
  userAgent?: string;
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
    const cacheClient = buildCacheClient();
    const mygrantResult = await getMygrantQuoteCandidates(input, cacheClient);
    // Prefer the AutoBolt-resolved vehicle identity over what the form submitted,
    // since the resolved values reflect the VIN the part was priced for. If the
    // form's typed Y/M/M disagree with the decode, the customer and the lead row
    // both see the vehicle the price actually corresponds to.
    const effectiveInput = applyResolvedVehicle(input, mygrantResult.resolvedVehicle);
    const selection = evaluateMygrantWindshieldCandidates(mygrantResult.items);
    const selectedPart = selection.selectedPart;

    if (selection.confidence !== 'high' || !selectedPart?.customerUnitPrice) {
      const confidenceReasons = [
        selectedPart?.customerUnitPrice ? `mygrant_confidence_${selection.confidence}` : 'missing_customer_unit_price',
        ...selection.reasons,
        ...mygrantResult.reasons,
      ];
      const stored = await storeAutomatedQuote(effectiveInput, {
        status: 'manual_review',
        pricingVersion: 'cash-windshield-v1',
        totalCents: 0,
        lineItems: [],
        confidenceReasons,
      }, selectedPart, mygrantResult.safeSnapshot, {
        ipAddress: ip === 'unknown' ? undefined : ip,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json({
        success: true,
        status: 'manual_review',
        quoteToken: stored.quoteToken,
        vehicle: effectiveInput.vehicle,
        adas: mygrantResult.adasSignal,
        message: 'We found your vehicle, but this glass needs a manual price confirmation.',
        confidenceReasons,
      });
    }

    const quote = buildCashWindshieldQuote({
      glassCostCents: dollarsToCents(selectedPart.customerUnitPrice),
      calibrationCents: shouldIncludeCalibration(effectiveInput, mygrantResult.adasSignal)
        ? Number.parseInt(process.env.QUOTE_ADAS_CALIBRATION_CENTS || '22500', 10)
        : 0,
      taxRate: Number.parseFloat(process.env.QUOTE_TAX_RATE || '0'),
    });

    const quoteWithMygrantConfidence = {
      ...quote,
      confidenceReasons: [
        ...quote.confidenceReasons,
        ...selection.reasons,
      ],
    };

    const stored = await storeAutomatedQuote(effectiveInput, quoteWithMygrantConfidence, selectedPart, mygrantResult.safeSnapshot, {
      ipAddress: ip === 'unknown' ? undefined : ip,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      status: quoteWithMygrantConfidence.status,
      quoteToken: stored.quoteToken,
      vehicle: effectiveInput.vehicle,
      pricing: {
        pricingVersion: quoteWithMygrantConfidence.pricingVersion,
        totalCents: quoteWithMygrantConfidence.totalCents,
        totalDollars: quoteWithMygrantConfidence.totalCents / 100,
        lineItems: quoteWithMygrantConfidence.lineItems,
        confidenceReasons: quoteWithMygrantConfidence.confidenceReasons,
      },
      selectedPart: publicPartSnapshot(selectedPart),
      adas: mygrantResult.adasSignal,
      message: quoteWithMygrantConfidence.status === 'ready_exact'
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

function applyResolvedVehicle(
  input: QuotePriceInput,
  resolved?: { vin?: string; year?: number; make?: string; model?: string; bodyStyle?: string }
): QuotePriceInput {
  if (!resolved) return input;
  // Only override individual fields when the decode produced a value; preserve
  // the form input as a fallback (e.g. trim isn't returned by the decoder).
  const vehicle = {
    ...input.vehicle,
    vin: resolved.vin ?? input.vehicle.vin,
    year: resolved.year ?? input.vehicle.year,
    make: resolved.make ?? input.vehicle.make,
    model: resolved.model ?? input.vehicle.model,
  };
  return { ...input, vehicle };
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

async function getMygrantQuoteCandidates(
  input: QuotePriceInput,
  cacheClient?: SupabaseClient
): Promise<{
  items: MygrantResponseItem[];
  reasons: string[];
  safeSnapshot: Record<string, unknown>;
  vehicleNags?: { prefix: string; number: string; amNumber?: string };
  resolvedVehicle?: { vin?: string; year?: number; make?: string; model?: string; bodyStyle?: string };
  /**
   * AutoBolt-derived calibration requirement signal. Authoritative when present
   * (overrides the form checkbox). `undefined` when AutoBolt didn't run (manual
   * mode without VIN), in which case we fall back to the form checkbox + year heuristic.
   */
  adasSignal?: { requiresCalibration: boolean; calibrations: Array<{ type?: string; sensor?: string }> };
}> {
  // Strategy:
  //   1. Use AutoBolt to resolve vehicle→NAGS (VIN-only today; plate path TBD)
  //   2. If we got a NAGS identifier, ask Mygrant.inquireByNags for priced candidates
  //   3. Whether or not (1)/(2) succeed, ALWAYS attempt Mygrant.inquireByVehicle
  //      as a fallback so we degrade gracefully when:
  //        - AutoBolt is missing creds / rate-limited / down
  //        - The amNumber→NAGS mapping turns out to be wrong (still pending Nick)
  //        - Mygrant returns no usable candidates for the resolved NAGS
  //   4. Prefer NAGS candidates when present; only fall back to vehicle candidates
  //      if NAGS came back empty.

  const reasons: string[] = [];
  const autoboltSnapshot: Record<string, unknown> = { confidence: 'none' };
  let nagsLookup: CachedNagsLookup | undefined;
  let nagsItems: MygrantResponseItem[] = [];
  let nagsMygrantSnapshot: Record<string, unknown> | undefined;
  let vehicleNagsForReturn: { prefix: string; number: string; amNumber?: string } | undefined;

  try {
    nagsLookup = await resolveVehicleNags(input, cacheClient, reasons);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    reasons.push('autobolt_lookup_failed');
    autoboltSnapshot.error = message.slice(0, 300);
  }

  if (nagsLookup) {
    Object.assign(autoboltSnapshot, {
      resolvedFrom: nagsLookup.resolvedFrom,
      confidence: nagsLookup.confidence,
      partCount: nagsLookup.partCount,
      year: nagsLookup.year,
      make: nagsLookup.make,
      model: nagsLookup.model,
      ...(nagsLookup.nags
        ? { nagsPrefix: nagsLookup.nags.prefix, nagsNumber: nagsLookup.nags.number }
        : {}),
    });
  }

  if (nagsLookup?.nags) {
    try {
      const response = await getMygrantClient().inquireByNags([
        { nagsPrefix: nagsLookup.nags.prefix, nagsNumber: nagsLookup.nags.number },
      ]);
      nagsItems = response.requestItems.flatMap(item => item.responses);
      if (response.requestStatusCode && response.requestStatusCode !== '0') {
        reasons.push(`mygrant_status_${response.requestStatusCode}`);
      }
      nagsMygrantSnapshot = {
        path: 'inquireByNags',
        requestStatusCode: response.requestStatusCode,
        requestStatusText: response.requestStatusText,
        responseCount: nagsItems.length,
        candidateSummary: evaluateMygrantWindshieldCandidates(nagsItems).rankedCandidates
          .slice(0, 8)
          .map(publicScoredMygrantCandidate),
      };
      vehicleNagsForReturn = {
        prefix: nagsLookup.nags.prefix,
        number: nagsLookup.nags.number,
        amNumber: nagsLookup.amNumber,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      reasons.push('mygrant_nags_lookup_failed');
      nagsMygrantSnapshot = { path: 'inquireByNags', error: message.slice(0, 300) };
    }
  }

  // Fallback path: always try the legacy vehicle inquiry when the NAGS path
  // produced no priceable candidates (empty, all accessory-only, all missing
  // price, all unavailable, etc.). Use the AutoBolt-resolved Y/M/M when
  // available so the fallback prices the same vehicle we'd label/store as
  // priced. Currently inquireByVehicle returns e610 on Mygrant's side, but
  // keeping the call preserves diagnostic telemetry and unblocks if Mygrant
  // ever adds vehicle support.
  let vehicleSnapshot: Record<string, unknown> | undefined;
  let vehicleItems: MygrantResponseItem[] = [];
  if (!hasPriceableCandidate(nagsItems)) {
    if (nagsItems.length > 0) reasons.push('mygrant_nags_no_priceable_candidate');
    const fallbackInput = applyResolvedVehicle(input, nagsLookup
      ? {
          vin: nagsLookup.vin || input.vehicle.vin || undefined,
          year: nagsLookup.year ?? undefined,
          make: nagsLookup.make ?? undefined,
          model: nagsLookup.model ?? undefined,
          bodyStyle: nagsLookup.bodyStyle ?? undefined,
        }
      : undefined);
    const vehicleResult = await tryMygrantInquireByVehicle(fallbackInput, reasons);
    vehicleItems = vehicleResult.items;
    vehicleSnapshot = vehicleResult.snapshot;
  }

  // Item selection priority:
  //   1. NAGS items with a priced candidate (any confidence) win.
  //   2. Vehicle-fallback items when fallback returned anything.
  //   3. Otherwise keep the NAGS items we did get so downstream ops views still
  //      see vendor details (selectedPart, qtyAvailable, etc.) rather than an
  //      empty bucket from a fallback that returned e610.
  const items = hasPriceableCandidate(nagsItems)
    ? nagsItems
    : vehicleItems.length > 0
      ? vehicleItems
      : nagsItems;
  return {
    items,
    reasons,
    vehicleNags: vehicleNagsForReturn,
    resolvedVehicle: nagsLookup
      ? {
          vin: nagsLookup.vin || input.vehicle.vin || undefined,
          year: nagsLookup.year ?? undefined,
          make: nagsLookup.make ?? undefined,
          model: nagsLookup.model ?? undefined,
          bodyStyle: nagsLookup.bodyStyle ?? undefined,
        }
      : undefined,
    // Only emit adasSignal when AutoBolt produced an authoritative single-part
    // match. For confidence='multi' or 'none' the calibrations[] array is empty
    // by absence of data (not by knowledge), so treating it as authoritative
    // would skip the user-provided hasAdas / year>=2018 fallback. Leaving it
    // undefined lets shouldIncludeCalibration fall through to those.
    adasSignal: nagsLookup && nagsLookup.confidence === 'single' && nagsLookup.nags
      ? { requiresCalibration: nagsLookup.calibrations.length > 0, calibrations: nagsLookup.calibrations }
      : undefined,
    safeSnapshot: {
      autobolt: autoboltSnapshot,
      ...(nagsMygrantSnapshot ? { mygrantNags: nagsMygrantSnapshot } : {}),
      ...(vehicleSnapshot ? { mygrantVehicle: vehicleSnapshot } : {}),
    },
  };
}

/**
 * "Priceable" means at least one candidate has a customer-facing unit price.
 * Medium-confidence parts (priced but with scoring warnings like "sensor pad")
 * still count: we'd rather quote a real number than burn a fallback round-trip
 * on inquireByVehicle, which currently returns e610 anyway.
 */
function hasPriceableCandidate(items: MygrantResponseItem[]): boolean {
  if (items.length === 0) return false;
  const evaluation = evaluateMygrantWindshieldCandidates(items);
  return !!evaluation.selectedPart?.customerUnitPrice;
}

async function resolveVehicleNags(
  input: QuotePriceInput,
  cacheClient: SupabaseClient | undefined,
  reasons: string[]
): Promise<CachedNagsLookup | undefined> {
  const vin = input.vehicle.vin || undefined;
  const plate = input.plateLast4 || undefined;
  const state = input.state || undefined;
  // The form sends only the plate's last 4; full plate lookups via AutoBolt
  // require the complete plate, so we can only use the plate path when the
  // caller upgrades to providing the full plate. Today VIN is the deterministic
  // route; plate decoding is reserved for a future iteration once we surface
  // full plate capture upstream.

  if (vin && cacheClient) {
    const key = vinLookupKey(vin);
    const cached = await readCachedNagsLookup(cacheClient, key);
    if (cached) {
      reasons.push('autobolt_cache_hit');
      return cached;
    }
  }

  if (!vin) {
    reasons.push('autobolt_missing_vin');
    return undefined;
  }

  const client = getAutoBoltClient();
  try {
    const summary = await client.lookup({ vin });
    const nagsFromPart = summary.selectedPart ? extractCachedNags(summary.selectedPart.amNumber) : undefined;
    const hasUsableNags = !!(nagsFromPart && (nagsFromPart.prefix || nagsFromPart.number));

    // Only cache decisive results. An inconclusive ('multi' / 'none') or
    // single-with-unparseable-NAGS response would otherwise pin the VIN to the
    // fallback path for 180 days. We still emit the reason for telemetry.
    if (cacheClient && summary.confidence === 'single' && hasUsableNags) {
      await writeCachedNagsLookup(cacheClient, vinLookupKey(vin), summary, { vin: summary.vin || vin });
    }
    if (summary.confidence !== 'single') {
      reasons.push(`autobolt_confidence_${summary.confidence}`);
    } else if (!hasUsableNags) {
      reasons.push('autobolt_nags_unparseable');
    }
    return {
      resolvedFrom: summary.resolvedFrom,
      vin: summary.vin || vin,
      year: summary.year,
      make: summary.make,
      model: summary.model,
      bodyStyle: summary.bodyStyle,
      confidence: summary.confidence,
      partCount: summary.partCount,
      nags: hasUsableNags ? nagsFromPart : undefined,
      amNumber: summary.selectedPart?.amNumber,
      oemPartNumbers: summary.selectedPart?.oemPartNumbers ?? [],
      interchangeables: summary.selectedPart?.interchangeables ?? [],
      calibrations: (summary.selectedPart?.calibrations ?? []).map(c => ({
        type: c.calibrationType?.name,
        sensor: c.sensor?.name,
      })),
    };
  } catch (error) {
    if (error instanceof AutoBoltError) {
      reasons.push(`autobolt_error_${error.code.toLowerCase()}`);
      if (error.code === 'NotFound') return undefined;
      // Keep the surrounding catch in getMygrantQuoteCandidates handling auth/rate failures.
    }
    throw error;
  }
  // Plate-only fallback intentionally omitted — see comment above.
  if (plate && state) reasons.push('autobolt_plate_only_unavailable');
}

async function tryMygrantInquireByVehicle(
  input: QuotePriceInput,
  reasons: string[]
): Promise<{ items: MygrantResponseItem[]; snapshot: Record<string, unknown> }> {
  try {
    const response = await getMygrantClient().inquireByVehicle([
      {
        vehicleYear: input.vehicle.year,
        vehicleMake: input.vehicle.make,
        vehicleModel: input.vehicle.model,
      },
    ]);
    const items = response.requestItems.flatMap(item => item.responses);
    if (response.requestStatusCode && response.requestStatusCode !== '0') {
      reasons.push(`mygrant_vehicle_status_${response.requestStatusCode}`);
    }
    return {
      items,
      snapshot: {
        path: 'inquireByVehicle',
        requestStatusCode: response.requestStatusCode,
        requestStatusText: response.requestStatusText,
        responseCount: items.length,
        candidateSummary: evaluateMygrantWindshieldCandidates(items).rankedCandidates
          .slice(0, 8)
          .map(publicScoredMygrantCandidate),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    reasons.push('mygrant_vehicle_lookup_failed');
    return { items: [], snapshot: { path: 'inquireByVehicle', error: message.slice(0, 300) } };
  }
}

function buildCacheClient(): SupabaseClient | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return undefined;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function extractCachedNags(amNumber?: string) {
  if (!amNumber) return undefined;
  const cleaned = amNumber.trim().toUpperCase().replace(/[\s\-_]+/g, '');
  const match = /^([A-Z]+)(.+)$/.exec(cleaned);
  if (!match) return { prefix: '', number: cleaned, raw: amNumber };
  return { prefix: match[1], number: match[2], raw: amNumber };
}

/**
 * Calibration decision rules, in priority order:
 *   1. AutoBolt's calibrations[] is authoritative when AutoBolt resolved the VIN.
 *      Customer's form checkbox is ignored — they can't reasonably know this.
 *   2. If AutoBolt didn't run (manual mode, no VIN), use the form checkbox.
 *   3. If neither, fall back to year>=2018 (most ADAS-equipped vehicles).
 */
function shouldIncludeCalibration(
  input: QuotePriceInput,
  adasSignal?: { requiresCalibration: boolean }
): boolean {
  if (adasSignal !== undefined) return adasSignal.requiresCalibration;
  if (input.hasAdas !== undefined) return input.hasAdas;
  return input.vehicle.year >= 2018;
}

async function storeAutomatedQuote(
  input: QuotePriceInput,
  quote: CashWindshieldQuote,
  selectedPart: MygrantResponseItem | undefined,
  mygrantSnapshot: Record<string, unknown>,
  context: PersistenceContext = {}
): Promise<StoredQuoteResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return {};

  try {
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const payload = {
      status: quote.status,
      status_reason: quote.confidenceReasons.join(','),
      pricing_version: quote.pricingVersion,
      zip: input.zip || null,
      state: input.state || null,
      ip_address: context.ipAddress || null,
      user_agent: context.userAgent || null,
      plate_last4: input.plateLast4 || null,
      plate_state: input.state || null,
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
      line_items: quote.lineItems.map((item, index) => ({
        sort_order: index + 1,
        kind: item.kind,
        description: item.description,
        amount_cents: item.amountCents,
        taxable: item.taxable || false,
        vendor_part_number: selectedPart?.productId || selectedPart?.nagsNumber || null,
        metadata: item.metadata || {},
      })),
    };

    const { data, error } = await supabase
      .rpc('fn_create_automated_quote', { payload })
      .single();

    if (error || !data) {
      console.error('[quote-price] automated quote insert failed:', error?.message);
      return {};
    }

    const createdQuote = data as CreateAutomatedQuoteResult;
    return { quoteId: createdQuote.id, quoteToken: createdQuote.quote_token };
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

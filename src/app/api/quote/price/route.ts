import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getMygrantClient, type MygrantNagsInquiryItem, type MygrantResponseItem } from '@/lib/mygrant/client';
import { evaluateMygrantWindshieldCandidates, publicScoredMygrantCandidate } from '@/lib/quote/mygrant-scoring';
import { buildCashWindshieldQuote, dollarsToCents, type CashWindshieldQuote } from '@/lib/quote/pricing';
import { calculateMarkup, detectHudFromFeatures } from '@/lib/quote/markup';
import { isInServiceArea, OUT_OF_AREA_MESSAGE } from '@/lib/quote/service-area';
import { AutoBoltError, getAutoBoltClient } from '@/lib/autobolt/client';
import { plateLookupKey, readCachedNagsLookup, vinLookupKey, writeCachedNagsLookup, extractInterchangeablesFromSummary, extractPrimaryFeaturesFromSummary, type CachedNagsLookup, type InterchangeableNagsPart } from '@/lib/autobolt/cache';
import { checkCompatibility, parseAmNumberToMygrantItem } from '@/lib/quote/nags-compatibility';
import { assertEnvCoherent } from '@/lib/env';
import { classifyAdasTier, type AdasTier } from '@/lib/quote/adas-tier';
import { classifyLeadMarket } from '@/lib/market';

export const runtime = 'nodejs';

const currentYear = new Date().getFullYear() + 1;

const quotePriceSchema = z.object({
  sessionId: z.string().trim().max(100).optional().or(z.literal('')),
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
    assertEnvCoherent(); // refuse to write if NEXT_PUBLIC_APP_ENV and Supabase ref disagree
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

    // Defense-in-depth service area gate. The form blocks the submit button
    // when ZIP is out-of-area; this catches direct API callers and tests.
    if (input.zip) {
      const serviceArea = isInServiceArea(input.zip);
      if (!serviceArea.inServiceArea && serviceArea.reason === 'out_of_area') {
        return NextResponse.json(
          { error: OUT_OF_AREA_MESSAGE, reason: 'out_of_area', zip3: serviceArea.zip3 },
          { status: 422 }
        );
      }
    }

    const cacheClient = buildCacheClient();

    // Dedup: if the same session already priced this vehicle in the last 5 min,
    // return the cached result without hitting AutoBolt or Mygrant again.
    // Targets the "retry rage-click" pattern (same plate lookup failing, user
    // resubmits 2-3× in quick succession).
    if (input.sessionId && cacheClient) {
      const cached = await findRecentQuote(cacheClient, input);
      if (cached) {
        return NextResponse.json({
          success: true,
          status: cached.status,
          quoteToken: cached.quote_token,
          vehicle: {
            vin: cached.vin || input.vehicle.vin,
            year: cached.vehicle_year,
            make: cached.vehicle_make,
            model: cached.vehicle_model,
            trim: cached.vehicle_trim ?? undefined,
          },
          message: cached.status === 'manual_review'
            ? 'We found your vehicle, but this glass needs a manual price confirmation.'
            : undefined,
          confidenceReasons: cached.confidence_reasons ?? [],
        });
      }
    }

    const mygrantResult = await getMygrantQuoteCandidates(input, cacheClient);
    // Prefer the AutoBolt-resolved vehicle identity over what the form submitted,
    // since the resolved values reflect the VIN the part was priced for. If the
    // form's typed Y/M/M disagree with the decode, the customer and the lead row
    // both see the vehicle the price actually corresponds to.
    const effectiveInput = applyResolvedVehicle(input, mygrantResult.resolvedVehicle);
    const selection = evaluateMygrantWindshieldCandidates(mygrantResult.items, {
      expectedInterchangeableNagsKeys: mygrantResult.expectedInterchangeableNagsKeys,
    });
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

    const wholesaleCents = dollarsToCents(selectedPart.customerUnitPrice);
    const markupResult = calculateMarkup({
      make: effectiveInput.vehicle.make,
      model: effectiveInput.vehicle.model,
      wholesaleCents,
    });

    if (markupResult.kind === 'manual_review') {
      const confidenceReasons = [
        `exotic_brand_${markupResult.brand.toLowerCase().replace(/\s+/g, '_')}`,
        ...selection.reasons,
        ...mygrantResult.reasons,
      ];
      const stored = await storeAutomatedQuote(effectiveInput, {
        status: 'manual_review',
        pricingVersion: 'cash-windshield-v2-markup',
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
        message: `Pricing for ${markupResult.brand} is handled by our team directly. Please call (720) 918-7465 for your quote.`,
        confidenceReasons,
      });
    }

    // Per Doug 2026-05-29 + council (Codex + Gemini) tiered ADAS policy:
    //  - Mandatory tier (camera calibration with Static type): bundle the
    //    $200 line into the quote total. The customer sees the full price.
    //  - Recommended tier (Dynamic-only camera calibration): NO line in the
    //    quote. The booking confirmation email/SMS surfaces it; tech walks
    //    customer through accept/decline at install. "Convert first, sell
    //    ADAS at install."
    //  - None: no ADAS line at all.
    const adasTier: AdasTier = shouldIncludeCalibration(effectiveInput, mygrantResult.adasSignal)
      ? classifyAdasTier(mygrantResult.adasSignal?.calibrations, effectiveInput.vehicle.make)
      : 'none';
    const adasCalibrationCents = Number.parseInt(process.env.QUOTE_ADAS_CALIBRATION_CENTS || '20000', 10);
    const quote = buildCashWindshieldQuote({
      wholesaleCents,
      markupCents: markupResult.markupCents,
      calibrationCents: adasTier === 'mandatory' ? adasCalibrationCents : 0,
      minTotalCents: Number.parseInt(process.env.QUOTE_MIN_TOTAL_CENTS || '29900', 10),
    });

    const quoteWithMygrantConfidence = {
      ...quote,
      confidenceReasons: [
        ...quote.confidenceReasons,
        `markup_tier_${markupResult.tier}`,
        `adas_tier_${adasTier}`,
        ...markupResult.reasons,
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
      adasTier,
      // When tier is "recommended", the booking confirmation surfaces the
      // option at $200; the quote total stays competitive.
      adasRecommendationCents: adasTier === 'recommended' ? adasCalibrationCents : 0,
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
    sessionId: input.sessionId?.trim() || '',
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
  /**
   * Vehicle has a HUD windshield, derived from AutoBolt features[]. Drives the
   * +$75 HUD markup adder. False when AutoBolt didn't run or the response didn't
   * include features.
   */
  hasHud: boolean;
  /**
   * NAGS keys (e.g. {'DW01881', 'DW01668', 'DW02479'}) the route intentionally
   * batched into Mygrant inquireByNags because AutoBolt declared them
   * interchangeable for this vehicle. Passed to evaluateMygrantWindshieldCandidates
   * so its ambiguity check doesn't trip on price competition between expected
   * interchangeables. Empty when no interchangeable batch ran.
   */
  expectedInterchangeableNagsKeys: ReadonlySet<string>;
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
  let expectedInterchangeableNagsKeys: Set<string> | undefined;

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
    // Build the NAGS query set: primary + functionally-compatible interchangeables.
    // The compatibility filter (per the 2026-05-27 council review) drops only
    // cosmetic-equivalent variants — anything missing a functional feature the
    // primary needed (ADAS, acoustic, heated wiper, HUD, etc.) is rejected so
    // we never substitute down a customer's actual driving experience.
    //
    // AutoBolt's amNumber encodes color, hardware, and premium indicator as a
    // trailing suffix (e.g. "DW02544GTYN" → color=GT, hw=Y, prem=N). Mygrant
    // requires these as separate XML fields; passing them inside nagsNumber
    // causes Mygrant to hang on parts it carries but can only find via the
    // split fields. parseAmNumberToMygrantItem handles the split.
    const nagsQuery: MygrantNagsInquiryItem[] = [
      parseAmNumberToMygrantItem(nagsLookup.amNumber) ?? { nagsPrefix: nagsLookup.nags.prefix, nagsNumber: nagsLookup.nags.number },
    ];
    const interchangeableCandidates: InterchangeableNagsPart[] = nagsLookup.interchangeableParts ?? [];
    const compatibilityLog: Array<{ amNumber: string; compatible: boolean; missingFunctional: string[] }> = [];
    for (const part of interchangeableCandidates) {
      const check = checkCompatibility(nagsLookup.primaryFeatures ?? [], part.features ?? []);
      compatibilityLog.push({
        amNumber: part.amNumber,
        compatible: check.compatible,
        missingFunctional: check.missingFunctionalFeatures,
      });
      if (check.compatible) {
        nagsQuery.push(
          parseAmNumberToMygrantItem(part.amNumber) ?? { nagsPrefix: part.nags.prefix, nagsNumber: part.nags.number }
        );
      }
    }
    if (nagsQuery.length > 1) {
      reasons.push(`interchangeable_nags_queried_${nagsQuery.length}`);
    }
    if (compatibilityLog.some(c => !c.compatible)) {
      reasons.push('interchangeable_nags_filtered_for_feature_compat');
    }
    expectedInterchangeableNagsKeys = new Set(
      nagsQuery.map(q => `${q.nagsPrefix}${q.nagsNumber}`)
    );

    try {
      const response = await getMygrantClient().inquireByNags(nagsQuery);
      nagsItems = response.requestItems.flatMap(item => item.responses);
      if (response.requestStatusCode && response.requestStatusCode !== '0') {
        reasons.push(`mygrant_status_${response.requestStatusCode}`);
      }
      nagsMygrantSnapshot = {
        path: 'inquireByNags',
        requestStatusCode: response.requestStatusCode,
        requestStatusText: response.requestStatusText,
        nagsQueried: nagsQuery,
        interchangeableCompatibility: compatibilityLog,
        responseCount: nagsItems.length,
        candidateSummary: evaluateMygrantWindshieldCandidates(nagsItems, {
          expectedInterchangeableNagsKeys,
        }).rankedCandidates
          .slice(0, 8)
          .map(publicScoredMygrantCandidate),
      };
      // Determine which NAGS the route ultimately selected (may be primary or
      // an interchangeable). The scoring already runs across all candidates;
      // we re-derive the selection here for telemetry.
      const selection = evaluateMygrantWindshieldCandidates(nagsItems, {
        expectedInterchangeableNagsKeys,
      });
      const selectedPrefix = selection.selectedPart?.nagsPrefix || nagsLookup.nags.prefix;
      const selectedNumber = selection.selectedPart?.nagsNumber || nagsLookup.nags.number;
      vehicleNagsForReturn = {
        prefix: selectedPrefix,
        number: selectedNumber,
        amNumber: nagsLookup.amNumber,
      };
      if (selectedPrefix !== nagsLookup.nags.prefix || selectedNumber !== nagsLookup.nags.number) {
        reasons.push(`interchangeable_${selectedPrefix}${selectedNumber}_chosen_over_${nagsLookup.nags.prefix}${nagsLookup.nags.number}`);
      }
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
    hasHud: nagsLookup?.hasHud === true,
    expectedInterchangeableNagsKeys: expectedInterchangeableNagsKeys ?? new Set<string>(),
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
      hasHud: detectHudFromFeatures(summary.selectedPart?.features),
      interchangeableParts: extractInterchangeablesFromSummary(summary),
      primaryFeatures: extractPrimaryFeaturesFromSummary(summary),
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

async function findRecentQuote(
  supabase: SupabaseClient,
  input: QuotePriceInput
): Promise<{ quote_token: string; status: string; vehicle_year: number; vehicle_make: string; vehicle_model: string; vehicle_trim: string | null; vin: string | null; confidence_reasons: string[] | null } | null> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('automated_quotes')
    .select('quote_token, status, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vin, confidence_reasons')
    .eq('session_id', input.sessionId!)
    .eq('vehicle_year', input.vehicle.year)
    .eq('vehicle_make', input.vehicle.make)
    .eq('vehicle_model', input.vehicle.model)
    .gte('created_at', fiveMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
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
      market: classifyLeadMarket({ state: input.state || null, zip: input.zip || null }) || null,
      session_id: input.sessionId || null,
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

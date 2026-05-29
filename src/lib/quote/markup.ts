/**
 * Pricing markup engine for the auto-quoter.
 *
 * Replaces the legacy labor+supplies+minimum-floor line items with a single
 * markup-over-wholesale formula. Customer sees "Windshield + install" as one
 * line (wholesale + markup combined); calibration stays on its own line.
 *
 * Rule precedence:
 *   1. Exotic brand → return MANUAL_REVIEW; the quote route bails to the
 *      manual-review path before showing a price.
 *   2. Otherwise, take the MAX of:
 *        - brand-tier markup ($200 non-luxury / $100 Tier 1 / $200 Tier 2)
 *        - wholesale-threshold markup ($200 / $250 / $300 / $400 by band)
 *        - effective tier markup = max(brandTier, threshold), so the
 *          threshold-floor dominates Tier 1/2 in most bands. Intent:
 *          Tier 1/2 trigger lookups + reasons, but the floor keeps prices
 *          from going below the wholesale-threshold cost-recovery line.
 *   3. Add +$100 if heavy-duty / commercial vehicle.
 *   4. Add +$75 if vehicle has a HUD windshield (any brand).
 *
 * Light truck / SUV gets +$0 (volume play — bread-and-butter jobs aren't
 * taxed for being trucks).
 *
 * All amounts are in cents.
 */

export const PRICING_RULES_VERSION = 'markup-v1';

export type MarkupResult =
  | { kind: 'priced'; markupCents: number; tier: PricingTier; reasons: string[] }
  | { kind: 'manual_review'; reason: 'exotic_brand'; brand: string };

export type PricingTier = 'non_luxury' | 'tier1' | 'tier2';

export interface MarkupInput {
  /** Vehicle make as returned by AutoBolt (canonical) or form input (fallback). */
  make: string;
  /** Vehicle model — needed for heavy-duty / commercial detection. */
  model: string;
  /** Mygrant customer unit price in cents — drives the threshold rule. */
  wholesaleCents: number;
  /** True if AutoBolt's features[] includes a heads-up display indicator. */
  hasHud: boolean;
}

const TIER1_LUXURY = new Set([
  'audi',
  'bmw',
  'mercedes',
  'mercedes-benz',
  'lexus',
  'acura',
  'cadillac',
  'infiniti',
  'lincoln',
  'volvo',
]);

const TIER2_BOUNDARY = new Set([
  'tesla',
  'porsche',
  'genesis',
  'jaguar',
  'land rover',
  'land-rover',
  'range rover',
  'range-rover',
]);

const EXOTIC_BRANDS = new Set([
  'maserati',
  'bentley',
  'rolls',
  'rolls-royce',
  'rolls royce',
  'aston martin',
  'aston-martin',
  'mclaren',
  'lamborghini',
  'lucid',
  'polestar',
]);

/**
 * Heavy-duty / commercial model identifiers. Match is substring on the
 * normalized model string so trims like "F-250 XLT" or "Sprinter 2500" still
 * resolve to heavy-duty.
 */
const HEAVY_DUTY_MODEL_PATTERNS = [
  'f-250',
  'f250',
  'f-350',
  'f350',
  'f-450',
  'f450',
  'f-550',
  'f550',
  'silverado 2500',
  'silverado 3500',
  'sierra 2500',
  'sierra 3500',
  'ram 2500',
  'ram 3500',
  'ram 4500',
  'ram 5500',
  'sprinter',
  'transit',
  'promaster',
  'nv200',
  'nv2500',
  'nv3500',
  'savana',
  'express',
] as const;

const BASE_MARKUP_CENTS = 20_000;
const TIER1_MARKUP_CENTS = 10_000;
const TIER2_MARKUP_CENTS = 20_000;
const HEAVY_DUTY_ADDER_CENTS = 10_000;
const HUD_ADDER_CENTS = 7_500;

const THRESHOLD_BREAKPOINTS_CENTS = [
  { ceiling: 25_000, markupCents: 20_000 },
  { ceiling: 40_000, markupCents: 25_000 },
  { ceiling: 60_000, markupCents: 30_000 },
  { ceiling: Number.POSITIVE_INFINITY, markupCents: 40_000 },
] as const;

export function calculateMarkup(input: MarkupInput): MarkupResult {
  const normalizedMake = normalizeBrand(input.make);
  const normalizedModel = normalizeModel(input.model);

  if (EXOTIC_BRANDS.has(normalizedMake)) {
    return { kind: 'manual_review', reason: 'exotic_brand', brand: input.make };
  }

  const reasons: string[] = [];
  let tier: PricingTier = 'non_luxury';
  let brandMarkup = BASE_MARKUP_CENTS;

  if (TIER1_LUXURY.has(normalizedMake)) {
    tier = 'tier1';
    brandMarkup = TIER1_MARKUP_CENTS;
    reasons.push('brand_tier1');
  } else if (TIER2_BOUNDARY.has(normalizedMake)) {
    tier = 'tier2';
    brandMarkup = TIER2_MARKUP_CENTS;
    reasons.push('brand_tier2');
  }

  const thresholdMarkup = resolveThresholdMarkup(input.wholesaleCents);
  if (thresholdMarkup > brandMarkup) {
    reasons.push(`wholesale_threshold_${thresholdMarkup / 100}`);
  }

  let markupCents = Math.max(brandMarkup, thresholdMarkup);

  if (isHeavyDuty(normalizedModel)) {
    markupCents += HEAVY_DUTY_ADDER_CENTS;
    reasons.push('heavy_duty_adder');
  }

  if (input.hasHud) {
    markupCents += HUD_ADDER_CENTS;
    reasons.push('hud_adder');
  }

  return { kind: 'priced', markupCents, tier, reasons };
}

function normalizeBrand(make: string): string {
  return make.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeModel(model: string): string {
  return model.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isHeavyDuty(normalizedModel: string): boolean {
  return HEAVY_DUTY_MODEL_PATTERNS.some(pattern => normalizedModel.includes(pattern));
}

function resolveThresholdMarkup(wholesaleCents: number): number {
  for (const band of THRESHOLD_BREAKPOINTS_CENTS) {
    if (wholesaleCents < band.ceiling) return band.markupCents;
  }
  return BASE_MARKUP_CENTS;
}

/**
 * Detect HUD from AutoBolt's features[] array. Match is by feature name
 * substring to tolerate vendor naming variations (e.g. "Heads-Up Display",
 * "Head Up Display", "HUD"). featureId comparison would be more robust if
 * AutoBolt publishes a stable HUD feature ID; until then, name-based match.
 */
export function detectHudFromFeatures(
  features: ReadonlyArray<{ name: string }> | undefined
): boolean {
  if (!features || features.length === 0) return false;
  return features.some(f => {
    const name = f.name?.toLowerCase() ?? '';
    return name.includes('heads up') || name.includes('heads-up') || name === 'hud' || name.includes('head up display');
  });
}

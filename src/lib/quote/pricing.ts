/**
 * Customer-facing pricing builder for the auto-quoter.
 *
 * Wholesale + markup combine into a single "Windshield + install" line item
 * so the customer sees one price for the glass-plus-labor portion. Calibration
 * stays on its own line so the surcharge is visible. Pre-tax — the form
 * appends a "+ sales tax at install" note out of band.
 *
 * Markup math lives in markup.ts; this module is responsible only for the
 * shape of the customer-facing quote and persistence-ready line items.
 */

export const CASH_WINDSHIELD_PRICING_VERSION = 'cash-windshield-v3-min-floor';

export type QuoteStatus = 'ready_exact' | 'ready_estimate' | 'manual_review';

export interface QuoteLineItem {
  kind: 'windshield_install' | 'calibration';
  description: string;
  amountCents: number;
  taxable?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CashWindshieldPricingInput {
  /** Mygrant customer unit price in cents. */
  wholesaleCents: number;
  /** Markup in cents, computed by calculateMarkup. */
  markupCents: number;
  /** Calibration price in cents when ADAS is required. Omit or 0 to skip. */
  calibrationCents?: number;
  /**
   * Minimum customer-facing total in cents. When the computed total falls
   * below this floor, the windshield+install line is silently inflated so
   * the customer-facing total equals the floor. Floor adjustment is
   * recorded in the line's metadata for audit. Omit or 0 to disable.
   */
  minTotalCents?: number;
}

export interface CashWindshieldQuote {
  status: QuoteStatus;
  pricingVersion: string;
  totalCents: number;
  lineItems: QuoteLineItem[];
  confidenceReasons: string[];
}

export function buildCashWindshieldQuote(input: CashWindshieldPricingInput): CashWindshieldQuote {
  if (!Number.isFinite(input.wholesaleCents) || input.wholesaleCents <= 0) {
    return {
      status: 'manual_review',
      pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
      totalCents: 0,
      lineItems: [],
      confidenceReasons: ['missing_or_invalid_wholesale_cost'],
    };
  }
  if (!Number.isFinite(input.markupCents) || input.markupCents < 0) {
    return {
      status: 'manual_review',
      pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
      totalCents: 0,
      lineItems: [],
      confidenceReasons: ['missing_or_invalid_markup'],
    };
  }
  if (input.calibrationCents !== undefined && (!Number.isFinite(input.calibrationCents) || input.calibrationCents < 0)) {
    return {
      status: 'manual_review',
      pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
      totalCents: 0,
      lineItems: [],
      confidenceReasons: ['invalid_calibration_amount'],
    };
  }

  const windshieldInstallCents = Math.round(input.wholesaleCents + input.markupCents);
  const lineItems: QuoteLineItem[] = [
    {
      kind: 'windshield_install',
      description: 'Windshield + install',
      amountCents: windshieldInstallCents,
      taxable: true,
      metadata: {
        wholesaleCents: Math.round(input.wholesaleCents),
        markupCents: Math.round(input.markupCents),
      },
    },
  ];

  const calibrationCents = input.calibrationCents ?? 0;
  if (calibrationCents > 0) {
    lineItems.push({
      kind: 'calibration',
      description: 'ADAS calibration',
      amountCents: Math.round(calibrationCents),
      taxable: false,
    });
  }

  let totalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);

  // Minimum total floor (per Doug 2026-05-28). If the computed total is
  // below the configured floor, silently inflate the windshield+install
  // line so the customer-facing total equals the floor. Adjustment recorded
  // in the line's metadata so Pink ops can still see the original wholesale
  // and markup math in the saved quote row.
  const minTotalCents = input.minTotalCents ?? 0;
  let floorAdjustmentCents = 0;
  if (minTotalCents > 0 && totalCents < minTotalCents) {
    floorAdjustmentCents = minTotalCents - totalCents;
    const windshieldLine = lineItems[0];
    windshieldLine.amountCents += floorAdjustmentCents;
    windshieldLine.metadata = {
      ...(windshieldLine.metadata ?? {}),
      floorAdjustmentCents,
      preFloorAmountCents: windshieldLine.amountCents - floorAdjustmentCents,
    };
    totalCents = minTotalCents;
  }

  return {
    status: 'ready_exact',
    pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
    totalCents,
    lineItems,
    confidenceReasons: [
      'markup_pricing_formula',
      ...(calibrationCents > 0 ? ['calibration_included'] : []),
      ...(floorAdjustmentCents > 0 ? [`minimum_total_floor_applied_${floorAdjustmentCents}c`] : []),
    ],
  };
}

export function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

export function centsToDollars(value: number): number {
  return Math.round(value) / 100;
}

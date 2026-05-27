export const CASH_WINDSHIELD_PRICING_VERSION = 'cash-windshield-v1';

export type QuoteStatus = 'ready_exact' | 'ready_estimate' | 'manual_review';

export interface QuoteLineItem {
  kind: 'glass' | 'labor' | 'supplies' | 'mobile_service' | 'calibration' | 'tax' | 'margin_adjustment';
  description: string;
  amountCents: number;
  taxable?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CashWindshieldPricingInput {
  glassCostCents: number;
  laborCents?: number;
  suppliesCents?: number;
  mobileServiceCents?: number;
  calibrationCents?: number;
  taxRate?: number;
  minimumQuoteCents?: number;
}

export interface CashWindshieldQuote {
  status: QuoteStatus;
  pricingVersion: string;
  totalCents: number;
  lineItems: QuoteLineItem[];
  confidenceReasons: string[];
}

const DEFAULT_LABOR_CENTS = 17500;
const DEFAULT_SUPPLIES_CENTS = 4500;
const DEFAULT_MOBILE_SERVICE_CENTS = 0;
const DEFAULT_MINIMUM_QUOTE_CENTS = 29900;

export function buildCashWindshieldQuote(input: CashWindshieldPricingInput): CashWindshieldQuote {
  if (!Number.isFinite(input.glassCostCents) || input.glassCostCents <= 0) {
    return {
      status: 'manual_review',
      pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
      totalCents: 0,
      lineItems: [],
      confidenceReasons: ['missing_or_invalid_glass_cost'],
    };
  }

  const invalidOptional = [
    input.laborCents,
    input.suppliesCents,
    input.mobileServiceCents,
    input.calibrationCents,
    input.taxRate,
    input.minimumQuoteCents,
  ].some(value => value !== undefined && !Number.isFinite(value));
  if (invalidOptional) {
    return {
      status: 'manual_review',
      pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
      totalCents: 0,
      lineItems: [],
      confidenceReasons: ['invalid_pricing_input'],
    };
  }

  const lineItems: QuoteLineItem[] = [
    {
      kind: 'glass',
      description: 'Windshield glass',
      amountCents: Math.round(input.glassCostCents),
      taxable: true,
    },
    {
      kind: 'labor',
      description: 'Mobile windshield installation labor',
      amountCents: input.laborCents ?? DEFAULT_LABOR_CENTS,
      taxable: false,
    },
    {
      kind: 'supplies',
      description: 'Urethane, primer, molding, clips, and shop supplies',
      amountCents: input.suppliesCents ?? DEFAULT_SUPPLIES_CENTS,
      taxable: true,
    },
  ];

  const mobileServiceCents = input.mobileServiceCents ?? DEFAULT_MOBILE_SERVICE_CENTS;
  if (mobileServiceCents > 0) {
    lineItems.push({
      kind: 'mobile_service',
      description: 'Mobile service',
      amountCents: mobileServiceCents,
      taxable: false,
    });
  }

  if (input.calibrationCents && input.calibrationCents > 0) {
    lineItems.push({
      kind: 'calibration',
      description: 'ADAS calibration',
      amountCents: input.calibrationCents,
      taxable: false,
    });
  }

  const taxRate = input.taxRate ?? 0;
  if (taxRate > 0) {
    const taxableSubtotal = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.amountCents, 0);
    const taxCents = Math.round(taxableSubtotal * taxRate);
    if (taxCents > 0) {
      lineItems.push({
        kind: 'tax',
        description: 'Estimated tax on taxable parts and supplies',
        amountCents: taxCents,
        taxable: false,
      });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  const minimumQuoteCents = input.minimumQuoteCents ?? DEFAULT_MINIMUM_QUOTE_CENTS;
  let minimumFloorApplied = false;
  if (subtotal < minimumQuoteCents) {
    minimumFloorApplied = true;
    lineItems.push({
      kind: 'margin_adjustment',
      description: 'Minimum installed price adjustment',
      amountCents: minimumQuoteCents - subtotal,
      taxable: false,
    });
  }

  return {
    status: input.calibrationCents && input.calibrationCents > 0 ? 'ready_estimate' : 'ready_exact',
    pricingVersion: CASH_WINDSHIELD_PRICING_VERSION,
    totalCents: lineItems.reduce((sum, item) => sum + item.amountCents, 0),
    lineItems,
    confidenceReasons: [
      input.calibrationCents && input.calibrationCents > 0
        ? 'calibration_included_as_estimate'
        : 'single_part_cash_windshield_formula',
      ...(minimumFloorApplied ? ['minimum_floor_applied'] : []),
    ],
  };
}

export function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

export function centsToDollars(value: number): number {
  return Math.round(value) / 100;
}

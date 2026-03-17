/**
 * Shared metric formulas for all admin dashboard reports.
 *
 * Every report that computes ROAS, CPL, ROI, or attribution rate
 * MUST use these functions to ensure cross-report consistency.
 *
 * ── DEFINITIONS ────────────────────────────────────────────────
 *
 * ROAS  = Attributed Revenue ÷ Ad Spend  (ad efficiency — revenue per dollar spent)
 * CPL   = Ad Spend ÷ Qualifying Leads    (acquisition cost per lead)
 * ROI   = (Revenue - Cost) ÷ Cost        (business profitability as a ratio)
 * Attribution Rate = Attributed Revenue ÷ Gross Revenue × 100
 */

// ── Formulas ──────────────────────────────────────────────────

/** Return on Ad Spend: attributed revenue per dollar of ad spend */
export function calcROAS(attributedRevenue: number, adSpend: number): number | null {
  if (adSpend <= 0) return null;
  return attributedRevenue / adSpend;
}

/** Cost Per Lead: ad spend divided by qualifying lead count */
export function calcCPL(adSpend: number, leadCount: number): number | null {
  if (leadCount <= 0) return null;
  return adSpend / leadCount;
}

/** Business ROI: profit as a multiple of cost — (revenue - cost) / cost */
export function calcROI(revenue: number, cost: number): number | null {
  if (cost <= 0) return null;
  return (revenue - cost) / cost;
}

/** Attribution rate: what % of gross revenue is linked to a lead source */
export function calcAttributionRate(attributedRevenue: number, grossRevenue: number): number {
  if (grossRevenue <= 0) return 0;
  return parseFloat(((attributedRevenue / grossRevenue) * 100).toFixed(1));
}

/** Profit margin: profit as a % of revenue */
export function calcProfitMargin(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return parseFloat((((revenue - cost) / revenue) * 100).toFixed(1));
}


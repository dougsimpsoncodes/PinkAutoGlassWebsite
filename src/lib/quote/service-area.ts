/**
 * Service area gate for the auto-quoter.
 *
 * Per Dan's 2026-05-27 rule walkthrough: out-of-area customers are blocked at
 * ZIP entry rather than quoted with a "we don't serve you" message. Inside
 * the service area, there is no distance-based mobile fee — the whitelist
 * itself is the gate.
 *
 * The matcher is intentionally coarse (ZIP first-3 digits) so we don't have
 * to ship a 100-entry ZIP table. Edge cases the prefix model misses can be
 * resolved by Pink staff on the phone — the gate's job is to filter the
 * NYC-customer noise, not to be a perfectly tight boundary.
 */

const CO_FRONT_RANGE_ZIP3 = new Set([
  '800', // Denver metro core
  '801', // Denver metro
  '802', // Denver metro
  '803', // Boulder, Broomfield, north metro
  '804', // (currently unassigned; reserved)
  '805', // Fort Collins, Loveland, Greeley, north
  '806', // Greeley, Brighton, NE plains-edge cities we serve
  '808', // Colorado Springs metro
  '809', // Colorado Springs metro
]);

const PHOENIX_METRO_ZIP3 = new Set([
  '850', // Phoenix, north
  '851', // West Valley pieces
  '852', // Mesa, Tempe, Scottsdale, Chandler
  '853', // East/SE Valley (Gilbert), West Valley (Glendale, Peoria, Surprise)
]);

export interface ServiceAreaCheckResult {
  inServiceArea: boolean;
  /**
   * Reason the ZIP was rejected. Empty when inServiceArea === true.
   * Surfaced in confidence_reasons for ops auditing.
   */
  reason?: 'invalid_zip' | 'out_of_area';
  /** Three-digit ZIP prefix that drove the decision (5-digit ZIPs only). */
  zip3?: string;
}

export function isInServiceArea(rawZip: string): ServiceAreaCheckResult {
  const zip = rawZip.trim();
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    return { inServiceArea: false, reason: 'invalid_zip' };
  }
  const zip3 = zip.slice(0, 3);
  if (CO_FRONT_RANGE_ZIP3.has(zip3) || PHOENIX_METRO_ZIP3.has(zip3)) {
    return { inServiceArea: true, zip3 };
  }
  return { inServiceArea: false, reason: 'out_of_area', zip3 };
}

export const OUT_OF_AREA_MESSAGE =
  'Sorry, we serve Colorado Front Range and Phoenix metro only. Enter a ZIP in our service area to continue.';

/**
 * State-level service-area gate. Used by the quote form when only the plate
 * state is known (no ZIP yet). Accepts CO and AZ; everything else is
 * out-of-area. Less precise than isInServiceArea(ZIP) — admits some AZ
 * customers from Tucson/Flagstaff — but trades that for not gating CO/AZ
 * customers behind a separate ZIP step at the top of the funnel. The
 * booking step's ZIP entry catches the false positives downstream.
 */
const SERVED_STATES = new Set(['CO', 'AZ']);

export function isStateInServiceArea(rawState: string | undefined | null): boolean {
  if (!rawState) return false;
  return SERVED_STATES.has(rawState.trim().toUpperCase());
}

export const OUT_OF_AREA_STATE_MESSAGE =
  'Sorry, Pink Auto Glass serves Colorado and Arizona only. Call (720) 918-7465 if you need a referral.';

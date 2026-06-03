import type { SatelliteQuoterMarketHint, SatelliteQuoterMode } from './config';

/**
 * Minimal tracking context contract for shared satellite quoter usage.
 *
 * This does not prescribe destinations or event wiring yet. It simply defines
 * the normalized context shape that shared quoter code can attach to wrapper-
 * level and funnel-level events.
 */
export interface SatelliteQuoterTrackingContext {
  siteKey: string;
  mode: SatelliteQuoterMode;
  utmSource?: string;
  marketHint?: SatelliteQuoterMarketHint;
  surface?: string;
}


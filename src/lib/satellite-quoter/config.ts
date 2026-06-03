export type SatelliteQuoterMode = 'standard' | 'zip-first';

export type SatelliteQuoterMarketHint = 'colorado' | 'arizona' | 'national';

export interface SatelliteQuoterWrapperCopy {
  headline?: string;
  subhead?: string;
  startLabel?: string;
  zipTitle?: string;
  zipBody?: string;
  zipCta?: string;
  quoteCardTitle?: string;
  quoteCardBody?: string;
}

/**
 * Minimal shared config contract for satellite quoter consumers.
 *
 * Keep this intentionally small at first. It defines only the fields we know
 * vary today between satellite experiences and leaves room to expand later
 * without forcing per-site logic forks.
 */
export interface SatelliteQuoterConfig {
  mode: SatelliteQuoterMode;
  siteKey: string;
  marketHint?: SatelliteQuoterMarketHint;
  utmSource?: string;
  wrapperCopy?: SatelliteQuoterWrapperCopy;
  styleVariant?: 'standard' | 'compact' | 'hero';
  [key: string]: unknown;
}


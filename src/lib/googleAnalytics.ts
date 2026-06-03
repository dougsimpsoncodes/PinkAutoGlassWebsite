/**
 * Google Analytics 4 (GA4) Data API helpers.
 * Used by the satellite-domains admin route to enrich GSC data with real session counts.
 *
 * Auth: Service account key via GOOGLE_ANALYTICS_CREDENTIALS (JSON string) or
 *       individual GOOGLE_ANALYTICS_CLIENT_EMAIL + GOOGLE_ANALYTICS_PRIVATE_KEY env vars.
 * Property: GOOGLE_ANALYTICS_PROPERTY_ID (numeric GA4 property ID, e.g. "123456789").
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface Ga4HostnameRow {
  hostName: string;
  sessions: number;
  pageViews: number;
  conversions: number;
}

export interface Ga4ConfigCheck {
  isValid: boolean;
  missingVars: string[];
}

/** Validate that required GA4 env vars are present before making API calls. */
export function validateGoogleAnalyticsConfig(): Ga4ConfigCheck {
  const missing: string[] = [];
  if (!process.env.GOOGLE_ANALYTICS_PROPERTY_ID) missing.push('GOOGLE_ANALYTICS_PROPERTY_ID');

  const hasCredentials =
    process.env.GOOGLE_ANALYTICS_CREDENTIALS ||
    (process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL && process.env.GOOGLE_ANALYTICS_PRIVATE_KEY);
  if (!hasCredentials) missing.push('GOOGLE_ANALYTICS_CREDENTIALS (or CLIENT_EMAIL + PRIVATE_KEY)');

  return { isValid: missing.length === 0, missingVars: missing };
}

function getAnalyticsClient(): BetaAnalyticsDataClient {
  if (process.env.GOOGLE_ANALYTICS_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS);
    return new BetaAnalyticsDataClient({ credentials });
  }
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
  });
}

// Cities confirmed as bot/crawler traffic (near-zero engagement, known data center locations).
// Excluded from all GA4 queries so our reports reflect real customer traffic only.
// Boardman OR = AWS us-west-2; Ashburn VA = AWS us-east-1; Singapore/Burnaby = cloud crawlers.
// Council Bluffs IA = Lumen/CDN data center (52 sessions, 13% engagement).
// Aspen CO = anomalous (34 sessions, 3% engagement, 0.57s avg — not a real customer market).
// Virginia (not set) = AWS/cloud unresolved region (109 sessions, 0.9% engagement).
const BOT_CITIES = [
  'Boardman', 'Ashburn', 'Singapore', 'Burnaby',
  'Council Bluffs', 'Aspen', 'Virginia',
];

/**
 * Fetch sessions, pageViews, and conversions from GA4 for a list of hostnames.
 * Returns one row per hostname that had activity in the given date range.
 * Bot cities (Boardman/Ashburn AWS data centers, Singapore, Burnaby) are always excluded.
 */
export async function fetchGa4HostnameMetrics(
  startDate: string,
  endDate: string,
  hostNames: string[]
): Promise<Ga4HostnameRow[]> {
  if (!hostNames.length) return [];

  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID!;
  const client = getAnalyticsClient();

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'hostName' }],
    metrics: [
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'conversions' },
    ],
    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'hostName',
              inListFilter: { values: hostNames },
            },
          },
          {
            notExpression: {
              filter: {
                fieldName: 'city',
                inListFilter: { values: BOT_CITIES },
              },
            },
          },
        ],
      },
    },
  });

  return (response.rows ?? []).map((row) => ({
    hostName: row.dimensionValues?.[0]?.value ?? '',
    sessions: parseInt(row.metricValues?.[0]?.value ?? '0', 10),
    pageViews: parseInt(row.metricValues?.[1]?.value ?? '0', 10),
    conversions: parseInt(row.metricValues?.[2]?.value ?? '0', 10),
  }));
}

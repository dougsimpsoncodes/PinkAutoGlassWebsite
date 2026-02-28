/**
 * Google Business Profile API Integration
 *
 * Fetches call metrics from GBP (calls from Maps/Search knowledge panel).
 * Uses the Business Profile Performance API via googleapis package.
 *
 * Required env vars:
 * - GBP_REFRESH_TOKEN (obtained via /api/gsc-reauth with gbp scope)
 * - GBP_ACCOUNT_ID (from GBP dashboard)
 * - GBP_LOCATION_ID (from GBP dashboard)
 * - GOOGLE_ADS_CLIENT_ID (shared OAuth client)
 * - GOOGLE_ADS_CLIENT_SECRET (shared OAuth client)
 */

import { google } from 'googleapis';

export function validateGBPConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'GBP_REFRESH_TOKEN',
    'GBP_ACCOUNT_ID',
    'GBP_LOCATION_ID',
  ];

  // OAuth client ID/secret shared with Google Ads
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;

  const missingVars = requiredVars.filter(v => !process.env[v]?.trim());
  if (!clientId) missingVars.push('GOOGLE_ADS_CLIENT_ID');
  if (!clientSecret) missingVars.push('GOOGLE_ADS_CLIENT_SECRET');

  return { isValid: missingVars.length === 0, missingVars };
}

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GBP_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export interface GBPCallMetric {
  date: string;
  totalCalls: number;
  missedCalls: number;
  answeredCalls: number;
  callsUnder30s: number;
  calls30sTo120s: number;
  callsOver120s: number;
  rawData: Record<string, unknown>;
}

/**
 * Fetch call metrics from Google Business Profile Performance API.
 *
 * Uses the `businessprofileperformance` API to get BUSINESS_PHONE_CALLS metrics.
 * Falls back gracefully if the API returns no data or isn't available.
 */
export async function fetchGBPCallMetrics(
  startDate: string,
  endDate: string
): Promise<GBPCallMetric[]> {
  const auth = getOAuth2Client();
  const locationId = process.env.GBP_LOCATION_ID!;

  // Use the Business Profile Performance API
  // Endpoint: GET /v1/locations/{location}/searchkeywords/impressions/monthly
  // For phone calls, we use the getDailyMetricsTimeSeries endpoint
  const locationName = `locations/${locationId}`;

  try {
    // The Business Profile Performance API provides daily metrics
    const response = await google.businessprofileperformance({
      version: 'v1',
      auth,
    }).locations.getDailyMetricsTimeSeries({
      name: locationName,
      dailyMetric: 'BUSINESS_PHONE_CALLS',
      'dailyRange.startDate.year': parseInt(startDate.split('-')[0]),
      'dailyRange.startDate.month': parseInt(startDate.split('-')[1]),
      'dailyRange.startDate.day': parseInt(startDate.split('-')[2]),
      'dailyRange.endDate.year': parseInt(endDate.split('-')[0]),
      'dailyRange.endDate.month': parseInt(endDate.split('-')[1]),
      'dailyRange.endDate.day': parseInt(endDate.split('-')[2]),
    });

    const timeSeries = response.data?.timeSeries;
    if (!timeSeries?.datedValues || timeSeries.datedValues.length === 0) {
      console.log('📞 GBP: No call metrics data returned');
      return [];
    }

    return timeSeries.datedValues.map((entry: any) => {
      const date = entry.date;
      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      const totalCalls = parseInt(entry.value || '0');

      return {
        date: dateStr,
        totalCalls,
        // GBP daily metrics only provides total count, not missed/answered breakdown
        // Those come from the insights API which requires different access
        missedCalls: 0,
        answeredCalls: totalCalls,
        callsUnder30s: 0,
        calls30sTo120s: 0,
        callsOver120s: 0,
        rawData: entry,
      };
    });
  } catch (error: any) {
    // If the API isn't available or returns an error, log and return empty
    console.error('GBP call metrics fetch failed:', error.message);
    if (error.code === 403) {
      console.error('GBP: Permission denied. Ensure business.manage scope is authorized.');
    }
    throw error;
  }
}

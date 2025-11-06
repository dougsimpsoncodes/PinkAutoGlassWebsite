/**
 * Google Search Console API Integration
 * Fetches organic search performance data (impressions, clicks, queries)
 *
 * Setup Instructions:
 * 1. Enable Search Console API: https://console.cloud.google.com/apis/library/searchconsole.googleapis.com
 * 2. Create OAuth credentials (same as Google Ads if using same project)
 * 3. Add environment variables to .env.local:
 *    - GOOGLE_SEARCH_CONSOLE_CLIENT_ID (can reuse GOOGLE_ADS_CLIENT_ID)
 *    - GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET (can reuse GOOGLE_ADS_CLIENT_SECRET)
 *    - GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN
 *    - GOOGLE_SEARCH_CONSOLE_SITE_URL (e.g., https://pinkautoglass.com)
 *
 * Documentation: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 */

import { google } from 'googleapis';

// Google Search Console API configuration
const GSC_CLIENT_ID = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
const GSC_CLIENT_SECRET = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
const GSC_REFRESH_TOKEN = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;
const GSC_SITE_URL = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || 'https://pinkautoglass.com';

/**
 * Validate that all required Google Search Console credentials are configured
 */
export function validateSearchConsoleConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = ['CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'];
  const missingVars: string[] = [];

  if (!GSC_CLIENT_ID) missingVars.push('GOOGLE_SEARCH_CONSOLE_CLIENT_ID or GOOGLE_ADS_CLIENT_ID');
  if (!GSC_CLIENT_SECRET) missingVars.push('GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET or GOOGLE_ADS_CLIENT_SECRET');
  if (!GSC_REFRESH_TOKEN) missingVars.push('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN');

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Create and return authenticated Google Search Console API client
 */
function getSearchConsoleClient() {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    throw new Error(
      `Missing required Google Search Console credentials: ${config.missingVars.join(', ')}`
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    GSC_CLIENT_ID,
    GSC_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: GSC_REFRESH_TOKEN,
  });

  return google.searchconsole({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetch overall site performance (daily aggregated impressions and clicks)
 */
export async function fetchDailyPerformance(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<any[]> {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    console.warn('Google Search Console credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 25000,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    return response.data.rows.map((row: any) => ({
      date: row.keys[0],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    }));
  } catch (error) {
    console.error('Error fetching Search Console daily performance:', error);
    throw error;
  }
}

/**
 * Fetch page-level performance data
 */
export async function fetchPagePerformance(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    console.warn('Google Search Console credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date', 'page', 'device'],
        rowLimit: 25000,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    return response.data.rows.map((row: any) => ({
      date: row.keys[0],
      page_url: row.keys[1],
      device_type: row.keys[2].toUpperCase(), // DESKTOP, MOBILE, TABLET
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    }));
  } catch (error) {
    console.error('Error fetching Search Console page performance:', error);
    throw error;
  }
}

/**
 * Fetch search query performance (which queries show your site)
 */
export async function fetchQueryPerformance(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    console.warn('Google Search Console credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date', 'query', 'page', 'device'],
        rowLimit: 25000,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    return response.data.rows.map((row: any) => ({
      date: row.keys[0],
      query: row.keys[1],
      page_url: row.keys[2],
      device_type: row.keys[3].toUpperCase(),
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    }));
  } catch (error) {
    console.error('Error fetching Search Console query performance:', error);
    throw error;
  }
}

/**
 * Fetch top queries for a specific page
 */
export async function fetchTopQueriesForPage(
  pageUrl: string,
  startDate: string,
  endDate: string,
  limit: number = 100
): Promise<any[]> {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    console.warn('Google Search Console credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'page',
                operator: 'equals',
                expression: pageUrl,
              },
            ],
          },
        ],
        rowLimit: limit,
      },
    });

    if (!response.data.rows) {
      return [];
    }

    return response.data.rows.map((row: any) => ({
      query: row.keys[0],
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    }));
  } catch (error) {
    console.error('Error fetching top queries for page:', error);
    throw error;
  }
}

/**
 * Get site summary for validation
 */
export async function getSiteSummary(
  startDate: string,
  endDate: string
): Promise<any> {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    return {
      configured: false,
      missingCredentials: config.missingVars,
    };
  }

  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: [],
        rowLimit: 1,
      },
    });

    if (!response.data.rows || response.data.rows.length === 0) {
      return {
        configured: true,
        siteUrl: GSC_SITE_URL,
        hasData: false,
      };
    }

    const totals = response.data.rows[0];

    return {
      configured: true,
      siteUrl: GSC_SITE_URL,
      hasData: true,
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      averageCtr: totals.ctr,
      averagePosition: totals.position,
      dateRange: { startDate, endDate },
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify site ownership and API access
 */
export async function verifySiteAccess(): Promise<{
  hasAccess: boolean;
  siteUrl: string;
  error?: string;
}> {
  const config = validateSearchConsoleConfig();
  if (!config.isValid) {
    return {
      hasAccess: false,
      siteUrl: GSC_SITE_URL!,
      error: `Missing credentials: ${config.missingVars.join(', ')}`,
    };
  }

  try {
    const searchConsole = getSearchConsoleClient();

    // Try to list sites to verify access
    const response = await searchConsole.sites.list({});

    const hasSite = response.data.siteEntry?.some(
      (site: any) => site.siteUrl === GSC_SITE_URL
    );

    return {
      hasAccess: hasSite || false,
      siteUrl: GSC_SITE_URL!,
      error: hasSite ? undefined : `Site ${GSC_SITE_URL} not found in account`,
    };
  } catch (error) {
    return {
      hasAccess: false,
      siteUrl: GSC_SITE_URL!,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Microsoft Advertising API Integration (Bing Ads)
 * Handles authentication and data fetching from Microsoft Advertising
 *
 * Setup Instructions:
 * 1. Get Microsoft Advertising Developer Token: https://developers.ads.microsoft.com/Account
 * 2. Create OAuth app: https://apps.dev.microsoft.com/
 * 3. Add environment variables to .env.local:
 *    - MICROSOFT_ADS_CLIENT_ID
 *    - MICROSOFT_ADS_CLIENT_SECRET
 *    - MICROSOFT_ADS_REFRESH_TOKEN
 *    - MICROSOFT_ADS_DEVELOPER_TOKEN
 *    - MICROSOFT_ADS_CUSTOMER_ID (Account ID)
 *
 * Note: Currently uses placeholder structure. Install microsoft-ads-api SDK when ready:
 * npm install @microsoft/bing-ads-api
 */

// Microsoft Ads API configuration
const MICROSOFT_ADS_CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const MICROSOFT_ADS_CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const MICROSOFT_ADS_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const MICROSOFT_ADS_DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const MICROSOFT_ADS_CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID; // Account ID

/**
 * Validate that all required Microsoft Ads credentials are configured
 */
export function validateMicrosoftAdsConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'MICROSOFT_ADS_CLIENT_ID',
    'MICROSOFT_ADS_CLIENT_SECRET',
    'MICROSOFT_ADS_REFRESH_TOKEN',
    'MICROSOFT_ADS_DEVELOPER_TOKEN',
    'MICROSOFT_ADS_CUSTOMER_ID',
  ];

  const missingVars = requiredVars.filter((varName) => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Get OAuth access token from refresh token
 * Microsoft uses standard OAuth 2.0 token exchange
 */
async function getAccessToken(): Promise<string> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    throw new Error(
      `Missing required Microsoft Ads credentials: ${config.missingVars.join(', ')}`
    );
  }

  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: MICROSOFT_ADS_CLIENT_ID!,
      client_secret: MICROSOFT_ADS_CLIENT_SECRET!,
      refresh_token: MICROSOFT_ADS_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
      scope: 'https://ads.microsoft.com/msads.manage',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Microsoft Ads access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Execute a Microsoft Ads reporting query
 * Uses Bing Ads Reporting API
 */
async function executeMicrosoftAdsQuery(reportType: string, columns: string[], dateRange: { start: string; end: string }): Promise<any[]> {
  const accessToken = await getAccessToken();

  // Microsoft Ads Reporting API endpoint
  const endpoint = 'https://reporting.api.bingads.microsoft.com/Api/Advertiser/Reporting/v13/ReportingService.svc';

  // Build report request (simplified structure - will need full SOAP envelope in production)
  const reportRequest = {
    ReportType: reportType,
    Format: 'Csv',
    ReportName: `${reportType}_${Date.now()}`,
    ReturnOnlyCompleteData: false,
    Aggregation: 'Daily',
    Columns: columns,
    Scope: {
      AccountIds: [MICROSOFT_ADS_CUSTOMER_ID],
    },
    Time: {
      CustomDateRangeStart: {
        Month: parseInt(dateRange.start.split('-')[1]),
        Day: parseInt(dateRange.start.split('-')[2]),
        Year: parseInt(dateRange.start.split('-')[0]),
      },
      CustomDateRangeEnd: {
        Month: parseInt(dateRange.end.split('-')[1]),
        Day: parseInt(dateRange.end.split('-')[2]),
        Year: parseInt(dateRange.end.split('-')[0]),
      },
    },
  };

  // Note: This is a placeholder structure
  // Production implementation requires SOAP XML formatting or official SDK
  console.warn('Microsoft Ads API integration is placeholder - awaiting credentials and SDK installation');

  return [];
}

/**
 * Fetch campaign performance data for a date range
 * Returns data in same format as Google Ads for consistent processing
 */
export async function fetchCampaignPerformance(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<any[]> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return [];
  }

  try {
    // Report columns matching Google Ads structure
    const columns = [
      'TimePeriod',
      'CampaignId',
      'CampaignName',
      'CampaignStatus',
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
      'ConversionValue',
      'Ctr',
      'AverageCpc',
    ];

    const results = await executeMicrosoftAdsQuery(
      'CampaignPerformanceReport',
      columns,
      { start: startDate, end: endDate }
    );

    // Transform to match Google Ads format for consistent database storage
    return results.map((row: any) => ({
      date: row.TimePeriod,
      campaign_id: row.CampaignId,
      campaign_name: row.CampaignName,
      campaign_status: row.CampaignStatus,
      impressions: parseInt(row.Impressions) || 0,
      clicks: parseInt(row.Clicks) || 0,
      cost_micros: Math.round(parseFloat(row.Spend) * 1000000), // Convert to micros
      conversions: parseFloat(row.Conversions) || 0,
      conversion_value_micros: Math.round(parseFloat(row.ConversionValue) * 1000000),
      ctr: parseFloat(row.Ctr) / 100, // Convert percentage to decimal
      average_cpc_micros: Math.round(parseFloat(row.AverageCpc) * 1000000),
      channel_type: 'Search', // Default to Search
    }));
  } catch (error) {
    console.error('Error fetching Microsoft Ads campaign performance:', error);
    throw error;
  }
}

/**
 * Fetch keyword performance data
 */
export async function fetchKeywordPerformance(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const columns = [
      'TimePeriod',
      'CampaignId',
      'CampaignName',
      'AdGroupId',
      'AdGroupName',
      'KeywordId',
      'Keyword',
      'MatchType',
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
      'ConversionValue',
      'Ctr',
      'AverageCpc',
      'QualityScore',
    ];

    const results = await executeMicrosoftAdsQuery(
      'KeywordPerformanceReport',
      columns,
      { start: startDate, end: endDate }
    );

    return results.map((row: any) => ({
      date: row.TimePeriod,
      campaign_id: row.CampaignId,
      campaign_name: row.CampaignName,
      ad_group_id: row.AdGroupId,
      ad_group_name: row.AdGroupName,
      keyword_id: row.KeywordId,
      keyword_text: row.Keyword,
      match_type: row.MatchType,
      impressions: parseInt(row.Impressions) || 0,
      clicks: parseInt(row.Clicks) || 0,
      cost_micros: Math.round(parseFloat(row.Spend) * 1000000),
      conversions: parseFloat(row.Conversions) || 0,
      conversion_value_micros: Math.round(parseFloat(row.ConversionValue) * 1000000),
      ctr: parseFloat(row.Ctr) / 100,
      average_cpc_micros: Math.round(parseFloat(row.AverageCpc) * 1000000),
      quality_score: parseInt(row.QualityScore) || null,
    }));
  } catch (error) {
    console.error('Error fetching Microsoft Ads keyword performance:', error);
    throw error;
  }
}

/**
 * Fetch search terms report (actual queries that triggered ads)
 */
export async function fetchSearchTerms(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const columns = [
      'TimePeriod',
      'CampaignId',
      'CampaignName',
      'AdGroupId',
      'AdGroupName',
      'KeywordId',
      'Keyword',
      'SearchQuery',
      'MatchType',
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
    ];

    const results = await executeMicrosoftAdsQuery(
      'SearchQueryPerformanceReport',
      columns,
      { start: startDate, end: endDate }
    );

    return results.map((row: any) => ({
      date: row.TimePeriod,
      campaign_id: row.CampaignId,
      campaign_name: row.CampaignName,
      ad_group_id: row.AdGroupId,
      ad_group_name: row.AdGroupName,
      keyword_id: row.KeywordId,
      keyword_text: row.Keyword,
      search_term: row.SearchQuery,
      match_type: row.MatchType,
      impressions: parseInt(row.Impressions) || 0,
      clicks: parseInt(row.Clicks) || 0,
      cost_micros: Math.round(parseFloat(row.Spend) * 1000000),
      conversions: parseFloat(row.Conversions) || 0,
    }));
  } catch (error) {
    console.error('Error fetching Microsoft Ads search terms:', error);
    throw error;
  }
}

/**
 * Get account summary for validation
 */
export async function getAccountSummary(): Promise<any> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    return {
      configured: false,
      missingCredentials: config.missingVars,
    };
  }

  try {
    const accessToken = await getAccessToken();

    return {
      configured: true,
      accountId: MICROSOFT_ADS_CUSTOMER_ID,
      hasValidToken: !!accessToken,
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

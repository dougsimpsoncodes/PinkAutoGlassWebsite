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

import { inflateRawSync } from 'zlib';
// adm-zip as fallback
import AdmZip from 'adm-zip';

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
    'MICROSOFT_ADS_ACCOUNT_ID',
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
 * Get campaigns from Microsoft Ads account
 * Uses the Campaign Management REST API
 */
export async function getCampaigns(): Promise<any[]> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return [];
  }

  try {
    const accessToken = await getAccessToken();
    const accountId = process.env.MICROSOFT_ADS_ACCOUNT_ID;
    const customerId = MICROSOFT_ADS_CUSTOMER_ID;

    const endpoint = `https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/Campaigns/QueryByAccountId`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': MICROSOFT_ADS_DEVELOPER_TOKEN!,
        'CustomerId': customerId!,
        'CustomerAccountId': accountId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AccountId: accountId,
        CampaignType: ['Search'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Microsoft Ads GetCampaigns error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    return data.Campaigns || [];
  } catch (error) {
    console.error('Error fetching Microsoft Ads campaigns:', error);
    return [];
  }
}

/**
 * Submit a report request and get the report ID
 * Uses the Reporting REST API
 */
async function submitReportRequest(
  reportType: string,
  columns: string[],
  dateRange: { start: string; end: string },
  aggregation: string = 'Summary'
): Promise<string | null> {
  const accessToken = await getAccessToken();
  const accountId = process.env.MICROSOFT_ADS_ACCOUNT_ID;
  const customerId = MICROSOFT_ADS_CUSTOMER_ID;

  const endpoint = 'https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit';

  // Parse dates
  const startParts = dateRange.start.split('-');
  const endParts = dateRange.end.split('-');

  const reportRequest: any = {
    ExcludeColumnHeaders: false,
    ExcludeReportFooter: true,
    ExcludeReportHeader: true,
    Format: 'Csv',
    FormatVersion: '2.0',
    ReportName: `${reportType}_${Date.now()}`,
    ReturnOnlyCompleteData: false,
    Aggregation: aggregation,
    Columns: columns,
    Scope: {
      AccountIds: [parseInt(accountId!)],
    },
    Time: {
      CustomDateRangeStart: {
        Year: parseInt(startParts[0]),
        Month: parseInt(startParts[1]),
        Day: parseInt(startParts[2]),
      },
      CustomDateRangeEnd: {
        Year: parseInt(endParts[0]),
        Month: parseInt(endParts[1]),
        Day: parseInt(endParts[2]),
      },
    },
  };

  const requestBody: any = {
    ReportRequest: {
      ...reportRequest,
      Type: reportType,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': MICROSOFT_ADS_DEVELOPER_TOKEN!,
        'CustomerId': customerId!,
        'CustomerAccountId': accountId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Microsoft Ads Submit Report error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.ReportRequestId || null;
  } catch (error) {
    console.error('Error submitting Microsoft Ads report:', error);
    return null;
  }
}

/**
 * Poll for report status and get download URL
 */
async function pollReportStatus(reportId: string, maxAttempts: number = 30): Promise<string | null> {
  const accessToken = await getAccessToken();
  const customerId = MICROSOFT_ADS_CUSTOMER_ID;
  const accountId = process.env.MICROSOFT_ADS_ACCOUNT_ID;

  const endpoint = 'https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'DeveloperToken': MICROSOFT_ADS_DEVELOPER_TOKEN!,
          'CustomerId': customerId!,
          'CustomerAccountId': accountId!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ReportRequestId: reportId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Microsoft Ads Poll Report error:', response.status, errorText);
        return null;
      }

      const data = await response.json();

      if (data.ReportRequestStatus?.Status === 'Success') {
        return data.ReportRequestStatus.ReportDownloadUrl || null;
      } else if (data.ReportRequestStatus?.Status === 'Error') {
        console.error('Microsoft Ads report error:', data.ReportRequestStatus);
        return null;
      }

      // Wait 2 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error polling Microsoft Ads report:', error);
      return null;
    }
  }

  console.error('Microsoft Ads report polling timed out');
  return null;
}

/**
 * Download and parse CSV report
 * Microsoft returns reports as ZIP files containing CSV
 */
async function downloadAndParseReport(downloadUrl: string): Promise<any[]> {
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      console.error('Failed to download Microsoft Ads report:', response.status);
      return [];
    }

    // Microsoft returns a ZIP file containing the CSV
    const buf = Buffer.from(await response.arrayBuffer());
    console.log(`Microsoft Ads report: downloaded ${buf.length} bytes`);
    let csvText = '';

    // Strategy 1: Manual ZIP extraction with Node.js built-in zlib
    // ZIP local file header starts with PK\x03\x04
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) {
      try {
        // Parse ZIP local file header
        const compressionMethod = buf.readUInt16LE(8);
        const compressedSize = buf.readUInt32LE(18);
        const fileNameLen = buf.readUInt16LE(26);
        const extraFieldLen = buf.readUInt16LE(28);
        const dataOffset = 30 + fileNameLen + extraFieldLen;

        if (compressionMethod === 8) {
          // Deflate — use inflateRawSync
          const compressed = buf.subarray(dataOffset, dataOffset + compressedSize);
          csvText = inflateRawSync(compressed).toString('utf8');
          console.log(`Microsoft Ads report: extracted CSV via inflateRawSync (${csvText.length} chars)`);
        } else if (compressionMethod === 0) {
          // Stored (no compression)
          csvText = buf.subarray(dataOffset, dataOffset + compressedSize).toString('utf8');
          console.log(`Microsoft Ads report: extracted stored CSV (${csvText.length} chars)`);
        }
      } catch (zlibErr) {
        console.warn('Microsoft Ads report: native ZIP extraction failed, trying adm-zip:', zlibErr);
      }
    }

    // Strategy 2: adm-zip fallback
    if (!csvText) {
      try {
        const zip = new AdmZip(buf);
        const zipEntries = zip.getEntries();
        for (const entry of zipEntries) {
          if (entry.entryName.endsWith('.csv')) {
            csvText = entry.getData().toString('utf8');
            console.log(`Microsoft Ads report: extracted CSV via adm-zip (${csvText.length} chars)`);
            break;
          }
        }
      } catch (admErr) {
        console.warn('Microsoft Ads report: adm-zip extraction failed:', admErr);
      }
    }

    // Strategy 3: plain text (not a ZIP)
    if (!csvText) {
      csvText = buf.toString('utf8');
      console.log(`Microsoft Ads report: treating as plain text (${csvText.length} chars)`);
    }

    if (!csvText) {
      console.error('No CSV content found in Microsoft Ads report');
      return [];
    }

    // Remove BOM if present
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }

    const lines = csvText.trim().split('\n');
    console.log(`Microsoft Ads report: ${lines.length} lines in CSV`);

    if (lines.length < 2) {
      console.warn('Microsoft Ads report: CSV has < 2 lines, returning empty');
      return [];
    }

    // Parse CSV — handle quoted fields properly
    const parseCsvLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseCsvLine(lines[0]);
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCsvLine(lines[i]);
      const row: any = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }
      results.push(row);
    }

    console.log(`Microsoft Ads report: parsed ${results.length} data rows`);
    return results;
  } catch (error) {
    console.error('Error downloading Microsoft Ads report:', error);
    return [];
  }
}

/**
 * Execute a Microsoft Ads reporting query using REST API
 * Submits report, polls for completion, downloads CSV, parses to JSON
 */
async function executeMicrosoftAdsQuery(
  reportType: string,
  columns: string[],
  dateRange: { start: string; end: string },
  aggregation: string = 'Summary'
): Promise<any[]> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return [];
  }

  // Submit report request
  const reportId = await submitReportRequest(reportType, columns, dateRange, aggregation);
  if (!reportId) {
    console.error('Failed to submit Microsoft Ads report request');
    return [];
  }

  // Poll for completion
  const downloadUrl = await pollReportStatus(reportId);
  if (!downloadUrl) {
    console.error('Failed to get Microsoft Ads report download URL');
    return [];
  }

  // Download and parse
  const results = await downloadAndParseReport(downloadUrl);
  return results;
}

/**
 * Fetch daily account performance for date range (matches Google Ads pattern)
 * Returns array of daily stats for aggregation in daily report
 */
export async function fetchDailyAccountPerformance(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<Array<{
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}>> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return [];
  }

  try {
    // Use AccountPerformanceReport with Daily aggregation
    // TimePeriod column gives us the date for each row
    const columns = [
      'TimePeriod',
      'AccountName',
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
    ];

    const results = await executeMicrosoftAdsQuery(
      'AccountPerformanceReportRequest',
      columns,
      { start: startDate, end: endDate },
      'Daily' // Daily breakdown like Google Ads
    );

    if (results.length === 0) {
      console.log('Microsoft Ads Daily: No data returned from report');
      return [];
    }

    console.log('Microsoft Ads Daily: Got', results.length, 'row(s) from report');

    // Transform to match Google Ads format
    return results.map((row: any) => {
      // TimePeriod format from Microsoft is typically "M/D/YYYY"
      let dateStr = row.TimePeriod;
      // Convert to YYYY-MM-DD format if needed
      if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          dateStr = `${year}-${month}-${day}`;
        }
      }

      return {
        date: dateStr,
        impressions: parseInt(row.Impressions) || 0,
        clicks: parseInt(row.Clicks) || 0,
        spend: parseFloat(row.Spend) || 0,
        conversions: parseFloat(row.Conversions) || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching Microsoft Ads daily performance:', error);
    return [];
  }
}

/**
 * Fetch account-level performance summary for admin dashboard
 * Returns aggregated spend, clicks, impressions for a date range
 */
export async function fetchAccountPerformance(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<{
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
} | null> {
  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    console.warn('Microsoft Ads credentials not configured:', config.missingVars);
    return null;
  }

  try {
    // Use AccountPerformanceReport for summary data
    // Must include at least one dimension column (AccountName)
    // Using exact columns that worked in test script
    const columns = [
      'AccountName',
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
      'Ctr',
    ];

    const results = await executeMicrosoftAdsQuery(
      'AccountPerformanceReportRequest',
      columns,
      { start: startDate, end: endDate },
      'Summary' // Get summary totals, not daily breakdown
    );

    if (results.length === 0) {
      console.log('Microsoft Ads: No data returned from report');
      return null;
    }

    console.log('Microsoft Ads: Got', results.length, 'row(s) from report');

    // Sum up all results (should be one row for Summary aggregation)
    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalConversions = 0;

    for (const row of results) {
      console.log('Microsoft Ads row:', row);
      totalSpend += parseFloat(row.Spend) || 0;
      totalClicks += parseInt(row.Clicks) || 0;
      totalImpressions += parseInt(row.Impressions) || 0;
      totalConversions += parseFloat(row.Conversions) || 0;
    }

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    console.log('Microsoft Ads totals:', { totalSpend, totalClicks, totalImpressions, totalConversions, ctr });

    return {
      spend: totalSpend,
      clicks: totalClicks,
      impressions: totalImpressions,
      conversions: totalConversions,
      ctr,
    };
  } catch (error) {
    console.error('Error fetching Microsoft Ads account performance:', error);
    return null;
  }
}

/**
 * Fetch campaign performance data for a date range
 * Returns data in same format as Google Ads for consistent processing
 * Valid columns: https://learn.microsoft.com/en-us/advertising/reporting-service/campaignperformancereportcolumn
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
    // Using valid column names per Microsoft Ads API documentation
    // Note: ConversionValue is not valid - use Revenue
    const columns = [
      'CampaignName',     // Required dimension
      'CampaignId',
      'CampaignStatus',
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
      'Revenue',          // Not ConversionValue
      'Ctr',
      'AverageCpc',
    ];

    const results = await executeMicrosoftAdsQuery(
      'CampaignPerformanceReportRequest',
      columns,
      { start: startDate, end: endDate },
      'Summary'
    );

    // Transform to match Google Ads format for consistent database storage
    return results.map((row: any) => ({
      campaign_id: row.CampaignId,
      campaign_name: row.CampaignName,
      campaign_status: row.CampaignStatus,
      impressions: parseInt(row.Impressions) || 0,
      clicks: parseInt(row.Clicks) || 0,
      cost_micros: Math.round(parseFloat(row.Spend) * 1000000), // Convert to micros
      conversions: parseFloat(row.Conversions) || 0,
      conversion_value_micros: Math.round(parseFloat(row.Revenue) * 1000000),
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
 * Valid columns: https://learn.microsoft.com/en-us/advertising/reporting-service/keywordperformancereportcolumn
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
    // Using valid column names per Microsoft Ads API documentation
    // Note: ConversionValue is not valid - use Revenue
    // Note: MatchType is not valid - use DeliveredMatchType
    const columns = [
      'Keyword',            // Required dimension
      'CampaignName',
      'AdGroupName',
      'KeywordId',
      'DeliveredMatchType', // Not MatchType
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
      'Revenue',            // Not ConversionValue
      'Ctr',
      'AverageCpc',
      'QualityScore',
    ];

    const results = await executeMicrosoftAdsQuery(
      'KeywordPerformanceReportRequest',
      columns,
      { start: startDate, end: endDate },
      'Summary'
    );

    return results.map((row: any) => ({
      campaign_name: row.CampaignName,
      ad_group_name: row.AdGroupName,
      keyword_id: row.KeywordId,
      keyword_text: row.Keyword,
      match_type: row.DeliveredMatchType,
      impressions: parseInt(row.Impressions) || 0,
      clicks: parseInt(row.Clicks) || 0,
      cost_micros: Math.round(parseFloat(row.Spend) * 1000000),
      conversions: parseFloat(row.Conversions) || 0,
      conversion_value_micros: Math.round(parseFloat(row.Revenue) * 1000000),
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
 * Valid columns: https://learn.microsoft.com/en-us/advertising/reporting-service/searchqueryperformancereportcolumn
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
    // Using valid column names per Microsoft Ads API documentation
    // Note: MatchType is not valid - use DeliveredMatchType or BidMatchType
    // Note: KeywordId exists but Keyword is the text
    const columns = [
      'SearchQuery',        // Required dimension - the actual search term
      'CampaignName',
      'CampaignId',
      'AdGroupName',
      'AdGroupId',
      'Keyword',            // The keyword text (not KeywordId for Summary)
      'DeliveredMatchType', // How the search matched (not MatchType)
      'Impressions',
      'Clicks',
      'Spend',
      'Conversions',
    ];

    const results = await executeMicrosoftAdsQuery(
      'SearchQueryPerformanceReportRequest',
      columns,
      { start: startDate, end: endDate },
      'Summary'  // Summary aggregation for totals
    );

    return results.map((row: any) => ({
      search_term: row.SearchQuery,
      campaign_name: row.CampaignName,
      campaign_id: row.CampaignId || '0',
      ad_group_name: row.AdGroupName,
      ad_group_id: row.AdGroupId || '0',
      keyword_text: row.Keyword,
      match_type: row.DeliveredMatchType,
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

// ============================================================================
// OFFLINE CONVERSION UPLOAD
// ============================================================================

/**
 * Offline conversion data for upload to Microsoft Ads
 */
export interface MicrosoftOfflineConversion {
  msclkid: string;
  conversionName: string; // Must match the Offline Conversion Goal name exactly
  conversionTime: string; // Format: ISO 8601 UTC (e.g., "2025-11-29T14:30:00.000Z")
  conversionValue?: number;
  conversionCurrency?: string; // Default: USD
}

/**
 * Result of an offline conversion upload
 */
export interface MicrosoftOfflineConversionResult {
  msclkid: string;
  success: boolean;
  error?: string;
}

/**
 * Format a Date object to Microsoft Ads datetime format
 * Format: ISO 8601 UTC format (YYYY-MM-DDTHH:mm:ssZ)
 * Per Microsoft docs: https://learn.microsoft.com/en-us/advertising/campaign-management-service/offlineconversion
 */
export function formatMicrosoftConversionDateTime(date: Date): string {
  return date.toISOString();
}

/**
 * Upload offline conversions to Microsoft Ads
 * Uses the Campaign Management API ApplyOfflineConversions operation
 *
 * Important: The conversion name must match exactly the name of the
 * OfflineConversionGoal created in Microsoft Ads UI.
 *
 * @param conversions Array of offline conversions to upload
 * @returns Results indicating success/failure for each conversion
 */
export async function uploadOfflineConversions(
  conversions: MicrosoftOfflineConversion[]
): Promise<{
  results: MicrosoftOfflineConversionResult[];
  successCount: number;
  failureCount: number;
}> {
  if (conversions.length === 0) {
    return { results: [], successCount: 0, failureCount: 0 };
  }

  const config = validateMicrosoftAdsConfig();
  if (!config.isValid) {
    throw new Error(
      `Missing required Microsoft Ads credentials: ${config.missingVars.join(', ')}`
    );
  }

  const accessToken = await getAccessToken();
  const accountId = process.env.MICROSOFT_ADS_ACCOUNT_ID;
  const customerId = MICROSOFT_ADS_CUSTOMER_ID;

  // Microsoft Ads REST API endpoint for offline conversions
  const endpoint = 'https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/OfflineConversions/Apply';

  // Build the request body
  const offlineConversions = conversions.map((conv) => ({
    ConversionCurrencyCode: conv.conversionCurrency || 'USD',
    ConversionName: conv.conversionName,
    ConversionTime: conv.conversionTime,
    ConversionValue: conv.conversionValue || 0,
    MicrosoftClickId: conv.msclkid,
  }));

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'DeveloperToken': MICROSOFT_ADS_DEVELOPER_TOKEN!,
        'CustomerId': customerId!,
        'CustomerAccountId': accountId!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        OfflineConversions: offlineConversions,
      }),
    });

    const responseData = await response.json();

    // Process results
    const results: MicrosoftOfflineConversionResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Check for partial errors
    if (responseData.PartialErrors && responseData.PartialErrors.length > 0) {
      // Create a map of failed indices
      const failedIndices = new Map<number, string>();
      for (const error of responseData.PartialErrors) {
        if (error.Index !== undefined) {
          failedIndices.set(error.Index, error.Message || 'Unknown error');
        }
      }

      // Process each conversion
      for (let i = 0; i < conversions.length; i++) {
        if (failedIndices.has(i)) {
          results.push({
            msclkid: conversions[i].msclkid,
            success: false,
            error: failedIndices.get(i),
          });
          failureCount++;
        } else {
          results.push({
            msclkid: conversions[i].msclkid,
            success: true,
          });
          successCount++;
        }
      }
    } else if (!response.ok) {
      // All failed
      const errorMsg = responseData.Message || `HTTP ${response.status}: ${response.statusText}`;
      return {
        results: conversions.map((conv) => ({
          msclkid: conv.msclkid,
          success: false,
          error: errorMsg,
        })),
        successCount: 0,
        failureCount: conversions.length,
      };
    } else {
      // All succeeded
      for (const conv of conversions) {
        results.push({
          msclkid: conv.msclkid,
          success: true,
        });
        successCount++;
      }
    }

    console.log(`📤 Microsoft Ads: Uploaded ${successCount} offline conversions (${failureCount} failed)`);

    return { results, successCount, failureCount };
  } catch (error: any) {
    console.error('❌ Error uploading Microsoft Ads offline conversions:', error);

    return {
      results: conversions.map((conv) => ({
        msclkid: conv.msclkid,
        success: false,
        error: error.message || 'Upload failed',
      })),
      successCount: 0,
      failureCount: conversions.length,
    };
  }
}

/**
 * Upload a single offline conversion
 * Convenience wrapper around uploadOfflineConversions
 */
export async function uploadOfflineConversion(
  conversion: MicrosoftOfflineConversion
): Promise<MicrosoftOfflineConversionResult> {
  const { results } = await uploadOfflineConversions([conversion]);
  return results[0] || { msclkid: conversion.msclkid, success: false, error: 'No result returned' };
}

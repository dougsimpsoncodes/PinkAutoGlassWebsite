/**
 * Google Ads API Integration
 * Handles authentication and data fetching from Google Ads
 */

import { GoogleAdsApi, Customer, ResourceNames } from 'google-ads-api';

/**
 * Validate that all required Google Ads credentials are configured
 */
export function validateGoogleAdsConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CUSTOMER_ID',
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
 * Create and return authenticated Google Ads API client
 *
 * IMPORTANT: Reads environment variables lazily (at call time, not at module import time)
 * This ensures compatibility with both:
 * - Production (Vercel) where env vars are injected before code execution
 * - Local scripts that use dotenv to load .env files after module imports
 */
export function getGoogleAdsClient(): {
  client: GoogleAdsApi;
  customer: Customer;
} {
  const config = validateGoogleAdsConfig();
  if (!config.isValid) {
    throw new Error(
      `Missing required Google Ads credentials: ${config.missingVars.join(', ')}`
    );
  }

  // Read environment variables at call time (lazy evaluation)
  // This ensures they're available whether loaded by Vercel or dotenv
  const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
  const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
  const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
  const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
  // Normalize IDs: remove dashes/spaces to match Google Ads expected format
  const GOOGLE_ADS_CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');
  const GOOGLE_ADS_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID; // optional (MCC)

  // Initialize the Google Ads API client
  const baseConfig: any = {
    client_id: GOOGLE_ADS_CLIENT_ID,
    client_secret: GOOGLE_ADS_CLIENT_SECRET,
    developer_token: GOOGLE_ADS_DEVELOPER_TOKEN,
  };

  // If using a Manager (MCC) to access a child account, set login_customer_id
  if (GOOGLE_ADS_LOGIN_CUSTOMER_ID && GOOGLE_ADS_LOGIN_CUSTOMER_ID.trim() !== '') {
    baseConfig.login_customer_id = GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/[-\s]/g, '');
  }

  const client = new GoogleAdsApi(baseConfig);

  // Create customer instance with refresh token
  const customer = client.Customer({
    customer_id: GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
  });

  return { client, customer };
}

/**
 * Fetch campaign performance data for a date range
 */
export async function fetchCampaignPerformance(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<any[]> {
  const { customer } = getGoogleAdsClient();

  // GAQL (Google Ads Query Language) query to fetch campaign performance
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.interactions,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.all_conversions,
      metrics.all_conversions_value,
      metrics.view_through_conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC
  `;

  try {
    const results = await customer.query(query);

    // Transform the results to a more usable format
    return results.map((row: any) => ({
      campaign_id: row.campaign.id,
      campaign_name: row.campaign.name,
      campaign_status: row.campaign.status,
      channel_type: row.campaign.advertising_channel_type,
      date: row.segments.date,
      impressions: parseInt(row.metrics.impressions || '0'),
      clicks: parseInt(row.metrics.clicks || '0'),
      interactions: parseInt(row.metrics.interactions || '0'),
      cost: parseFloat((row.metrics.cost_micros / 1000000).toFixed(2)), // Convert micros to dollars
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversions_value: parseFloat(row.metrics.conversions_value || '0'),
      all_conversions: parseFloat(row.metrics.all_conversions || '0'),
      all_conversions_value: parseFloat(row.metrics.all_conversions_value || '0'),
      view_through_conversions: parseInt(row.metrics.view_through_conversions || '0'),
    }));
  } catch (error: any) {
    console.error('Error fetching campaign performance:', error);
    throw new Error(`Failed to fetch campaign performance: ${error.message}`);
  }
}

/**
 * Fetch campaign performance data with hourly breakdown
 * Used for time-based attribution matching
 */
export async function fetchCampaignPerformanceHourly(
  startDate: string, // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
): Promise<any[]> {
  const { customer } = getGoogleAdsClient();

  // GAQL query with hourly segmentation
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      segments.date,
      segments.hour,
      metrics.impressions,
      metrics.clicks,
      metrics.interactions,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC, segments.hour DESC
  `;

  try {
    const results = await customer.query(query);

    // Transform the results to a more usable format
    return results.map((row: any) => ({
      campaign_id: row.campaign.id,
      campaign_name: row.campaign.name,
      campaign_status: row.campaign.status,
      channel_type: row.campaign.advertising_channel_type,
      date: row.segments.date,
      hour_of_day: parseInt(row.segments.hour || '0'), // 0-23
      impressions: parseInt(row.metrics.impressions || '0'),
      clicks: parseInt(row.metrics.clicks || '0'),
      interactions: parseInt(row.metrics.interactions || '0'),
      cost: parseFloat((row.metrics.cost_micros / 1000000).toFixed(2)),
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversions_value: parseFloat(row.metrics.conversions_value || '0'),
    }));
  } catch (error: any) {
    console.error('Error fetching hourly campaign performance:', error);
    throw new Error(`Failed to fetch hourly campaign performance: ${error.message}`);
  }
}

/**
 * Fetch ad group performance data
 */
export async function fetchAdGroupPerformance(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name,
      ad_group.status,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM ad_group
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND ad_group.status != 'REMOVED'
    ORDER BY segments.date DESC
  `;

  try {
    const results = await customer.query(query);

    return results.map((row: any) => ({
      campaign_id: row.campaign.id,
      campaign_name: row.campaign.name,
      ad_group_id: row.ad_group.id,
      ad_group_name: row.ad_group.name,
      ad_group_status: row.ad_group.status,
      date: row.segments.date,
      impressions: parseInt(row.metrics.impressions || '0'),
      clicks: parseInt(row.metrics.clicks || '0'),
      cost: parseFloat((row.metrics.cost_micros / 1000000).toFixed(2)),
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversions_value: parseFloat(row.metrics.conversions_value || '0'),
    }));
  } catch (error: any) {
    console.error('Error fetching ad group performance:', error);
    throw new Error(`Failed to fetch ad group performance: ${error.message}`);
  }
}

/**
 * Fetch keyword performance data
 */
export async function fetchKeywordPerformance(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM keyword_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND ad_group_criterion.status != 'REMOVED'
    ORDER BY segments.date DESC
  `;

  try {
    const results = await customer.query(query);

    return results.map((row: any) => ({
      campaign_id: row.campaign.id,
      campaign_name: row.campaign.name,
      ad_group_id: row.ad_group.id,
      ad_group_name: row.ad_group.name,
      keyword: row.ad_group_criterion.keyword.text,
      match_type: row.ad_group_criterion.keyword.match_type,
      date: row.segments.date,
      impressions: parseInt(row.metrics.impressions || '0'),
      clicks: parseInt(row.metrics.clicks || '0'),
      cost: parseFloat((row.metrics.cost_micros / 1000000).toFixed(2)),
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversions_value: parseFloat(row.metrics.conversions_value || '0'),
    }));
  } catch (error: any) {
    console.error('Error fetching keyword performance:', error);
    throw new Error(`Failed to fetch keyword performance: ${error.message}`);
  }
}

/**
 * Fetch search query report - actual search terms that triggered ads
 * This shows what users searched for (not just keywords you bid on)
 */
export async function fetchSearchQueryReport(
  startDate: string,
  endDate: string
): Promise<any[]> {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name,
      segments.search_term_match_type,
      segments.date,
      search_term_view.search_term,
      search_term_view.status,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.all_conversions,
      metrics.all_conversions_value
    FROM search_term_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY metrics.impressions DESC
  `;

  try {
    const results = await customer.query(query);

    return results.map((row: any) => ({
      campaign_id: row.campaign.id,
      campaign_name: row.campaign.name,
      ad_group_id: row.ad_group.id,
      ad_group_name: row.ad_group.name,
      search_term: row.search_term_view.search_term,
      match_type: row.segments.search_term_match_type,
      status: row.search_term_view.status,
      date: row.segments.date,
      impressions: parseInt(row.metrics.impressions || '0'),
      clicks: parseInt(row.metrics.clicks || '0'),
      cost: parseFloat((row.metrics.cost_micros / 1000000).toFixed(2)),
      conversions: parseFloat(row.metrics.conversions || '0'),
      conversions_value: parseFloat(row.metrics.conversions_value || '0'),
      all_conversions: parseFloat(row.metrics.all_conversions || '0'),
      all_conversions_value: parseFloat(row.metrics.all_conversions_value || '0'),
    }));
  } catch (error: any) {
    console.error('Error fetching search query report:', error);
    throw new Error(`Failed to fetch search query report: ${error.message}`);
  }
}

// ============================================================================
// CALL TRACKING — AGGREGATE CONVERSIONS + INDIVIDUAL CALL RECORDS
// ============================================================================

/**
 * Fetch phone call conversion data broken out by conversion action.
 * Returns daily counts of "Calls from ads" per campaign.
 */
export async function fetchCallConversions(
  startDate: string,
  endDate: string
): Promise<Array<{
  date: string;
  campaign_id: string;
  campaign_name: string;
  conversion_action_id: string;
  conversion_action_name: string;
  conversions: number;
  conversions_value: number;
}>> {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      segments.conversion_action,
      segments.conversion_action_name,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND segments.conversion_action_category = 'PHONE_CALL'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC
  `;

  try {
    const results = await customer.query(query);

    return results.map((row: any) => {
      // Parse conversion action ID from resource name:
      // "customers/123/conversionActions/7351179314" -> "7351179314"
      const resourceName = row.segments?.conversion_action || '';
      const actionId = resourceName.split('/').pop() || '';

      return {
        date: row.segments.date,
        campaign_id: row.campaign.id?.toString() || '',
        campaign_name: row.campaign.name || '',
        conversion_action_id: actionId,
        conversion_action_name: row.segments.conversion_action_name || '',
        conversions: parseFloat(row.metrics.conversions || '0'),
        conversions_value: parseFloat(row.metrics.conversions_value || '0'),
      };
    });
  } catch (error: any) {
    console.error('Error fetching call conversions:', error);
    throw new Error(`Failed to fetch call conversions: ${error.message}`);
  }
}

/**
 * Fetch individual call records from Google Ads call_view.
 * Queries ONE DAY AT A TIME to avoid gRPC timeout (Opteo library has 5-min limit).
 * For backfill, call in a loop; for daily cron, pass yesterday only.
 */
export async function fetchCallView(
  singleDate: string // Format: YYYY-MM-DD (one day only)
): Promise<Array<{
  resource_name: string;
  start_date_time: string;
  end_date_time: string | null;
  call_duration_seconds: number;
  caller_area_code: string;
  caller_country_code: string;
  call_status: string;
  call_type: string;
  call_tracking_display_location: string;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
  ad_group_name: string;
}>> {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      call_view.resource_name,
      call_view.start_call_date_time,
      call_view.end_call_date_time,
      call_view.call_duration_seconds,
      call_view.caller_area_code,
      call_view.caller_country_code,
      call_view.call_status,
      call_view.type,
      call_view.call_tracking_display_location,
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name
    FROM call_view
    WHERE segments.date = '${singleDate}'
  `;

  try {
    const results = await customer.query(query);

    return results.map((row: any) => ({
      resource_name: row.call_view?.resource_name || '',
      start_date_time: row.call_view?.start_call_date_time || '',
      end_date_time: row.call_view?.end_call_date_time || null,
      call_duration_seconds: parseInt(row.call_view?.call_duration_seconds || '0'),
      caller_area_code: row.call_view?.caller_area_code || '',
      caller_country_code: row.call_view?.caller_country_code || '',
      call_status: String(row.call_view?.call_status || ''),
      call_type: String(row.call_view?.type || ''),
      call_tracking_display_location: String(row.call_view?.call_tracking_display_location || ''),
      campaign_id: row.campaign?.id?.toString() || '',
      campaign_name: row.campaign?.name || '',
      ad_group_id: row.ad_group?.id?.toString() || '',
      ad_group_name: row.ad_group?.name || '',
    }));
  } catch (error: any) {
    console.error(`Error fetching call_view for ${singleDate}:`, error);
    throw new Error(`Failed to fetch call_view for ${singleDate}: ${error.message}`);
  }
}

/**
 * Fetch call_view records for a date range by looping day-by-day.
 * Prevents gRPC timeouts on the Opteo library's 5-minute limit.
 */
export async function fetchCallViewRange(
  startDate: string,
  endDate: string
): Promise<ReturnType<typeof fetchCallView> extends Promise<infer T> ? T : never> {
  const allCalls: Awaited<ReturnType<typeof fetchCallView>> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    try {
      const dayCalls = await fetchCallView(dateStr);
      allCalls.push(...dayCalls);
    } catch (error: any) {
      // Log but continue — don't let one failed day stop the entire sync
      console.warn(`⚠️ call_view failed for ${dateStr}: ${error.message}`);
    }
  }

  return allCalls;
}

// ============================================================================
// OFFLINE CONVERSION UPLOAD
// ============================================================================

/**
 * Offline conversion data for upload
 */
export interface OfflineConversion {
  gclid: string;
  conversionDateTime: string; // Format: yyyy-mm-dd HH:mm:ss+|-HH:mm (e.g., "2024-01-15 14:30:00-07:00")
  conversionValue?: number;
  currencyCode?: string; // Default: USD
  conversionActionId?: string; // If not provided, uses GOOGLE_ADS_CONVERSION_ACTION_ID env var
}

/**
 * Result of an offline conversion upload
 */
export interface OfflineConversionResult {
  gclid: string;
  success: boolean;
  error?: string;
}

/**
 * Format a Date object to Google Ads datetime format with timezone
 * Format: yyyy-mm-dd HH:mm:ss+|-HH:mm
 */
export function formatConversionDateTime(date: Date, timezoneOffset: string = '-07:00'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${timezoneOffset}`;
}

/**
 * Upload offline click conversions to Google Ads
 *
 * Use this to report conversions that happened offline (e.g., phone calls from RingCentral)
 * back to Google Ads for attribution and optimization.
 *
 * Requirements:
 * 1. You must have a conversion action set up in Google Ads
 * 2. The GCLID must be captured when the user clicks the ad
 * 3. Conversions should be uploaded within 90 days of the click
 *
 * @param conversions Array of offline conversions to upload
 * @returns Array of results indicating success/failure for each conversion
 */
export async function uploadOfflineConversions(
  conversions: OfflineConversion[]
): Promise<{
  results: OfflineConversionResult[];
  successCount: number;
  failureCount: number;
}> {
  if (conversions.length === 0) {
    return { results: [], successCount: 0, failureCount: 0 };
  }

  const { customer } = getGoogleAdsClient();
  const customerId = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');
  const defaultConversionActionId = process.env.GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID;

  if (!defaultConversionActionId) {
    console.warn('⚠️ GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID not set. Conversions will fail without a conversion action.');
  }

  // Build click conversion objects
  const clickConversions = conversions.map((conv) => {
    const conversionActionId = conv.conversionActionId || defaultConversionActionId;

    if (!conversionActionId) {
      throw new Error(`No conversion action ID provided for GCLID ${conv.gclid}`);
    }

    return {
      gclid: conv.gclid,
      conversion_action: ResourceNames.conversionAction(customerId, conversionActionId),
      conversion_date_time: conv.conversionDateTime,
      conversion_value: conv.conversionValue || 0,
      currency_code: conv.currencyCode || 'USD',
    };
  });

  try {
    // Use the conversionUploads service
    // Cast to any because the SDK's type definitions expect class instances
    // but plain objects work correctly at runtime
    const response = await customer.conversionUploads.uploadClickConversions({
      customer_id: customerId,
      conversions: clickConversions,
      partial_failure: true, // Continue uploading even if some fail
      validate_only: false,
    } as any);

    // Process results
    const results: OfflineConversionResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Check for partial failure errors
    const partialFailureError = response.partial_failure_error;
    const failedIndices = new Set<number>();

    if (partialFailureError && partialFailureError.details) {
      // Extract failed indices from error details
      // The details array contains serialized GoogleAdsFailure messages
      for (const detail of partialFailureError.details as any[]) {
        const errors = detail.errors || [];
        for (const error of errors) {
          if (error.location?.field_path_elements) {
            for (const element of error.location.field_path_elements) {
              if (element.field_name === 'conversions' && element.index !== undefined) {
                failedIndices.add(element.index);
                results.push({
                  gclid: conversions[element.index].gclid,
                  success: false,
                  error: error.message || 'Unknown error',
                });
                failureCount++;
              }
            }
          }
        }
      }
    }

    // Add successful results
    for (let i = 0; i < conversions.length; i++) {
      if (!failedIndices.has(i)) {
        results.push({
          gclid: conversions[i].gclid,
          success: true,
        });
        successCount++;
      }
    }

    console.log(`📤 Uploaded ${successCount} offline conversions (${failureCount} failed)`);

    return { results, successCount, failureCount };
  } catch (error: any) {
    console.error('❌ Error uploading offline conversions:', error);

    // Return all as failed
    return {
      results: conversions.map((conv) => ({
        gclid: conv.gclid,
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
  conversion: OfflineConversion
): Promise<OfflineConversionResult> {
  const { results } = await uploadOfflineConversions([conversion]);
  return results[0] || { gclid: conversion.gclid, success: false, error: 'No result returned' };
}

/**
 * List available conversion actions in the account
 * Use this to find the conversion action ID for offline conversion uploads
 */
export async function listConversionActions(): Promise<Array<{
  id: string;
  name: string;
  type: string;
  status: string;
  category: string;
}>> {
  const { customer } = getGoogleAdsClient();

  const query = `
    SELECT
      conversion_action.id,
      conversion_action.name,
      conversion_action.type,
      conversion_action.status,
      conversion_action.category
    FROM conversion_action
    WHERE conversion_action.status != 'REMOVED'
    ORDER BY conversion_action.name
  `;

  try {
    const results = await customer.query(query);

    return results.map((row: any) => ({
      id: row.conversion_action.id?.toString() || '',
      name: row.conversion_action.name || '',
      type: row.conversion_action.type || '',
      status: row.conversion_action.status || '',
      category: row.conversion_action.category || '',
    }));
  } catch (error: any) {
    console.error('Error listing conversion actions:', error);
    throw new Error(`Failed to list conversion actions: ${error.message}`);
  }
}

/**
 * Test Google Ads API connection
 */
export async function testConnection(): Promise<{
  success: boolean;
  customerName?: string;
  customerId?: string;
  error?: string;
}> {
  try {
    const { customer } = getGoogleAdsClient();

    // Simple query to test connection
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name
      FROM customer
      LIMIT 1
    `;

    const results = await customer.query(query);

    if (results.length > 0) {
      const customerData = results[0] as any;
      return {
        success: true,
        customerId: customerData.customer?.id?.toString() || '',
        customerName: customerData.customer?.descriptive_name || '',
      };
    }

    return {
      success: false,
      error: 'No customer data returned',
    };
  } catch (error: any) {
    console.error('Google Ads connection test failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Google Ads API Integration
 * Handles authentication and data fetching from Google Ads
 */

import { GoogleAdsApi, Customer } from 'google-ads-api';

// Google Ads API configuration
const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;

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

  // Initialize the Google Ads API client
  const client = new GoogleAdsApi({
    client_id: GOOGLE_ADS_CLIENT_ID!,
    client_secret: GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: GOOGLE_ADS_DEVELOPER_TOKEN!,
  });

  // Create customer instance
  const customer = client.Customer({
    customer_id: GOOGLE_ADS_CUSTOMER_ID!,
    refresh_token: GOOGLE_ADS_REFRESH_TOKEN!,
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
      const customerData = results[0];
      return {
        success: true,
        customerId: customerData.customer.id?.toString() || '',
        customerName: customerData.customer.descriptive_name || '',
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

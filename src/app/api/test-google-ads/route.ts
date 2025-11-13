/**
 * Test Google Ads API Connection
 * GET /api/test-google-ads
 */

import { NextResponse } from 'next/server';
import { testConnection, validateGoogleAdsConfig, fetchCampaignPerformance } from '@/lib/googleAds';

export async function GET() {
  try {
    // Step 1: Validate configuration
    const config = validateGoogleAdsConfig();

    if (!config.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required credentials',
          missingVars: config.missingVars,
        },
        { status: 500 }
      );
    }

    // Step 2: Test connection
    const connectionResult = await testConnection();

    if (!connectionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: connectionResult.error,
          step: 'connection_test',
        },
        { status: 500 }
      );
    }

    // Step 3: Try fetching recent campaign data (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    let campaignData = null;
    try {
      const data = await fetchCampaignPerformance(startDate, endDate);
      campaignData = {
        dateRange: { startDate, endDate },
        totalRecords: data.length,
        sample: data.slice(0, 3), // First 3 records
      };
    } catch (error: any) {
      campaignData = {
        error: 'Could not fetch campaign data',
        message: error.message,
      };
    }

    return NextResponse.json({
      success: true,
      connection: {
        customerId: connectionResult.customerId,
        customerName: connectionResult.customerName,
      },
      credentials: {
        clientId: process.env.GOOGLE_ADS_CLIENT_ID?.substring(0, 20) + '...',
        developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
      },
      campaignData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

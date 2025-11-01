import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateGoogleAdsConfig,
  testConnection,
  fetchCampaignPerformance,
} from '@/lib/googleAds';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/sync/google-ads
 * Sync Google Ads campaign performance data to database
 */
export async function POST(req: NextRequest) {

  try {
    // Step 1: Validate configuration
    console.log('Validating Google Ads API configuration...');
    const config = validateGoogleAdsConfig();

    if (!config.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Google Ads API not configured',
          missingVars: config.missingVars,
          setupGuide: 'See GOOGLE_ADS_API_SETUP.md for setup instructions',
        },
        { status: 400 }
      );
    }

    // Step 2: Test connection
    console.log('Testing Google Ads API connection...');
    const connectionTest = await testConnection();

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Google Ads API connection failed',
          details: connectionTest.error,
        },
        { status: 500 }
      );
    }

    console.log(
      `Successfully connected to Google Ads account: ${connectionTest.customerName} (${connectionTest.customerId})`
    );

    // Step 3: Determine date range (last 30 days by default)
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching campaign data from ${startDateStr} to ${endDateStr}...`);

    // Step 4: Fetch campaign performance data
    const campaignData = await fetchCampaignPerformance(startDateStr, endDateStr);

    console.log(`Found ${campaignData.length} campaign performance records`);

    // Step 5: Store data in database
    let newRecords = 0;
    let updatedRecords = 0;
    const errors = [];

    for (const record of campaignData) {
      try {
        const dbRecord = {
          date: record.date,
          campaign_id: record.campaign_id.toString(),
          campaign_name: record.campaign_name,
          campaign_status: record.campaign_status,
          channel_type: record.channel_type,
          impressions: record.impressions,
          clicks: record.clicks,
          interactions: record.interactions,
          cost: record.cost,
          conversions: record.conversions,
          conversions_value: record.conversions_value,
          all_conversions: record.all_conversions,
          all_conversions_value: record.all_conversions_value,
          view_through_conversions: record.view_through_conversions,
          sync_timestamp: new Date().toISOString(),
          raw_data: record,
        };

        // Insert or update (upsert based on date + campaign_id)
        const { data, error } = await supabase
          .from('google_ads_daily_performance')
          .upsert(dbRecord, {
            onConflict: 'date,campaign_id',
          })
          .select();

        if (error) {
          errors.push({
            campaign_id: record.campaign_id,
            date: record.date,
            error: error.message,
          });
        } else if (data) {
          if (data.length > 0) {
            newRecords++;
          } else {
            updatedRecords++;
          }
        }
      } catch (err: any) {
        errors.push({
          campaign_id: record.campaign_id,
          date: record.date,
          error: err.message,
        });
      }
    }

    // Step 6: Calculate summary statistics
    const { data: stats } = await supabase
      .from('google_ads_daily_performance')
      .select('impressions, clicks, cost, conversions, conversions_value')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    const totalImpressions = stats?.reduce((sum, r) => sum + (r.impressions || 0), 0) || 0;
    const totalClicks = stats?.reduce((sum, r) => sum + (r.clicks || 0), 0) || 0;
    const totalCost = stats?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
    const totalConversions = stats?.reduce((sum, r) => sum + (r.conversions || 0), 0) || 0;
    const totalConversionsValue =
      stats?.reduce((sum, r) => sum + (r.conversions_value || 0), 0) || 0;

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalCost / totalClicks : 0;
    const avgCPA = totalConversions > 0 ? totalCost / totalConversions : 0;
    const roi = totalCost > 0 ? ((totalConversionsValue - totalCost) / totalCost) * 100 : 0;

    return NextResponse.json({
      ok: true,
      message: 'Google Ads sync completed successfully',
      account: {
        customerName: connectionTest.customerName,
        customerId: connectionTest.customerId,
      },
      summary: {
        recordsFetched: campaignData.length,
        newRecords,
        updatedRecords,
        errors: errors.length,
        dateRange: {
          from: startDateStr,
          to: endDateStr,
          days: daysBack,
        },
      },
      statistics: {
        totalImpressions,
        totalClicks,
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalConversions: parseFloat(totalConversions.toFixed(2)),
        totalConversionsValue: parseFloat(totalConversionsValue.toFixed(2)),
        avgCTR: parseFloat(avgCTR.toFixed(2)),
        avgCPC: parseFloat(avgCPC.toFixed(2)),
        avgCPA: parseFloat(avgCPA.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Google Ads sync error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync/google-ads
 * Check Google Ads sync status and configuration
 */
export async function GET(req: NextRequest) {
  // Auth handled by middleware

  try {
    // Check configuration
    const config = validateGoogleAdsConfig();

    if (!config.isValid) {
      return NextResponse.json({
        ok: false,
        configured: false,
        missingVars: config.missingVars,
        setupGuide: 'See GOOGLE_ADS_API_SETUP.md for setup instructions',
      });
    }

    // Test connection
    const connectionTest = await testConnection();

    if (!connectionTest.success) {
      return NextResponse.json({
        ok: false,
        configured: true,
        connected: false,
        error: connectionTest.error,
      });
    }

    // Get sync status from database
    const { data: lastSync } = await supabase
      .from('google_ads_daily_performance')
      .select('sync_timestamp')
      .order('sync_timestamp', { ascending: false })
      .limit(1)
      .single();

    const { count: totalRecords } = await supabase
      .from('google_ads_daily_performance')
      .select('*', { count: 'exact', head: true });

    // Get last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentStats } = await supabase
      .from('google_ads_daily_performance')
      .select('impressions, clicks, cost, conversions')
      .gte('date', sevenDaysAgoStr);

    const last7DaysCost =
      recentStats?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
    const last7DaysConversions =
      recentStats?.reduce((sum, r) => sum + (r.conversions || 0), 0) || 0;

    return NextResponse.json({
      ok: true,
      configured: true,
      connected: true,
      account: {
        customerName: connectionTest.customerName,
        customerId: connectionTest.customerId,
      },
      lastSyncAt: lastSync?.sync_timestamp || null,
      totalRecordsInDatabase: totalRecords || 0,
      last7Days: {
        cost: parseFloat(last7DaysCost.toFixed(2)),
        conversions: parseFloat(last7DaysConversions.toFixed(2)),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

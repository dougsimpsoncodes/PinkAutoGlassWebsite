import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateGoogleAdsConfig,
  testConnection,
  fetchSearchQueryReport,
} from '@/lib/googleAds';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}

/**
 * POST /api/admin/sync/google-ads-search-terms
 * Sync Google Ads Search Query Report to database
 * This shows actual search terms that triggered ads (not just bidded keywords)
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    console.log('Validating Google Ads API configuration...');
    const config = validateGoogleAdsConfig();

    if (!config.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Google Ads API not configured',
          missingVars: config.missingVars,
        },
        { status: 400 }
      );
    }

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
      `Connected to: ${connectionTest.customerName} (${connectionTest.customerId})`
    );

    // Determine date range (last 30 days by default)
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching search query report from ${startDateStr} to ${endDateStr}...`);

    // Fetch search query report
    const searchTermData = await fetchSearchQueryReport(startDateStr, endDateStr);

    console.log(`Found ${searchTermData.length} search term records`);

    // Store data in database
    let newRecords = 0;
    let updatedRecords = 0;
    const errors = [];

    for (const record of searchTermData) {
      try {
        const dbRecord = {
          report_date: record.date,
          search_term: record.search_term,
          search_term_match_type: record.match_type,
          keyword_id: record.ad_group_id, // Using ad_group_id as identifier
          keyword_text: record.ad_group_name,
          campaign_id: record.campaign_id.toString(),
          campaign_name: record.campaign_name,
          impressions: record.impressions,
          clicks: record.clicks,
          cost_micros: Math.round(record.cost * 1000000), // Convert back to micros
          conversions: record.conversions,
          ctr: record.impressions > 0 ? (record.clicks / record.impressions) * 100 : 0,
          cost: record.cost,
          sync_timestamp: new Date().toISOString(),
        };

        // Upsert based on (report_date, search_term, campaign_id)
        const { data, error } = await supabase
          .from('google_ads_search_terms')
          .upsert(dbRecord, {
            onConflict: 'report_date,search_term,campaign_id',
          })
          .select();

        if (error) {
          errors.push({
            search_term: record.search_term,
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
          search_term: record.search_term,
          date: record.date,
          error: err.message,
        });
      }
    }

    // Calculate summary statistics
    const { data: stats } = await supabase
      .from('google_ads_search_terms')
      .select('impressions, clicks, cost, conversions')
      .gte('report_date', startDateStr)
      .lte('report_date', endDateStr);

    const totalImpressions = stats?.reduce((sum, r) => sum + (r.impressions || 0), 0) || 0;
    const totalClicks = stats?.reduce((sum, r) => sum + (r.clicks || 0), 0) || 0;
    const totalCost = stats?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
    const totalConversions = stats?.reduce((sum, r) => sum + (r.conversions || 0), 0) || 0;

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalCost / totalClicks : 0;

    // Get unique search terms count
    const { data: uniqueTerms } = await supabase
      .from('google_ads_search_terms')
      .select('search_term')
      .gte('report_date', startDateStr)
      .lte('report_date', endDateStr);

    const uniqueSearchTerms = new Set(uniqueTerms?.map(t => t.search_term) || []).size;

    return NextResponse.json({
      ok: true,
      message: 'Search query report sync completed successfully',
      account: {
        customerName: connectionTest.customerName,
        customerId: connectionTest.customerId,
      },
      summary: {
        recordsFetched: searchTermData.length,
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
        uniqueSearchTerms,
        totalImpressions,
        totalClicks,
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalConversions: parseFloat(totalConversions.toFixed(2)),
        avgCTR: parseFloat(avgCTR.toFixed(2)),
        avgCPC: parseFloat(avgCPC.toFixed(2)),
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Search query report sync error:', error);
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
 * GET /api/admin/sync/google-ads-search-terms
 * Check search terms sync status
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const config = validateGoogleAdsConfig();

    if (!config.isValid) {
      return NextResponse.json({
        ok: false,
        configured: false,
        missingVars: config.missingVars,
      });
    }

    const connectionTest = await testConnection();

    if (!connectionTest.success) {
      return NextResponse.json({
        ok: false,
        configured: true,
        connected: false,
        error: connectionTest.error,
      });
    }

    // Get sync status
    const { data: lastSync } = await supabase
      .from('google_ads_search_terms')
      .select('sync_timestamp')
      .order('sync_timestamp', { ascending: false })
      .limit(1)
      .single();

    const { count: totalRecords } = await supabase
      .from('google_ads_search_terms')
      .select('*', { count: 'exact', head: true });

    // Get unique search terms
    const { data: uniqueTermsData } = await supabase
      .from('google_ads_search_terms')
      .select('search_term');

    const uniqueTerms = new Set(uniqueTermsData?.map(t => t.search_term) || []).size;

    // Get last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentStats } = await supabase
      .from('google_ads_search_terms')
      .select('impressions, clicks, cost, conversions')
      .gte('report_date', sevenDaysAgoStr);

    const last7DaysImpressions =
      recentStats?.reduce((sum, r) => sum + (r.impressions || 0), 0) || 0;
    const last7DaysClicks =
      recentStats?.reduce((sum, r) => sum + (r.clicks || 0), 0) || 0;
    const last7DaysCost =
      recentStats?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;

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
      uniqueSearchTerms: uniqueTerms,
      last7Days: {
        impressions: last7DaysImpressions,
        clicks: last7DaysClicks,
        cost: parseFloat(last7DaysCost.toFixed(2)),
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

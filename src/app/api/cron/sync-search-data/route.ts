/**
 * Daily Search Data Sync Cron Job
 * Syncs Google Ads search terms and Google Search Console organic queries
 * Triggered by Vercel Cron at 6am MT (1pm UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateGoogleAdsConfig,
  fetchSearchQueryReport,
  fetchCampaignPerformance,
} from '@/lib/googleAds';
import {
  validateSearchConsoleConfig,
  fetchQueryPerformance,
  fetchDailyPerformance,
} from '@/lib/googleSearchConsole';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

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

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting search data sync...');

    const supabase = getSupabaseClient();
    const results = {
      googleAds: {
        campaigns: { success: false, records: 0, error: null as string | null },
        searchTerms: { success: false, records: 0, error: null as string | null },
      },
      googleSearchConsole: {
        queries: { success: false, records: 0, error: null as string | null },
        dailyTotals: { success: false, records: 0, error: null as string | null },
      },
    };

    // Date range: last 7 days (Google Ads data is typically delayed by 1-2 days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // 7 days back

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`📅 Syncing data from ${startDateStr} to ${endDateStr}`);

    // ========================================
    // 1. Sync Google Ads Campaign Performance
    // ========================================
    try {
      const configValid = validateGoogleAdsConfig();
      if (configValid.isValid) {
        console.log('📊 Syncing Google Ads campaigns...');
        const campaignData = await fetchCampaignPerformance(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of campaignData) {
          const dbRecord = {
            date: record.date,
            report_date: record.date,
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

          const { error } = await supabase
            .from('google_ads_daily_performance')
            .upsert(dbRecord, { onConflict: 'date,campaign_id' });

          if (!error) inserted++;
        }

        results.googleAds.campaigns = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} campaign records`);
      } else {
        results.googleAds.campaigns.error = `Missing config: ${configValid.missingVars.join(', ')}`;
        console.warn('⚠️ Google Ads not configured');
      }
    } catch (error: any) {
      results.googleAds.campaigns.error = error.message;
      console.error('❌ Google Ads campaign sync failed:', error.message);
    }

    // ========================================
    // 2. Sync Google Ads Search Terms
    // ========================================
    try {
      const configValid = validateGoogleAdsConfig();
      if (configValid.isValid) {
        console.log('🔍 Syncing Google Ads search terms...');
        const searchTermData = await fetchSearchQueryReport(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of searchTermData) {
          const dbRecord = {
            report_date: record.date,
            search_term: record.search_term,
            search_term_match_type: record.match_type,
            keyword_id: record.ad_group_id,
            keyword_text: record.ad_group_name,
            campaign_id: record.campaign_id.toString(),
            campaign_name: record.campaign_name,
            impressions: record.impressions,
            clicks: record.clicks,
            cost_micros: Math.round(record.cost * 1000000),
            conversions: record.conversions,
            ctr: record.impressions > 0 ? (record.clicks / record.impressions) * 100 : 0,
            cost: record.cost,
            sync_timestamp: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('google_ads_search_terms')
            .upsert(dbRecord, { onConflict: 'report_date,search_term,campaign_id' });

          if (!error) inserted++;
        }

        results.googleAds.searchTerms = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} search term records`);
      } else {
        results.googleAds.searchTerms.error = `Missing config: ${configValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.googleAds.searchTerms.error = error.message;
      console.error('❌ Google Ads search terms sync failed:', error.message);
    }

    // ========================================
    // 3. Sync Google Search Console Queries
    // ========================================
    try {
      const configValid = validateSearchConsoleConfig();
      if (configValid.isValid) {
        console.log('🌐 Syncing Google Search Console queries...');
        const queryData = await fetchQueryPerformance(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of queryData) {
          const dbRecord = {
            date: record.date,
            query: record.query,
            page_url: record.page_url || null,
            impressions: record.impressions,
            clicks: record.clicks,
            ctr: record.ctr,
            position: record.position,
            device_type: record.device_type || null,
            country: 'usa',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('google_search_console_queries')
            .upsert(dbRecord, { onConflict: 'date,query,page_url,device_type' });

          if (!error) inserted++;
        }

        results.googleSearchConsole.queries = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} GSC query records`);
      } else {
        results.googleSearchConsole.queries.error = `Missing config: ${configValid.missingVars.join(', ')}`;
        console.warn('⚠️ Google Search Console not configured');
      }
    } catch (error: any) {
      results.googleSearchConsole.queries.error = error.message;
      console.error('❌ GSC queries sync failed:', error.message);
    }

    // ========================================
    // 4. Sync Google Search Console Daily Totals
    // ========================================
    try {
      const configValid = validateSearchConsoleConfig();
      if (configValid.isValid) {
        console.log('📈 Syncing GSC daily totals...');
        const dailyData = await fetchDailyPerformance(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of dailyData) {
          const dbRecord = {
            date: record.date,
            total_impressions: record.impressions,
            total_clicks: record.clicks,
            average_ctr: record.ctr,
            average_position: record.position,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('google_search_console_daily_totals')
            .upsert(dbRecord, { onConflict: 'date' });

          if (!error) inserted++;
        }

        results.googleSearchConsole.dailyTotals = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} GSC daily total records`);
      } else {
        results.googleSearchConsole.dailyTotals.error = `Missing config: ${configValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.googleSearchConsole.dailyTotals.error = error.message;
      console.error('❌ GSC daily totals sync failed:', error.message);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Search data sync completed in ${duration}s`);

    return NextResponse.json({
      success: true,
      message: `Search data sync completed in ${duration}s`,
      dateRange: {
        from: startDateStr,
        to: endDateStr,
      },
      results,
    });
  } catch (error: any) {
    console.error('❌ Critical error during search data sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

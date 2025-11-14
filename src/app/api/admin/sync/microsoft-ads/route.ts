import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminApiKey } from '@/lib/api-auth';
import {
  validateMicrosoftAdsConfig,
  fetchCampaignPerformance,
  fetchKeywordPerformance,
  fetchSearchTerms,
  getAccountSummary,
} from '@/lib/microsoftAds';


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/admin/sync/microsoft-ads
 * Sync Microsoft Advertising (Bing Ads) campaign performance data to database
 */
export async function POST(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;

  const supabase = getSupabaseClient();

  try {
    // Step 1: Validate configuration
    console.log('Validating Microsoft Ads API configuration...');
    const config = validateMicrosoftAdsConfig();

    if (!config.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Microsoft Ads API not configured',
          missingVars: config.missingVars,
          setupGuide: 'Add Microsoft Ads credentials to .env.local (see /lib/microsoftAds.ts for details)',
        },
        { status: 400 }
      );
    }

    // Step 2: Test connection
    console.log('Testing Microsoft Ads API connection...');
    const accountSummary = await getAccountSummary();

    if (!accountSummary.configured || accountSummary.error) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Microsoft Ads API connection failed',
          details: accountSummary.error || 'Account not configured',
        },
        { status: 500 }
      );
    }

    console.log(`Successfully connected to Microsoft Ads account: ${accountSummary.accountId}`);

    // Step 3: Determine date range (last 30 days by default)
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching Microsoft Ads campaign data from ${startDateStr} to ${endDateStr}...`);

    // Step 4: Fetch campaign performance data
    const campaignData = await fetchCampaignPerformance(startDateStr, endDateStr);
    console.log(`Found ${campaignData.length} campaign performance records`);

    // Step 5: Fetch keyword performance data
    const keywordData = await fetchKeywordPerformance(startDateStr, endDateStr);
    console.log(`Found ${keywordData.length} keyword performance records`);

    // Step 6: Fetch search terms data
    const searchTermsData = await fetchSearchTerms(startDateStr, endDateStr);
    console.log(`Found ${searchTermsData.length} search term records`);

    // Step 7: Store campaign data in database
    let campaignNewRecords = 0;
    let campaignUpdatedRecords = 0;
    const campaignErrors = [];

    for (const record of campaignData) {
      try {
        const { data, error } = await supabase
          .from('microsoft_ads_daily_performance')
          .upsert({
            date: record.date,
            campaign_id: record.campaign_id,
            campaign_name: record.campaign_name,
            campaign_status: record.campaign_status,
            impressions: record.impressions,
            clicks: record.clicks,
            cost_micros: record.cost_micros,
            conversions: record.conversions,
            conversion_value_micros: record.conversion_value_micros,
            ctr: record.ctr,
            average_cpc_micros: record.average_cpc_micros,
            channel_type: record.channel_type,
          }, {
            onConflict: 'date,campaign_id',
          })
          .select();

        if (error) {
          campaignErrors.push({ record, error: error.message });
        } else if (data) {
          campaignNewRecords++;
        }
      } catch (err) {
        console.error('Error upserting Microsoft Ads campaign record:', err);
        campaignErrors.push({ record, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Step 8: Store keyword data in database
    let keywordNewRecords = 0;
    const keywordErrors = [];

    for (const record of keywordData) {
      try {
        const { data, error } = await supabase
          .from('microsoft_ads_keyword_performance')
          .upsert({
            date: record.date,
            campaign_id: record.campaign_id,
            campaign_name: record.campaign_name,
            ad_group_id: record.ad_group_id,
            ad_group_name: record.ad_group_name,
            keyword_id: record.keyword_id,
            keyword_text: record.keyword_text,
            match_type: record.match_type,
            impressions: record.impressions,
            clicks: record.clicks,
            cost_micros: record.cost_micros,
            conversions: record.conversions,
            conversion_value_micros: record.conversion_value_micros,
            ctr: record.ctr,
            average_cpc_micros: record.average_cpc_micros,
            quality_score: record.quality_score,
          }, {
            onConflict: 'date,keyword_id',
          })
          .select();

        if (error) {
          keywordErrors.push({ record, error: error.message });
        } else if (data) {
          keywordNewRecords++;
        }
      } catch (err) {
        console.error('Error upserting Microsoft Ads keyword record:', err);
        keywordErrors.push({ record, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Step 9: Store search terms data in database
    let searchTermsNewRecords = 0;
    const searchTermsErrors = [];

    for (const record of searchTermsData) {
      try {
        const { data, error } = await supabase
          .from('microsoft_ads_search_terms')
          .upsert({
            date: record.date,
            campaign_id: record.campaign_id,
            campaign_name: record.campaign_name,
            ad_group_id: record.ad_group_id,
            ad_group_name: record.ad_group_name,
            keyword_id: record.keyword_id,
            keyword_text: record.keyword_text,
            search_term: record.search_term,
            match_type: record.match_type,
            impressions: record.impressions,
            clicks: record.clicks,
            cost_micros: record.cost_micros,
            conversions: record.conversions,
          }, {
            onConflict: 'date,campaign_id,search_term',
          })
          .select();

        if (error) {
          searchTermsErrors.push({ record, error: error.message });
        } else if (data) {
          searchTermsNewRecords++;
        }
      } catch (err) {
        console.error('Error upserting Microsoft Ads search term record:', err);
        searchTermsErrors.push({ record, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Step 10: Return summary
    const summary = {
      ok: true,
      message: 'Microsoft Ads sync completed',
      dateRange: { start: startDateStr, end: endDateStr },
      campaigns: {
        fetched: campaignData.length,
        stored: campaignNewRecords,
        errors: campaignErrors.length,
      },
      keywords: {
        fetched: keywordData.length,
        stored: keywordNewRecords,
        errors: keywordErrors.length,
      },
      searchTerms: {
        fetched: searchTermsData.length,
        stored: searchTermsNewRecords,
        errors: searchTermsErrors.length,
      },
    };

    if (campaignErrors.length > 0 || keywordErrors.length > 0 || searchTermsErrors.length > 0) {
      console.warn('Some records failed to sync:', {
        campaignErrors: campaignErrors.slice(0, 5),
        keywordErrors: keywordErrors.slice(0, 5),
        searchTermsErrors: searchTermsErrors.slice(0, 5),
      });
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Microsoft Ads sync error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Microsoft Ads sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync/microsoft-ads
 * Check Microsoft Ads configuration status
 */
export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;

  try {
    const config = validateMicrosoftAdsConfig();
    const accountSummary = await getAccountSummary();

    return NextResponse.json({
      configured: config.isValid,
      missingCredentials: config.missingVars,
      account: accountSummary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

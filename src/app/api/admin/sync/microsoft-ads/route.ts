import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
export const maxDuration = 300;

const UPSERT_CHUNK_SIZE = 250;

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

    // Step 4-6: Fetch all report datasets in parallel to reduce sync latency
    const [campaignData, keywordData, searchTermsData] = await Promise.all([
      fetchCampaignPerformance(startDateStr, endDateStr),
      fetchKeywordPerformance(startDateStr, endDateStr),
      fetchSearchTerms(startDateStr, endDateStr),
    ]);

    console.log(`Found ${campaignData.length} campaign performance records`);
    console.log(`Found ${keywordData.length} keyword performance records`);
    console.log(`Found ${searchTermsData.length} search term records`);

    // Step 7: Build upsert payloads
    const campaignRecordsRaw = campaignData.map((record) => ({
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
    }));

    const keywordRecordsRaw = keywordData.map((record) => ({
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
    }));

    const searchTermRecordsRaw = searchTermsData.map((record) => ({
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
    }));

    // Remove duplicate conflict keys before upsert to avoid Postgres
    // "ON CONFLICT DO UPDATE command cannot affect row a second time"
    const campaignRecords = dedupeRecords(
      campaignRecordsRaw,
      (r) => `${r.date}|${r.campaign_id}`
    );
    const keywordRecords = dedupeRecords(
      keywordRecordsRaw,
      (r) => `${r.date}|${r.keyword_id}`
    );
    const searchTermRecords = dedupeRecords(
      searchTermRecordsRaw,
      (r) => `${r.date}|${r.campaign_id}|${r.search_term}`
    );

    // Step 8: Batch upsert for speed/reliability
    const campaignErrors: Array<{ chunk: string; error: string }> = [];
    const keywordErrors: Array<{ chunk: string; error: string }> = [];
    const searchTermsErrors: Array<{ chunk: string; error: string }> = [];

    const [campaignStored, keywordStored, searchTermsStored] = await Promise.all([
      upsertInChunks(
        supabase,
        'microsoft_ads_daily_performance',
        campaignRecords,
        'date,campaign_id',
        campaignErrors
      ),
      upsertInChunks(
        supabase,
        'microsoft_ads_keyword_performance',
        keywordRecords,
        'date,keyword_id',
        keywordErrors
      ),
      upsertInChunks(
        supabase,
        'microsoft_ads_search_terms',
        searchTermRecords,
        'date,campaign_id,search_term',
        searchTermsErrors
      ),
    ]);

    // Step 10: Return summary
    const summary = {
      ok: true,
      message: 'Microsoft Ads sync completed',
      dateRange: { start: startDateStr, end: endDateStr },
      campaigns: {
        fetched: campaignData.length,
        stored: campaignStored,
        errors: campaignErrors.length,
      },
      keywords: {
        fetched: keywordData.length,
        stored: keywordStored,
        errors: keywordErrors.length,
      },
      searchTerms: {
        fetched: searchTermsData.length,
        stored: searchTermsStored,
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

async function upsertInChunks<T extends Record<string, any>>(
  supabase: ReturnType<typeof getSupabaseClient>,
  table: string,
  records: T[],
  onConflict: string,
  errors: Array<{ chunk: string; error: string }>
): Promise<number> {
  let stored = 0;

  for (let i = 0; i < records.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = records.slice(i, i + UPSERT_CHUNK_SIZE);
    const chunkLabel = `${i}-${i + chunk.length - 1}`;

    try {
      const { error } = await supabase
        .from(table)
        .upsert(chunk, { onConflict });

      if (error) {
        errors.push({ chunk: chunkLabel, error: error.message });
      } else {
        stored += chunk.length;
      }
    } catch (err) {
      errors.push({
        chunk: chunkLabel,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return stored;
}

function dedupeRecords<T>(
  records: T[],
  keyFn: (record: T) => string
): T[] {
  const byKey = new Map<string, T>();
  for (const record of records) {
    byKey.set(keyFn(record), record);
  }
  return Array.from(byKey.values());
}

/**
 * GET /api/admin/sync/microsoft-ads
 * Check Microsoft Ads configuration status
 */
export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

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

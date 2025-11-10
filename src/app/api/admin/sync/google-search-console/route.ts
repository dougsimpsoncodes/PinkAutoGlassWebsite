import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateSearchConsoleConfig,
  fetchDailyPerformance,
  fetchPagePerformance,
  fetchQueryPerformance,
  verifySiteAccess,
} from '@/lib/googleSearchConsole';


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
 * POST /api/admin/sync/google-search-console
 * Sync Google Search Console organic performance data to database
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // Step 1: Validate configuration
    console.log('Validating Google Search Console API configuration...');
    const config = validateSearchConsoleConfig();

    if (!config.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Google Search Console API not configured',
          missingVars: config.missingVars,
          setupGuide: 'Add Google Search Console credentials to .env.local (see /lib/googleSearchConsole.ts)',
        },
        { status: 400 }
      );
    }

    // Step 2: Verify site access
    console.log('Verifying site access...');
    const accessCheck = await verifySiteAccess();

    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Google Search Console site access failed',
          details: accessCheck.error,
        },
        { status: 500 }
      );
    }

    console.log(`Successfully connected to Search Console for site: ${accessCheck.siteUrl}`);

    // Step 3: Determine date range (last 30 days by default, Search Console has 2-3 day delay)
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // Account for Search Console data delay

    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching Search Console data from ${startDateStr} to ${endDateStr}...`);

    // Step 4: Fetch daily totals
    const dailyData = await fetchDailyPerformance(startDateStr, endDateStr);
    console.log(`Found ${dailyData.length} daily performance records`);

    // Step 5: Fetch page-level performance
    const pageData = await fetchPagePerformance(startDateStr, endDateStr);
    console.log(`Found ${pageData.length} page performance records`);

    // Step 6: Fetch query performance
    const queryData = await fetchQueryPerformance(startDateStr, endDateStr);
    console.log(`Found ${queryData.length} query performance records`);

    // Step 7: Store daily totals in database
    let dailyNewRecords = 0;
    const dailyErrors = [];

    for (const record of dailyData) {
      try {
        const { data, error } = await supabase
          .from('google_search_console_daily_totals')
          .upsert({
            date: record.date,
            total_impressions: record.impressions,
            total_clicks: record.clicks,
            average_ctr: record.ctr,
            average_position: record.position,
          }, {
            onConflict: 'date',
          })
          .select();

        if (error) {
          dailyErrors.push({ record, error: error.message });
        } else if (data) {
          dailyNewRecords++;
        }
      } catch (err) {
        console.error('Error upserting Search Console daily record:', err);
        dailyErrors.push({ record, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Step 8: Store page performance in database
    let pageNewRecords = 0;
    const pageErrors = [];

    for (const record of pageData) {
      try {
        const { data, error } = await supabase
          .from('google_search_console_performance')
          .upsert({
            date: record.date,
            page_url: record.page_url,
            device_type: record.device_type,
            impressions: record.impressions,
            clicks: record.clicks,
            ctr: record.ctr,
            position: record.position,
          }, {
            onConflict: 'date,page_url,device_type',
          })
          .select();

        if (error) {
          pageErrors.push({ record, error: error.message });
        } else if (data) {
          pageNewRecords++;
        }
      } catch (err) {
        console.error('Error upserting Search Console page record:', err);
        pageErrors.push({ record, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Step 9: Store query performance in database
    let queryNewRecords = 0;
    const queryErrors = [];

    for (const record of queryData) {
      try {
        const { data, error } = await supabase
          .from('google_search_console_queries')
          .upsert({
            date: record.date,
            query: record.query,
            page_url: record.page_url,
            device_type: record.device_type,
            impressions: record.impressions,
            clicks: record.clicks,
            ctr: record.ctr,
            position: record.position,
          }, {
            onConflict: 'date,query,page_url,device_type',
          })
          .select();

        if (error) {
          queryErrors.push({ record, error: error.message });
        } else if (data) {
          queryNewRecords++;
        }
      } catch (err) {
        console.error('Error upserting Search Console query record:', err);
        queryErrors.push({ record, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    // Step 10: Return summary
    const summary = {
      ok: true,
      message: 'Google Search Console sync completed',
      dateRange: { start: startDateStr, end: endDateStr },
      daily: {
        fetched: dailyData.length,
        stored: dailyNewRecords,
        errors: dailyErrors.length,
      },
      pages: {
        fetched: pageData.length,
        stored: pageNewRecords,
        errors: pageErrors.length,
      },
      queries: {
        fetched: queryData.length,
        stored: queryNewRecords,
        errors: queryErrors.length,
      },
    };

    if (dailyErrors.length > 0 || pageErrors.length > 0 || queryErrors.length > 0) {
      console.warn('Some records failed to sync:', {
        dailyErrors: dailyErrors.slice(0, 5),
        pageErrors: pageErrors.slice(0, 5),
        queryErrors: queryErrors.slice(0, 5),
      });
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Google Search Console sync error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Google Search Console sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync/google-search-console
 * Check Google Search Console configuration status
 */
export async function GET() {
  try {
    const config = validateSearchConsoleConfig();
    const accessCheck = await verifySiteAccess();

    return NextResponse.json({
      configured: config.isValid,
      missingCredentials: config.missingVars,
      siteAccess: accessCheck,
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

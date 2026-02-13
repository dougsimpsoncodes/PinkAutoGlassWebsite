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
export const maxDuration = 300;

const UPSERT_CHUNK_SIZE = 250;

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
    } catch (error) {
      errors.push({
        chunk: chunkLabel,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return stored;
}

function dedupeRecords<T>(records: T[], keyFn: (record: T) => string): T[] {
  const byKey = new Map<string, T>();
  for (const record of records) {
    byKey.set(keyFn(record), record);
  }
  return Array.from(byKey.values());
}

/**
 * POST /api/admin/sync/google-search-console
 * Sync Google Search Console organic performance data to database
 */
export async function POST(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

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

    // Step 4-6: Fetch all datasets in parallel
    const [dailyData, pageData, queryData] = await Promise.all([
      fetchDailyPerformance(startDateStr, endDateStr),
      fetchPagePerformance(startDateStr, endDateStr),
      fetchQueryPerformance(startDateStr, endDateStr),
    ]);

    console.log(`Found ${dailyData.length} daily performance records`);
    console.log(`Found ${pageData.length} page performance records`);
    console.log(`Found ${queryData.length} query performance records`);

    // Step 7: Build deduped upsert payloads
    const dailyRecords = dedupeRecords(
      dailyData.map((record) => ({
        date: record.date,
        total_impressions: record.impressions,
        total_clicks: record.clicks,
        average_ctr: record.ctr,
        average_position: record.position,
      })),
      (r) => r.date
    );

    const pageRecords = dedupeRecords(
      pageData.map((record) => ({
        date: record.date,
        page_url: record.page_url,
        device_type: record.device_type,
        impressions: record.impressions,
        clicks: record.clicks,
        ctr: record.ctr,
        position: record.position,
      })),
      (r) => `${r.date}|${r.page_url}|${r.device_type}`
    );

    const queryRecords = dedupeRecords(
      queryData.map((record) => ({
        date: record.date,
        query: record.query,
        page_url: record.page_url,
        device_type: record.device_type,
        impressions: record.impressions,
        clicks: record.clicks,
        ctr: record.ctr,
        position: record.position,
      })),
      (r) => `${r.date}|${r.query}|${r.page_url}|${r.device_type}`
    );

    // Step 8: Batch upsert each table
    const dailyErrors: Array<{ chunk: string; error: string }> = [];
    const pageErrors: Array<{ chunk: string; error: string }> = [];
    const queryErrors: Array<{ chunk: string; error: string }> = [];

    const [dailyStored, pageStored, queryStored] = await Promise.all([
      upsertInChunks(
        supabase,
        'google_search_console_daily_totals',
        dailyRecords,
        'date',
        dailyErrors
      ),
      upsertInChunks(
        supabase,
        'google_search_console_performance',
        pageRecords,
        'date,page_url,device_type',
        pageErrors
      ),
      upsertInChunks(
        supabase,
        'google_search_console_queries',
        queryRecords,
        'date,query,page_url,device_type',
        queryErrors
      ),
    ]);

    // Step 10: Return summary
    const summary = {
      ok: true,
      message: 'Google Search Console sync completed',
      dateRange: { start: startDateStr, end: endDateStr },
      daily: {
        fetched: dailyData.length,
        stored: dailyStored,
        errors: dailyErrors.length,
      },
      pages: {
        fetched: pageData.length,
        stored: pageStored,
        errors: pageErrors.length,
      },
      queries: {
        fetched: queryData.length,
        stored: queryStored,
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
export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { isMarketFilter, type MarketFilter, type Market } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Satellite Domain Definitions ────────────────────────────────────────────
//
// `market` field allows the route to filter the GSC fetch list when the admin
// market toggle is set, saving GSC API calls. Page-side filtering still
// applies as a defense-in-depth measure.
//
// 'colorado' / 'arizona' map directly to the admin toggle. 'national' domains
// have no clear market home — they're shown under "All Markets" and hidden
// under specific toggles (matches existing client-side filter behavior).
//
// Colorado Springs / Fort Collins are CO-based; tagged 'colorado'.

type SatelliteMarket = 'colorado' | 'arizona' | 'national';

export const SATELLITE_DOMAINS: ReadonlyArray<{
  domain: string; utmSource: string; label: string; color: string; market: SatelliteMarket;
}> = [
  // ── Denver / Colorado ──────────────────────────────────────────────────────
  { domain: 'windshieldcostcalculator.com', utmSource: 'windshieldcostcalculator', label: 'WS Cost Calculator', color: '#6366f1', market: 'colorado' },
  { domain: 'windshielddenver.com', utmSource: 'windshielddenver', label: 'WS Denver', color: '#ec4899', market: 'colorado' },
  { domain: 'windshieldchiprepairdenver.com', utmSource: 'chiprepairdenver', label: 'Chip Repair Denver', color: '#f59e0b', market: 'colorado' },
  { domain: 'windshieldchiprepairboulder.com', utmSource: 'chiprepairboulder', label: 'Chip Repair Boulder', color: '#10b981', market: 'colorado' },
  { domain: 'aurorawindshield.com', utmSource: 'aurorawindshield', label: 'Aurora WS', color: '#3b82f6', market: 'colorado' },
  { domain: 'mobilewindshielddenver.com', utmSource: 'mobilewindshielddenver', label: 'Mobile WS Denver', color: '#8b5cf6', market: 'colorado' },
  { domain: 'cheapestwindshieldnearme.com', utmSource: 'cheapestwindshield', label: 'Cheapest WS Near Me', color: '#ef4444', market: 'colorado' },
  { domain: 'newwindshieldcost.com', utmSource: 'newwindshieldcost', label: 'New WS Cost', color: '#06b6d4', market: 'colorado' },
  { domain: 'getawindshieldquote.com', utmSource: 'getawindshieldquote', label: 'Get WS Quote', color: '#84cc16', market: 'colorado' },
  { domain: 'newwindshieldnearme.com', utmSource: 'newwindshieldnearme', label: 'New WS Near Me', color: '#f97316', market: 'colorado' },
  { domain: 'windshieldpricecompare.com', utmSource: 'windshieldpricecompare', label: 'WS Price Compare', color: '#14b8a6', market: 'colorado' },
  // ── Phoenix / Arizona ─────────────────────────────────────────────────────
  { domain: 'windshieldchiprepairmesa.com', utmSource: 'chiprepairmesa', label: 'Chip Repair Mesa', color: '#f43f5e', market: 'arizona' },
  { domain: 'windshieldchiprepairphoenix.com', utmSource: 'chiprepairphoenix', label: 'Chip Repair Phoenix', color: '#e11d48', market: 'arizona' },
  { domain: 'windshieldchiprepairscottsdale.com', utmSource: 'chiprepairscottsdale', label: 'Chip Repair Scottsdale', color: '#be123c', market: 'arizona' },
  { domain: 'windshieldchiprepairtempe.com', utmSource: 'chiprepairtempe', label: 'Chip Repair Tempe', color: '#9f1239', market: 'arizona' },
  { domain: 'windshieldcostphoenix.com', utmSource: 'windshieldcostphoenix', label: 'WS Cost Phoenix', color: '#b45309', market: 'arizona' },
  { domain: 'mobilewindshieldphoenix.com', utmSource: 'mobilewindshieldphoenix', label: 'Mobile WS Phoenix', color: '#92400e', market: 'arizona' },
  // ── National ──────────────────────────────────────────────────────────────
  { domain: 'carwindshieldprices.com', utmSource: 'carwindshieldprices', label: 'Car WS Prices', color: '#0369a1', market: 'national' },
  { domain: 'windshieldrepairprices.com', utmSource: 'windshieldrepairprices', label: 'WS Repair Prices', color: '#0c4a6e', market: 'national' },
  { domain: 'carglassprices.com', utmSource: 'carglassprices', label: 'Car Glass Prices', color: '#0284c7', market: 'national' },
  // ── Colorado Springs / Fort Collins (Colorado market) ─────────────────────
  { domain: 'coloradospringswindshield.com', utmSource: 'coloradospringswindshield', label: 'CS Windshield', color: '#0891b2', market: 'colorado' },
  { domain: 'autoglasscoloradosprings.com', utmSource: 'autoglasscoloradosprings', label: 'CS Auto Glass', color: '#0e7490', market: 'colorado' },
  { domain: 'mobilewindshieldcoloradosprings.com', utmSource: 'mobilewindshieldcoloradosprings', label: 'CS Mobile WS', color: '#155e75', market: 'colorado' },
  { domain: 'windshieldreplacementfortcollins.com', utmSource: 'windshieldreplacementfortcollins', label: 'Ft Collins WS', color: '#164e63', market: 'colorado' },
] as const;

export type SatelliteDomain = (typeof SATELLITE_DOMAINS)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface DomainResult {
  domain: string;
  label: string;
  color: string;
  utmSource: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  leads: number;
  daily: DailyRow[];
  gscError?: string;
}

// ─── GSC Client Factory ───────────────────────────────────────────────────────

function createGscClient() {
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing GSC credentials: GOOGLE_SEARCH_CONSOLE_CLIENT_ID/GOOGLE_ADS_CLIENT_ID, GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET/GOOGLE_ADS_CLIENT_SECRET, GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.searchconsole({ version: 'v1', auth: oauth2Client });
}

// ─── GSC Fetch for a Single Domain ───────────────────────────────────────────

async function fetchDomainGsc(
  domain: string,
  startDate: string,
  endDate: string
): Promise<{ summary: { clicks: number; impressions: number; ctr: number; position: number }; daily: DailyRow[]; error?: string }> {
  const zeros = { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  try {
    const searchConsole = createGscClient();
    const siteUrl = `sc-domain:${domain}`;

    // Run summary and daily fetches in parallel
    const [summaryRes, dailyRes] = await Promise.allSettled([
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: [],
          rowLimit: 1,
        },
      }),
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 500,
        },
      }),
    ]);

    // Parse summary
    let summary = zeros;
    if (summaryRes.status === 'fulfilled') {
      const rows = summaryRes.value.data.rows;
      if (rows && rows.length > 0) {
        const row = rows[0] as any;
        summary = {
          clicks: row.clicks ?? 0,
          impressions: row.impressions ?? 0,
          ctr: row.ctr ?? 0,
          position: row.position ?? 0,
        };
      }
    } else {
      const err = summaryRes.reason;
      const code = err?.code || err?.status;
      // 403 = not verified, 404 = not found — treat as no data, not a crash
      if (code === 403 || code === 404 || code === '403' || code === '404') {
        return { summary: zeros, daily: [], error: `Domain not verified in GSC (${code})` };
      }
      throw err;
    }

    // Parse daily rows
    let daily: DailyRow[] = [];
    if (dailyRes.status === 'fulfilled') {
      const rows = dailyRes.value.data.rows;
      if (rows && rows.length > 0) {
        daily = (rows as any[]).map((row) => ({
          date: row.keys[0],
          clicks: row.clicks ?? 0,
          impressions: row.impressions ?? 0,
          ctr: row.ctr ?? 0,
          position: row.position ?? 0,
        }));
      }
    }
    // If daily failed but summary succeeded, we just return empty daily — not fatal

    return { summary, daily };
  } catch (err: any) {
    const code = err?.code || err?.status;
    // Gracefully handle known non-crash errors
    if (code === 403 || code === 404 || code === '403' || code === '404') {
      return { summary: zeros, daily: [], error: `Domain not verified in GSC (${code})` };
    }
    console.error(`GSC fetch error for ${domain}:`, err?.message || err);
    return { summary: zeros, daily: [], error: err?.message || 'GSC fetch failed' };
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate query params are required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const marketParam = searchParams.get('market');
    if (marketParam !== null && !isMarketFilter(marketParam)) {
      return NextResponse.json(
        { error: 'Invalid market. Must be one of: all, colorado, arizona' },
        { status: 400 }
      );
    }
    const market: MarketFilter = (marketParam as MarketFilter) || 'all';

    // Filter the domain list before doing any work — saves up to 18 GSC API
    // calls when a specific market is selected. National domains are hidden
    // under specific-market views (matches existing client-side behavior).
    const inScope = market === 'all'
      ? [...SATELLITE_DOMAINS]
      : SATELLITE_DOMAINS.filter((d) => d.market === market);

    // ── Fetch GSC data for in-scope domains in parallel ────────────────────
    const gscResults = await Promise.allSettled(
      inScope.map((sat) => fetchDomainGsc(sat.domain, startDate, endDate))
    );

    // ── Query Supabase for lead counts per utm_source ──────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const utmSources = inScope.map((d) => d.utmSource);

    const { data: leadRows, error: leadError } = await supabase
      .from('leads')
      .select('utm_source')
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z')
      .in('utm_source', utmSources);

    if (leadError) {
      console.error('Supabase leads query error:', leadError);
    }

    // Build a map of utm_source → lead count
    const leadCounts: Record<string, number> = {};
    for (const utmSource of utmSources) {
      leadCounts[utmSource] = 0;
    }
    if (leadRows) {
      for (const row of leadRows) {
        if (row.utm_source && leadCounts[row.utm_source] !== undefined) {
          leadCounts[row.utm_source]++;
        }
      }
    }

    // ── Assemble domain results ────────────────────────────────────────────
    const domains: DomainResult[] = inScope.map((sat, idx) => {
      const gscResult = gscResults[idx];
      let summary = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
      let daily: DailyRow[] = [];
      let gscError: string | undefined;

      if (gscResult.status === 'fulfilled') {
        summary = gscResult.value.summary;
        daily = gscResult.value.daily;
        gscError = gscResult.value.error;
      } else {
        gscError = gscResult.reason?.message || 'Unknown GSC error';
      }

      return {
        domain: sat.domain,
        label: sat.label,
        color: sat.color,
        utmSource: sat.utmSource,
        clicks: summary.clicks,
        impressions: summary.impressions,
        ctr: summary.ctr,
        position: summary.position,
        leads: leadCounts[sat.utmSource] ?? 0,
        daily,
        ...(gscError ? { gscError } : {}),
      };
    });

    return NextResponse.json({
      domains,
      dateRange: { startDate, endDate },
    });
  } catch (err: any) {
    console.error('satellite-domains route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

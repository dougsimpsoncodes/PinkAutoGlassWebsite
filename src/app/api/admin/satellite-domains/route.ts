import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Satellite Domain Definitions ────────────────────────────────────────────

export const SATELLITE_DOMAINS = [
  // ── Denver / Colorado ──────────────────────────────────────────────────────
  { domain: 'windshieldcostcalculator.com', utmSource: 'windshieldcostcalculator', label: 'WS Cost Calculator', color: '#6366f1' },
  { domain: 'windshielddenver.com', utmSource: 'windshielddenver', label: 'WS Denver', color: '#ec4899' },
  { domain: 'windshieldchiprepairdenver.com', utmSource: 'chiprepairdenver', label: 'Chip Repair Denver', color: '#f59e0b' },
  { domain: 'windshieldchiprepairboulder.com', utmSource: 'chiprepairboulder', label: 'Chip Repair Boulder', color: '#10b981' },
  { domain: 'aurorawindshield.com', utmSource: 'aurorawindshield', label: 'Aurora WS', color: '#3b82f6' },
  { domain: 'mobilewindshielddenver.com', utmSource: 'mobilewindshielddenver', label: 'Mobile WS Denver', color: '#8b5cf6' },
  { domain: 'cheapestwindshieldnearme.com', utmSource: 'cheapestwindshield', label: 'Cheapest WS Near Me', color: '#ef4444' },
  { domain: 'newwindshieldcost.com', utmSource: 'newwindshieldcost', label: 'New WS Cost', color: '#06b6d4' },
  { domain: 'getawindshieldquote.com', utmSource: 'getawindshieldquote', label: 'Get WS Quote', color: '#84cc16' },
  { domain: 'newwindshieldnearme.com', utmSource: 'newwindshieldnearme', label: 'New WS Near Me', color: '#f97316' },
  { domain: 'windshieldpricecompare.com', utmSource: 'windshieldpricecompare', label: 'WS Price Compare', color: '#14b8a6' },
  // ── Phoenix / Arizona ─────────────────────────────────────────────────────
  { domain: 'windshieldchiprepairmesa.com', utmSource: 'chiprepairmesa', label: 'Chip Repair Mesa', color: '#f43f5e' },
  { domain: 'windshieldchiprepairphoenix.com', utmSource: 'chiprepairphoenix', label: 'Chip Repair Phoenix', color: '#e11d48' },
  { domain: 'windshieldchiprepairscottsdale.com', utmSource: 'chiprepairscottsdale', label: 'Chip Repair Scottsdale', color: '#be123c' },
  { domain: 'windshieldchiprepairtempe.com', utmSource: 'chiprepairtempe', label: 'Chip Repair Tempe', color: '#9f1239' },
  { domain: 'windshieldcostphoenix.com', utmSource: 'windshieldcostphoenix', label: 'WS Cost Phoenix', color: '#b45309' },
  { domain: 'mobilewindshieldphoenix.com', utmSource: 'mobilewindshieldphoenix', label: 'Mobile WS Phoenix', color: '#92400e' },
  // ── National ──────────────────────────────────────────────────────────────
  { domain: 'carwindshieldprices.com', utmSource: 'carwindshieldprices', label: 'Car WS Prices', color: '#0369a1' },
  { domain: 'windshieldrepairprices.com', utmSource: 'windshieldrepairprices', label: 'WS Repair Prices', color: '#0c4a6e' },
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

    // ── Fetch GSC data for all 11 domains in parallel ──────────────────────
    const gscResults = await Promise.allSettled(
      SATELLITE_DOMAINS.map((sat) => fetchDomainGsc(sat.domain, startDate, endDate))
    );

    // ── Query Supabase for lead counts per utm_source ──────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const utmSources = SATELLITE_DOMAINS.map((d) => d.utmSource);

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
    const domains: DomainResult[] = SATELLITE_DOMAINS.map((sat, idx) => {
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

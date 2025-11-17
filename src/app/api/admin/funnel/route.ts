import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  deduplicateCustomers,
  getCustomerBreakdown,
  type RingCentralCall,
  type FormLead,
} from '@/lib/customerDeduplication';


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/funnel?startDate=2025-10-01&endDate=2025-11-01
 *
 * Three-Metric Funnel Dashboard: Impressions → Clicks → Unique Customers
 *
 * Returns data for all 3 platforms: Google Ads, Bing Ads, Organic
 *
 * Response:
 * {
 *   "ok": true,
 *   "dateRange": { "start": "2025-10-01", "end": "2025-11-01" },
 *   "platforms": {
 *     "google_ads": {
 *       "impressions": 12500,
 *       "clicks": 850,
 *       "uniqueCustomers": 45,
 *       "breakdown": { "byCall": 30, "byForm": 15 },
 *       "cost": 1250.50,
 *       "ctr": 6.8,
 *       "conversionRate": 5.3,
 *       "costPerCustomer": 27.79
 *     },
 *     "bing_ads": { ... },
 *     "organic": { ... }
 *   },
 *   "totals": {
 *     "impressions": 45000,
 *     "clicks": 2100,
 *     "uniqueCustomers": 78,
 *     "breakdown": { "byCall": 65, "byForm": 13 },
 *     "totalCost": 3200.00,
 *     "avgCostPerCustomer": 41.03
 *   }
 * }
 */

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    console.log(`📊 Fetching funnel data for ${startDate} to ${endDate}...`);

    const client = getSupabaseClient();

    // =============================================================================
    // FETCH ALL DATA IN PARALLEL
    // =============================================================================

    const [
      googleAdsResult,
      bingAdsResult,
      organicResult,
      callsResult,
      formsResult,
    ] = await Promise.allSettled([
      // Google Ads performance
      client
        .from('google_ads_daily_performance')
        .select('impressions, clicks, cost_micros')
        .gte('date', startDate)
        .lte('date', endDate),

      // Bing Ads performance
      client
        .from('microsoft_ads_daily_performance')
        .select('impressions, clicks, cost_micros')
        .gte('date', startDate)
        .lte('date', endDate),

      // Organic (Google Search Console)
      client
        .from('google_search_console_daily_totals')
        .select('impressions, clicks')
        .gte('date', startDate)
        .lte('date', endDate),

      // RingCentral calls with attribution
      client
        .from('ringcentral_calls')
        .select('from_number, start_time, direction, result, duration, utm_source, utm_medium, utm_campaign, ad_platform')
        .eq('direction', 'Inbound')
        .gte('start_time', startDate)
        .lte('start_time', endDate),

      // Form submissions with attribution
      client
        .from('leads')
        .select('phone, created_at, utm_source, utm_medium, utm_campaign, ad_platform, gclid, msclkid')
        .gte('created_at', startDate)
        .lte('created_at', endDate),
    ]);

    // =============================================================================
    // AGGREGATE PLATFORM METRICS
    // =============================================================================

    // Google Ads
    const googleAdsData = googleAdsResult.status === 'fulfilled' ? googleAdsResult.value.data : [];
    const googleImpressions = googleAdsData?.reduce((sum: number, row: any) => sum + (row.impressions || 0), 0) || 0;
    const googleClicks = googleAdsData?.reduce((sum: number, row: any) => sum + (row.clicks || 0), 0) || 0;
    const googleCostMicros = googleAdsData?.reduce((sum: number, row: any) => sum + (row.cost_micros || 0), 0) || 0;
    const googleCost = googleCostMicros / 1000000;

    // Bing Ads
    const bingAdsData = bingAdsResult.status === 'fulfilled' ? bingAdsResult.value.data : [];
    const bingImpressions = bingAdsData?.reduce((sum: number, row: any) => sum + (row.impressions || 0), 0) || 0;
    const bingClicks = bingAdsData?.reduce((sum: number, row: any) => sum + (row.clicks || 0), 0) || 0;
    const bingCostMicros = bingAdsData?.reduce((sum: number, row: any) => sum + (row.cost_micros || 0), 0) || 0;
    const bingCost = bingCostMicros / 1000000;

    // Organic
    const organicData = organicResult.status === 'fulfilled' ? organicResult.value.data : [];
    const organicImpressions = organicData?.reduce((sum: number, row: any) => sum + (row.impressions || 0), 0) || 0;
    const organicClicks = organicData?.reduce((sum: number, row: any) => sum + (row.clicks || 0), 0) || 0;

    // =============================================================================
    // DEDUPLICATE CUSTOMERS BY PHONE NUMBER
    // =============================================================================

    const calls: RingCentralCall[] = callsResult.status === 'fulfilled' ? (callsResult.value.data || []) : [];
    const forms: FormLead[] = formsResult.status === 'fulfilled' ? (formsResult.value.data || []) : [];

    // Get all unique customers
    const allUniqueCustomers = deduplicateCustomers(calls, forms);

    // Split by platform
    const googleCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'google');
    const bingCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'bing');
    const organicCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'organic');
    const directCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'direct' || c.attribution.platform === 'unknown');

    // Get breakdowns
    const googleBreakdown = getCustomerBreakdown(googleCustomers);
    const bingBreakdown = getCustomerBreakdown(bingCustomers);
    const organicBreakdown = getCustomerBreakdown(organicCustomers);
    const directBreakdown = getCustomerBreakdown(directCustomers);
    const totalBreakdown = getCustomerBreakdown(allUniqueCustomers);

    // =============================================================================
    // BUILD RESPONSE
    // =============================================================================

    const platforms = {
      google_ads: {
        impressions: googleImpressions,
        clicks: googleClicks,
        uniqueCustomers: googleBreakdown.total,
        breakdown: {
          byCall: googleBreakdown.byCall,
          byForm: googleBreakdown.byForm,
        },
        cost: parseFloat(googleCost.toFixed(2)),
        ctr: googleImpressions > 0 ? parseFloat(((googleClicks / googleImpressions) * 100).toFixed(2)) : 0,
        conversionRate: googleClicks > 0 ? parseFloat(((googleBreakdown.total / googleClicks) * 100).toFixed(2)) : 0,
        costPerCustomer: googleBreakdown.total > 0 ? parseFloat((googleCost / googleBreakdown.total).toFixed(2)) : 0,
      },
      bing_ads: {
        impressions: bingImpressions,
        clicks: bingClicks,
        uniqueCustomers: bingBreakdown.total,
        breakdown: {
          byCall: bingBreakdown.byCall,
          byForm: bingBreakdown.byForm,
        },
        cost: parseFloat(bingCost.toFixed(2)),
        ctr: bingImpressions > 0 ? parseFloat(((bingClicks / bingImpressions) * 100).toFixed(2)) : 0,
        conversionRate: bingClicks > 0 ? parseFloat(((bingBreakdown.total / bingClicks) * 100).toFixed(2)) : 0,
        costPerCustomer: bingBreakdown.total > 0 ? parseFloat((bingCost / bingBreakdown.total).toFixed(2)) : 0,
      },
      organic: {
        impressions: organicImpressions,
        clicks: organicClicks,
        uniqueCustomers: organicBreakdown.total,
        breakdown: {
          byCall: organicBreakdown.byCall,
          byForm: organicBreakdown.byForm,
        },
        cost: 0,
        ctr: organicImpressions > 0 ? parseFloat(((organicClicks / organicImpressions) * 100).toFixed(2)) : 0,
        conversionRate: organicClicks > 0 ? parseFloat(((organicBreakdown.total / organicClicks) * 100).toFixed(2)) : 0,
        costPerCustomer: 0,
      },
      direct: {
        impressions: 0,
        clicks: 0,
        uniqueCustomers: directBreakdown.total,
        breakdown: {
          byCall: directBreakdown.byCall,
          byForm: directBreakdown.byForm,
        },
        cost: 0,
        ctr: 0,
        conversionRate: 0,
        costPerCustomer: 0,
      },
    };

    const totalCost = googleCost + bingCost;
    const totalImpressions = googleImpressions + bingImpressions + organicImpressions;
    const totalClicks = googleClicks + bingClicks + organicClicks;

    const totals = {
      impressions: totalImpressions,
      clicks: totalClicks,
      uniqueCustomers: totalBreakdown.total,
      breakdown: {
        byCall: totalBreakdown.byCall,
        byForm: totalBreakdown.byForm,
      },
      totalCost: parseFloat(totalCost.toFixed(2)),
      avgCostPerCustomer: totalBreakdown.total > 0 ? parseFloat((totalCost / totalBreakdown.total).toFixed(2)) : 0,
      overallCTR: totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
      overallConversionRate: totalClicks > 0 ? parseFloat(((totalBreakdown.total / totalClicks) * 100).toFixed(2)) : 0,
    };

    console.log(`✅ Funnel data fetched:`, {
      platforms: Object.keys(platforms).map(k => `${k}: ${(platforms as any)[k].uniqueCustomers} customers`),
      totals: `${totals.uniqueCustomers} unique customers (${totals.breakdown.byCall} call, ${totals.breakdown.byForm} form)`,
    });

    return NextResponse.json({
      ok: true,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      platforms,
      totals,
    });

  } catch (error: any) {
    console.error('Funnel data error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

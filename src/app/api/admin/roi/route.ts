import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  deduplicateCustomers,
  type RingCentralCall,
  type FormLead,
} from '@/lib/customerDeduplication';


// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/roi?startDate=2025-10-01&endDate=2025-11-01
 *
 * ROI Dashboard: Revenue, Cost, and ROI by platform
 *
 * Response:
 * {
 *   "ok": true,
 *   "platforms": {
 *     "google_ads": {
 *       "uniqueCustomers": 45,
 *       "cost": 1250.50,
 *       "revenue": 18750.00,
 *       "costPerCustomer": 27.79,
 *       "revenuePerCustomer": 416.67,
 *       "roi": 15.0,  // (Revenue / Cost)
 *       "profit": 17499.50
 *     },
 *     ...
 *   },
 *   "totals": {
 *     "uniqueCustomers": 78,
 *     "totalCost": 3200.00,
 *     "totalRevenue": 45000.00,
 *     "avgCostPerCustomer": 41.03,
 *     "avgRevenuePerCustomer": 576.92,
 *     "overallROI": 14.06,
 *     "totalProfit": 41800.00
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

    console.log(`💰 Fetching ROI data for ${startDate} to ${endDate}...`);

    const client = getSupabaseClient();

    // =============================================================================
    // FETCH DATA IN PARALLEL
    // =============================================================================

    const [
      googleAdsResult,
      bingAdsResult,
      callsResult,
      formsResult,
      leadsResult,
    ] = await Promise.allSettled([
      // Google Ads cost
      client
        .from('google_ads_daily_performance')
        .select('cost_micros')
        .gte('date', startDate)
        .lte('date', endDate),

      // Bing Ads cost
      client
        .from('microsoft_ads_daily_performance')
        .select('cost_micros')
        .gte('date', startDate)
        .lte('date', endDate),

      // RingCentral calls
      client
        .from('ringcentral_calls')
        .select('from_number, start_time, direction, ad_platform, utm_source, utm_medium, utm_campaign')
        .eq('direction', 'Inbound')
        .gte('start_time', startDate)
        .lte('start_time', endDate),

      // Form submissions
      client
        .from('leads')
        .select('phone, created_at, ad_platform, utm_source, utm_medium, utm_campaign, gclid, msclkid')
        .gte('created_at', startDate)
        .lte('created_at', endDate),

      // Leads with revenue
      client
        .from('leads')
        .select('phone, revenue_amount, ad_platform, created_at')
        .not('revenue_amount', 'is', null)
        .gte('created_at', startDate)
        .lte('created_at', endDate),
    ]);

    // =============================================================================
    // CALCULATE COSTS
    // =============================================================================

    const googleAdsData = googleAdsResult.status === 'fulfilled' ? googleAdsResult.value.data : [];
    const googleCostMicros = googleAdsData?.reduce((sum: number, row: any) => sum + (row.cost_micros || 0), 0) || 0;
    const googleCost = googleCostMicros / 1000000;

    const bingAdsData = bingAdsResult.status === 'fulfilled' ? bingAdsResult.value.data : [];
    const bingCostMicros = bingAdsData?.reduce((sum: number, row: any) => sum + (row.cost_micros || 0), 0) || 0;
    const bingCost = bingCostMicros / 1000000;

    // =============================================================================
    // DEDUPLICATE CUSTOMERS
    // =============================================================================

    const calls: RingCentralCall[] = callsResult.status === 'fulfilled' ? (callsResult.value.data || []) : [];
    const forms: FormLead[] = formsResult.status === 'fulfilled' ? (formsResult.value.data || []) : [];

    const allUniqueCustomers = deduplicateCustomers(calls, forms);

    // Split by platform
    const googleCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'google');
    const bingCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'bing');
    const organicCustomers = allUniqueCustomers.filter(c => c.attribution.platform === 'organic');
    const directCustomers = allUniqueCustomers.filter(c =>
      c.attribution.platform === 'direct' || c.attribution.platform === 'unknown'
    );

    // =============================================================================
    // CALCULATE REVENUE BY PLATFORM
    // =============================================================================

    const leadsWithRevenue = leadsResult.status === 'fulfilled' ? (leadsResult.value.data || []) : [];

    // Group revenue by platform
    const revenueByPlatform: Record<string, number> = {
      google: 0,
      bing: 0,
      organic: 0,
      direct: 0,
      unknown: 0,
    };

    for (const lead of leadsWithRevenue) {
      const platform = lead.ad_platform || 'unknown';
      const revenue = lead.revenue_amount || 0;
      if (platform in revenueByPlatform) {
        revenueByPlatform[platform] += revenue;
      } else {
        revenueByPlatform[platform] = revenue;
      }
    }

    // =============================================================================
    // BUILD PLATFORM METRICS
    // =============================================================================

    const calculatePlatformMetrics = (
      customers: number,
      cost: number,
      revenue: number
    ) => {
      const costPerCustomer = customers > 0 ? cost / customers : 0;
      const revenuePerCustomer = customers > 0 ? revenue / customers : 0;
      const roi = cost > 0 ? (revenue / cost) : 0;
      const profit = revenue - cost;

      return {
        uniqueCustomers: customers,
        cost: parseFloat(cost.toFixed(2)),
        revenue: parseFloat(revenue.toFixed(2)),
        costPerCustomer: parseFloat(costPerCustomer.toFixed(2)),
        revenuePerCustomer: parseFloat(revenuePerCustomer.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(2)) : 0,
      };
    };

    const platforms = {
      google_ads: calculatePlatformMetrics(
        googleCustomers.length,
        googleCost,
        revenueByPlatform.google
      ),
      bing_ads: calculatePlatformMetrics(
        bingCustomers.length,
        bingCost,
        revenueByPlatform.bing
      ),
      organic: calculatePlatformMetrics(
        organicCustomers.length,
        0,
        revenueByPlatform.organic
      ),
      direct: calculatePlatformMetrics(
        directCustomers.length,
        0,
        revenueByPlatform.direct + revenueByPlatform.unknown
      ),
    };

    // =============================================================================
    // CALCULATE TOTALS
    // =============================================================================

    const totalCustomers = allUniqueCustomers.length;
    const totalCost = googleCost + bingCost;
    const totalRevenue = Object.values(revenueByPlatform).reduce((sum, rev) => sum + rev, 0);
    const totalProfit = totalRevenue - totalCost;

    const totals = {
      uniqueCustomers: totalCustomers,
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      avgCostPerCustomer: totalCustomers > 0 ? parseFloat((totalCost / totalCustomers).toFixed(2)) : 0,
      avgRevenuePerCustomer: totalCustomers > 0 ? parseFloat((totalRevenue / totalCustomers).toFixed(2)) : 0,
      overallROI: totalCost > 0 ? parseFloat((totalRevenue / totalCost).toFixed(2)) : 0,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      profitMargin: totalRevenue > 0 ? parseFloat(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0,
    };

    console.log(`✅ ROI data fetched:`, {
      totalCustomers,
      totalCost: `$${totalCost.toFixed(2)}`,
      totalRevenue: `$${totalRevenue.toFixed(2)}`,
      roi: `${totals.overallROI}x`,
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
    console.error('ROI data error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

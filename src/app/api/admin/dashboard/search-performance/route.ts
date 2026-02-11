import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Get current time in Mountain Time (UTC-7) - business is in Denver
function getMountainTime(): Date {
  const now = new Date();
  const mtOffset = -7 * 60;
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcNow + (mtOffset * 60000));
}

// Insight types for actionable recommendations
interface Insight {
  type: 'overlap' | 'coverage_gap' | 'platform_arbitrage' | 'waste' | 'top_performer';
  severity: 'high' | 'medium' | 'low';
  search_term: string;
  recommendation: string;
  data: Record<string, any>;
}

/**
 * GET /api/admin/dashboard/search-performance
 * Returns unified paid (Google + Microsoft) + organic search performance with insights
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');
    const minImpressions = parseInt(searchParams.get('minImpressions') || '5');

    // Calculate date range using Mountain Time
    const mtNow = getMountainTime();
    const mtToday = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());
    const startDate = new Date(mtToday);
    // Cached tables (search terms, GSC queries) are 1-2 days behind — cron syncs yesterday-7d.
    // Always go back at least 2 days so "Today" and "Yesterday" show the most recent synced data.
    const effectiveDaysBack = Math.max(daysBack, 2);
    startDate.setDate(startDate.getDate() - effectiveDaysBack);
    const endDate = mtNow;

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch all data sources in parallel
    const [
      { data: googlePaidData, error: googlePaidError },
      { data: microsoftPaidData, error: microsoftPaidError },
      { data: organicData, error: organicError },
      { data: leadData },
      { data: callData },
      { data: textData },
    ] = await Promise.all([
      // Google Ads search terms
      supabase
        .from('google_ads_search_terms')
        .select('search_term, campaign_name, impressions, clicks, cost, conversions, ctr')
        .gte('report_date', startDateStr)
        .lte('report_date', endDateStr),
      // Microsoft Ads search terms
      supabase
        .from('microsoft_ads_search_terms')
        .select('search_term, campaign_name, impressions, clicks, cost_micros, conversions')
        .gte('report_date', startDateStr)
        .lte('report_date', endDateStr),
      // Google Search Console organic queries
      supabase
        .from('google_search_console_queries')
        .select('query, page_url, impressions, clicks, ctr, position')
        .gte('date', startDateStr)
        .lte('date', endDateStr),
      // Lead attribution
      supabase
        .from('leads')
        .select('utm_term, first_contact_method')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .not('utm_term', 'is', null),
      // Call attribution (deduplicate by phone)
      supabase
        .from('ringcentral_calls')
        .select('utm_term, from_number')
        .eq('direction', 'Inbound')
        .gte('start_time', startDateStr)
        .lte('start_time', endDateStr)
        .not('utm_term', 'is', null),
      // Text click attribution
      supabase
        .from('conversion_events')
        .select('utm_term')
        .eq('event_type', 'text_click')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .not('utm_term', 'is', null),
    ]);

    if (googlePaidError) console.error('Error fetching Google paid data:', googlePaidError);
    if (microsoftPaidError) console.error('Error fetching Microsoft paid data:', microsoftPaidError);
    if (organicError) console.error('Error fetching organic data:', organicError);

    // ─── Aggregate Google Paid by search term ───
    const googleTerms = new Map<string, {
      impressions: number; clicks: number; cost: number; conversions: number; campaigns: Set<string>;
    }>();

    googlePaidData?.forEach(row => {
      const term = row.search_term.toLowerCase().trim();
      if (!googleTerms.has(term)) {
        googleTerms.set(term, { impressions: 0, clicks: 0, cost: 0, conversions: 0, campaigns: new Set() });
      }
      const e = googleTerms.get(term)!;
      e.impressions += row.impressions || 0;
      e.clicks += row.clicks || 0;
      e.cost += row.cost || 0;
      e.conversions += row.conversions || 0;
      if (row.campaign_name) e.campaigns.add(row.campaign_name);
    });

    // ─── Aggregate Microsoft Paid by search term ───
    const microsoftTerms = new Map<string, {
      impressions: number; clicks: number; cost: number; conversions: number; campaigns: Set<string>;
    }>();

    microsoftPaidData?.forEach(row => {
      const term = row.search_term.toLowerCase().trim();
      if (!microsoftTerms.has(term)) {
        microsoftTerms.set(term, { impressions: 0, clicks: 0, cost: 0, conversions: 0, campaigns: new Set() });
      }
      const e = microsoftTerms.get(term)!;
      e.impressions += row.impressions || 0;
      e.clicks += row.clicks || 0;
      e.cost += (row.cost_micros || 0) / 1000000; // Convert micros to dollars
      e.conversions += row.conversions || 0;
      if (row.campaign_name) e.campaigns.add(row.campaign_name);
    });

    // ─── Aggregate Organic by query ───
    const organicTerms = new Map<string, {
      impressions: number; clicks: number; position_sum: number; position_count: number; pages: Set<string>;
    }>();

    organicData?.forEach(row => {
      const term = row.query.toLowerCase().trim();
      if (!organicTerms.has(term)) {
        organicTerms.set(term, { impressions: 0, clicks: 0, position_sum: 0, position_count: 0, pages: new Set() });
      }
      const e = organicTerms.get(term)!;
      e.impressions += parseInt(row.impressions?.toString() || '0');
      e.clicks += parseInt(row.clicks?.toString() || '0');
      if (row.position) { e.position_sum += row.position; e.position_count += 1; }
      if (row.page_url) e.pages.add(row.page_url);
    });

    // ─── Build lead attribution map ───
    const leadsByTerm = new Map<string, { calls: number; quotes: number; texts: number }>();

    leadData?.forEach((lead: any) => {
      const term = (lead.utm_term || '').toLowerCase().trim();
      if (!term) return;
      if (!leadsByTerm.has(term)) leadsByTerm.set(term, { calls: 0, quotes: 0, texts: 0 });
      if (lead.first_contact_method === 'form') leadsByTerm.get(term)!.quotes++;
    });

    // Calls — deduplicate by phone number per term
    const callsByTermAndPhone = new Map<string, Set<string>>();
    callData?.forEach((call: any) => {
      const term = (call.utm_term || '').toLowerCase().trim();
      if (!term) return;
      if (!callsByTermAndPhone.has(term)) callsByTermAndPhone.set(term, new Set());
      callsByTermAndPhone.get(term)!.add(call.from_number);
    });
    callsByTermAndPhone.forEach((phones, term) => {
      if (!leadsByTerm.has(term)) leadsByTerm.set(term, { calls: 0, quotes: 0, texts: 0 });
      leadsByTerm.get(term)!.calls = phones.size;
    });

    // Text clicks
    textData?.forEach((text: any) => {
      const term = (text.utm_term || '').toLowerCase().trim();
      if (!term) return;
      if (!leadsByTerm.has(term)) leadsByTerm.set(term, { calls: 0, quotes: 0, texts: 0 });
      leadsByTerm.get(term)!.texts++;
    });

    // ─── Build unified rows (one row per search term) ───
    const allTerms = new Set([
      ...googleTerms.keys(),
      ...microsoftTerms.keys(),
      ...organicTerms.keys(),
    ]);

    const combinedData: any[] = [];

    allTerms.forEach(term => {
      const g = googleTerms.get(term);
      const m = microsoftTerms.get(term);
      const o = organicTerms.get(term);

      const gImp = g?.impressions || 0;
      const gClk = g?.clicks || 0;
      const gCost = g?.cost || 0;
      const gConv = g?.conversions || 0;

      const mImp = m?.impressions || 0;
      const mClk = m?.clicks || 0;
      const mCost = m?.cost || 0;
      const mConv = m?.conversions || 0;

      const oImp = o?.impressions || 0;
      const oClk = o?.clicks || 0;
      const oPos = o && o.position_count > 0 ? o.position_sum / o.position_count : 0;

      const totalImp = gImp + mImp + oImp;
      const totalClk = gClk + mClk + oClk;
      const totalCost = gCost + mCost;

      // Skip if below minimum impressions
      if (totalImp < minImpressions) return;

      // Source badges
      const sources: string[] = [];
      if (g) sources.push('G-Paid');
      if (m) sources.push('M-Paid');
      if (o) sources.push('Organic');

      // Lead attribution
      const leads = leadsByTerm.get(term) || { calls: 0, quotes: 0, texts: 0 };
      const totalLeads = leads.calls + leads.quotes + leads.texts;
      const costPerLead = totalLeads > 0 && totalCost > 0 ? totalCost / totalLeads : 0;

      combinedData.push({
        search_term: term,
        sources,

        // Google Paid
        google_impressions: gImp,
        google_clicks: gClk,
        google_cost: parseFloat(gCost.toFixed(2)),
        google_conversions: parseFloat(gConv.toFixed(2)),
        google_campaigns: g ? Array.from(g.campaigns) : [],

        // Microsoft Paid
        microsoft_impressions: mImp,
        microsoft_clicks: mClk,
        microsoft_cost: parseFloat(mCost.toFixed(2)),
        microsoft_conversions: parseFloat(mConv.toFixed(2)),
        microsoft_campaigns: m ? Array.from(m.campaigns) : [],

        // Organic
        organic_impressions: oImp,
        organic_clicks: oClk,
        organic_position: parseFloat(oPos.toFixed(1)),
        organic_pages: o ? Array.from(o.pages).map(url => {
          try { return new URL(url).pathname; } catch { return url; }
        }) : [],

        // Combined totals
        total_impressions: totalImp,
        total_clicks: totalClk,
        total_cost: parseFloat(totalCost.toFixed(2)),

        // Leads
        calls: leads.calls,
        quotes: leads.quotes,
        texts: leads.texts,
        total_leads: totalLeads,
        cost_per_lead: parseFloat(costPerLead.toFixed(2)),
      });
    });

    // Sort by total impressions
    combinedData.sort((a, b) => b.total_impressions - a.total_impressions);

    // ─── Calculate summary statistics ───
    const totGoogleImp = combinedData.reduce((s, t) => s + t.google_impressions, 0);
    const totGoogleClk = combinedData.reduce((s, t) => s + t.google_clicks, 0);
    const totGoogleCost = combinedData.reduce((s, t) => s + t.google_cost, 0);
    const totGoogleConv = combinedData.reduce((s, t) => s + t.google_conversions, 0);
    const totGoogleLeads = combinedData.filter(t => t.sources.includes('G-Paid')).reduce((s, t) => s + t.total_leads, 0);

    const totMsImp = combinedData.reduce((s, t) => s + t.microsoft_impressions, 0);
    const totMsClk = combinedData.reduce((s, t) => s + t.microsoft_clicks, 0);
    const totMsCost = combinedData.reduce((s, t) => s + t.microsoft_cost, 0);
    const totMsConv = combinedData.reduce((s, t) => s + t.microsoft_conversions, 0);
    const totMsLeads = combinedData.filter(t => t.sources.includes('M-Paid') && !t.sources.includes('G-Paid')).reduce((s, t) => s + t.total_leads, 0);

    const totOrgImp = combinedData.reduce((s, t) => s + t.organic_impressions, 0);
    const totOrgClk = combinedData.reduce((s, t) => s + t.organic_clicks, 0);
    const totOrgLeads = combinedData.filter(t => t.sources.includes('Organic') && !t.sources.includes('G-Paid') && !t.sources.includes('M-Paid')).reduce((s, t) => s + t.total_leads, 0);

    const summary = {
      totalTerms: combinedData.length,

      google: {
        impressions: totGoogleImp,
        clicks: totGoogleClk,
        cost: parseFloat(totGoogleCost.toFixed(2)),
        conversions: parseFloat(totGoogleConv.toFixed(2)),
        leads: totGoogleLeads,
        ctr: totGoogleImp > 0 ? parseFloat(((totGoogleClk / totGoogleImp) * 100).toFixed(2)) : 0,
        costPerLead: totGoogleLeads > 0 ? parseFloat((totGoogleCost / totGoogleLeads).toFixed(2)) : 0,
      },
      microsoft: {
        impressions: totMsImp,
        clicks: totMsClk,
        cost: parseFloat(totMsCost.toFixed(2)),
        conversions: parseFloat(totMsConv.toFixed(2)),
        leads: totMsLeads,
        ctr: totMsImp > 0 ? parseFloat(((totMsClk / totMsImp) * 100).toFixed(2)) : 0,
        costPerLead: totMsLeads > 0 ? parseFloat((totMsCost / totMsLeads).toFixed(2)) : 0,
      },
      organic: {
        impressions: totOrgImp,
        clicks: totOrgClk,
        leads: totOrgLeads,
        ctr: totOrgImp > 0 ? parseFloat(((totOrgClk / totOrgImp) * 100).toFixed(2)) : 0,
      },
      combined: {
        impressions: totGoogleImp + totMsImp + totOrgImp,
        clicks: totGoogleClk + totMsClk + totOrgClk,
        cost: parseFloat((totGoogleCost + totMsCost).toFixed(2)),
        leads: combinedData.reduce((s, t) => s + t.total_leads, 0),
      },
    };

    // ─── Generate actionable insights ───
    const insights = generateInsights(combinedData);

    return NextResponse.json({
      ok: true,
      dateRange: { from: startDateStr, to: endDateStr, days: daysBack },
      summary,
      insights,
      data: combinedData,
    });
  } catch (error: any) {
    console.error('Search performance API error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

/**
 * Generate actionable insights from unified search term data
 */
function generateInsights(data: any[]): Insight[] {
  const insights: Insight[] = [];

  for (const term of data) {
    const hasGooglePaid = term.google_impressions > 0;
    const hasMsPaid = term.microsoft_impressions > 0;
    const hasOrganic = term.organic_impressions > 0;

    // 1. Overlap Opportunities: ranking organically AND paying — potential savings
    if (hasGooglePaid && hasOrganic && term.organic_position > 0 && term.organic_position < 5) {
      insights.push({
        type: 'overlap',
        severity: term.google_cost > 50 ? 'high' : 'medium',
        search_term: term.search_term,
        recommendation: `Already ranking #${term.organic_position.toFixed(1)} organically. Consider reducing paid spend ($${term.google_cost.toFixed(2)}) — organic may handle this traffic.`,
        data: {
          organic_position: term.organic_position,
          paid_cost: term.google_cost,
          paid_clicks: term.google_clicks,
          organic_clicks: term.organic_clicks,
        },
      });
    }

    // 2. Coverage Gaps: high organic impressions with no paid coverage
    if (hasOrganic && !hasGooglePaid && !hasMsPaid && term.organic_impressions > 200 && term.organic_position > 5) {
      insights.push({
        type: 'coverage_gap',
        severity: term.organic_impressions > 500 ? 'high' : 'medium',
        search_term: term.search_term,
        recommendation: `${term.organic_impressions.toLocaleString()} organic impressions but position #${term.organic_position.toFixed(1)} — adding paid ads could capture more of this traffic.`,
        data: {
          organic_impressions: term.organic_impressions,
          organic_position: term.organic_position,
          organic_clicks: term.organic_clicks,
        },
      });
    }

    // 3. Platform Arbitrage: same term on both platforms with different CPC
    if (hasGooglePaid && hasMsPaid && term.google_clicks > 3 && term.microsoft_clicks > 3) {
      const gCPC = term.google_clicks > 0 ? term.google_cost / term.google_clicks : 0;
      const mCPC = term.microsoft_clicks > 0 ? term.microsoft_cost / term.microsoft_clicks : 0;

      if (gCPC > 0 && mCPC > 0) {
        const cheaperPlatform = gCPC < mCPC ? 'Google' : 'Microsoft';
        const priceDiff = Math.abs(gCPC - mCPC);
        const pctDiff = (priceDiff / Math.max(gCPC, mCPC)) * 100;

        if (pctDiff > 30) {
          insights.push({
            type: 'platform_arbitrage',
            severity: pctDiff > 50 ? 'high' : 'medium',
            search_term: term.search_term,
            recommendation: `${cheaperPlatform} is ${pctDiff.toFixed(0)}% cheaper per click ($${Math.min(gCPC, mCPC).toFixed(2)} vs $${Math.max(gCPC, mCPC).toFixed(2)}). Shift budget to ${cheaperPlatform}.`,
            data: {
              google_cpc: parseFloat(gCPC.toFixed(2)),
              microsoft_cpc: parseFloat(mCPC.toFixed(2)),
              cheaper_platform: cheaperPlatform,
              savings_pct: parseFloat(pctDiff.toFixed(0)),
            },
          });
        }
      }
    }

    // 4. Waste Detection: spend with zero leads
    const totalTermCost = term.google_cost + term.microsoft_cost;
    if (totalTermCost > 20 && term.total_leads === 0) {
      insights.push({
        type: 'waste',
        severity: totalTermCost > 100 ? 'high' : totalTermCost > 50 ? 'medium' : 'low',
        search_term: term.search_term,
        recommendation: `$${totalTermCost.toFixed(2)} spent with 0 leads. Consider adding as negative keyword or pausing.`,
        data: {
          total_cost: parseFloat(totalTermCost.toFixed(2)),
          total_clicks: term.total_clicks,
          google_cost: term.google_cost,
          microsoft_cost: term.microsoft_cost,
        },
      });
    }

    // 5. Top Performers: lowest cost per lead
    if (term.cost_per_lead > 0 && term.cost_per_lead < 30 && term.total_leads >= 2) {
      insights.push({
        type: 'top_performer',
        severity: 'high',
        search_term: term.search_term,
        recommendation: `$${term.cost_per_lead.toFixed(2)}/lead with ${term.total_leads} leads — increase budget allocation for this term.`,
        data: {
          cost_per_lead: term.cost_per_lead,
          total_leads: term.total_leads,
          total_cost: parseFloat(totalTermCost.toFixed(2)),
        },
      });
    }
  }

  // Sort: high severity first, then by type priority
  const typePriority: Record<string, number> = {
    waste: 0, top_performer: 1, platform_arbitrage: 2, overlap: 3, coverage_gap: 4,
  };
  const sevPriority: Record<string, number> = { high: 0, medium: 1, low: 2 };

  insights.sort((a, b) => {
    const sevDiff = sevPriority[a.severity] - sevPriority[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return typePriority[a.type] - typePriority[b.type];
  });

  return insights;
}

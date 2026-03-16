import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPaidAdsDailyMetrics, getSupabaseClient } from '@/lib/dashboardData';
import { validateSearchConsoleConfig } from '@/lib/googleSearchConsole';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Get current time in Mountain Time (DST-aware)
function getMountainTime(): Date {
  const now = new Date();
  const mtString = now.toLocaleString('en-US', { timeZone: 'America/Denver' });
  return new Date(mtString);
}

function isMissingColumnError(error: any): boolean {
  const message = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  return error?.code === '42703' || message.includes('does not exist') || details.includes('does not exist');
}

async function fetchRowsWithDateFallback(
  supabase: SupabaseClient,
  table: string,
  selectColumns: string,
  startDateStr: string,
  endDateStr: string,
  dateColumns: string[]
): Promise<any[]> {
  let lastError: any = null;

  for (const dateColumn of dateColumns) {
    const { data, error } = await supabase
      .from(table)
      .select(selectColumns)
      .gte(dateColumn, startDateStr)
      .lte(dateColumn, endDateStr);

    if (!error) {
      return data || [];
    }

    lastError = error;
    if (!isMissingColumnError(error)) {
      console.error(`Error fetching ${table} data (${dateColumn}):`, error);
      return [];
    }
  }

  if (lastError) {
    console.error(`Error fetching ${table} data (all date columns failed):`, lastError);
  }

  return [];
}

// Insight types for actionable recommendations
interface Insight {
  type: 'overlap' | 'coverage_gap' | 'platform_arbitrage' | 'waste' | 'top_performer';
  severity: 'high' | 'medium' | 'low';
  search_term: string;
  recommendation: string;
  data: Record<string, any>;
}

interface SeoSuggestion {
  category: 'striking_distance' | 'ctr_improvement' | 'content_gap' | 'quick_win' | 'defend_position';
  priority: 'high' | 'medium' | 'low';
  search_term: string;
  action: string;
  detail: string;
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
    startDate.setDate(startDate.getDate() - daysBack);
    const endDate = mtNow;

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const startTimestamp = startDate.toISOString();
    const endTimestamp = endDate.toISOString();

    // Fetch all data sources in parallel
    const [
      googlePaidData,
      microsoftPaidData,
      paidDailyMetrics,
      { data: organicData, error: organicError },
      { data: gscDailyData, error: gscDailyError },
      { data: leadData },
      { data: callData },
      { data: textData },
    ] = await Promise.all([
      // Google Ads search terms
      fetchRowsWithDateFallback(
        supabase,
        'google_ads_search_terms',
        'search_term, campaign_name, impressions, clicks, cost, conversions, ctr',
        startDateStr,
        endDateStr,
        ['report_date', 'date']
      ),
      // Microsoft Ads search terms
      fetchRowsWithDateFallback(
        supabase,
        'microsoft_ads_search_terms',
        'search_term, campaign_name, impressions, clicks, cost_micros, conversions',
        startDateStr,
        endDateStr,
        ['date', 'report_date']
      ),
      // Paid platform daily totals (canonical source used by Google/Microsoft dashboard pages)
      getPaidAdsDailyMetrics(
        supabase,
        startDateStr,
        endDateStr
      ),
      // Google Search Console organic queries
      supabase
        .from('google_search_console_queries')
        .select('query, page_url, impressions, clicks, ctr, position')
        .gte('date', startDateStr)
        .lte('date', endDateStr),
      // GSC data freshness check
      supabase
        .from('google_search_console_daily_totals')
        .select('date, updated_at')
        .order('date', { ascending: false })
        .limit(1),
      // Lead attribution
      supabase
        .from('leads')
        .select('utm_term, first_contact_method')
        .eq('is_test', false)
        .gte('created_at', startTimestamp)
        .lte('created_at', endTimestamp)
        .not('utm_term', 'is', null),
      // Call attribution (deduplicate by phone)
      supabase
        .from('ringcentral_calls')
        .select('utm_term, from_number')
        .eq('direction', 'Inbound')
        .gte('start_time', startTimestamp)
        .lte('start_time', endTimestamp)
        .not('utm_term', 'is', null),
      // Text click attribution
      supabase
        .from('conversion_events')
        .select('utm_term')
        .eq('event_type', 'text_click')
        .gte('created_at', startTimestamp)
        .lte('created_at', endTimestamp)
        .not('utm_term', 'is', null),
    ]);

    if (organicError) console.error('Error fetching organic data:', organicError);
    if (gscDailyError) console.error('Error fetching GSC freshness data:', gscDailyError);

    // ─── GSC fallback: if no organic data and range is too recent, use latest available date ───
    let effectiveOrganicData = organicData || [];
    let organicFallbackDate: string | null = null;

    const latestGscRow = (gscDailyData || [])[0] || null;
    if (effectiveOrganicData.length === 0 && latestGscRow?.date) {
      const gscAvailable = new Date(latestGscRow.date + 'T00:00:00');
      if (startDate > gscAvailable) {
        // Selected range is newer than latest GSC data — fall back to latest available date
        const fallbackDate = latestGscRow.date;
        const { data: fallbackOrganic, error: fallbackError } = await supabase
          .from('google_search_console_queries')
          .select('query, page_url, impressions, clicks, ctr, position')
          .eq('date', fallbackDate);

        if (!fallbackError && fallbackOrganic && fallbackOrganic.length > 0) {
          effectiveOrganicData = fallbackOrganic;
          organicFallbackDate = fallbackDate;
        }
      }
    }

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

    effectiveOrganicData.forEach(row => {
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
    const paidGoogle = paidDailyMetrics.google;
    const paidMicrosoft = paidDailyMetrics.microsoft;

    const totGoogleLeads = combinedData.filter(t => t.sources.includes('G-Paid')).reduce((s, t) => s + t.total_leads, 0);

    const totMsLeads = combinedData.filter(t => t.sources.includes('M-Paid') && !t.sources.includes('G-Paid')).reduce((s, t) => s + t.total_leads, 0);

    const totOrgImp = combinedData.reduce((s, t) => s + t.organic_impressions, 0);
    const totOrgClk = combinedData.reduce((s, t) => s + t.organic_clicks, 0);
    const totOrgLeads = combinedData.filter(t => t.sources.includes('Organic') && !t.sources.includes('G-Paid') && !t.sources.includes('M-Paid')).reduce((s, t) => s + t.total_leads, 0);

    const summary = {
      totalTerms: combinedData.length,

      google: {
        impressions: paidGoogle.impressions,
        clicks: paidGoogle.clicks,
        cost: paidGoogle.spend,
        conversions: paidGoogle.conversions,
        leads: totGoogleLeads,
        ctr: paidGoogle.ctr,
        costPerLead: totGoogleLeads > 0 ? parseFloat((paidGoogle.spend / totGoogleLeads).toFixed(2)) : 0,
      },
      microsoft: {
        impressions: paidMicrosoft.impressions,
        clicks: paidMicrosoft.clicks,
        cost: paidMicrosoft.spend,
        conversions: paidMicrosoft.conversions,
        leads: totMsLeads,
        ctr: paidMicrosoft.ctr,
        costPerLead: totMsLeads > 0 ? parseFloat((paidMicrosoft.spend / totMsLeads).toFixed(2)) : 0,
      },
      organic: {
        impressions: totOrgImp,
        clicks: totOrgClk,
        leads: totOrgLeads,
        ctr: totOrgImp > 0 ? parseFloat(((totOrgClk / totOrgImp) * 100).toFixed(2)) : 0,
      },
      combined: {
        impressions: paidGoogle.impressions + paidMicrosoft.impressions + totOrgImp,
        clicks: paidGoogle.clicks + paidMicrosoft.clicks + totOrgClk,
        cost: parseFloat((paidGoogle.spend + paidMicrosoft.spend).toFixed(2)),
        leads: combinedData.reduce((s, t) => s + t.total_leads, 0),
      },
    };

    const gscConfig = validateSearchConsoleConfig();
    const latestGsc = (gscDailyData || [])[0] || null;
    const latestGscDate = latestGsc?.date ? new Date(latestGsc.date) : null;

    const gscAvailableThrough = new Date(mtToday);
    gscAvailableThrough.setDate(gscAvailableThrough.getDate() - 3); // Typical GSC lag

    const hasOrganicDataInRange = effectiveOrganicData.length > 0;
    const selectedRangeIsTooRecentForGsc = startDate > gscAvailableThrough;
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceLastData = latestGscDate
      ? Math.floor((mtToday.getTime() - latestGscDate.getTime()) / msPerDay)
      : null;
    const stale = daysSinceLastData !== null && daysSinceLastData > 5;

    let warning: string | null = null;
    if (!gscConfig.isValid) {
      warning = `Google Search Console is not fully configured (${gscConfig.missingVars.join(', ')}).`;
    } else if (!latestGsc) {
      warning = 'No Google Search Console data has been synced yet.';
    } else if (stale) {
      warning = `Google Search Console data is stale (last data date: ${latestGsc.date}, ${daysSinceLastData} days old).`;
    } else if (organicFallbackDate) {
      warning = `Organic data shown from ${organicFallbackDate} (most recent available — GSC typically lags 2-3 days).`;
    } else if (!hasOrganicDataInRange && selectedRangeIsTooRecentForGsc) {
      warning = 'Selected period is too recent for Google Search Console (data typically lags 2-3 days).';
    }

    // ─── Generate actionable insights ───
    const insights = generateInsights(combinedData);
    const seoSuggestions = generateSeoSuggestions(combinedData);

    return NextResponse.json({
      ok: true,
      dateRange: { from: startDateStr, to: endDateStr, days: daysBack },
      summary,
      gscStatus: {
        configured: gscConfig.isValid,
        missingVars: gscConfig.missingVars,
        lastDataDate: latestGsc?.date || null,
        daysSinceLastData,
        hasOrganicDataInRange,
        selectedRangeIsTooRecentForGsc,
        organicFallbackDate,
        stale,
        warning,
      },
      insights,
      seoSuggestions,
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

/**
 * Generate SEO-specific suggestions from organic search data
 * Focuses on ranking improvements, CTR optimization, and content opportunities
 */
function generateSeoSuggestions(data: any[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];
  const organicTerms = data.filter(t => t.organic_impressions > 0);

  for (const term of organicTerms) {
    const pos = term.organic_position;
    const imp = term.organic_impressions;
    const clk = term.organic_clicks;
    const ctr = imp > 0 ? (clk / imp) * 100 : 0;

    // 1. Striking Distance (position 4-10) — close to top 3 where most clicks happen
    if (pos >= 4 && pos <= 10 && imp >= 50) {
      suggestions.push({
        category: 'striking_distance',
        priority: imp > 200 ? 'high' : 'medium',
        search_term: term.search_term,
        action: 'Improve content to push into top 3',
        detail: `Ranking #${pos.toFixed(1)} with ${imp.toLocaleString()} impressions. Moving to top 3 could 3-5x your clicks. Add more detailed content, internal links, and ensure the page loads fast.`,
        data: { position: pos, impressions: imp, clicks: clk, ctr: parseFloat(ctr.toFixed(1)), pages: term.organic_pages },
      });
    }

    // 2. CTR Improvement — ranking well but low click-through rate
    if (pos <= 5 && imp >= 100 && ctr < 3) {
      suggestions.push({
        category: 'ctr_improvement',
        priority: imp > 300 ? 'high' : 'medium',
        search_term: term.search_term,
        action: 'Improve title tag and meta description',
        detail: `Position #${pos.toFixed(1)} but only ${ctr.toFixed(1)}% CTR (expected 5-15%). Your title/meta description may not be compelling enough. Add your city name, a value prop, and a call to action.`,
        data: { position: pos, impressions: imp, clicks: clk, ctr: parseFloat(ctr.toFixed(1)), pages: term.organic_pages },
      });
    }

    // 3. Content Gaps — page 2 terms (position 11-20) with decent impressions
    if (pos > 10 && pos <= 20 && imp >= 100) {
      suggestions.push({
        category: 'content_gap',
        priority: imp > 300 ? 'high' : 'medium',
        search_term: term.search_term,
        action: 'Create or improve dedicated content',
        detail: `Position #${pos.toFixed(1)} (page 2) with ${imp.toLocaleString()} impressions. Create a dedicated page or blog post targeting this term. Include it in headings, add FAQ schema, and build internal links to it.`,
        data: { position: pos, impressions: imp, clicks: clk, pages: term.organic_pages },
      });
    }

    // 4. Quick Wins — high impressions, decent position, already getting clicks
    if (pos <= 3 && imp >= 200 && clk >= 10) {
      suggestions.push({
        category: 'quick_win',
        priority: 'medium',
        search_term: term.search_term,
        action: 'Already winning — optimize for conversions',
        detail: `Top 3 ranking with ${clk} clicks. Focus on conversion: make sure the landing page has a clear CTA, phone number, and quote form above the fold.`,
        data: { position: pos, impressions: imp, clicks: clk, ctr: parseFloat(ctr.toFixed(1)), pages: term.organic_pages },
      });
    }

    // 5. Defend Position — top 3 but competitors may overtake
    if (pos >= 2 && pos <= 4 && imp >= 500) {
      suggestions.push({
        category: 'defend_position',
        priority: imp > 1000 ? 'high' : 'medium',
        search_term: term.search_term,
        action: 'Defend this high-value ranking',
        detail: `Position #${pos.toFixed(1)} for a high-volume term (${imp.toLocaleString()} impressions). Keep content fresh, add new sections quarterly, get more backlinks, and monitor for ranking drops.`,
        data: { position: pos, impressions: imp, clicks: clk, pages: term.organic_pages },
      });
    }
  }

  // Sort by priority then by impressions
  const priMap: Record<string, number> = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => {
    const priDiff = priMap[a.priority] - priMap[b.priority];
    if (priDiff !== 0) return priDiff;
    return (b.data.impressions || 0) - (a.data.impressions || 0);
  });

  // Cap at 15 suggestions to keep it actionable
  return suggestions.slice(0, 15);
}

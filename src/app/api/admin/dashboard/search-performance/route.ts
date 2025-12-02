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
  const mtOffset = -7 * 60; // Mountain Time offset in minutes
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcNow + (mtOffset * 60000));
}

interface SearchTermPerformance {
  search_term: string;
  source: 'PAID' | 'ORG';

  // Paid metrics (Google Ads)
  paid_impressions: number;
  paid_clicks: number;
  paid_cost: number;
  paid_ctr: number;
  paid_cpc: number;
  paid_conversions: number;
  paid_campaigns: string[];

  // Organic metrics (Google Search Console)
  organic_impressions: number;
  organic_clicks: number;
  organic_ctr: number;
  organic_position: number;
  organic_pages: string[];

  // Lead attribution (NEW)
  calls: number;
  quotes: number;
  texts: number;
  total_leads: number;
  cost_per_lead: number;
  lead_conversion_rate: number;

  // Total for this row (either paid or organic)
  total_impressions: number;
  total_clicks: number;
  ctr: number;
}

/**
 * GET /api/admin/dashboard/search-performance
 * Returns combined paid + organic search performance
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const daysBack = parseInt(searchParams.get('days') || '30');
    const source = searchParams.get('source') || 'all'; // 'paid', 'organic', or 'all'
    const minImpressions = parseInt(searchParams.get('minImpressions') || '10');

    // Calculate date range using Mountain Time (business is in Denver)
    const mtNow = getMountainTime();
    const endDate = new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch Google Ads search terms (paid)
    const { data: paidData, error: paidError } = await supabase
      .from('google_ads_search_terms')
      .select('search_term, campaign_name, impressions, clicks, cost, conversions, ctr')
      .gte('report_date', startDateStr)
      .lte('report_date', endDateStr);

    if (paidError) {
      console.error('Error fetching paid data:', paidError);
    }

    // Fetch Google Search Console queries (organic)
    const { data: organicData, error: organicError } = await supabase
      .from('google_search_console_queries')
      .select('query, page_url, impressions, clicks, ctr, position')
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (organicError) {
      console.error('Error fetching organic data:', organicError);
    }

    // Aggregate paid data by search term
    const paidTerms = new Map<string, {
      impressions: number;
      clicks: number;
      cost: number;
      conversions: number;
      campaigns: Set<string>;
    }>();

    paidData?.forEach(row => {
      const term = row.search_term.toLowerCase().trim();
      if (!paidTerms.has(term)) {
        paidTerms.set(term, {
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
          campaigns: new Set(),
        });
      }
      const existing = paidTerms.get(term)!;
      existing.impressions += row.impressions || 0;
      existing.clicks += row.clicks || 0;
      existing.cost += row.cost || 0;
      existing.conversions += row.conversions || 0;
      if (row.campaign_name) {
        existing.campaigns.add(row.campaign_name);
      }
    });

    // Aggregate organic data by query
    const organicTerms = new Map<string, {
      impressions: number;
      clicks: number;
      position_sum: number;
      position_count: number;
      pages: Set<string>;
    }>();

    organicData?.forEach(row => {
      const term = row.query.toLowerCase().trim();
      if (!organicTerms.has(term)) {
        organicTerms.set(term, {
          impressions: 0,
          clicks: 0,
          position_sum: 0,
          position_count: 0,
          pages: new Set(),
        });
      }
      const existing = organicTerms.get(term)!;
      existing.impressions += parseInt(row.impressions?.toString() || '0');
      existing.clicks += parseInt(row.clicks?.toString() || '0');
      if (row.position) {
        existing.position_sum += row.position;
        existing.position_count += 1;
      }
      if (row.page_url) {
        existing.pages.add(row.page_url);
      }
    });

    // Fetch lead attribution data (calls, quotes, texts)
    const leadsByTerm = new Map<string, { calls: number; quotes: number; texts: number }>();

    // Get quotes/form submissions
    const { data: leadData } = await supabase
      .from('leads')
      .select('utm_term, first_contact_method')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .not('utm_term', 'is', null);

    leadData?.forEach((lead: any) => {
      const term = (lead.utm_term || '').toLowerCase().trim();
      if (!term) return;

      if (!leadsByTerm.has(term)) {
        leadsByTerm.set(term, { calls: 0, quotes: 0, texts: 0 });
      }
      const existing = leadsByTerm.get(term)!;
      if (lead.first_contact_method === 'form') {
        existing.quotes++;
      }
    });

    // Get phone calls - deduplicate by phone number (unique callers only)
    const { data: callData } = await supabase
      .from('ringcentral_calls')
      .select('utm_term, from_number')
      .eq('direction', 'Inbound')
      .gte('start_time', startDateStr)
      .lte('start_time', endDateStr)
      .not('utm_term', 'is', null);

    // Group by term, then count unique phone numbers per term
    const callsByTermAndPhone = new Map<string, Set<string>>();
    callData?.forEach((call: any) => {
      const term = (call.utm_term || '').toLowerCase().trim();
      if (!term) return;

      if (!callsByTermAndPhone.has(term)) {
        callsByTermAndPhone.set(term, new Set());
      }
      callsByTermAndPhone.get(term)!.add(call.from_number);
    });

    // Now add unique caller counts to leadsByTerm
    callsByTermAndPhone.forEach((phoneNumbers, term) => {
      if (!leadsByTerm.has(term)) {
        leadsByTerm.set(term, { calls: 0, quotes: 0, texts: 0 });
      }
      leadsByTerm.get(term)!.calls = phoneNumbers.size; // Count unique phone numbers
    });

    // Get text clicks
    const { data: textData } = await supabase
      .from('conversion_events')
      .select('utm_term')
      .eq('event_type', 'text_click')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .not('utm_term', 'is', null);

    textData?.forEach((text: any) => {
      const term = (text.utm_term || '').toLowerCase().trim();
      if (!term) return;

      if (!leadsByTerm.has(term)) {
        leadsByTerm.set(term, { calls: 0, quotes: 0, texts: 0 });
      }
      leadsByTerm.get(term)!.texts++;
    });

    // Create separate rows for paid and organic data
    const allTerms = new Set([...paidTerms.keys(), ...organicTerms.keys()]);
    const combinedData: SearchTermPerformance[] = [];

    allTerms.forEach(term => {
      const paid = paidTerms.get(term);
      const organic = organicTerms.get(term);

      // Create PAID row if paid data exists
      if (paid) {
        const paidImpressions = paid.impressions || 0;
        const paidClicks = paid.clicks || 0;
        const paidCost = paid.cost || 0;
        const paidConversions = paid.conversions || 0;

        // Skip if below minimum impressions threshold
        if (paidImpressions < minImpressions) {
          // Don't create paid row
        } else {
          const paidCTR = paidImpressions > 0 ? (paidClicks / paidImpressions) * 100 : 0;
          const paidCPC = paidClicks > 0 ? paidCost / paidClicks : 0;

          // Get lead data for this term
          const leads = leadsByTerm.get(term) || { calls: 0, quotes: 0, texts: 0 };
          const totalLeads = leads.calls + leads.quotes + leads.texts;
          const costPerLead = totalLeads > 0 ? paidCost / totalLeads : 0;
          const leadConvRate = paidClicks > 0 ? (totalLeads / paidClicks) * 100 : 0;

          combinedData.push({
            search_term: term,
            source: 'PAID',
            paid_impressions: paidImpressions,
            paid_clicks: paidClicks,
            paid_cost: parseFloat(paidCost.toFixed(2)),
            paid_ctr: parseFloat(paidCTR.toFixed(2)),
            paid_cpc: parseFloat(paidCPC.toFixed(2)),
            paid_conversions: parseFloat(paidConversions.toFixed(2)),
            paid_campaigns: Array.from(paid.campaigns || []),
            organic_impressions: 0,
            organic_clicks: 0,
            organic_ctr: 0,
            organic_position: 0,
            organic_pages: [],
            calls: leads.calls,
            quotes: leads.quotes,
            texts: leads.texts,
            total_leads: totalLeads,
            cost_per_lead: parseFloat(costPerLead.toFixed(2)),
            lead_conversion_rate: parseFloat(leadConvRate.toFixed(2)),
            total_impressions: paidImpressions,
            total_clicks: paidClicks,
            ctr: parseFloat(paidCTR.toFixed(2)),
          });
        }
      }

      // Create ORG row if organic data exists
      if (organic) {
        const organicImpressions = organic.impressions || 0;
        const organicClicks = organic.clicks || 0;
        const avgPosition = organic.position_count
          ? organic.position_sum / organic.position_count
          : 0;

        // Skip if below minimum impressions threshold
        if (organicImpressions < minImpressions) {
          // Don't create organic row
        } else {
          const organicCTR = organicImpressions > 0 ? (organicClicks / organicImpressions) * 100 : 0;

          // Get lead data for this term
          const leads = leadsByTerm.get(term) || { calls: 0, quotes: 0, texts: 0 };
          const totalLeads = leads.calls + leads.quotes + leads.texts;
          const leadConvRate = organicClicks > 0 ? (totalLeads / organicClicks) * 100 : 0;

          combinedData.push({
            search_term: term,
            source: 'ORG',
            paid_impressions: 0,
            paid_clicks: 0,
            paid_cost: 0,
            paid_ctr: 0,
            paid_cpc: 0,
            paid_conversions: 0,
            paid_campaigns: [],
            organic_impressions: organicImpressions,
            organic_clicks: organicClicks,
            organic_ctr: parseFloat(organicCTR.toFixed(2)),
            organic_position: parseFloat(avgPosition.toFixed(1)),
            organic_pages: Array.from(organic.pages || []).map(url => {
              // Shorten URLs for display
              try {
                const parsed = new URL(url);
                return parsed.pathname;
              } catch {
                return url;
              }
            }),
            calls: leads.calls,
            quotes: leads.quotes,
            texts: leads.texts,
            total_leads: totalLeads,
            cost_per_lead: 0, // Free for organic
            lead_conversion_rate: parseFloat(leadConvRate.toFixed(2)),
            total_impressions: organicImpressions,
            total_clicks: organicClicks,
            ctr: parseFloat(organicCTR.toFixed(2)),
          });
        }
      }
    });

    // Sort by total impressions (most impressions first)
    combinedData.sort((a, b) => b.total_impressions - a.total_impressions);

    // Calculate summary statistics
    const paidRows = combinedData.filter(t => t.source === 'PAID');
    const organicRows = combinedData.filter(t => t.source === 'ORG');

    // Find terms that appear in both paid and organic
    const paidTermSet = new Set(paidRows.map(r => r.search_term));
    const organicTermSet = new Set(organicRows.map(r => r.search_term));
    const termsInBoth = [...paidTermSet].filter(term => organicTermSet.has(term));

    const summary = {
      totalRows: combinedData.length,
      totalUniqueTerms: new Set(combinedData.map(r => r.search_term)).size,
      paidRows: paidRows.length,
      organicRows: organicRows.length,
      termsInBoth: termsInBoth.length,
      totalPaidImpressions: combinedData.reduce((sum, t) => sum + t.paid_impressions, 0),
      totalPaidClicks: combinedData.reduce((sum, t) => sum + t.paid_clicks, 0),
      totalPaidCost: parseFloat(
        combinedData.reduce((sum, t) => sum + t.paid_cost, 0).toFixed(2)
      ),
      totalPaidConversions: parseFloat(
        combinedData.reduce((sum, t) => sum + t.paid_conversions, 0).toFixed(2)
      ),
      totalOrganicImpressions: combinedData.reduce((sum, t) => sum + t.organic_impressions, 0),
      totalOrganicClicks: combinedData.reduce((sum, t) => sum + t.organic_clicks, 0),
      totalImpressions: combinedData.reduce((sum, t) => sum + t.total_impressions, 0),
      totalClicks: combinedData.reduce((sum, t) => sum + t.total_clicks, 0),
      totalCalls: combinedData.reduce((sum, t) => sum + t.calls, 0),
      totalQuotes: combinedData.reduce((sum, t) => sum + t.quotes, 0),
      totalTexts: combinedData.reduce((sum, t) => sum + t.texts, 0),
      totalLeads: combinedData.reduce((sum, t) => sum + t.total_leads, 0),
      paidCalls: paidRows.reduce((sum, t) => sum + t.calls, 0),
      paidQuotes: paidRows.reduce((sum, t) => sum + t.quotes, 0),
      paidTexts: paidRows.reduce((sum, t) => sum + t.texts, 0),
      paidLeads: paidRows.reduce((sum, t) => sum + t.total_leads, 0),
      organicCalls: organicRows.reduce((sum, t) => sum + t.calls, 0),
      organicQuotes: organicRows.reduce((sum, t) => sum + t.quotes, 0),
      organicTexts: organicRows.reduce((sum, t) => sum + t.texts, 0),
      organicLeads: organicRows.reduce((sum, t) => sum + t.total_leads, 0),
    };

    // Add calculated averages
    const avgPaidCTR =
      summary.totalPaidImpressions > 0
        ? (summary.totalPaidClicks / summary.totalPaidImpressions) * 100
        : 0;
    const avgPaidCPC =
      summary.totalPaidClicks > 0 ? summary.totalPaidCost / summary.totalPaidClicks : 0;
    const avgOrganicCTR =
      summary.totalOrganicImpressions > 0
        ? (summary.totalOrganicClicks / summary.totalOrganicImpressions) * 100
        : 0;
    const avgCombinedCTR =
      summary.totalImpressions > 0
        ? (summary.totalClicks / summary.totalImpressions) * 100
        : 0;

    return NextResponse.json({
      ok: true,
      dateRange: {
        from: startDateStr,
        to: endDateStr,
        days: daysBack,
      },
      summary: {
        ...summary,
        avgPaidCTR: parseFloat(avgPaidCTR.toFixed(2)),
        avgPaidCPC: parseFloat(avgPaidCPC.toFixed(2)),
        avgOrganicCTR: parseFloat(avgOrganicCTR.toFixed(2)),
        avgCombinedCTR: parseFloat(avgCombinedCTR.toFixed(2)),
      },
      data: combinedData,
    });
  } catch (error: any) {
    console.error('Search performance API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

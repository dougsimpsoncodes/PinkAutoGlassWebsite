import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

interface SearchTerm {
  'Search term': string;
  Clicks: string;
  'Impr.': string;
  Cost: string;
  Conversions: string;
  'Conv. rate': string;
  'Cost / conv.': string;
}

export async function POST(request: NextRequest) {
  try {
    // =============================================================================
    // AUTO-SYNC: Sync RingCentral data before analyzing (if needed)
    // =============================================================================
    try {
      // Create Basic Auth credentials for internal API call
      const credentials = Buffer.from(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`).toString('base64');

      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/sync/ringcentral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('✅ RingCentral auto-sync completed:', syncData.summary);
      } else {
        console.warn('⚠️ RingCentral auto-sync failed (non-fatal):', await syncResponse.text());
      }
    } catch (syncError) {
      console.warn('⚠️ RingCentral auto-sync error (non-fatal):', syncError);
      // Don't fail the entire request if sync fails
    }

    // Read the latest uploaded CSV
    const filepath = join(process.cwd(), 'data', 'google-ads', 'search-terms-latest.csv');

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'No data file found. Please upload a search terms report first.' },
        { status: 404 }
      );
    }

    const content = await readFile(filepath, 'utf-8');
    const lines = content.trim().split('\n');

    // Find the header line (must include "Search term" AND "Clicks")
    let headerIndex = 0;
    let headerContent = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Search term') && line.includes('Clicks')) {
        headerIndex = i;
        headerContent = lines.slice(i).join('\n');
        break;
      }
    }

    // Parse CSV
    const records: SearchTerm[] = parse(headerContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    // First, find the "Total: Campaign" row for accurate totals
    let campaignTotals = null;
    const campaignTotalRow = records.find(r =>
      r['Search term'] && r['Search term'].toLowerCase() === 'total: campaign'
    );

    if (campaignTotalRow) {
      campaignTotals = {
        clicks: parseInt(campaignTotalRow.Clicks?.replace(/,/g, '') || '0') || 0,
        impressions: parseInt(campaignTotalRow['Impr.']?.replace(/,/g, '') || '0') || 0,
        cost: parseFloat(campaignTotalRow.Cost?.replace(/[$,]/g, '') || '0') || 0,
        conversions: parseFloat(campaignTotalRow.Conversions?.replace(/,/g, '') || '0') || 0,
      };
    }

    // Analyze the data
    const insights = {
      totalClicks: campaignTotals?.clicks || 0,
      totalImpressions: campaignTotals?.impressions || 0,
      totalCost: campaignTotals?.cost || 0,
      totalConversions: campaignTotals?.conversions || 0,
      costPerConversion: 0,
      converters: [] as any[],
      wasted: [] as any[],
      competitors: [] as any[],
      highIntent: [] as any[],
    };

    const competitorNames = ['safelite', 'safe light', 'jiffy', 'primos', 'anders', 'native', 'tavos'];
    const highIntentKeywords = ['replacement', 'repair', 'mobile', 'near me', 'cost'];

    records.forEach(term => {
      // Skip rows without a search term or total rows (which cause double-counting)
      if (!term['Search term']) return;
      if (term['Search term'].toLowerCase().startsWith('total:')) return;

      const clicks = parseInt(term.Clicks) || 0;
      const impressions = parseInt(term['Impr.']) || 0;
      const cost = term.Cost ? parseFloat(term.Cost.replace('$', '')) : 0;
      const conversions = parseFloat(term.Conversions) || 0;
      const convRate = term['Conv. rate'] ? parseFloat(term['Conv. rate'].replace('%', '')) : 0;

      // Note: We use campaignTotals for overall metrics (not summing individual rows)
      // Individual rows are only used for keyword analysis below

      const searchTerm = term['Search term'];
      const termLower = searchTerm.toLowerCase();

      // Identify converters
      if (conversions > 0) {
        insights.converters.push({
          term: searchTerm,
          clicks,
          impressions,
          conversions,
          cost,
          convRate,
          costPerConv: cost / conversions,
        });
      }

      // Identify wasted spend - ONLY terms with NO engagement (no clicks at all)
      // We exclude terms with clicks because clicks = site visits = potential phone calls/future conversions
      // Only flag if: high impressions but ZERO clicks (ad not resonating) OR competitor brands with no engagement
      const isCompetitorBrand = competitorNames.some(comp => termLower.includes(comp));

      // Wasted spend = impressions but no clicks (for non-competitor high-intent terms)
      // OR competitor brands getting impressions but no clicks
      if (impressions > 10 && clicks === 0 && cost === 0) {
        // These are getting shown but not clicked - ad copy problem, not negative keyword problem
        // Don't add to wasted list - these go to "missed opportunities"
      } else if (isCompetitorBrand && clicks === 0 && impressions > 5) {
        // Competitor brand with no engagement - consider blocking
        insights.wasted.push({
          term: searchTerm,
          clicks,
          impressions,
          cost,
          conversions: 0,
          convRate: 0,
        });
      }
      // REMOVED: Terms with clicks are NOT wasted - they drove traffic

      // Identify competitor searches
      if (competitorNames.some(comp => termLower.includes(comp))) {
        insights.competitors.push({
          term: searchTerm,
          impressions,
          clicks,
          cost,
          conversions,
          convRate,
        });
      }

      // Identify high-intent terms with impressions but no clicks
      if (impressions > 5 && clicks === 0 && highIntentKeywords.some(kw => termLower.includes(kw))) {
        insights.highIntent.push({
          term: searchTerm,
          impressions,
          clicks: 0,
          cost: 0,
          conversions: 0,
          convRate: 0,
        });
      }
    });

    // Sort by relevance
    insights.converters.sort((a, b) => b.convRate - a.convRate);
    insights.wasted.sort((a, b) => b.cost - a.cost);
    insights.competitors.sort((a, b) => b.impressions - a.impressions);
    insights.highIntent.sort((a, b) => b.impressions - a.impressions);

    // Calculate cost per conversion
    insights.costPerConversion = insights.totalConversions > 0
      ? insights.totalCost / insights.totalConversions
      : 0;

    // =============================================================================
    // Extract date range from CSV and query RingCentral + Leads
    // =============================================================================
    let dateRange = null;
    let callData = null;
    let leadData = null;

    try {
      // Try to extract date range from CSV metadata (first few lines before headers)
      // Google Ads CSV format includes date range like: "October 20, 2025 - October 28, 2025" or "Sep 1, 2024 - Sep 30, 2024"
      const dateRangeRegex = /(\w+\s+\d{1,2},\s+\d{4})\s*-\s*(\w+\s+\d{1,2},\s+\d{4})/;
      const firstLines = lines.slice(0, 10).join('\n');
      const dateMatch = firstLines.match(dateRangeRegex);

      if (dateMatch) {
        const csvStartDate = new Date(dateMatch[1]);
        const csvEndDate = new Date(dateMatch[2]);
        csvEndDate.setHours(23, 59, 59, 999);

        // Pre-calculate ALL 5 date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateRanges = {
          all: {
            start: csvStartDate.toISOString(),
            end: csvEndDate.toISOString(),
            display: `${dateMatch[1]} - ${dateMatch[2]}`
          },
          today: {
            start: today.toISOString(),
            end: now.toISOString(),
            display: 'Today'
          },
          yesterday: {
            start: yesterday.toISOString(),
            end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
            display: 'Yesterday'
          },
          '7days': {
            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: now.toISOString(),
            display: 'Last 7 Days'
          },
          '30days': {
            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: now.toISOString(),
            display: 'Last 30 Days'
          }
        };

        // Query RingCentral and Leads for ALL date ranges
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const callDataByRange: any = {};
        const leadDataByRange: any = {};

        for (const [rangeKey, range] of Object.entries(dateRanges)) {
          // Query RingCentral calls for this range
          const { data: calls, error: callsError } = await supabase
            .from('ringcentral_calls')
            .select('*')
            .gte('start_time', range.start)
            .lte('start_time', range.end)
            .eq('direction', 'Inbound');

          if (!callsError && calls) {
            const totalCalls = calls.length;
            const answeredCalls = calls.filter(c => c.result === 'Accepted').length;
            const missedCalls = calls.filter(c => c.result === 'Missed').length;

            callDataByRange[rangeKey] = {
              totalCalls,
              answeredCalls,
              missedCalls,
              costPerCall: totalCalls > 0 ? insights.totalCost / totalCalls : 0,
            };
          }

          // Query form leads for this range
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id')
            .gte('created_at', range.start)
            .lte('created_at', range.end);

          if (!leadsError && leads) {
            leadDataByRange[rangeKey] = {
              formSubmissions: leads.length,
              costPerFormSubmission: leads.length > 0 ? insights.totalCost / leads.length : 0,
            };
          }
        }

        // Return all ranges
        dateRange = dateRanges;
        callData = callDataByRange;
        leadData = leadDataByRange;
      }
    } catch (error) {
      console.error('Error querying call/lead data:', error);
      // Don't fail the entire request if call/lead data fails
    }

    return NextResponse.json({
      success: true,
      analysis: insights,
      callData,
      leadData,
      dateRange,
      metadata: {
        totalTerms: records.length,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    );
  }
}

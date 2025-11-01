import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { existsSync } from 'fs';

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

    // Analyze the data
    const insights = {
      totalClicks: 0,
      totalImpressions: 0,
      totalCost: 0,
      totalConversions: 0,
      costPerConversion: 0,
      converters: [] as any[],
      wasted: [] as any[],
      competitors: [] as any[],
      highIntent: [] as any[],
    };

    const competitorNames = ['safelite', 'safe light', 'jiffy', 'primos', 'anders', 'native', 'tavos'];
    const highIntentKeywords = ['replacement', 'repair', 'mobile', 'near me', 'cost'];

    records.forEach(term => {
      // Skip rows without a search term
      if (!term['Search term']) return;

      const clicks = parseInt(term.Clicks) || 0;
      const impressions = parseInt(term['Impr.']) || 0;
      const cost = term.Cost ? parseFloat(term.Cost.replace('$', '')) : 0;
      const conversions = parseFloat(term.Conversions) || 0;
      const convRate = term['Conv. rate'] ? parseFloat(term['Conv. rate'].replace('%', '')) : 0;

      insights.totalClicks += clicks;
      insights.totalImpressions += impressions;
      insights.totalCost += cost;
      insights.totalConversions += conversions;

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

    return NextResponse.json({
      success: true,
      analysis: insights,
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

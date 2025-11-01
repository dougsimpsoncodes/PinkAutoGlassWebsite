import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Save analysis results as actionable recommendations
export async function POST(request: NextRequest) {
  try {
    const { analysis } = await request.json();

    const recommendations: any[] = [];

    // Create recommendations from wasted spend (competitor brands)
    if (analysis.wasted && analysis.wasted.length > 0) {
      analysis.wasted.forEach((term: any) => {
        recommendations.push({
          category: 'negative_keywords',
          priority: 'high',
          title: `Block competitor search: "${term.term}"`,
          description: `This competitor brand search got ${term.impressions} impressions but zero clicks. Consider adding as negative keyword.`,
          search_term: term.term,
          current_metrics: {
            impressions: term.impressions,
            clicks: term.clicks,
            cost: term.cost,
            conversions: 0,
          },
          expected_impact: 'Eliminate wasted impressions on competitor brand searches',
          status: 'pending',
        });
      });
    }

    // Create recommendations from top converters
    if (analysis.converters && analysis.converters.length > 0) {
      analysis.converters.slice(0, 5).forEach((term: any) => {
        recommendations.push({
          category: 'increase_bids',
          priority: 'critical',
          title: `Increase bid on: "${term.term}"`,
          description: `This term has a ${term.convRate.toFixed(0)}% conversion rate at $${term.costPerConv?.toFixed(2)} CPA. Increase bids by 30-50% to capture more traffic.`,
          search_term: term.term,
          current_metrics: {
            impressions: term.impressions,
            clicks: term.clicks,
            cost: term.cost,
            conversions: term.conversions,
            convRate: term.convRate,
            costPerConv: term.costPerConv,
          },
          expected_impact: `+40% conversions while maintaining profitable CPA`,
          status: 'pending',
        });
      });
    }

    // Create recommendations from missed opportunities
    if (analysis.highIntent && analysis.highIntent.length > 0) {
      analysis.highIntent.slice(0, 3).forEach((term: any) => {
        recommendations.push({
          category: 'improve_ad_copy',
          priority: 'medium',
          title: `Improve ad copy for: "${term.term}"`,
          description: `This high-intent search got ${term.impressions} impressions but zero clicks. Your ad copy isn't resonating with these searchers.`,
          search_term: term.term,
          current_metrics: {
            impressions: term.impressions,
            clicks: 0,
            cost: 0,
            conversions: 0,
          },
          expected_impact: `2-3x CTR improvement with better ad relevance`,
          status: 'pending',
        });
      });
    }

    // Bulk insert recommendations
    if (recommendations.length > 0) {
      const { data, error } = await supabase
        .from('google_ads_recommendations')
        .insert(recommendations)
        .select();

      if (error) {
        console.error('Error saving recommendations:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        count: data.length,
        recommendations: data,
      });
    }

    return NextResponse.json({
      success: true,
      count: 0,
      message: 'No recommendations to save',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to save recommendations' }, { status: 500 });
  }
}

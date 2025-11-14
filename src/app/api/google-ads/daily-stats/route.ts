/**
 * Get Google Ads Daily Statistics
 * GET /api/google-ads/daily-stats?startDate=2025-11-01&endDate=2025-11-14
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCampaignPerformance } from '@/lib/googleAds';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate and endDate' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch campaign performance data
    const campaigns = await fetchCampaignPerformance(startDate, endDate);

    // Aggregate by date
    const dataByDate: Record<
      string,
      {
        date: string;
        impressions: number;
        clicks: number;
        spend: number;
      }
    > = {};

    campaigns.forEach((campaign) => {
      const { date, impressions, clicks, cost } = campaign;

      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          impressions: 0,
          clicks: 0,
          spend: 0,
        };
      }

      dataByDate[date].impressions += impressions;
      dataByDate[date].clicks += clicks;
      dataByDate[date].spend += cost;
    });

    // Convert to array and sort by date
    const dailyData = Object.values(dataByDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      success: true,
      dateRange: { startDate, endDate },
      totalDays: dailyData.length,
      data: dailyData,
    });
  } catch (error: any) {
    // Try to surface a concise, non-sensitive message for easier debugging
    let message = error?.message || 'Unknown error';
    const code = error?.code || error?.status;
    const cause = error?.response?.data?.error || error?.errors?.[0]?.message;
    if (cause) message = `${message} (${cause})`;
    console.error('Error fetching Google Ads daily stats:', { message, code });
    return NextResponse.json(
      {
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch Google Ads Data for Daily Report
 * Returns aggregated Google Ads metrics by day
 */

import { fetchCampaignPerformance } from '../src/lib/googleAds';

interface DailyAdsData {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

export async function fetchGoogleAdsDataByDay(
  startDate: string,
  endDate: string
): Promise<DailyAdsData[]> {
  try {
    // Fetch campaign performance data
    const campaigns = await fetchCampaignPerformance(startDate, endDate);

    // Aggregate by date
    const dataByDate: Record<string, DailyAdsData> = {};

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

    return dailyData;
  } catch (error: any) {
    console.error('Error fetching Google Ads data:', error.message);
    throw error;
  }
}

// For testing
if (require.main === module) {
  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const startDate = fourteenDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  fetchGoogleAdsDataByDay(startDate, endDate)
    .then((data) => {
      console.log('Google Ads Data:');
      console.log(JSON.stringify(data, null, 2));
    })
    .catch((error) => {
      console.error('Failed:', error.message);
      process.exit(1);
    });
}

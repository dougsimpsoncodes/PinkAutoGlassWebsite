/**
 * Fetch Google Ads data for a specific date
 */
require('dotenv').config({ path: '.env.local' });

const { GoogleAdsApi } = require('google-ads-api');

async function fetchGoogleAdsData(dateStr) {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });

  const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE segments.date = '${dateStr}'
      AND campaign.status != 'REMOVED'
  `;

  try {
    const results = await customer.query(query);

    let impressions = 0, clicks = 0, spend = 0, conversions = 0;

    results.forEach(row => {
      impressions += parseInt(row.metrics.impressions || '0');
      clicks += parseInt(row.metrics.clicks || '0');
      spend += parseFloat((row.metrics.cost_micros / 1000000).toFixed(2));
      conversions += parseFloat(row.metrics.conversions || '0');
    });

    return { impressions, clicks, spend, conversions };
  } catch (error) {
    console.error('Google Ads API error:', error.message);
    return { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
  }
}

// If run directly
if (require.main === module) {
  const date = process.argv[2] || '2025-11-25';
  fetchGoogleAdsData(date).then(data => {
    console.log(`Google Ads data for ${date}:`);
    console.log(`  Impressions: ${data.impressions.toLocaleString()}`);
    console.log(`  Clicks: ${data.clicks}`);
    console.log(`  Spend: $${data.spend.toFixed(2)}`);
    console.log(`  Conversions: ${data.conversions}`);
  });
}

module.exports = { fetchGoogleAdsData };

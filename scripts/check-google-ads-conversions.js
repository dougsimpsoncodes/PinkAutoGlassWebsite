/**
 * Check Google Ads Conversion Actions
 *
 * This script lists all conversion actions in your Google Ads account
 * to verify phone call conversions are properly set up.
 *
 * Usage:
 *   node scripts/check-google-ads-conversions.js
 */

require('dotenv').config({ path: '.env.local' });

const { GoogleAdsApi, enums } = require('google-ads-api');

async function checkConversions() {
  try {
    console.log('🔍 Checking Google Ads conversion actions...\n');

    // Initialize Google Ads API client
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Query conversion actions
    const query = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.category,
        conversion_action.status,
        conversion_action.primary_for_goal,
        conversion_action.phone_call_duration_seconds,
        conversion_action.tag_snippets
      FROM conversion_action
      WHERE conversion_action.status != 'REMOVED'
      ORDER BY conversion_action.name
    `;

    const conversions = await customer.query(query);

    console.log(`Found ${conversions.length} conversion action(s):\n`);
    console.log('='.repeat(80));

    conversions.forEach((conversion, index) => {
      const action = conversion.conversion_action;

      console.log(`\n${index + 1}. ${action.name}`);
      console.log(`   ID: ${action.id}`);
      console.log(`   Type: ${action.type}`);
      console.log(`   Category: ${action.category}`);
      console.log(`   Status: ${action.status}`);
      console.log(`   Primary for goal: ${action.primary_for_goal ? 'Yes' : 'No'}`);

      // Check for phone call specific info
      if (action.type === 'PHONE_CALL_LEAD') {
        console.log(`   📞 Phone Call Conversion`);
        console.log(`   Min call duration: ${action.phone_call_duration_seconds || 0} seconds`);
      }

      // Check for tag snippets (conversion labels)
      if (action.tag_snippets && action.tag_snippets.length > 0) {
        action.tag_snippets.forEach(snippet => {
          if (snippet.type === 'WEBPAGE') {
            // Extract conversion label from the snippet
            const labelMatch = snippet.page_format?.match(/send_to['"]\s*:\s*['"]AW-\d+\/([^'"]+)['"]/);
            if (labelMatch) {
              console.log(`   Conversion Label: ${labelMatch[1]}`);
            }
          }
        });
      }
    });

    console.log('\n' + '='.repeat(80));

    // Summary
    const phoneCallConversions = conversions.filter(c =>
      c.conversion_action.type === 'PHONE_CALL_LEAD' ||
      c.conversion_action.name.toLowerCase().includes('call') ||
      c.conversion_action.name.toLowerCase().includes('phone')
    );

    const websiteConversions = conversions.filter(c =>
      c.conversion_action.type === 'WEBPAGE'
    );

    console.log('\n📊 SUMMARY:');
    console.log(`   Total conversions: ${conversions.length}`);
    console.log(`   Phone call conversions: ${phoneCallConversions.length}`);
    console.log(`   Website conversions: ${websiteConversions.length}`);

    // Check against expected labels from code
    console.log('\n✅ VERIFICATION:');

    const expectedLabels = {
      'Lead Form': '3CXNCJaG9cEbEJSayehB',
      'Call Click': 'NRHDCJmG9cEbEJSayehB',
      'Text Click': 'zs3xCJyG9cEbEJSayehB',
    };

    Object.entries(expectedLabels).forEach(([name, label]) => {
      const found = conversions.some(c => {
        if (!c.conversion_action.tag_snippets) return false;
        return c.conversion_action.tag_snippets.some(snippet => {
          return snippet.page_format?.includes(label);
        });
      });

      console.log(`   ${name} (${label}): ${found ? '✅ Found' : '❌ Missing'}`);
    });

    // Check for phone call from ads conversion
    const hasPhoneCallConversion = conversions.some(c =>
      c.conversion_action.type === 'PHONE_CALL_LEAD'
    );

    console.log(`   Phone Calls from Ads: ${hasPhoneCallConversion ? '✅ Found' : '❌ Missing'}`);

    if (!hasPhoneCallConversion) {
      console.log('\n⚠️  WARNING: No phone call conversion from ads found!');
      console.log('   You should set up a "Phone calls from ads" conversion action.');
      console.log('   See: docs/GOOGLE_ADS_CONVERSION_SETUP.md');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error checking conversions:', error.message);

    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n💡 Your Google Ads API credentials may not have permission to read conversion actions.');
      console.error('   Please check manually in Google Ads: Tools → Conversions');
    } else if (error.message.includes('invalid_grant')) {
      console.error('\n💡 Your refresh token may have expired.');
      console.error('   Please regenerate it and update GOOGLE_ADS_REFRESH_TOKEN in .env.local');
    }
  }
}

// Additional function to analyze search terms
async function analyzeSearchTerms() {
  try {
    console.log('\n🔍 Analyzing Search Terms Report (Last 30 Days)...\n');

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Date range - last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Campaign performance
    console.log('=== Campaign Performance ===\n');

    const campaignQuery = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'
        AND campaign.status != 'REMOVED'
    `;

    const campaigns = await customer.query(campaignQuery);
    const campStats = {};

    campaigns.forEach(row => {
      const name = row.campaign.name;
      if (!campStats[name]) {
        campStats[name] = { impressions: 0, clicks: 0, cost: 0, conversions: 0 };
      }
      campStats[name].impressions += parseInt(row.metrics.impressions || '0');
      campStats[name].clicks += parseInt(row.metrics.clicks || '0');
      campStats[name].cost += parseFloat(row.metrics.cost_micros || 0) / 1000000;
      campStats[name].conversions += parseFloat(row.metrics.conversions || '0');
    });

    Object.entries(campStats).forEach(([name, s]) => {
      console.log(`Campaign: ${name}`);
      console.log(`  Spend: $${s.cost.toFixed(2)} | Clicks: ${s.clicks} | Conv: ${s.conversions}`);
      console.log(`  CTR: ${(s.impressions > 0 ? (s.clicks / s.impressions * 100).toFixed(2) : '0')}%`);
      if (s.conversions > 0) console.log(`  CPA: $${(s.cost / s.conversions).toFixed(2)}`);
      console.log('');
    });

    // Search terms
    console.log('=== Search Terms Analysis ===\n');

    const searchQuery = `
      SELECT
        search_term_view.search_term,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM search_term_view
      WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'
    `;

    const searchTerms = await customer.query(searchQuery);
    const termStats = {};

    searchTerms.forEach(row => {
      const term = row.search_term_view?.search_term;
      if (!term) return;
      if (!termStats[term]) {
        termStats[term] = { impressions: 0, clicks: 0, cost: 0, conversions: 0 };
      }
      termStats[term].impressions += parseInt(row.metrics.impressions || '0');
      termStats[term].clicks += parseInt(row.metrics.clicks || '0');
      termStats[term].cost += parseFloat(row.metrics.cost_micros || 0) / 1000000;
      termStats[term].conversions += parseFloat(row.metrics.conversions || '0');
    });

    // Top converting
    console.log('--- TOP CONVERTING SEARCH TERMS ---\n');
    const converters = Object.entries(termStats)
      .filter(([, s]) => s.conversions > 0)
      .sort((a, b) => b[1].conversions - a[1].conversions)
      .slice(0, 15);

    if (converters.length === 0) {
      console.log('No converting search terms found in the last 30 days.\n');
    } else {
      converters.forEach(([term, s]) => {
        console.log(`"${term}"`);
        console.log(`  Conv: ${s.conversions} | Clicks: ${s.clicks} | Cost: $${s.cost.toFixed(2)} | CPA: $${(s.cost / s.conversions).toFixed(2)}`);
      });
    }

    // Wasted spend
    console.log('\n--- WASTED SPEND (No Conversions, 2+ Clicks) ---\n');
    const wasted = Object.entries(termStats)
      .filter(([, s]) => s.conversions === 0 && s.clicks >= 2)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 20);

    if (wasted.length === 0) {
      console.log('No wasted spend found!\n');
    } else {
      let totalWasted = 0;
      wasted.forEach(([term, s]) => {
        console.log(`"${term}"`);
        console.log(`  Clicks: ${s.clicks} | Cost: $${s.cost.toFixed(2)}`);
        totalWasted += s.cost;
      });
      console.log(`\nTotal wasted (shown): $${totalWasted.toFixed(2)}`);
    }

    // High volume
    console.log('\n--- HIGH VOLUME TERMS (Most Clicks) ---\n');
    Object.entries(termStats)
      .sort((a, b) => b[1].clicks - a[1].clicks)
      .slice(0, 15)
      .forEach(([term, s]) => {
        const convRate = s.clicks > 0 ? (s.conversions / s.clicks * 100).toFixed(1) : '0';
        console.log(`"${term}"`);
        console.log(`  Clicks: ${s.clicks} | Conv: ${s.conversions} | Rate: ${convRate}%`);
      });

    // Summary
    const totalCost = Object.values(termStats).reduce((sum, s) => sum + s.cost, 0);
    const totalConv = Object.values(termStats).reduce((sum, s) => sum + s.conversions, 0);
    const totalClicks = Object.values(termStats).reduce((sum, s) => sum + s.clicks, 0);

    console.log('\n=== SUMMARY ===');
    console.log(`Total Spend: $${totalCost.toFixed(2)}`);
    console.log(`Total Clicks: ${totalClicks}`);
    console.log(`Total Conversions: ${totalConv}`);
    console.log(`Overall CPA: $${totalConv > 0 ? (totalCost / totalConv).toFixed(2) : 'N/A'}`);
    console.log(`Conversion Rate: ${totalClicks > 0 ? ((totalConv / totalClicks) * 100).toFixed(1) : '0'}%`);

  } catch (error) {
    console.error('Error analyzing search terms:', error.message);
  }
}

// Run based on command line args
const args = process.argv.slice(2);
if (args.includes('--search-terms') || args.includes('-s')) {
  analyzeSearchTerms();
} else if (args.includes('--all') || args.includes('-a')) {
  checkConversions().then(() => analyzeSearchTerms());
} else {
  checkConversions();
  console.log('\nTip: Run with --search-terms or -s to see search term analysis');
  console.log('     Run with --all or -a to see both');
}

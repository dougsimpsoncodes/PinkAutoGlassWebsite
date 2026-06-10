// Create the quoter-led RSA in the Denver > Denver Keywords ad group.
// Runs ALONGSIDE the existing phone-first RSA (811492665732), which stays
// untouched as the control. Top-3 headlines pinned to position 1 as a pool
// so a quote-first message always shows. Lands on /quote (dedicated quoter).
//
// Usage:
//   node scripts/create-quoter-rsa.js          (dry run: resolve ad group, print payload)
//   node scripts/create-quoter-rsa.js --apply  (create the ad)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { GoogleAdsApi } = require('google-ads-api');

const APPLY = process.argv.includes('--apply');

const HEADLINES = [
  { text: 'Enter Your Plate. Get A Price.', pinned_field: 'HEADLINE_1' },
  { text: 'Windshield Quote In 60 Seconds', pinned_field: 'HEADLINE_1' },
  { text: 'Priced Online. Booked Online.', pinned_field: 'HEADLINE_1' },
  { text: 'Enter VIN, See Your Price' },
  { text: 'Real Installed Price Online' },
  { text: '24/7 Online Windshield Quotes' },
  { text: 'Get Your Price, Skip The Call' },
  { text: 'Book Mobile Service Online' },
  { text: 'Mobile Windshield Replacement' },
  { text: 'Free Mobile Service In Denver' },
  { text: 'Windshields From $299' },
  { text: 'Same-Day Mobile Service' },
  { text: 'Pink Auto Glass' },
  { text: 'Lifetime Warranty On Service' },
  { text: 'Denver Windshield Quotes' },
];

const DESCRIPTIONS = [
  { text: 'Enter your plate or VIN, see your exact installed price in 60 seconds. Book online 24/7.' },
  { text: 'Mobile windshield replacement in Denver. We come to your home or work at no extra cost.' },
  { text: 'Exact price online — no phone call, no waiting. Same-day mobile appointments available.' },
  { text: 'A portion of every sale supports breast cancer research. Local, trusted Denver service.' },
];

const FINAL_URL = 'https://pinkautoglass.com/quote';

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
});

(async () => {
  for (const h of HEADLINES) {
    if (h.text.length > 30) throw new Error(`Headline over 30 chars: "${h.text}" (${h.text.length})`);
  }
  for (const d of DESCRIPTIONS) {
    if (d.text.length > 90) throw new Error(`Description over 90 chars: "${d.text}" (${d.text.length})`);
  }

  const rows = await customer.query(`
    SELECT ad_group.id, ad_group.resource_name, campaign.name, ad_group.name
    FROM ad_group
    WHERE campaign.name = 'Denver' AND ad_group.name = 'Denver Keywords'
      AND ad_group.status = 'ENABLED'
  `);
  if (rows.length !== 1) throw new Error(`Expected exactly 1 ad group, found ${rows.length}`);
  const adGroup = rows[0].ad_group;
  console.log(`Target: ${rows[0].campaign.name} > ${rows[0].ad_group.name} (${adGroup.resource_name})`);
  console.log(`Headlines: ${HEADLINES.length}, Descriptions: ${DESCRIPTIONS.length}, URL: ${FINAL_URL}`);

  if (!APPLY) {
    console.log('\nDRY RUN — re-run with --apply to create the ad.');
    return;
  }

  const result = await customer.adGroupAds.create([
    {
      ad_group: adGroup.resource_name,
      status: 'ENABLED',
      ad: {
        final_urls: [FINAL_URL],
        responsive_search_ad: {
          headlines: HEADLINES,
          descriptions: DESCRIPTIONS,
        },
      },
    },
  ]);
  console.log('Created:', JSON.stringify(result?.results || result, null, 2));
})().catch((e) => {
  console.error('ERR', JSON.stringify(e.errors || e.message || e, null, 2));
  process.exit(1);
});

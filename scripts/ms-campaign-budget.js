/**
 * View or update Microsoft Ads campaign daily budget.
 * Run: node scripts/ms-campaign-budget.js            (view current budgets)
 *      node scripts/ms-campaign-budget.js <id> <usd> (set daily budget)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const CLIENT_ID = process.env.MICROSOFT_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_ADS_CLIENT_SECRET;
const ENV_REFRESH_TOKEN = process.env.MICROSOFT_ADS_REFRESH_TOKEN;
const DEVELOPER_TOKEN = process.env.MICROSOFT_ADS_DEVELOPER_TOKEN;
const ACCOUNT_ID = process.env.MICROSOFT_ADS_ACCOUNT_ID;
const CUSTOMER_ID = process.env.MICROSOFT_ADS_CUSTOMER_ID;

async function getRefreshToken() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'microsoft_ads_refresh_token')
        .single();
      if (data?.value) return data.value;
    } catch {
      // fall through to env token
    }
  }
  return ENV_REFRESH_TOKEN;
}

async function getAccessToken() {
  const refreshToken = await getRefreshToken();
  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'https://ads.microsoft.com/msads.manage offline_access',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(data).slice(0, 200)}`);
  return data.access_token;
}

async function api(path, body, token, method = 'POST') {
  const res = await fetch(`https://campaign.api.bingads.microsoft.com/CampaignManagement/v13/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      DeveloperToken: DEVELOPER_TOKEN,
      CustomerId: CUSTOMER_ID,
      CustomerAccountId: ACCOUNT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
  const [, , campaignId, newBudget] = process.argv;
  const token = await getAccessToken();

  const { Campaigns } = await api('Campaigns/QueryByAccountId', {
    AccountId: ACCOUNT_ID,
    CampaignType: 'Search',
  }, token);

  console.log('Current campaigns:');
  for (const c of Campaigns || []) {
    console.log(`  ${c.Id}  ${c.Name}  status=${c.Status}  dailyBudget=$${c.DailyBudget} (${c.BudgetType})`);
  }

  if (!campaignId || !newBudget) return;

  const target = (Campaigns || []).find((c) => String(c.Id) === String(campaignId));
  if (!target) throw new Error(`Campaign ${campaignId} not found`);

  const result = await api('Campaigns', {
    AccountId: ACCOUNT_ID,
    Campaigns: [{ Id: target.Id, DailyBudget: Number(newBudget), BudgetType: target.BudgetType }],
  }, token, 'PUT');

  const errors = result.PartialErrors || [];
  if (errors.length) {
    console.error('Update errors:', JSON.stringify(errors, null, 2));
    process.exit(1);
  }
  console.log(`\nUpdated campaign ${target.Name} (${target.Id}) daily budget to $${newBudget}`);
}

main().catch((err) => { console.error('Error:', err.message); process.exit(1); });

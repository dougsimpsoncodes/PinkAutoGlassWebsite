# Fix: Google Ads API “No Refresh Token” in Local TypeScript Scripts

## Context
- Error: `Error: No refresh token or refresh handler callback is set.`
- Stack: Node + TypeScript (tsx), `google-ads-api` npm package.
- Cause only reproduces locally when loading `.env` with `dotenv` after imports; production (Vercel) works because env is present before any code executes.

## Root Cause
In ES Modules, `import` statements are hoisted and evaluated before the module body runs. The current `src/lib/googleAds.ts` reads environment variables into module‑scope constants at import time. When a local script imports this module before running `dotenv.config(...)`, those constants capture `undefined`, and later calls fail with “no refresh token”.

## Decision
Adopt lazy (runtime) env reads inside `getGoogleAdsClient()` and validate on each call. For local scripts, ensure env is loaded before importing by either preloading dotenv via Node options or using a tiny dynamic import. This keeps production behavior unchanged and makes local scripts reliable.

## Changes (Code Snippets)

### 1) Refactor `src/lib/googleAds.ts`
Move env access into the function and validate at call time.

```ts
// src/lib/googleAds.ts
import { GoogleAdsApi, Customer } from 'google-ads-api';

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val || val.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export function getGoogleAdsClient(): { client: GoogleAdsApi; customer: Customer } {
  const client = new GoogleAdsApi({
    client_id: requireEnv('GOOGLE_ADS_CLIENT_ID'),
    client_secret: requireEnv('GOOGLE_ADS_CLIENT_SECRET'),
    developer_token: requireEnv('GOOGLE_ADS_DEVELOPER_TOKEN'),
  });

  const customer = client.Customer({
    customer_id: requireEnv('GOOGLE_ADS_CUSTOMER_ID'),
    refresh_token: requireEnv('GOOGLE_ADS_REFRESH_TOKEN'),
  });

  return { client, customer };
}

export async function fetchCampaignPerformance(startDate: string, endDate: string) {
  const { customer } = getGoogleAdsClient();
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC`;
  const rows = await customer.query(query);
  return rows;
}
```

### 2) Ensure local scripts load env before importing
Option A (preferred for simplicity): Preload dotenv via Node options.

```bash
NODE_OPTIONS="-r dotenv/config" \
DOTENV_CONFIG_PATH="/tmp/.env.production.clean2" \
npx tsx scripts/send-full-test-report.ts
```

Option B (inline): Call dotenv, then dynamically import the module.

```ts
// scripts/send-full-test-report.ts
import dotenv from 'dotenv';
dotenv.config({ path: '/tmp/.env.production.clean2' });

async function main() {
  const { fetchCampaignPerformance } = await import('../src/lib/googleAds.js');
  const data = await fetchCampaignPerformance('2025-11-01', '2025-11-12');
  console.log('Rows:', data.length);
}

main().catch(err => { console.error(err); process.exit(1); });
```

## Tests / Verification
1. Local (dotenv preloaded):
   - Command: see Option A above.
   - Expect: no “No refresh token” error; rows returned; script completes.
2. Local (dynamic import):
   - Use Option B; expect same successful result.
3. Production (Vercel):
   - No changes required; env is injected at boot; APIs continue to work.

## Rollback Plan
- Revert the lazy env read changes in `src/lib/googleAds.ts` to previous module‑scope constants (not recommended). No data/state changes involved.

## Best Practices
- Do not read env at module scope for external API clients; read and validate at call time.
- For CLI/scripts, either preload dotenv (`NODE_OPTIONS=-r dotenv/config`) or run `dotenv.config()` before importing modules that access `process.env`.
- Prefer clear error messages for missing credentials to speed troubleshooting.

## Notes / Edge Cases
- If the error persists after these changes, the refresh token itself may be invalid/expired or tied to a different Google Ads account. Regenerate and test a new refresh token.
- Ensure the OAuth2 client’s credentials (client id/secret) match the refresh token’s origin project, and that `customer_id` is the intended account.


# Google Ads OAuth Credentials Recovery and Hardening

## Summary
Local and production calls now fail with `unauthorized_client` / `invalid_client` during the refresh-token exchange. We fixed env loading order (lazy reads), so remaining causes are credential mismatch or token invalidation. This guide diagnoses which piece is broken and regenerates a clean, matching set (client id/secret/refresh token) using the correct scope and project. It also covers verification and prevention so tokens don’t silently expire again.

---

## 1) Quick Diagnosis Matrix (10 minutes)
Use Google OAuth token endpoint to test independently of app code.

Curl (replace values):

```
curl -s https://oauth2.googleapis.com/token \
  -d client_id="<CLIENT_ID>" \
  -d client_secret="<CLIENT_SECRET>" \
  -d grant_type=refresh_token \
  -d refresh_token="<REFRESH_TOKEN>" | jq
```

Interpretation:
- `invalid_client`: client_id/secret pair not recognized (wrong project, typo, rotated secret).
- `unauthorized_client`: client type/permissions invalid for this flow, or client_id doesn’t match the refresh_token’s origin.
- `invalid_grant`: refresh token invalid/expired/revoked; or wrong client for that token; or app in testing with >7‑day expiry.
- 200 OK with `access_token`: credentials are valid.

Also confirm the Ads scope used to obtain the refresh token was:
- `https://www.googleapis.com/auth/adwords`

---

## 2) Prerequisites Checklist (Google Cloud project)
- Google Ads API enabled in the same GCP project as the OAuth client.
- OAuth consent screen configured (publish to Production to avoid 7‑day token expiry for non-test users).
- OAuth client type: Desktop or Web (both work; Desktop + OAuth Playground is simplest for a one‑time token).
- Developer token approved (Basic/Standard) in Google Ads; linked to the target customer.

Links:
- Cloud Console: https://console.cloud.google.com/
- OAuth Playground: https://developers.google.com/oauthplayground/
- Ads API OAuth: https://developers.google.com/google-ads/api/docs/oauth/overview

---

## 3) Regenerate a Matching Credential Set (15–20 minutes)
Goal: ensure `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` all come from the same GCP project and the same OAuth client.

A) Create or identify the OAuth client
- Cloud Console → APIs & Services → Credentials → “Create Credentials” → OAuth client ID.
- Choose "Desktop app" (simplest) OR "Web application" (with a redirect URI).
- Note the `client_id` and `client_secret`.

B) Use OAuth Playground to get a fresh refresh token
1. Open OAuth Playground → cog icon (upper-right) → check “Use your own OAuth credentials”, then enter your new `client_id` and `client_secret`.
2. Step 1: Input scope: `https://www.googleapis.com/auth/adwords` → Authorize APIs.
3. When prompted, select the Google user that has access to the Google Ads account (or MCC) for `GOOGLE_ADS_CUSTOMER_ID`.
4. Step 2: Exchange authorization code for tokens → copy the `refresh_token` (only shown once).
   - If you don’t see a refresh token, click the cog again and enable “Access type: offline” and “Force prompt: consent”, then re‑authorize.

C) Update environment
- Vercel (Production): set all FIVE variables from the same set
  - `GOOGLE_ADS_CLIENT_ID`
  - `GOOGLE_ADS_CLIENT_SECRET`
  - `GOOGLE_ADS_REFRESH_TOKEN`
  - `GOOGLE_ADS_DEVELOPER_TOKEN` (unchanged unless you rotate)
  - `GOOGLE_ADS_CUSTOMER_ID`
- Local: update `.env.local` or preload via DOTENV for scripts.

D) Verify via token endpoint (again)
- Run the curl from Section 1 with the new trio. Expect 200 and an `access_token`.

---

## 4) App-level Verification (5–10 minutes)
- Local: Preload dotenv and run a small test

```
NODE_OPTIONS="-r dotenv/config" DOTENV_CONFIG_PATH=".env.local" \
  npx tsx -e "import('./src/lib/googleAds.ts').then(async m => { const r = await m.fetchCampaignPerformance('2025-11-11','2025-11-12'); console.log('rows', r.length); }).catch(e=>{console.error(e);process.exit(1);})"
```

- Production: call your stats endpoint and confirm JSON returns data, not `invalid_client`.

---

## 5) Common Pitfalls and Fixes
- Mixed projects: Refresh token from Project A; client id/secret from Project B → `unauthorized_client`/`invalid_client`.
- Testing mode: Consent screen in “Testing” → refresh tokens expire after 7 days. Publish to “Production”.
- Rotated secret: If you created a new OAuth client or reset secret, all prior refresh tokens tied to the old secret can fail.
- Wrong user/account: The Google account that granted consent must have access to the Ads `customer_id` (or via MCC).
- Missing scope: Refresh token created without `adwords` scope → calls will fail.

---

## 6) Prevention / Hardening
- Publish consent screen to Production (avoid 7‑day expiry).
- Store credentials only in Vercel env; do not commit.
- Add a CI smoke: curl token endpoint weekly and alert on non‑200.
- Log and surface OAuth token errors with clear action guidance.
- Document credential provenance (GCP project, client name, owner account, date).

---

## 7) If Problems Persist
- Re-run Section 1 to see the exact OAuth error from Google.
- Confirm Ads API is enabled on the same GCP project as the OAuth client.
- Consider regenerating a Desktop client dedicated to this integration to avoid ambiguity.
- Verify developer token status in the Google Ads UI and the linked accounts.

---

## Appendix: Minimal Client Code Pattern

```
import { GoogleAdsApi } from 'google-ads-api';

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function getGoogleAdsClient() {
  const client = new GoogleAdsApi({
    client_id: env('GOOGLE_ADS_CLIENT_ID'),
    client_secret: env('GOOGLE_ADS_CLIENT_SECRET'),
    developer_token: env('GOOGLE_ADS_DEVELOPER_TOKEN'),
  });
  const customer = client.Customer({
    customer_id: env('GOOGLE_ADS_CUSTOMER_ID'),
    refresh_token: env('GOOGLE_ADS_REFRESH_TOKEN'),
  });
  return { client, customer };
}
```


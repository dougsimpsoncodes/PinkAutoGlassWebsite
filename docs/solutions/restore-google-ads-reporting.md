# Restore Google Ads API Reporting (Fast Path)

## Executive Summary
Production Google Ads reporting fails with `invalid_client` during OAuth token exchange. This indicates a mismatch between `client_id`/`client_secret` and `refresh_token` (e.g., rotated secret/new OAuth client) or a Testing‑mode token expiry. The code already supports lazy env reads and MCC via `GOOGLE_ADS_LOGIN_CUSTOMER_ID`. Fix by regenerating a refresh token that matches the current client, updating env vars, and verifying via the included token checks and `/api/google-ads/daily-stats`. Future-proof with a weekly token smoke. This doc provides a short, reliable sequence Claude can follow to restore reporting quickly.

---

## Scope
- Affects: `/api/google-ads/daily-stats` and any Google Ads pulls
- Not impacted: RingCentral, Supabase, notifications
- Code already supports: MCC (`GOOGLE_ADS_LOGIN_CUSTOMER_ID`), dashless IDs, lazy env reads

## Steps (Claude Implementation)

### 1) Diagnose current credentials
- Run local helper (optional):
  ```bash
  chmod +x scripts/google-ads-credential-diagnose.sh
  ./scripts/google-ads-credential-diagnose.sh              # or ./scripts/google-ads-credential-diagnose.sh .env.local
  ```
- Or verify in production (after deploy) with admin route:
  ```bash
  curl -u admin:<ADMIN_PASSWORD> "https://pinkautoglass.com/api/admin/google-ads/token-check"
  ```
- Note the error:
  - `invalid_client`/`unauthorized_client`: client and token mismatch → regenerate refresh token or align client.
  - `invalid_grant`: refresh token expired/revoked or Testing-mode → regenerate refresh token.

### 2) Regenerate only the refresh token (keep client_id/secret)
- In Google Cloud Console (same project):
  - Ensure Google Ads API is enabled; publish OAuth consent screen to Production.
- OAuth Playground: https://developers.google.com/oauthplayground/
  - Gear → “Use your own OAuth credentials” → paste `GOOGLE_ADS_CLIENT_ID`/`GOOGLE_ADS_CLIENT_SECRET`
  - Enable “Access type: offline” and “Force prompt: consent”
  - Scope: `https://www.googleapis.com/auth/adwords` → Authorize → Exchange → copy `refresh_token` (shown once)
- Vercel → Project → Settings → Environment Variables:
  - Update `GOOGLE_ADS_REFRESH_TOKEN` = new value
  - If using MCC, set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` = manager ID (no dashes)
  - Confirm `GOOGLE_ADS_CUSTOMER_ID` is the child ID (no dashes)
- Redeploy

### 3) Verify end-to-end
- Production token check:
  ```bash
  curl -u admin:<ADMIN_PASSWORD> "https://pinkautoglass.com/api/admin/google-ads/token-check"
  # Expect: { ok: true, ... }
  ```
- Reporting API:
  ```bash
  curl "https://pinkautoglass.com/api/google-ads/daily-stats?startDate=2025-11-11&endDate=2025-11-12"
  # Expect: { success: true, data: [...] }
  ```

## Notes & Troubleshooting
- MCC access: Set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (manager) and keep `GOOGLE_ADS_CUSTOMER_ID` (child). IDs must be dashless.
- invalid_client/unauthorized_client: refresh token belongs to a different OAuth client or client secret rotated → re‑issue refresh token for the current client.
- invalid_grant: refresh token expired/revoked or Testing-mode → regenerate; make sure consent screen is Production.

## Prevention (Optional)
- Add a weekly token smoke (CI/Cron): run `scripts/google-ads-credential-diagnose.sh` in “check only” mode and alert on failure.
- Document credential provenance (GCP project, OAuth client name, date/user). Store only in Vercel env.

## Files Already in Repo
- `scripts/google-ads-credential-diagnose.sh` — local token diagnose helper
- `scripts/google-ads-token-check.ts` — local token exchange test (Node/tsx)
- `src/app/api/admin/google-ads/token-check/route.ts` — admin prod token check route (Basic Auth)
- `src/lib/googleAds.ts` — lazy env reads, MCC support, ID normalization
- `src/app/api/google-ads/daily-stats/route.ts` — improved error surfacing


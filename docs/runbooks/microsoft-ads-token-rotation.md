# Microsoft Ads Token Rotation Runbook

## Goal
Rotate the Microsoft Ads refresh token in under 2 minutes and keep reporting healthy.

## When To Run
- Microsoft Ads dashboard shows $0 for Today/Yesterday
- `GET /api/admin/sync/microsoft-ads` reports token errors
- 90 days have passed since the last successful Microsoft Ads sync

## One-Time Azure Setup
Add localhost redirect URIs in the Azure App Registration:
- `http://localhost:8080`
- `http://localhost:8081`
- `http://localhost:8082`

## Fast Rotation Steps
1. From repo root, run:

```bash
set -a; source .env.local; set +a
node scripts/ms_ads_refresh_token.js
```

2. A browser tab opens. Sign in and click **Accept**.
3. The script prints a new refresh token.
4. Update Vercel production env:
   - `MICROSOFT_ADS_REFRESH_TOKEN`
5. Redeploy production (so env takes effect).
6. Trigger sync:
   - `POST /api/admin/sync/microsoft-ads?days=7`

## Verification
- Sync response shows non-zero `campaigns/keywords/searchTerms`.
- Admin dashboard shows Today/Yesterday non-zero.

## Notes
- The refresh token has a **sliding 90‑day inactivity window**.
- As long as the daily sync runs, the token won’t expire.

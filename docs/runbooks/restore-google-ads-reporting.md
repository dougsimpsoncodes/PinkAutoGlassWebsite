# Runbook: Restore Google Ads API Reporting (Claude Implementation Script)

This runbook gives Claude exact steps and commands to restore Google Ads reporting when the OAuth refresh token fails with `invalid_client`/`unauthorized_client`.

## TL;DR (What Claude Should Do)
1) Diagnose current credentials (token exchange) locally or in prod.
2) Regenerate a matching refresh token using OAuth Playground with OUR client credentials.
3) Update only the `GOOGLE_ADS_REFRESH_TOKEN` in Vercel (and optional MCC header), redeploy.
4) Verify token exchange and the reporting API.

---

## 0) Preconditions
- Repo checked out and commands run from project root.
- Access to Vercel project env.
- Admin Basic Auth for prod admin API (username/password env: `ADMIN_USERNAME` / `ADMIN_PASSWORD`).

---

## 1) Diagnose Current Credentials

Option A — Local diagnose (uses current environment)
```bash
chmod +x scripts/google-ads-credential-diagnose.sh
./scripts/google-ads-credential-diagnose.sh                 # or
./scripts/google-ads-credential-diagnose.sh .env.local      # loads from file first
```
- Expect: JSON with `access_token`. If you get `invalid_client`/`invalid_grant`, proceed to Step 2.

Option B — Production diagnose (after deploy)
```bash
# Replace <ADMIN_PASSWORD>
curl -u admin:<ADMIN_PASSWORD> \
  "https://pinkautoglass.com/api/admin/google-ads/token-check"
```
- Expect: `{ ok: true, ... }`. If `{ ok: false, error: "invalid_client"|"invalid_grant" }`, proceed to Step 2.

---

## 2) Regenerate a Matching Refresh Token (Do NOT change client unless necessary)

Confirm OAuth client type:
- If the OAuth client is "Web application": add redirect URI to the client:
  - `https://developers.google.com/oauthplayground`
- If the OAuth client is "Desktop app": skip redirect URI step.

Use OAuth Playground: https://developers.google.com/oauthplayground/
1. Click the gear icon (top right):
   - Enable "Use your own OAuth credentials"
   - Paste `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET`
   - Turn on both:
     - "Access type: offline"
     - "Force prompt: consent"
2. Step 1: Input scope and authorize
   - `https://www.googleapis.com/auth/adwords`
   - Click "Authorize APIs" and approve
3. Step 2: Exchange authorization code
   - Click "Exchange authorization code for tokens"
   - Copy the `refresh_token` (it’s only shown once)

---

## 3) Update Vercel Environment and Redeploy

Update only the refresh token (keep client id/secret unchanged):
```bash
# Remove old token (optional; or edit via Vercel UI)
vercel env rm GOOGLE_ADS_REFRESH_TOKEN production -y || true

# Add the new refresh token
vercel env add GOOGLE_ADS_REFRESH_TOKEN production << 'EOF'
<PASTE_NEW_REFRESH_TOKEN_HERE>
EOF

# Optional (if using an MCC/manager account)
# Set the manager account id WITHOUT dashes
vercel env add GOOGLE_ADS_LOGIN_CUSTOMER_ID production << 'EOF'
<MANAGER_ID_NO_DASHES>
EOF

# Confirm child account id is dashless (update if needed)
# vercel env add GOOGLE_ADS_CUSTOMER_ID production

# Deploy changes
vercel deploy --prod --yes
```

Notes:
- Alternatively, update env vars via Vercel dashboard (Project → Settings → Environment Variables), then redeploy.
- IDs should be stored without dashes (code normalizes, but keeping env clean avoids confusion).

---

## 4) Verify End-to-End

Check prod token exchange:
```bash
curl -u admin:<ADMIN_PASSWORD> \
  "https://pinkautoglass.com/api/admin/google-ads/token-check"
# Expect: { ok: true, token_type, expires_in, ... }
```

Call reporting API:
```bash
curl "https://pinkautoglass.com/api/google-ads/daily-stats?startDate=2025-11-11&endDate=2025-11-12"
# Expect: { success: true, data: [...] }
```

---

## 5) Troubleshooting Notes (Quick)
- `invalid_client` / `unauthorized_client`: The refresh token does not belong to the provided client id/secret (mismatch or rotated secret). Re-issue the refresh token using the exact client used in env.
- `invalid_grant`: The refresh token is expired/revoked or was created while the consent screen was in Testing (7-day expiry). Re-create with Production consent screen.
- MCC access: If using a manager account to access a child account, set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` to the manager id (no dashes). Keep `GOOGLE_ADS_CUSTOMER_ID` as the child id.

---

## 6) Optional Prevention
- Add a weekly token smoke (CI/Cron) that runs the diagnose script and alerts on non-200 token exchanges.
- Document credential provenance (GCP project, OAuth client name, who consented, date). Store only in Vercel env.


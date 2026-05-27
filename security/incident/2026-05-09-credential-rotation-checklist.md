# Secret Rotation Checklist - Historical Findings

Created: 2026-05-09

This checklist covers historical Gitleaks findings baselined in:

- `.gitleaksignore`
- `security/baseline/gitleaks-historical-baseline.json`

The baseline is a CI control only. It does not prove the old values are safe. Complete the checks below before the automated quote flow is launched publicly.

## Required Checks

- [ ] Supabase service-role key: confirm current live key does not match any historical finding; rotate if unknown.
- [ ] Supabase anon key: confirm current live key does not match any historical finding; rotate if unknown.
- [ ] Vercel environment variables: rotate any variable that may have appeared in historical docs or scripts.
- [ ] SendGrid/Resend API keys: confirm no historical value is still active; rotate if unknown.
- [ ] RingCentral/Twilio/Microsoft Ads credentials: confirm no historical value is still active; rotate if unknown.
- [ ] Admin dashboard password: rotate because an old hash/password example existed in `scripts/create-admin-user.sql`.
- [ ] Cron/internal authorization tokens: rotate any token represented by historical curl auth findings.

## Completion Notes

Record the rotation date, owner, and dashboard used for each service. Do not paste secrets or partial secrets into this file.

| Service | Status | Rotation Date | Owner | Notes |
| --- | --- | --- | --- | --- |
| Supabase service-role key | Pending |  |  |  |
| Supabase anon key | Pending |  |  |  |
| Vercel env vars | Pending |  |  |  |
| SendGrid/Resend | Pending |  |  |  |
| RingCentral/Twilio | Pending |  |  |  |
| Microsoft Ads | Pending |  |  |  |
| Admin dashboard password | Pending |  |  |  |
| Cron/internal tokens | Pending |  |  |  |

## Baseline Policy

- Do not add new `.gitleaksignore` fingerprints without an incident note.
- If a historical value is found to still be active, rotate it immediately and document the rotation here.
- Rewriting git history is only considered if rotation is impossible or a third-party requires removal.

# Preexisting Security Scan Triage - 2026-05-09

Scope: baseline review before exposing the automated quote flow publicly.

## Current Gate Status

- `npm audit --audit-level=moderate`: clean after dependency remediation in commit `472386f`.
- `gitleaks protect --source .`: no leaks in the current uncommitted diff.
- `gitleaks detect --log-opts='HEAD~1..HEAD'`: no leaks in the quote-engine commit.
- Full-history `gitleaks detect`: 56 historical findings across 13 commits.
- Full-repo Semgrep: 88 findings, mostly preexisting low-signal logging warnings.

## Historical Secret Classes

These findings are historical and redacted in the scan output. They still require rotation-status confirmation:

- 16 Supabase service-role key findings.
- 14 Supabase anon key findings.
- 19 generic API key findings.
- 7 curl authorization findings.

Highest-priority files from the historical report:

- `TROUBLESHOOTING_STALE_DATA.md`
- `LEAD_NOTIFICATION_IMPLEMENTATION_PLAN.md`
- `.github/workflows/security.yml`
- `security/baseline/secrets-policy.md`
- `SECURITY_AUDIT_REPORT.md`
- `SECRETS_MANAGEMENT_POLICY.md`
- `.claude/CLAUDE.md`
- `scripts/run-migration-pg.js`

## Phase 0 Remediation Decisions

- Treat historical secret findings as a rotation/verification task first.
- Do not rewrite git history unless a live secret is confirmed and rotation alone is insufficient.
- Remove current JWT-shaped and bcrypt-shaped examples so future scans do not create repeated false positives.
- Harden public booking query parsing before it becomes part of the quote funnel.
- Harden migration scripts before using them to apply the quote database migration.
- Harden local OAuth helper browser launch so it does not shell-execute URL input.

## Required Manual Rotation Check

Before launch, compare live credentials in Vercel/Supabase/service dashboards against the historical secret classes above. Rotate anything live, uncertain, or impossible to prove inactive.

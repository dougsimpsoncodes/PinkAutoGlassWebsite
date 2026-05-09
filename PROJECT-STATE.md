# PROJECT-STATE.md — Pink Auto Glass Website

## One-Line Summary
Live client site at `pinkautoglass.com`; as of 2026-04-12 the latest investigated CI/CD alert for commit `b8b7c5e` appears self-healed because the matching GitHub Actions runs are now green.

## What's Built
- [x] Production website and deployment pipeline live in this repo
- [x] GitHub Actions `CI/CD Pipeline` and `Security Checks` workflows active

## Current Focus
Automated quote engine MVP foundation: exact cash windshield quote when confident, estimate/manual review otherwise.

## Decisions Made
- 2026-04-12: Treat queued failure `ci_failure_210` as self-healed because `gh run view` for commit `b8b7c5e` showed the relevant `CI/CD Pipeline` run completed successfully, with no failed-step logs available.

## Known Issues
- `scripts/auto-fix/project-map.json` points PinkAutoGlassWebsite at a stale workspace path instead of this repo, which can misroute future auto-fix attempts.
- Working tree currently contains unrelated local changes in `tasks/todo.md` and `tasks/2026-04-12-google-ads-call-attribution-cascade-fix.md`; avoid touching them during automated fixes.

## Next Steps (priority order)
1. Update the auto-fix project map to the real repo path before the next Pink Auto Glass failure.
2. Continue monitoring CI/CD alerts; only apply a code fix if a currently failing run reproduces.

## Key Files
- `.github/workflows/` — CI/CD and security workflows
- `PROJECT-STATE.md` — this project log

## Credentials & Config
- GitHub Actions / Vercel secrets: stored in GitHub repo settings and Vercel project settings

## Integrations
- **Mygrant Glass API** — setup form drafted 2026-04-15; customer API access confirmed by Leon. Vendor contact: `api-support@mygrantglass.com` (Leon Staub / Mark Wright / Tim Veilleux). Mygrant does not IP-allowlist; traffic is identified by a required `User-Agent` header. Exact string and enforcement requirements live in `.claude/CLAUDE.md` under "Mygrant API Integration — User-Agent Rule". Client foundation now lives in `src/lib/mygrant/client.ts`; guard script: `npx tsx scripts/verify-mygrant-client.ts`.
- **PlateToVIN API** — selected as MVP plate lookup provider. Client foundation lives in `src/lib/platelookup/client.ts`; smoke script: `npx tsx scripts/platetovin-smoke.ts --plate=ABC123 --state=CO`.

## Change Log
- 2026-04-12: Created project state file in the active repo and logged self-healed investigation for `ci_failure_210`.
- 2026-04-14: Started call attribution remediation. Audited production data, identified the 3 ad_platform writers, found the orphaned Phase 2 resolver, drafted the 3-PR plan, ran reviews via Claude self-read + Gemini + Codex.
- 2026-04-15: PR1 merged (commit 3e9ac57). Migration applied to live DB. Dashboard builders updated. PR2 work scheduled for next session — see `tasks/2026-04-14-attribution-remediation.md` "Resume here" section.
- 2026-04-15: Drafted Mygrant Glass API integration setup form. Added User-Agent rule to `.claude/CLAUDE.md` and Integrations section here. Revised after Codex second-opinion review: switched UA contact email to `doug@pinkautoglass.com` (real routing address), dropped AWS/Next.js specifics from OMS framing, acknowledged Vercel Static IPs/Secure Compute as a future option in the IP answer, and upgraded enforcement from "documentation rule" to "code-level invariant" (central client + constant + test + repo guard required in first client PR).
- 2026-05-09: Started automated quote engine MVP foundation. Added Mygrant SOAP inquiry client + guard, PlateToVIN client, quote identify API boundary, cash windshield pricing helper, smoke scripts, and migration draft `20260509_automated_quotes.sql`. Migration not applied yet; live API credentials still needed in `.env.local`.

## Attribution Remediation (in progress)

3-PR remediation of the call attribution model driving Google + Microsoft search ad spend. Background, full audit, decision log, and resume instructions live in `tasks/2026-04-14-attribution-remediation.md`.

**PR1 — MERGED to main 2026-04-15 (commit `3e9ac57`):**
- Stopped the dual-platform corruption: removed two `ad_platform` writes from `src/lib/offlineConversionSync.ts`
- Migration `20260414_expand_attribution_constraints.sql` applied to live DB (project `fypzafbsfrrlrrufzkol`) via the new `scripts/run-migration-via-api.js` helper. Constraints verified via `pg_constraint` query
- Dashboard query builders (`metricsBuilder.ts`, `unifiedLeadsBuilder.ts`) now SELECT and prefer `attribution_method` when set to a canonical value (`google_call_view` or `direct_match`). Backward-compatible no-op until PR2 ships
- Reviews: Claude self-review + Gemini SHIP-WITH-CHANGES + Codex MERGE

**PR2 — NOT STARTED. Next session.** Resolver integration (extract Google call_view from `callAttributionSync.ts` into `callAttribution.ts` as Rule 1), shared `isQualifyingCall()` helper, density check on `matchDirectConversions`, stop writing `time_correlation` to canonical, overwrite-precedence guard in `saveAttributionResults`, method-allowlist guards on offline conversion uploads. See task file Section "PR2" for details.

**PR3 — NOT STARTED.** Schedule `/api/cron/run-attribution`, backfill via existing admin endpoint, drop zombie `leads.website_session_id`, update stale `CRON_SETUP.md`.

## Known Issues — Attribution

- **Stale `POSTGRES_URL` credential** (Codex flagged 2026-04-14). Points at deleted project ref `ihbhwusdqdcdpvgucvsr` instead of live `fypzafbsfrrlrrufzkol`. `scripts/run-migration.js` is broken because of this. Workaround in place via `scripts/run-migration-via-api.js`. Real fix: pull fresh transaction-pooler URL from Supabase dashboard, `printf 'value' | vercel env add POSTGRES_URL development` (per the `\n` rule, never `echo`), `npm run env:pull`. ~5 minutes. Filed as a separate followup, not blocking attribution work.

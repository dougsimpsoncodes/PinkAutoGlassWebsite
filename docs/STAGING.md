# Staging Environment

Pink Auto Glass uses two separate environments for safe shipping:

| Env | URL | Vercel project | Supabase project | Git branch |
| --- | --- | --- | --- | --- |
| **Production** | `https://pinkautoglass.com` | `pinkautoglasswebsite` | (existing) | `main` |
| **Staging** | `https://pinkautoglasswebsite-staging.vercel.app` (default) | `pinkautoglasswebsite-staging` | `pink-auto-glass-staging` | `staging` |

Staging exists so we can ship UI / content / schema changes against a real deploy URL + real database WITHOUT polluting prod analytics, the prod conversion stream, or prod data. **Do not point any ads at the staging URL.**

## What's already wired in this branch

This PR (`feat/staging-environment-setup`) adds the application-side hooks. After merge to `main`, the code is staging-aware: it just needs env vars to behave that way.

- `src/lib/env.ts` — `isStaging()` reads `NEXT_PUBLIC_APP_ENV`. Defaults to production-safe behavior when unset. Also exports `assertEnvCoherent()` (see below).
- `src/components/StagingBanner.tsx` — sticky amber bar at the top of every page when `NEXT_PUBLIC_APP_ENV=staging`. Invisible in prod.
- `src/app/layout.tsx` — adds `robots: { index: false, follow: false }` Next.js metadata on staging.
- `src/app/robots.ts` — returns a blanket `Disallow: /` rule on staging, so `/robots.txt` blocks all crawlers.
- `scripts/verify-env-coherence.ts` — 7-case test that the assertion catches drift.

Net effect: with `NEXT_PUBLIC_APP_ENV=staging` set, the staging deploy is non-indexable AND visibly labeled to humans. With `STAGING_SUPABASE_PROJECT_REFS` set (see §3), it ALSO refuses to write to the wrong database if the env label and the Supabase URL ever drift apart.

### Why two signals (not just one env var)

A council review (Codex + Gemini, 2026-05-28) flagged the same root risk from different angles: a single env-var toggle is brittle — one misconfig on a hotfix branch can pollute prod analytics or write test data to prod tables.

The fix is a belt-and-suspenders signal:

| Signal | What it represents | Failure mode |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | Human-readable label, drives banner/robots/UI | Easy to mistype or forget on a hotfix |
| Supabase project ref in `NEXT_PUBLIC_SUPABASE_URL` | The actual data destination | Cannot be forged — wrong ref = broken DB connection |

`assertEnvCoherent()` compares them. If `NEXT_PUBLIC_APP_ENV=staging` but the Supabase ref isn't in `STAGING_SUPABASE_PROJECT_REFS` (or vice versa), it throws BEFORE the write happens. Defense in depth — banner protects humans, robots protects search engines, this protects the database.

When `STAGING_SUPABASE_PROJECT_REFS` is unset, the assertion is a no-op (safe default — current prod behavior).

### How to use `assertEnvCoherent()`

Call it at the top of any API route that mutates production-relevant tables. The auto-quoter homepage migration PR will add the call in:

- `src/app/api/lead/route.ts` (lead capture)
- `src/app/api/quote/price/route.ts` (quote creation)
- `src/app/api/quote/book/route.ts` (booking)
- Any other write path that touches `leads`, `automated_quotes`, `automated_quote_bookings`

```typescript
import { assertEnvCoherent } from '@/lib/env';

export async function POST(req: Request) {
  assertEnvCoherent(); // throws on env drift, before any write
  // ... existing logic
}
```

## One-time external setup (Doug)

These steps create the actual external resources. Run once per environment.

### 1. Create the Supabase staging project

1. Go to https://supabase.com/dashboard → **New project**.
2. Name: `pink-auto-glass-staging`, region: `us-east-1` (or whatever matches prod).
3. Save the password somewhere safe (you'll need it for migrations).
4. Once provisioned, collect from **Settings → API**:
   - `Project URL` → will become `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → will become `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → will become `SUPABASE_SERVICE_ROLE_KEY`
5. Apply the same migrations the prod project has. Easiest path: in the new project's SQL editor, paste each file from `supabase/migrations/` in chronological order. Or run:
   ```bash
   STAGING_PROJECT_REF=<new-project-ref> \
     node scripts/run-migration.js supabase/migrations/<file>.sql
   ```
   (the run-migration helper currently targets prod — wire it to pick up a staging ref via env var before bulk-running).

### 2. Create the Vercel staging project

1. Go to https://vercel.com/dougsimpsoncodes-projects → **Add New… → Project**.
2. Import the same GitHub repo (`dougsimpsoncodes/PinkAutoGlassWebsite`).
3. Project name: `pinkautoglasswebsite-staging`.
4. **Production branch:** set to `staging` (NOT `main`). This is critical — Vercel calls every deploy from this project's production branch "production" internally, but in our world that's the staging environment.
5. Framework: Next.js (auto-detected). Node version: 22.x (matches prod).
6. Before the first deploy, set env vars (see §3).

### 3. Wire the staging env vars in Vercel

In the new `pinkautoglasswebsite-staging` project's **Settings → Environment Variables**, set the following for "Production" (Vercel's term — this maps to our staging environment):

| Variable | Value | Source |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `staging` | **required** — flips banner, noindex, robots |
| `NEXT_PUBLIC_SUPABASE_URL` | staging Supabase URL | from §1 step 4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | staging anon key | from §1 step 4 |
| `SUPABASE_SERVICE_ROLE_KEY` | staging service role key | from §1 step 4 |
| `STAGING_SUPABASE_PROJECT_REFS` | staging Supabase project ref (the `<ref>` in `https://<ref>.supabase.co`) | **also add to PROD env vars with the same value** — both projects need to know what counts as staging |
| `AUTOBOLT_API_KEY` | (use same key OR get a staging key from Nick) | prod env |
| `MYGRANT_*` | prod values OK for now | prod env |
| `RESEND_API_KEY` / `TWILIO_*` | **leave UNSET** initially | so staging cannot send real emails/SMS to real customers |
| `GOOGLE_ADS_*` | **leave UNSET** | staging must not write to prod ad accounts |
| `MICROSOFT_ADS_*` | **leave UNSET** | same reason |
| `NEXT_PUBLIC_GSC_VERIFICATION` | **leave UNSET** | staging must not be verified as a search property |

Use `printf` (NOT `echo`) when piping any value through `vercel env add` — see the project CLAUDE.md "NEVER ADD `\n` TO .env FILES" section.

### 4. Create the `staging` git branch

After this PR merges to `main`:

```bash
git fetch origin
git checkout main
git pull
git checkout -b staging
git push -u origin staging
```

Once the `staging` branch exists, Vercel's `pinkautoglasswebsite-staging` project auto-deploys from it.

## Day-to-day workflow

```
main           ←── prod, never commit directly
  ↑ (PR after staging soak)
staging        ←── auto-deploys to pinkautoglasswebsite-staging.vercel.app
  ↑ (PR for each change)
feat/<thing>   ←── do work here, PR into staging
```

For any user-facing change:

1. Branch off `staging`: `git checkout staging && git pull && git checkout -b feat/<thing>`.
2. Build, commit, push, open PR into `staging`.
3. Once merged, Vercel auto-deploys to staging URL.
4. Smoke-test on staging (real VINs, real plates, real bookings — they hit staging Supabase).
5. When ready, open a PR from `staging` → `main`. That promotes everything in staging to prod in one cut.
6. After merge, smoke prod with one real VIN.

## Verifying staging is "really" staging

After Doug completes §1–§4, hit the staging URL and confirm:

- [ ] Amber **STAGING — not the live site** banner is visible at top
- [ ] `view-source:` shows `<meta name="robots" content="noindex, nofollow, nocache">`
- [ ] `https://pinkautoglasswebsite-staging.vercel.app/robots.txt` returns `Disallow: /`
- [ ] Submitting a test quote writes to the staging Supabase project (NOT prod)
- [ ] No Google Ads / Microsoft Ads conversion fires from the staging URL (check Tag Assistant)
- [ ] No customer-facing email/SMS leaves the staging deploy (Resend/Twilio creds are unset)
- [ ] `npx tsx scripts/verify-env-coherence.ts` passes (assertion catches synthetic drift cases)
- [ ] Manual drift test: temporarily flip `NEXT_PUBLIC_APP_ENV` on staging Vercel to `production` and confirm the booking route throws "Env mismatch" before writing. Flip back.

## Open follow-ups (not in this PR)

- `scripts/run-migration.js` should accept a `--env=staging` flag so we can bulk-apply migrations to the staging Supabase without hand-editing.
- Promotion of `staging` → `main` should be a one-click PR convention so Dan can see what's about to go live without reading code.
- Optional: a `make staging-smoke` target that hits the staging URL and asserts the banner + robots + a sample VIN flow end-to-end.

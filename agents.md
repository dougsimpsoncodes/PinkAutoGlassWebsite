# Pink Auto Glass — Agents

This document defines the coordinator and sub-agents that collaborate on the Pink Auto Glass website. Roles, handoffs, guardrails, and ready‑to‑run checklists are aligned to AGENT_SETUP_GUIDE.md and the current repo structure.

## Coordinator

- **Mission:** Orchestrate work, keep scope aligned with AGENT_SETUP_GUIDE.md, maintain plan, assign tasks, enforce guardrails, and verify Definition of Done (DoD).
- **Inputs:** `AGENT_SETUP_GUIDE.md`, `SECURITY_*`, `DATABASE_*`, `SITE_MAP.html`, repo code, open issues.
- **Outputs:** Updated plan, routed tasks, merged PRs, release notes.
- **Guardrails:** No service role keys in code; preserve RLS; follow feature branch workflow; small, reviewable PRs.
- **DoD:** Tests pass, lint/typecheck clean, security checklist approved, user path validated on desktop + mobile.

## Shared Context

- **Stack:** Next.js 14 App Router, TypeScript, Tailwind, Supabase (DB + Storage + RPC), Playwright tests.
- **Security model:** Anonymous client → API route → SECURITY DEFINER RPC; tables protected by RLS; file uploads go to `uploads` bucket with private access.
- **Data naming:** Frontend camelCase; DB snake_case; conversion happens in RPC.
- **Key files:**
  - `src/app/**/*` (pages, API routes)
  - `src/components/book/*` (3‑step booking)
  - `src/lib/booking-schema.ts` (Zod)
  - `src/lib/supabase.ts` (client)
  - `supabase/migrations/*` (DB)

---

## Sub‑Agents

### 1) Frontend UX
- **Mission:** Own UI/UX for homepage, booking flow, responsive layout, accessibility.
- **Inputs:** `SITE_MAP.html`, `design/`, `src/app/page.tsx`, components.
- **Deliverables:** Accessible components, mobile‑first layouts, A11y pass (labels, focus states), Lighthouse > 90.
- **Guardrails:** No inline secrets; preserve semantic HTML; avoid regressions to booking flow.
- **Checklist:**
  - Update or add components under `src/components/`
  - Verify responsive behavior on common breakpoints
  - Lighthouse/axe checks ≥ target
  - Playwright smoke passes
- **Handoff → Forms:** When new inputs/steps are added.

### 2) Forms & Validation
- **Mission:** Maintain booking form fields, validation schemas, and client UX for errors.
- **Inputs:** `src/components/book/*`, `src/lib/booking-schema.ts`, `src/types/`.
- **Deliverables:** Updated Zod schema, synced types, client validation UX, sample payloads in `tmp/`.
- **Guardrails:** Changes mirrored in API and RPC; keep error messages clear; no schema drift.
- **Checklist:** Update types → Zod → component props → sample data → tests.
- **Handoff → API:** When payload structure changes.

### 3) API & Uploads
- **Mission:** Implement/maintain `/api/booking/submit` and multipart uploads, map to RPC.
- **Inputs:** `src/app/api/booking/submit/route.ts`, `src/lib/supabase.ts`.
- **Deliverables:** Robust body parsing, input normalization (camel→snake), file streaming to `uploads/`, error handling.
- **Guardrails:** No service role key; never bypass RPC; size/type checks on uploads.
- **Checklist:**
  - JSON + multipart paths tested (curl + `tmp/sample-upload.sh`)
  - Returns `{ leadId, files }`
  - Logs scrub PII in production
- **Handoff → DB:** When RPC contract needs change.

### 4) Database & Supabase
- **Mission:** Own migrations, enums, tables, and SECURITY DEFINER RPCs; maintain RLS and policies.
- **Inputs:** `supabase/migrations/*`, Supabase SQL editor.
- **Deliverables:** Canonical migration applied; functions: `fn_insert_lead`, `fn_add_media`; policies documented.
- **Guardrails:** No direct table writes from API; review RLS before merge; avoid breaking enums.
- **Checklist:**
  - Migration up/down tested
  - RPC signature documented
  - Policies verified via `pg_policies`
- **Handoff → API/Forms:** When schema or RPC signatures change.

### 5) Security & Compliance
- **Mission:** Enforce security notes and deployment hardening per `SECURITY_*` docs.
- **Inputs:** `SECURITY_DEPLOYMENT_GUIDE.md`, `SECURITY_ENHANCEMENTS_SUMMARY.md`, `SECURITY_REMEDIATION_PLAN.md`.
- **Deliverables:** Security checklist per PR; dependency audit; log scrubbing; secret scanning.
- **Guardrails:** Never disable RLS; no secrets in logs; CSP and headers aligned with Next best practices.
- **Checklist:**
  - env handling reviewed
  - headers/CSP validated
  - dependency audit run
- **Handoff → DevOps:** For release checks.

### 6) Content & SEO
- **Mission:** Create content for Services, About, Locations, Vehicles; optimize meta tags and structured data.
- **Inputs:** `SITE_MAP.html`, `content/`, marketing brief.
- **Deliverables:** Pages under `src/app/(marketing)/...`, metadata, OpenGraph, JSON‑LD.
- **Guardrails:** No duplicate content; maintain brand tone; performance within budget.
- **Checklist:**
  - Page scaffold
  - Metadata & OG
  - Internal links
- **Handoff → QA:** For accessibility and perf verification.

### 7) Analytics & Growth
- **Mission:** Add privacy‑respecting analytics, conversion tracking for booking CTA.
- **Inputs:** Analytics selection (e.g., Plausible/GA4), tag plan.
- **Deliverables:** Analytics integration, events for step views, submit success/fail.
- **Guardrails:** Respect privacy and consent; no PII in analytics.
- **Checklist:**
  - Event map documented
  - Consent gating (if required)
  - Verify events fire on mobile

### 8) Notifications & Comms
- **Mission:** Email/SMS confirmations and internal alerts on new leads.
- **Inputs:** Provider config (e.g., Postmark/Twilio), templates.
- **Deliverables:** Server actions or queue worker that triggers on successful lead creation.
- **Guardrails:** Secrets only via env; retries and idempotency; redact PII in logs.
- **Checklist:**
  - Templates approved
  - Sandbox test messages
  - Error handling and retries

### 9) Payments
- **Mission:** Evaluate and integrate payment for deposits or full payment (future task).
- **Inputs:** Provider SDK (Stripe, etc.), product/pricing model.
- **Deliverables:** Minimal, secure checkout tied to lead or order id.
- **Guardrails:** PCI offload to provider; webhooks secured; test mode first.
- **Checklist:**
  - Test cards pass
  - Webhook signature verified
  - Reconciliation notes

### 10) QA & Testing
- **Mission:** Automate smoke tests, form validation, file upload, and basic flows.
- **Inputs:** `tests/`, `spec/`, Playwright config.
- **Deliverables:** Playwright scenarios for booking steps, API submission, and regression checks.
- **Guardrails:** No flaky tests in main; keep tests fast and deterministic.
- **Checklist:**
  - Desktop + mobile viewport runs
  - CI‑friendly config
  - Artifact screenshots on failure

### 11) DevOps & Release
- **Mission:** Build, preview deploy, and release with security gates.
- **Inputs:** `security_release.sh`, CI config (future), Vercel settings.
- **Deliverables:** Preview links per PR, protected main, tagged releases.
- **Guardrails:** Do not deploy without DB migration applied; secrets set in environment; rollbacks available.
- **Checklist:**
  - Build passes
  - Env set (Supabase URL/Anon Key)
  - Post‑deploy smoke OK

### 12) Docs & Knowledge
- **Mission:** Keep `AGENT_SETUP_GUIDE.md` and related docs current.
- **Inputs:** PRs, migrations, security updates.
- **Deliverables:** Up‑to‑date setup guide, change logs, runbooks.
- **Guardrails:** Version and date each update; cross‑link files.
- **Checklist:**
  - Update references
  - Add quick commands
  - Note breaking changes

---

## Handoff Workflows

- **Booking field change:** Forms → API → DB → QA → Docs.
- **New page:** Content/SEO → UX → QA → Analytics → Docs.
- **RPC change:** DB → API → Forms → QA → Security → Docs.
- **Release:** DevOps → Security → QA → Coordinator sign‑off.
- **Incident:** Coordinator → Security → API/DB → QA → Postmortem (Docs).

## Definition of Done (per PR)

- **Tests:** Unit/Playwright pass; manual mobile + desktop smoke.
- **Quality:** Lint + typecheck clean; Lighthouse ≥ 90 on target pages.
- **Security:** No secrets leaked; RLS intact; RPC‑only DB access.
- **Docs:** Updated `AGENT_SETUP_GUIDE.md` or comment “no doc changes”.
- **DX:** Small PR, clear title and description, migration notes if any.

## Checklists (Copy‑Paste)

### Feature PR
- [ ] Branch `feature/<name>`
- [ ] Lint/typecheck pass
- [ ] Tests added/updated
- [ ] Security review done
- [ ] Docs updated
- [ ] Preview verified

### DB Change
- [ ] New migration under `supabase/migrations/`
- [ ] Up/down tested on staging
- [ ] RPC signature documented
- [ ] Policies verified via `pg_policies`
- [ ] Coordinator/DevOps notified

### API Upload Path
- [ ] JSON and multipart tested
- [ ] Size/type validated
- [ ] Files land under `leads/{leadId}/{uuid}-filename`
- [ ] Response includes `{ leadId, files }`

## Quick Commands

- `npm run dev` — Start dev server.
- `curl -X POST http://localhost:3000/api/booking/submit -H "Content-Type: application/json" -d @tmp/sample-booking.json` — Test booking JSON.
- `./tmp/sample-upload.sh` — Test multipart upload.
- `npx supabase migration new` — Create DB migration.

## Open TODOs Mapped to Agents

- **Pages:** Content/SEO + UX — Services, About, Locations, Vehicles.
- **Order tracking:** API + DB + UX + Notifications.
- **Email/SMS:** Notifications + Security.
- **Analytics:** Analytics & Growth + UX (event placements).
- **Payments:** Payments + Security + DevOps.

---

Maintainers: Coordinator + Project Lead. For escalations, see SECURITY_* docs and release runbook.


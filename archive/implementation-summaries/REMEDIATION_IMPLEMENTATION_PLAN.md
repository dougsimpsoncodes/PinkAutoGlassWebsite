# Pink Auto Glass — Remediation Implementation Plan

Prepared for Claude Code. This plan breaks work into small, reviewable PRs aligned with the Agents doc and guardrails. Each section includes objectives, concrete tasks with precise file paths, acceptance criteria, and verification steps.

---

## Scope & Goals

- Fix security and data path guardrails (RPC-only, no service role in code).
- Align frontend types/schema with API/RPC payloads to remove drift.
- Correct minor UX/SEO issues and broken links.
- Re-enable defensive controls (rate limiting, upload checks).
- Keep changes incremental, focused, and testable.

---

## Repo Baseline Assumptions

- Stack: Next.js 14 App Router, TS, Tailwind, Supabase (DB + Storage + RPC), Playwright.
- Primary flows:
  - Homepage quote form → `/api/lead`
  - Full booking (3-step) → `/api/booking/submit` with JSON/multipart
- Storage bucket (canonical): `uploads` (private)
- RPCs: `fn_insert_lead`, `fn_add_media`, `fn_get_reference_number`
- Tests: `npm run dev` + `npm run test`

---

## Phase 1 — API & Uploads

### Objectives
- Enforce RPC-only DB writes.
- Remove service role usage in app code.
- Standardize uploads to `uploads` bucket.
- Re-enable rate limiting and fix Node-safe base64 decoding.

### Tasks
1) Replace direct table write in `/api/lead` with RPC-based insert
- Files:
  - `src/app/api/lead/route.ts`
- Changes:
  - Remove usage of `SUPABASE_SERVICE_ROLE_KEY` and `.from('leads').insert`.
  - Build camelCase payload from QuoteForm submission:
    - Split `name` → `firstName`, `lastName`.
    - Normalize `phone` to E.164 → `phoneE164`.
    - Parse `vehicle` string into `vehicleYear`, `vehicleMake`, `vehicleModel`.
    - Pass all fields as `p_payload` to `fn_insert_lead` (camelCase, matching the PL/pgSQL parser).
  - Keep response shape backward compatible: `{ success: true, message, leadId }`.
  - Add basic validation and error messages with 4xx for client input errors; 5xx for server errors.
  - Add lightweight rate limiting (memory Map) analogous to `/api/booking/submit`.

2) Re-enable rate limiting in `/api/booking/submit`
- Files:
  - `src/app/api/booking/submit/route.ts`
- Changes:
  - Restore the `checkRateLimit` implementation (Map + window).
  - On 429, include `Retry-After` header.
  - Keep disabled only in `NODE_ENV=development` if you must, via guard.

3) Fix Node-safe base64 handling on JSON uploads
- Files:
  - `src/app/api/booking/submit/route.ts`
- Changes:
  - Replace `atob(file.data)` with `Buffer.from(file.data, 'base64')`.
  - Ensure `ArrayBuffer` is created via `Buffer` → `Uint8Array`.

4) Standardize Storage bucket usage
- Files:
  - `src/lib/supabase.ts`
  - `src/app/api/booking/submit/route.ts`
- Changes:
  - Set canonical bucket in lib to `uploads`.
  - Ensure API route also uses `uploads` consistently.
  - Validate MIME/type/size already done; keep it.

5) Logging hygiene
- Files:
  - `src/app/api/booking/submit/route.ts`
  - `src/app/api/lead/route.ts`
- Changes:
  - No PII in logs (strip phone, email).

### Acceptance Criteria
- `/api/lead`: No service role key usage. Insert occurs via `fn_insert_lead`. Response unchanged.
- `/api/booking/submit`: Rate limit active in non-dev; JSON base64 uploads work.
- Storage paths: `uploads/leads/{leadId}/{uuid-or-sanitized-name}`.
- Response includes `{ ok, id, referenceNumber, files }` for booking; `{ success, leadId }` for lead.

### Verify
- `curl -X POST http://localhost:3000/api/lead -H "Content-Type: application/json" -d '{"name":"Jane Doe","phone":"(303)555-1234","vehicle":"2020 Toyota Camry","zip":"80202","hasInsurance":"yes","source":"homepage_quote_form","clientId":"abc","sessionId":"def"}'`
  - Expect 200 with `{ success: true, leadId }`.
- `./tmp/sample-booking-json.sh` and `./tmp/sample-upload.sh`
  - Expect 200 with `{ ok: true, id, referenceNumber, files:[...] }`.
- `npm run test`
  - Smoke tests for both endpoints pass.

---

## Phase 2 — Forms & Validation

### Objectives
- Remove schema/type drift across Zod, TS types, and RPC parsing.
- Fix service prefill mapping to match DB enum.

### Tasks
1) Normalize booking types and field names
- Files:
  - `src/types/booking.ts`
  - `src/lib/booking-schema.ts`
  - `src/app/book/page.tsx`
- Changes:
  - Frontend form stays camelCase (UX).
  - Ensure payload sent to API uses camelCase fields expected by `fn_insert_lead`:
    - `serviceType`: `'repair' | 'replacement'`
    - `phoneE164` (from `phone`)
    - `address` (from `streetAddress`)
    - `zip` (from `zipCode`)
    - `timePreference` (from `timeWindow`; allowed: `morning|afternoon|flexible`) if used server-side.
  - Align `BookingSchema` (Zod) with the same keys used in submission.
  - Remove unused or orphan fields in Zod or TS that aren’t submitted.

2) Fix prefill service mapping
- Files:
  - `src/app/book/page.tsx`
- Changes:
  - Map:
    - `windshield-replacement` → `replacement`
    - `windshield-repair` → `repair`
    - `mobile-service` should toggle `mobileService` but not change `serviceType` enum.
    - `adas-calibration` should map to `replacement` if required by business rule; document this.

### Acceptance Criteria
- Zod, TS, and submit payload align (no mismatches).
- URL prefill values never cause enum errors.

### Verify
- Manual: Visit `/book?service=windshield-replacement`, complete flow, submit.
- Check browser console – no validation drift errors.
- `npm run test` passes.

---

## Phase 3 — Frontend UX Fixes

### Objectives
- Correct broken links and minor UX issues.

### Tasks
1) Fix privacy policy links
- Files:
  - `src/app/book/page.tsx`
  - `src/components/book/success-confirmation.tsx`
- Changes:
  - Replace `/privacy-policy` with `/privacy`.

2) Minor: Remove unused imports or extraneous components if identified during review (e.g., unused `Head` in client components).

### Acceptance Criteria
- All links resolve to valid routes.
- No unused imports flagged by lint.

### Verify
- Click-through audit on booking flow and success page.
- `npm run lint` clean.

---

## Phase 4 — Security & Compliance

### Objectives
- Adhere to SECURITY_* guardrails, ensure no secrets in code/logs, and align CSP.

### Tasks
1) Ensure no service role usage in app code
- Confirm only server-side admin client exists in `src/lib/supabase.ts` and is unused in request handlers that accept anon traffic. For public endpoints, always use anon client + RPC.

2) CSP review (optional hardening)
- Files:
  - `src/middleware.ts`
- Changes:
  - Keep GA allowances; consider moving from `'unsafe-inline'` to nonce if time allows (optional).

3) Env hygiene
- Ensure `.env.production` contains no real secrets committed. If any secrets were exposed, rotate them and document.

### Acceptance Criteria
- No service role usage in endpoints receiving public traffic (`/api/lead`, `/api/booking/submit`).
- Logs contain no PII.
- Security review notes included in PR description.

### Verify
- Search code for `SUPABASE_SERVICE_ROLE_KEY` usage in API routes (should be 0).
- `rg -n "console.*(email|phone|phoneE164)"` returns none in API code.

---

## Phase 5 — Database & Supabase

### Objectives
- Keep canonical RPCs stable and documented; prevent enum drift.

### Tasks
1) Confirm canonical enums and RPC contracts
- Files:
  - `supabase/migrations/*`
  - `src/types/supabase.ts`
- Changes:
  - Ensure client uses enum values: `service_type: 'repair'|'replacement'`.
  - Document RPC payload shape (camelCase input parsed in PL/pgSQL) in `AGENT_SETUP_GUIDE.md` or Comments.

2) No direct table writes from API
- Enforce at code review and PR templates.

### Acceptance Criteria
- RPCs: `fn_insert_lead`, `fn_add_media`, `fn_get_reference_number` remain unchanged and functional.
- No schema drift introduced.

### Verify
- Submit JSON + multipart flows; inspect DB for inserted rows (manual or via Supabase SQL console).

---

## Phase 6 — Analytics & Growth (Optional)

### Objectives
- Keep analytics privacy-respecting and accurate.

### Tasks
1) Consent gating (if required by deployment region)
- Files:
  - `src/app/layout.tsx`
  - A small `ConsentBanner` component (if adding)
- Changes:
  - Gate GA load behind consent (optional based on policy).

2) Ensure no PII in analytics events
- Files:
  - `src/lib/analytics.ts`
  - `src/components/AnalyticsTracker.tsx`
- Review event labels/values for PII risk (looks clean now).

### Acceptance Criteria
- GA loads conditionally if gating enabled.
- No PII sent.

### Verify
- Manually test event firing with devtools.
- Confirm no PII fields in payloads.

---

## Phase 7 — QA & Testing

### Objectives
- Keep Playwright smoke passing; add tests only where adjacent patterns exist.

### Tasks
1) Validate existing Playwright tests
- Commands: `npm run dev` then `npm run test`
- Ensure smoke tests for `/api/lead` and `/api/booking/submit` still succeed.

2) If needed, add a minimal test for rate limit behavior (skipped in CI to avoid flakiness) – optional.

### Acceptance Criteria
- All current tests pass locally and in CI (when added).

### Verify
- `npm run test` green.

---

## Phase 8 — DevOps & Release

### Objectives
- Ensure safe release with environment readiness.

### Tasks
1) Add CI stub (optional)
- GitHub Actions or equivalent to run `npm ci`, `npm run build`, `npm run test`, `npm run lint`.

2) Release notes and security checklist
- Include checkboxes from SECURITY_* docs in PR descriptions.

### Acceptance Criteria
- Preview deploy build passes (Vercel).
- Security checklist acknowledged.

### Verify
- Open a preview; run `tests/smoke.spec.js` against the preview if feasible.

---

## Phase 9 — Docs & Knowledge

### Objectives
- Keep `AGENT_SETUP_GUIDE.md` and docs aligned with reality.

### Tasks
1) Update docs
- Files:
  - `AGENT_SETUP_GUIDE.md`
  - `NAVIGATION_IMPLEMENTATION.md` (if link changes require)
  - `SECURITY_DEPLOYMENT_GUIDE.md` (note removal of service role usage in public APIs)
- Changes:
  - Document RPC-only pattern, payload keys, storage bucket name, and test commands.

### Acceptance Criteria
- Docs current with new endpoints behavior and payload shapes.
- Change log appended with date and version.

### Verify
- Reviewer can run commands from docs and succeed.

---

## PR Breakdown (Small, Reviewable)

1) PR: API Guardrails
- `/api/lead` → RPC-only, remove service role, normalize payload.
- Re-enable rate limiting in `/api/booking/submit`, Buffer base64 fix.
- No PII logging.

2) PR: Bucket Consistency
- Standardize to `uploads` in `src/lib/supabase.ts` and API route.

3) PR: Forms & Prefill
- Align `BookingSchema`, `types/booking.ts`, and booking `page.tsx` submit payload.
- Fix prefill mapping for `service`.

4) PR: UX Links
- Fix `/privacy-policy` → `/privacy` in booking & success pages.
- Dead import cleanup.

5) PR: Docs Update
- `AGENT_SETUP_GUIDE.md` payload maps, bucket names, RPC-only policy.
- Note security checklist confirmations.

(Optional separate PRs: Analytics consent gating, CI pipeline)

---

## Definition of Done (Per PR)

- Tests: Playwright smoke passes; manual submit tests for JSON and multipart OK.
- Quality: Lint and typecheck clean; no unused imports.
- Security: RPC-only, no service role in public APIs, no PII in logs.
- Docs: Updated or “no doc changes” comment.
- DX: Clear title/description; minimal surface area changes.

---

## Quick Verification Commands

- Dev server: `npm run dev`
- JSON booking test: `curl -X POST http://localhost:3000/api/booking/submit -H "Content-Type: application/json" -d @tmp/sample-booking.json`
- Multipart upload test: `./tmp/sample-upload.sh`
- Homepage lead form API: `curl -X POST http://localhost:3000/api/lead -H "Content-Type: application/json" -d '{"name":"Jane Doe","phone":"(303)555-1234","vehicle":"2020 Toyota Camry","zip":"80202","hasInsurance":"yes","source":"homepage_quote_form"}'`
- Tests: `npm run test`
- Lint: `npm run lint`

---

## Risks & Mitigations

- Enum mismatches causing 400/500: Mitigated by prefill mapping + unified schema/types.
- Rate limiting false positives: Allow relaxed thresholds in dev; test Map-based limiter.
- Storage bucket drift: One-time standardization to `uploads`.
- Secret handling: Verify no secrets in `.env.*`; rotate if needed.

---

## Handoffs (Agents)

- Forms → API → DB → QA → Docs for schema alignment.
- Coordinator to ensure guardrails (RPC-only, RLS preserved) and Definition of Done are enforced per PR.


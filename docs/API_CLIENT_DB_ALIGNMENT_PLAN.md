# Pink Auto Glass — Client/API/DB Alignment & Hardening Plan

Version: 2025-09-26

## Overview

This plan aligns the frontend booking flow, API handler, and database RPCs; hardens security headers; fixes Playwright configuration; and removes drift. It preserves the existing security model (anonymous client → API route → SECURITY DEFINER RPC; RLS enabled; private storage).

## Goals

- Make booking submission work end-to-end with both JSON and multipart uploads.
- Keep RPC-only database writes and RLS intact (no service role usage).
- Validate files (size/type/count) and return consistent response data including `referenceNumber`.
- Fix Playwright config and brittle assertions to reflect current UI.
- Harden CSP for production; keep development relaxed.
- Update docs and sample scripts; reduce code drift.

## Non‑Goals

- Implementing a full order-tracking UI backed by DB (recommended as a follow-up).
- Rewriting the validation system across the stack (Zod remains the source of truth for API input).

## Current Gaps (Summary)

- Client posts JSON with snake_case; API expects multipart; RPC expects camelCase → submission fails.
- API returns `{ leadId }`; client derives a fake reference instead of using DB `reference_number`.
- No size/type checks on uploads; only single file supported.
- Playwright expects server on port 3001 and asserts old content.
- CSP allows `'unsafe-eval'` and inline scripts/styles in production.
- `supabaseAdmin` pattern exists in code (should remain unused in app repo).

## Target Architecture (Data Flow)

Frontend (camelCase JSON) → API (`/api/booking/submit`) → RPC `fn_insert_lead(p_id, p_payload jsonb)` → DB (snake_case)

Uploads: API streams to Supabase Storage private bucket `uploads/` under `uploads/leads/{leadId}/{uuid}-filename` and registers media via RPC.

## Changes by Area

### API: `src/app/api/booking/submit/route.ts`

- Accept both request types:
  - JSON: `Content-Type: application/json` with camelCase body and optional `files` array of base64 items `{ data, name, type, size }`.
  - Multipart: `payload` (JSON string/file) plus `file` or `file[]` parts.
- Normalize to camelCase payload compatible with `fn_insert_lead` (camelCase → RPC maps to snake_case).
- Rate limit: 5 req/min/IP; include `Retry-After`.
- Validate uploads: allowed types `image/jpeg,jpg,png,webp,heic,heif`; max 10MB each; max 5 files.
- Upload to private `uploads` bucket: `uploads/leads/{leadId}/{uuid}-{safeName}`.
- Response: `{ ok: true, id: "<uuid>", referenceNumber: "PAG-...", files: [{ path, mimeType, size }] }`.
- Error JSON: `{ ok: false, error, code?, validationErrors? }` with appropriate status (400/429/500).

### DB: Migration for `fn_get_reference_number`

- Add migration `YYYY-MM-DD_add_fn_get_reference_number.sql`:
  - `create or replace function public.fn_get_reference_number(p_id uuid) returns text language sql security definer stable as $$ select reference_number from public.leads where id = p_id $$;`
  - Revoke all from public; grant execute to `anon`.
- This avoids direct selects from API while retrieving the generated reference number.

### Frontend: `src/app/book/page.tsx`

- Build camelCase submission object per `BookingSchema` and POST JSON to `/api/booking/submit`.
- Normalize phone to `phoneE164` client-side (or on API) before send.
- Use `{ id, referenceNumber }` from response; stop fabricating references.
- Option: keep photo UI deferred; retain state but do not send files from UI for now (API still supports uploads for curl tests).

### Middleware CSP: `src/middleware.ts`

- Production CSP changes:
  - Remove `'unsafe-eval'` from `script-src`.
  - Avoid inline scripts; keep inline styles only if needed: `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com`.
  - Keep `connect-src` for Supabase endpoints; keep `frame-ancestors 'none'`, `object-src 'none'`.
- Development path remains relaxed (early return).

### Playwright Tests

- Config: set `webServer.port` to `3000` and `use.baseURL` to `http://localhost:3000`.
- Update assertions to current headings and labels (avoid brittle copy checks; prefer roles/labels/selectors).
- Add API test:
  - POST minimal valid JSON payload to `/api/booking/submit`; expect `200` and `{ ok: true, id, referenceNumber }`.
- Optional: multipart upload test via `formData` to verify path pattern and type/size enforcement.

### Docs & Sample Scripts

- AGENT_SETUP_GUIDE.md: update quick commands to JSON submit with new response.
- `tmp/sample-booking.json`: use direct camelCase payload (no `{ data: ... }` wrapper).
- Add `tmp/sample-booking-json.sh`: curl JSON to local API.
- Update `tmp/sample-upload.sh`: multipart using `payload` and repeated `file` fields.

### Cleanup & Drift

- Ensure no service-role usage in web app; keep `supabaseAdmin` unused or remove in a later PR.
- Either integrate `src/lib/validation.ts` into API or remove to prevent drift (Zod is the source of truth).
- Remove `.bak` files in a follow-up cleanup PR.

## API Contract (After Changes)

Endpoint: `POST /api/booking/submit`

Request (JSON):

```
Content-Type: application/json
{
  "serviceType": "repair" | "replacement",
  "mobileService": boolean,
  "firstName": string,
  "lastName": string,
  "email": string,
  "phoneE164": "+15555550123",
  "address": string,
  "city": string,
  "state": "CO",
  "zip": "80202",
  "vehicleYear": 2020,
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "preferredDate": "2025-09-29",
  "timePreference": "morning" | "afternoon" | "flexible",
  "notes": string?,
  "smsConsent": boolean,
  "privacyAcknowledgment": boolean,
  "termsAccepted": boolean,
  "clientId": string?,
  "sessionId": string?,
  "firstTouch": object?,
  "lastTouch": object?,
  "files": [{ "data": "base64...", "name": "photo.jpg", "type": "image/jpeg", "size": 12345 }]?
}
```

Request (multipart):

- `payload`: JSON string with the same shape as above (without `files`).
- `file`: one or more file parts (repeatable), each with correct `Content-Type`.

Response (200):

```
{
  "ok": true,
  "id": "<lead-uuid>",
  "referenceNumber": "PAG-YYMMDD-####",
  "files": [
    { "path": "uploads/leads/<id>/<uuid>-name.jpg", "mimeType": "image/jpeg", "size": 12345 }
  ]
}
```

Errors:

- 400: `{ ok: false, error: "Validation failed", validationErrors: { field: msg } }`
- 429: `{ ok: false, error: "Too many requests", retryAfter: seconds }` (sets `Retry-After`)
- 500: `{ ok: false, error: "Server error", code?: string }`

Validation (uploads):

- Allowed types: `image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif`
- Max size per file: 10MB
- Max files: 5

Storage:

- Bucket: `uploads` (private)
- Path: `uploads/leads/{leadId}/{uuid}-{safe-filename}`

## Security Posture

- DB: RLS enabled; anonymous can only execute whitelisted SECURITY DEFINER RPCs.
- API: No service role; all writes via RPC.
- CSP: production removes `'unsafe-eval'`; minimizes inline allowances.
- PII: Avoid logging full payloads; log high-level errors only.
- API keys: `api-auth.ts` remains unused for public routes; do not rely on hardcoded dev keys in production.

## Test & Verification

1) Local run: `npm run dev` (server on 3000).
2) JSON submission:

```
curl -X POST http://localhost:3000/api/booking/submit \
  -H "Content-Type: application/json" \
  -d @tmp/sample-booking.json
```

3) Multipart submission (example in `tmp/sample-upload.sh`).
4) Playwright: `npm run test` (ensures updated config and assertions pass).

## PR Strategy

- Branch: `feature/api-alignment`.
- Small, reviewable commits grouped by area (API, tests, CSP, docs).
- Include security checklist in PR notes (RLS unchanged, no service role, CSP tightened).

## Acceptance Criteria

- `/api/booking/submit` accepts JSON and multipart, validates inputs, and returns `{ ok, id, referenceNumber, files }`.
- Booking UI submits camelCase JSON and shows the actual `referenceNumber`.
- Files land under `uploads/leads/{leadId}/{uuid}-filename`.
- Playwright runs against port 3000 and passes updated specs.
- CSP no longer includes `'unsafe-eval'` in production.
- Docs and sample scripts reflect implemented behavior.

## Enhancements (Suggested Next)

- Tracking: Add RPC `fn_get_lead_status_by_reference(reference text)` and update `/track` to show live status.
- Photos UI: Add multi-photo upload with client-side compression (use `src/lib/image-compression.ts`) and progress UI.
- Analytics: Add privacy-respecting analytics with consent gating; track booking steps and success/failure (no PII).
- Structured logging: Add server-side logging with redaction; consider Sentry without PII.
- Tests: Add API schema tests, upload edge cases, and Lighthouse run in CI.

## Follow‑Up Tickets (Small, Focused PRs)

1) Photos UI + Client Compression
- Scope: Add a multi-photo uploader to Step 1 or Step 3 with previews, limits, and progress; compress large images client-side.
- Files: `src/components/book/*` (new `photo-uploader.tsx`), `src/lib/image-compression.ts`, `src/app/book/page.tsx`.
- Requirements:
  - Max 5 images, enforce allowed MIME types, show preview thumbnails and remove control.
  - Compress images > 2MB using `compressImages` and surface savings.
  - Persist in sessionStorage with existing form state.
- Acceptance:
  - Upload UI present and accessible; compression occurs for 2MB+; cannot exceed 5 images; all controls keyboard-friendly.

2) Track Page: Live Status by Reference
- Scope: Add RPC `fn_get_lead_status_by_reference(reference text)` (SECURITY DEFINER, anon execute), API passthrough, and fetch on `/track`.
- Files: new migration, `src/app/api/lead/status/route.ts`, `src/app/track/page.tsx`.
- Requirements:
  - API `GET /api/lead/status?ref=...` returns `{ ok, status, submittedAt }` via RPC.
  - Track page shows live status or “not found”.
- Acceptance:
  - Valid reference shows status; invalid returns helpful message without leaking PII.

3) Analytics (Privacy‑Respecting)
- Scope: Integrate Plausible (preferred) or GA4 behind consent gating; add events for `booking_start`, `booking_step`, `booking_complete`, `booking_error`.
- Files: `src/app/layout.tsx` (loader), small util `src/lib/analytics.ts`.
- Requirements:
  - No PII in events; respect Do Not Track/consent; events on mobile.
- Acceptance:
  - Events fire across devices when consented; none fire without consent.

4) Structured/Redacted Server Logging
- Scope: Add minimal logger for API routes to log errors with PII redaction and request correlation id.
- Files: `src/lib/log.ts`, wrap API handlers.
- Acceptance:
  - Error logs exclude email/phone/address; include request id and error codes.

5) Lighthouse/Perf Budget in CI
- Scope: Add a script to run Lighthouse (or Playwright’s trace + assertions) with budgets and fail on regressions.
- Files: `package.json` scripts, `scripts/lighthouse.mjs`, optional GitHub Action (future).
- Acceptance:
  - Local command outputs scores; budget thresholds documented (target ≥ 90 for key pages).

6) CSP Nonce/Hashes (Remove Inline Allowances)
- Scope: Introduce nonce or hash strategy to eliminate `'unsafe-inline'` for scripts and (ideally) styles in production.
- Files: `src/middleware.ts`, `_document`-equivalent patterns or Next headers API.
- Acceptance:
  - Production CSP without `'unsafe-inline'`/`'unsafe-eval'`; app renders and hydrates normally.

7) Cleanup Drift & Dead Code
- Scope: Remove unused `.bak` files; remove or integrate `src/lib/validation.ts`; ensure `supabaseAdmin` is unused.
- Files: repo-wide.
- Acceptance:
  - No `.bak` files; one validation path (Zod at API); no service role key paths in use.

8) Upload Edge‑Case Tests
- Scope: Add Playwright/API tests for invalid MIME, >10MB file, and >5 files; ensure proper 400 messages.
- Files: `tests/` new specs.
- Acceptance:
  - Tests pass and prevent regressions in upload validation.

9) Supabase Storage Policies (Docs + Checks)
- Scope: Document and verify storage policies for `uploads` bucket remain private; signed URL usage if ever needed.
- Files: docs; manual Supabase checks.
- Acceptance:
  - Bucket is private; only RPC/API can interact; no public read access.

10) Admin/Internal API Auth Application (Future)
- Scope: Apply `src/lib/api-auth.ts` to any future admin/internal endpoints; rotate dev keys.
- Acceptance:
  - Admin routes require admin keys; internal routes require internal keys; no PII leakage.

## Quick Commands

- Dev: `npm run dev`
- JSON booking: `curl -X POST http://localhost:3000/api/booking/submit -H "Content-Type: application/json" -d @tmp/sample-booking.json`
- Multipart booking: `./tmp/sample-upload.sh`
- Tests: `npm run test`
- New migration: `npx supabase migration new`

## Estimated Effort

- API + RPC: 0.5–1 day
- Frontend submit + success handling: 0.5 day
- Playwright config + spec updates: 0.5 day
- CSP hardening + verification: 0.25 day
- Docs + samples + cleanup: 0.25 day

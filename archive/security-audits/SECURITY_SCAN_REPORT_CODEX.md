# Security Scan Report — Codex

Date: 2025-08-22
Scope: Repository-wide static review (no changes made)

## Summary
- Strong baseline: Supabase with RPC + RLS, anon key on client, env files gitignored.
- Notable risks: public debug endpoints, permissive signed URL minting, CSP allows inline/eval, limited server-side validation/rate limiting on live booking route, un-sanitized upload filenames, storage bucket inconsistencies.

## Findings

### Critical
- Public debug data exposure
  - File: `src/app/api/debug/list-media/route.ts`
  - Issue: Returns `media` rows using anon key, no auth. Even if blocked by RLS in prod, a public debug endpoint is unsafe by default.
- Open signed URL minting
  - File: `src/app/api/media/signed-url/route.ts`
  - Issue: Generates signed URLs for arbitrary `path` with no auth/validation. Anyone who guesses/knows a path can get temporary access.
- Un-sanitized upload filenames
  - File: `src/app/api/booking/submit/route.ts`
  - Issue: Builds storage path using `uploadFile.name` directly. No allowlist/sanitization; risks traversal-like object keys and abuse.

### High
- CSP allows inline/eval in production
  - File: `src/middleware.ts`
  - Issue: `script-src` includes `'unsafe-inline'` and `'unsafe-eval'`, materially weakening XSS protections.
- Live booking route lacks server-side rate limiting and deep validation
  - File: `src/app/api/booking/submit/route.ts`
  - Issue: Minimal checks on multipart path; no size/type limits; no abuse throttling.
- Storage bucket inconsistency
  - Files: `src/lib/supabase.ts`, `db/schema.sql`, API routes
  - Issue: Mixed usage of `uploads` vs `lead-media` leads to policy drift and misconfigurations. Canonical path appears to be `uploads`.

### Medium
- Information leakage in API errors
  - File: `src/app/api/booking/submit/route.ts`
  - Issue: Returns DB/storage error messages to client (`details: ...`). Prefer generic client messages; log full details server-side.
- Client-side admin/debug listing
  - File: `src/app/admin/debug-media/page.tsx`
  - Issue: Client component fetches from public debug API. Admin views should be server-only and access-gated.
- Service role export present
  - File: `src/lib/supabase.ts`
  - Issue: `supabaseAdmin` exported. Not used in client code now, but keep server-only to avoid accidental bundling.

### Low / Hardening
- Legacy divergence and `.bak` routes
  - Files: `src/app/api/booking/submit/route.ts.bak*`, `src/lib/* .bak`
  - Issue: Two implementations (JSON vs multipart) create drift and confusion; larger surface area.
- PII in logs (legacy)
  - File: `src/app/api/booking/submit/route.ts.bak`
  - Issue: Logs customer-identifying info. Avoid logging PII.
- Dev/test pages
  - File: `src/app/tailwind-test/page.tsx`
  - Issue: Non-sensitive, but keep out of prod routes.

### Secrets Review
- `.env*` is gitignored; `.env.local` exists locally and is not tracked (good).
- Anon key in `.env.local` is acceptable (public by design). No service role key found in repo.
- Recommendation: Enable PR-time secret scanning (JWT-like strings, `SUPABASE_SERVICE_ROLE_KEY`, private keys, etc.).

## Evidence (selected)
- Public debug API: `src/app/api/debug/list-media/route.ts` — anon `select` from `media` without auth.
- Signed URL endpoint: `src/app/api/media/signed-url/route.ts` — `createSignedUrl(path, 60)` without auth or path validation.
- Raw filename in path: `src/app/api/booking/submit/route.ts` — `const filePath = \`leads/${leadId}/${uuidv4()}-${uploadFile.name}\``.
- CSP: `src/middleware.ts` — `script-src 'self' 'unsafe-eval' 'unsafe-inline' ...`.
- No rate limit on live route vs robust logic in `.bak` handler.

## Forced-Ranked Remediations
1) Lock down signed URL endpoint
   - Require auth or server-only; validate `path` prefix (e.g., `leads/{leadId}/...`) and caller authorization.
   - Consider removing until admin v1 is implemented.
2) Remove or gate public debug endpoints/pages
   - Disable `api/debug/list-media` and gate admin view as server-only with access control.
3) Sanitize and validate uploads (server-side)
   - Enforce MIME/type allowlist and size caps; sanitize filenames to `[A-Za-z0-9._-]`; generate server-side names.
4) Tighten CSP in production
   - Remove `'unsafe-inline'` and `'unsafe-eval'`; if needed, use nonces/hashes or refactor.
5) Add server-side validation + rate limiting to booking submit
   - Mirror client rules; add IP-based throttling; return generic errors to clients.
6) Standardize on `uploads` bucket (private)
   - Align all helpers and routes; remove references to `lead-media` unless intentionally used and configured.
7) Generic error responses
   - Hide internal error details from clients; keep rich logs server-side.
8) Keep service role server-only
   - Prevent client imports; optionally move admin client to a `lib/server/` module.
9) Remove legacy `.bak` routes after consolidation
   - Reduce attack surface and cognitive load.
10) Add security checks in CI
   - Secret scanning; basic endpoint abuse tests; signed URL misuse tests.

## Quick Remediation Map
- Endpoints: `src/app/api/media/signed-url/route.ts`, `src/app/api/debug/list-media/route.ts`, `src/app/api/booking/submit/route.ts`
- Headers: `src/middleware.ts`
- Storage/filenames: `src/app/api/booking/submit/route.ts`
- Admin: `src/app/admin/*` (convert to server-only, gated)
- Hygiene: Remove `.bak` routes post-consolidation; enable CI secret scan

## Acceptance Criteria (Phase 1 Security)
- No public debug APIs in production; admin read-only views are server-rendered and access-gated.
- Signed URL endpoint requires auth and validates paths against authorized lead scopes.
- Booking submit enforces server-side validation + rate limiting and returns generic client errors.
- All storage paths sanitized; files stored under `uploads/leads/{leadId}/{uuid-filename}`; bucket is private.
- CSP does not include `'unsafe-inline'`/`'unsafe-eval'` in production.
- Secret scanning active; no secrets in code or logs.

## Notes
- This is a static review; no code was altered.
- The repo shows no committed secrets; `.env.local` remains untracked.


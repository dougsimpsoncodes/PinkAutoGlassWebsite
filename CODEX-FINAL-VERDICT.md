APPROVED

Reviewed on March 20, 2026.

Gate 2 retry is approved. The four original blockers are addressed in the current implementation:

1. Service-role admin reads: confirmed as the existing project-wide admin pattern, not a new exception. There are 42 existing `src/app/api/admin/*` routes using `SUPABASE_SERVICE_ROLE_KEY`, and [src/middleware.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/middleware.ts) protects both `/admin/*` and `/api/admin/*` with HTTP Basic Auth. The new invoice and roster-audit routes follow that established admin-only convention.
2. Pagination/performance: the invoice list now uses server-side pagination, sort, and search in [src/app/api/admin/invoices/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/admin/invoices/route.ts), with row detail loaded on demand from [src/app/api/admin/invoices/[id]/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/admin/invoices/[id]/route.ts). `raw_data` is no longer shipped in the base list payload.
3. XLSX parser hardening: [src/app/api/admin/roster-audit/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/admin/roster-audit/route.ts) now validates required columns, rejects mixed spreadsheet/image uploads, limits spreadsheets to a single file, and deduplicates repeated job numbers. Fixture verification exists in [test/roster-parse-verify.js](/Users/dougsimpson/clients/pink-auto-glass/website/test/roster-parse-verify.js) with [test/fixtures/omega-roster-sample.xlsx](/Users/dougsimpson/clients/pink-auto-glass/website/test/fixtures/omega-roster-sample.xlsx), and the test passed with 223 entries including the last row.
4. Screenshot fallback: [src/app/admin/dashboard/uploads/page.tsx](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/admin/dashboard/uploads/page.tsx) now treats screenshot audits as best-effort, shows a warning banner, and does not display the authoritative "All caught up!" state for screenshot results.

Verification run:

- `node test/roster-parse-verify.js` passed
- `npm run build` passed on March 20, 2026

Notes:

- Build emitted a stale Browserslist database warning.
- This repo's `next build` output still reports "Skipping validation of types" and "Skipping linting." That is a repo-wide build configuration note, not a blocker for this gate.

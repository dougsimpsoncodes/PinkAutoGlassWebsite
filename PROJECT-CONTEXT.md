# PAG Invoice Audit & Roster Audit — Project Context
**Read this before reviewing ARCHITECTURE.md or any code.**

---

## Who Is This For

**Client:** Pink Auto Glass — mobile windshield repair/replacement serving Colorado and Arizona

**Project Sponsor / Decision Maker:** Doug Simpson — operator, uploads invoices nightly, needs visibility into what's been entered

**Primary User:** Doug Simpson — manually uploads Omega invoice screenshots each night. Needs to (1) see all uploaded invoices in one place and (2) quickly identify which invoices from the Omega roster he hasn't uploaded yet.

**Secondary User(s):** None currently — admin-only feature

**Consultant/Builder:** Doug Simpson — AI automation consultant

---

## Business Goals

1. **Audit visibility** — see all uploaded invoices in a sortable, searchable table so Doug can verify data accuracy after upload
2. **Gap detection** — upload the Omega roster export (XLSX) and instantly see which invoices are missing, eliminating manual cross-referencing
3. **Reduce human error** — prevent missed invoices that break the lead-to-revenue attribution pipeline

---

## What This Feature Must Prove

- **Invoice listing works** — all `omega_installs` records display with correct data, sortable by name/date/amount
- **Roster audit catches every gap** — XLSX parse is 100% accurate (no missed rows like the Gemini screenshot approach)
- **Zero friction** — upload XLSX, see results instantly, no extra steps

---

## Hard Constraints

- [x] Must use existing admin auth (middleware already handles this)
- [x] Must match existing admin UI patterns (DashboardLayout, Tailwind, Lucide icons)
- [x] XLSX parsing must be server-side (no client-side file reading)
- [x] No new database tables or migrations — reads from existing `omega_installs`
- [x] Screenshot fallback must still work (Gemini vision) for users who can't export XLSX

---

## What Success Looks Like

**Immediate:** Doug uploads the nightly XLSX, sees 0 missing → "All caught up!" or sees the 2-3 he missed → uploads those individual invoices

**Ongoing:** This replaces the manual audit process entirely. Doug never needs to cross-reference Omega and the admin panel again.

**Phase 1 done:** Both pages working in production, Doug has used it for at least one nightly upload cycle.

---

## What Failure Looks Like

- XLSX parse misses rows or swaps data between rows (trust killer — happened with Gemini screenshots)
- Invoice listing page is too slow with hundreds of records
- Auth bypass — API routes must require admin login

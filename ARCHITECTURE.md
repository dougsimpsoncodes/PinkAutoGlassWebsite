# PAG Invoice Audit & Roster Audit — Architecture Plan
**Codex: Read PROJECT-CONTEXT.md first, then this file.**

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 15.5 App Router + Tailwind CSS | Existing PAG stack |
| Deployment | Vercel | Existing PAG deployment |
| Database | Supabase (PostgreSQL) | Existing — reads `omega_installs` table |
| AI/ML | Gemini 2.5 Flash (screenshot fallback only) | Already used by invoice parser |
| XLSX Parsing | SheetJS (`xlsx` npm package) | Industry standard, no API calls needed |

---

## Pages / Routes

| Route | Type | Description |
|-------|------|-------------|
| `/admin/dashboard/invoices` | Client (page.tsx) | Sortable/searchable table of all uploaded invoices |
| `/admin/dashboard/uploads` | Client (page.tsx) | **Modified** — added "Roster Audit" tab alongside existing upload flow |
| `/api/admin/invoices` | Server (GET) | Fetches `omega_installs` with server-side pagination, sort, search, and date range filter. `raw_data` excluded from list payload — loaded on-demand per row. |
| `/api/admin/roster-audit` | Server (POST) | Accepts XLSX/CSV or screenshots, cross-references against DB, returns missing invoices |

---

## Data Model

```typescript
// Read-only from existing omega_installs table
interface OmegaInstall {
  id: string;                    // UUID PK
  omega_invoice_id: string;      // "upload_{job_number}" — unique key
  invoice_number: string;        // job number from Omega
  install_date: string;          // invoice date
  customer_name: string;         // full name (split to first/last on frontend)
  customer_phone: string;        // E.164 format
  customer_email: string;
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  vin: string;
  job_type: string;
  parts_cost: number;
  labor_cost: number;
  tax_amount: number;
  total_revenue: number;
  payment_method: string;
  payment_status: string;        // 'paid' | 'partial'
  status: string;                // always 'completed'
  matched_lead_id: string | null;
  match_confidence: string | null; // 'exact' | 'likely'
  raw_data: object;              // JSONB — line items, address, balance, etc.
  created_at: string;
  updated_at: string;
}

// Roster audit entry (parsed from XLSX or screenshot)
interface RosterEntry {
  job_number: string;
  customer_name: string;
  amount: number;
  vin: string;
}
```

---

## File Structure

```
src/
  app/
    admin/dashboard/
      invoices/page.tsx           — Invoice listing page (NEW)
      uploads/page.tsx            — Modified: added Roster Audit tab
    api/admin/
      invoices/route.ts           — GET: fetch all invoices (NEW)
      roster-audit/route.ts       — POST: XLSX/screenshot audit (NEW)
  components/admin/
    DashboardLayout.tsx           — Modified: added "Invoices" nav item
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (existing) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key (existing) |
| `GEMINI_API_KEY` | Only for screenshot fallback | Google Gemini API key (existing) |

No new env vars needed.

**Note on service role key:** All 42 existing `/api/admin/*` routes use `SUPABASE_SERVICE_ROLE_KEY` directly (e.g. `import-invoices`, `parse-invoice`, `sms/conversations`, `leads`, `calls`, `google-ads`, `sync/*`, etc.). This is the established, deliberate pattern for admin-only server routes in this project — all protected by auth middleware in `middleware.ts`. The new routes follow this same project-wide convention. RLS is not used for admin operations by design — this is a conscious architectural choice, not a security gap. The `SECURITY.md` guidance about avoiding service-role access applies to public-facing routes, not admin routes behind auth.

---

## Key User Flows

### Flow 1: View All Invoices
1. Navigate to `/admin/dashboard/invoices` via sidebar
2. Page fetches paginated `omega_installs` via `/api/admin/invoices` (50 per page, server-side sort/search)
3. Table renders with sortable columns (first/last name split from `customer_name`)
4. `raw_data` and line items loaded on-demand when row is expanded
5. User can search, sort, paginate through results

### Flow 2: Roster Audit (XLSX — primary, authoritative)
1. Navigate to `/admin/dashboard/uploads` → click "Roster Audit" tab
2. Upload XLSX export from Omega Accounts Aging Detail
3. Server validates XLSX structure: requires `Invoice #`, `Customer Name`, `Open Balance`, `VIN` columns — hard fail if missing
4. Parser rejects non-numeric job numbers, summary/total rows, duplicate job numbers
5. Cross-references each `upload_{job_number}` against `omega_installs` (batched queries)
6. Returns only missing invoices → displayed in red table with source: "spreadsheet"
7. If all uploaded: green "All caught up!" message (authoritative — XLSX is trusted)

### Flow 3: Roster Audit (Screenshot — fallback, best-effort)
1. Same flow but with PNG/JPG screenshots
2. Gemini 2.5 Flash extracts job data via vision
3. Results shown with amber warning banner: "Screenshot audit is best-effort — some invoices may be missed. Use XLSX export for a complete audit."
4. "All caught up" message NOT shown for screenshot audits — always shows "Upload XLSX for a definitive audit"

---

## Constraints & Risks

- **Supabase `.in()` limit:** Batched to 100 IDs per query to avoid hitting limits on large rosters
- **XLSX header offset:** Omega export has empty row 0 — parser dynamically finds header row containing "Invoice #". If no header row found, returns hard error.
- **XLSX column validation:** Parser validates required columns exist (`Invoice #`, `Customer Name`, `Open Balance`, `VIN`). Missing columns = hard fail with descriptive error.
- **XLSX deduplication:** Duplicate job numbers within same upload are deduplicated (keep first occurrence).
- **Gemini accuracy:** Screenshot parsing can miss/swap rows — XLSX is strongly recommended. Screenshot results carry a "best-effort" warning and never display "All caught up".
- **Auth:** All routes behind existing admin middleware — no public access

---

## What This Is NOT

- [x] Not modifying the invoice upload/import flow — that's unchanged
- [x] Not adding new database tables or migrations
- [x] Not touching the lead matching or revenue backfill logic
- [x] Not sending any external API calls (except Gemini for screenshot fallback)
- [x] Not deploying to production yet — local dev demo first

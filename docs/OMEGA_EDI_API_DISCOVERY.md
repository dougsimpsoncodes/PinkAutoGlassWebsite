# Omega EDI API Discovery

**Purpose:** Document available Omega EDI API endpoints to determine what pricing/parts data we can pull automatically.

**Status:** PHASE 0 SMOKE READY — NAGS endpoints still need verification with Pink's actual Omega API key.

---

## How to Complete This Document

1. Log into Omega EDI at https://app.omegaedi.com
2. Navigate to API docs (typically Settings > API / Integrations, or `/api/docs/`)
3. Document what endpoints exist in each section below
4. Test the API key with the existing health check: `GET /api/admin/sync/omega`

---

## Known Endpoints (Already Integrated)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/quotes` | GET | Working (nightly sync) |
| `/quotes/:id` | GET | Working |
| `/invoices` | GET | Working (nightly sync) |
| `/invoices/:id` | GET | Working |
| `/customers/:id` | GET | Working |
| `/customers/search` | GET | Working |

---

## Parts/Pricing Endpoints (Need Discovery)

The quote-engine path should use Omega for vehicle-to-NAGS resolution, then Mygrant for supplier
cost and inventory. A read-only smoke script exists:

```bash
npx tsx scripts/omega-nags-smoke.ts --vin=17_CHARACTER_VIN
npx tsx scripts/omega-nags-smoke.ts --vin=17_CHARACTER_VIN --quote-first
npx tsx scripts/omega-nags-smoke.ts --vehicle-id=NAGS_CAR_ID --nags=FW04792
```

The script requires `OMEGA_EDI_API_KEY` in `.env.local` and intentionally does not print the raw API key or raw VIN.

### Target NAGS Endpoints

| Purpose | Endpoint | Status |
| --- | --- | --- |
| List valid years / search tree | `GET /NagsVehicles/search` | To verify |
| Models for a year | `GET /NagsVehicles/search/{year}` | To verify |
| Body styles for year + make | `GET /NagsVehicles/search/{year}/{make_id}` | To verify |
| Vehicle IDs for YMM | `GET /NagsVehicles/search/{year}/{make_id}/{model_id}` | To verify |
| VIN or NAGS CarID to glass candidates | `GET /NagsVehicles/{vehicle_id}?load_glass=WINDSHIELD&load_options=true` | Smoke script ready |
| Optional Omega quote benchmark | `GET /NagsQuotes/{vehicle_id}/{nags_part_number}` | Smoke script ready |

Before production implementation, verify:

- Existing `OMEGA_EDI_API_KEY` is authorized for `/NagsVehicles/*`.
- NAGS license seats are assigned to the API user/key.
- VIN lookup credits are enabled and confirm per-successful-lookup cost.
- Returned part numbers are canonical NAGS values accepted by Mygrant SOAP Inquiry.
- Multiple windshield variants include enough options data for customer/admin disambiguation.

Older speculative candidates from the first integration plan:

### Parts Lookup by Vehicle

- [ ] `GET /parts?year=YYYY&make=X&model=Y` or similar
- [ ] `GET /parts/search?vehicle=...`
- [ ] `GET /catalog/parts?...`

**If found, document:**
- Endpoint path:
- Query parameters:
- Response format (paste example):

### Parts Lookup by VIN

- [ ] `GET /parts?vin=XXXXX`
- [ ] `GET /vin/decode?vin=XXXXX`

**If found, document:**
- Endpoint path:
- Query parameters:
- Response format (paste example):

### NAGS Part Numbers

- [ ] `GET /parts/nags?number=XXX`
- [ ] NAGS numbers included in parts search results?

**If found, document:**
- Where NAGS numbers appear:
- Format (e.g., `FW12345`):

### Pricing Data

- [ ] Supplier/wholesale cost in parts results?
- [ ] List price in parts results?
- [ ] Labor hours/rates available?

**If found, document:**
- Price fields and what they represent:
- Currency format:

---

## Rate Limits

Current known limit: **200 requests/minute** (from response headers `X-RateLimit-Remaining`, `X-RateLimit-Reset`).

- [ ] Confirm rate limit is still 200/min
- [ ] Any different limits for parts/pricing endpoints?
- [ ] Any daily/monthly quotas?

---

## Authentication

Current: `api_key` header with `OMEGA_EDI_API_KEY` env var.

- [ ] Confirm same auth works for parts endpoints
- [ ] Any additional scopes/permissions needed?

---

## Decision: Manual vs. API Pricing

Based on discovery:

- **If parts/pricing API exists:** Wire `getPartsByVehicle()` in `src/lib/omegaEDI.ts` to call it. The `pricing_cache` table caches results for 7 days.

- **If NO parts/pricing API:** Use the `pricing_cache` table as a manual lookup. Populate it from the Omega web portal for your top 50 vehicle year/make/model combinations. The pricing module (`src/lib/pricing.ts`) already falls back through: cache → Omega API → env var default.

---

## Notes

(Add any observations, quirks, or undocumented behavior here)

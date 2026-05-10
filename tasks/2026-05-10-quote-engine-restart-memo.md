# Quote Engine Restart Memo

Date: 2026-05-10
Project: Pink Auto Glass automated quote engine
Audience: next Codex/Claude/Gemini session and Doug/Dan

## TL;DR Like You're 15

To quote a windshield automatically, the system needs this chain:

```text
customer car info -> exact windshield part number -> supplier cost/inventory -> installed customer quote
```

The exact windshield part number is the **NAGS number**, for example `FW04792`.

What works today:

```text
known NAGS number -> Mygrant price and inventory
```

What does not work yet:

```text
year/make/model or VIN -> exact NAGS windshield candidates
```

That missing decoder is the central blocker.

## Current Strategic Decision

We do **not** want to build a substandard temporary browser-scraping solution if it becomes the foundation of the product.

Preferred long-term architecture:

```text
Customer enters plate, VIN, or year/make/model
  -> official vehicle-to-NAGS decoder
  -> NAGS windshield candidates and feature options
  -> Mygrant SOAP Inquiry by NAGS
  -> supplier cost and availability
  -> Pink installed quote formula
  -> quote is shown/sent, or marked needs-confirmation if ambiguous
```

For MVP input, year/make/model is acceptable because it matches the current manual process and is easier for customers than VIN. The system can follow up when more details are needed.

## What We Confirmed

### Mygrant

Mygrant API credentials are configured locally via `.env.local` using:

- `MYGRANT_AUTH_TOKEN`
- `MYGRANT_CUSTOMER_ID`
- `MYGRANT_WEB_USER_ID`
- `MYGRANT_PASSWORD`
- `MYGRANT_CUSTOMER_CONTACT`
- `MYGRANT_ENVIRONMENT`

Do not print or paste these values.

The Mygrant SOAP API works for known NAGS numbers.

Verified smoke:

```bash
npx tsx scripts/mygrant-inquiry-smoke.ts --nags=DW01658
npx tsx scripts/mygrant-inquiry-smoke.ts --nags=FW04792
```

Results:

- Mygrant returns `requestStatusCode: 0`.
- It returns customer unit price.
- It returns Denver inventory/branch data.
- Existing candidate scoring can select a high-confidence windshield part.

Mygrant SOAP **does not currently work as a year/make/model decoder**.

We tried sending:

```xml
<RequestVehicleYear>2020</RequestVehicleYear>
<RequestVehicleMake>Toyota</RequestVehicleMake>
<RequestVehicleModel>Camry</RequestVehicleModel>
```

That returned:

```text
e610 Internal error: Something went wrong.
```

The Mygrant PDF attachment at:

```text
/Users/dougsimpson/Library/Containers/com.apple.mail/Data/Library/Mail Downloads/3085DAB6-69EA-4A35-825D-AAC7D1C76AB8/Mygrant SOAP WebServices Technical Spec 20260317 v1.7.pdf
```

is byte-for-byte identical to:

```text
/Users/dougsimpson/Downloads/Mygrant SOAP WebServices Technical Spec 20260317 v1.7.pdf
```

The PDF clearly documents:

- NAGS Inquiry
- ProductID Inquiry
- NAGS + ProductID combined inquiry
- NAGS Order
- Return

It does **not** provide a working sample request for:

```text
year/make/model -> NAGS part numbers
```

The PDF does mention `RequestVehicleYear`, `RequestVehicleMake`, and `RequestVehicleModel`, but those appear in the response structure section, not in a working request example.

The Mygrant website Make/Model page does return NAGS candidates. Example for `2020 Toyota Camry` returned:

- `FW04771`
- `FW04772`
- `FW04773`
- `FW04786`
- `FW04790`
- `FW04792`
- `FW05487`

That proves Mygrant has the data somewhere, but not that CoRE650 exposes it through the documented SOAP API.

### Omega

Omega may have the ideal vehicle-to-NAGS decoder through endpoints like:

```text
GET /NagsVehicles/search
GET /NagsVehicles/search/{year}
GET /NagsVehicles/search/{year}/{make_id}
GET /NagsVehicles/search/{year}/{make_id}/{model_id}
GET /NagsVehicles/{vehicle_id}?load_glass=WINDSHIELD&load_options=true
GET /NagsQuotes/{vehicle_id}/{nags_part_number}
```

But we discovered a blocker:

- Pink does not currently have an Omega Enterprise account.
- Omega API keys appear to require Enterprise access.
- NAGS licensing and VIN lookups are separate/metered.

Therefore Omega API is not available to us right now unless the account is upgraded or Omega enables a separate add-on.

### NHTSA

NHTSA VIN decode is not enough. It can decode vehicle identity fields like year/make/model/body/trim. It does not provide NAGS auto-glass part numbers.

### Browser Automation

Browser automation against Mygrant/Omega websites is technically possible but not ideal:

- fragile if page layout changes
- session/login issues
- possible vendor terms risk
- hard to make reliable for customer-facing instant quotes
- may expose VINs/credentials in logs if not handled carefully

If used at all, it should be an internal RPA spike or a controlled background worker, not the core production design.

## Commits Made In This Workstream

Recent relevant commits:

```text
8d3bf25 Add Omega NAGS smoke test
3248935 Surface Mygrant return-code errors
82519fc Add Mygrant env setup helper
e9c2637 Add quote history replay script
7472c34 Add quote history coverage audit
a533bd4 Add Mygrant windshield confidence scoring
2020d39 Add automated quote follow-up workflow
282742c Persist automated quote attempts through RPC
5892974 Add automated quote MVP flow
```

## Important Files

Mygrant client:

```text
src/lib/mygrant/client.ts
```

Mygrant scoring:

```text
src/lib/quote/mygrant-scoring.ts
```

Cash quote formula:

```text
src/lib/quote/pricing.ts
```

Current quote API route:

```text
src/app/api/quote/price/route.ts
```

Omega client:

```text
src/lib/omegaEDI.ts
```

Omega NAGS discovery doc:

```text
docs/OMEGA_EDI_API_DISCOVERY.md
```

Mygrant smoke:

```text
scripts/mygrant-inquiry-smoke.ts
```

Omega NAGS smoke:

```text
scripts/omega-nags-smoke.ts
```

Mygrant env setup helper:

```text
scripts/setup-mygrant-env.ts
```

Historical data audit/replay:

```text
scripts/audit-quote-history-coverage.ts
scripts/replay-quote-history.ts
```

## Historical Data Findings

We audited historical Omega installs.

Useful data exists:

- 252 likely windshield install rows
- 100% have year/make/model
- 92.1% have VIN
- 100% have invoice totals
- 99.2% have parts cost
- 95.2% have labor cost
- 100% have line items

Weak point:

- Only 1.2% had obvious NAGS-like part numbers.

Replay result:

- 196 replayable windshield cases from 250 fetched rows
- 194 had parts cost
- Current formula averaged $89.38 above historical actual totals
- Median delta was $56.87 above actual
- 154 / 194 were within $100
- Calibration jobs ran high

Conclusion: historical data is useful for tuning installed quote formula, but not enough by itself to decode YMM/VIN to NAGS.

## Security / Verification Status

Recent checks passed during this workstream:

- `npx tsx scripts/verify-mygrant-scoring.ts`
- `npm run ci:guards`
- Semgrep on changed scripts/files
- staged whitespace checks
- staged gitleaks scans

Known caveat:

- Full `npx tsc --noEmit` still fails on unrelated pre-existing project issues, including `.next` route type mismatches, older scripts, admin route typing, missing `bcryptjs`, and other unrelated TypeScript errors.

## Current Git Status At Break

At the time this memo was written, unrelated local worktree changes existed:

```text
 M next.config.js
 M package.json
 M src/middleware.ts
?? scripts/omega-invoices-dry-run.ts
?? src/lib/omega/invoice-detail.ts
```

Those were not part of the quote-engine decoder investigation and should not be reverted without checking with the user.

## Next Best Step

The next best step is to ask Mygrant for the missing YMM lookup contract.

Recommended email to Leon:

```text
Hi Leon,

We have CoRE650 SOAP Inquiry working for known NAGS numbers. We can successfully send a NAGS Inquiry and receive customer price and availability.

For our MVP, we are comfortable using year/make/model rather than VIN.

Your PDF references RequestVehicleYear, RequestVehicleMake, and RequestVehicleModel, and the error table references "No products were found for this combination of year, make and model." However, the sample requests only show NAGS and ProductID Inquiry.

Can you send a working sample XML request for Inquiry by year/make/model that returns matching windshield NAGS candidates?

We tried sending RequestVehicleYear/RequestVehicleMake/RequestVehicleModel inside RequestDetail and received e610.

If year/make/model lookup is not supported through CoRE650, is there another official Mygrant endpoint or product that exposes the same data as the logged-in Search by Make/Model page?

Our intended flow is:
1. Customer enters year/make/model
2. Mygrant returns matching windshield NAGS candidates
3. We call CoRE650 NAGS Inquiry for price and availability
4. We calculate the installed quote

Thanks.
```

## Questions For Doug / Dan

1. Do we want to pursue Mygrant as the single-provider ideal first, before revisiting Omega or third-party decoders?

2. Are we willing to buy Mygrant VIN lookup credits if Mygrant says their VIN search is the official route, even if customers mostly use year/make/model?

3. If Mygrant cannot provide API YMM lookup, do we want to evaluate Omega Enterprise/Web Quote pricing, or search for a different licensed VIN/YMM-to-NAGS provider?

4. For YMM-only MVP, should ambiguous results show a quote range to the customer, or should they see "we'll confirm this by text/call" while the system still prepares candidate prices internally?

5. What level of pricing risk is acceptable for automated quotes?
   Example: exact quote only when one high-confidence candidate exists, otherwise estimate/manual confirmation.

6. Should the first production launch be limited to the top 20-50 most common vehicles from historical Pink jobs?

## Restart Checklist

When work resumes:

1. Read this memo.
2. Check `git status --short` and avoid reverting unrelated local changes.
3. Confirm whether Leon/Mygrant answered the YMM API question.
4. If Mygrant provides working XML, update `src/lib/mygrant/client.ts` with a documented YMM lookup method and add a smoke test.
5. If Mygrant says no, decide between:
   - Omega Enterprise/Web Quote
   - another licensed NAGS decoder
   - limited YMM-first MVP with approved browser/RPA only if vendor permits
6. Do not build production browser scraping unless the vendor approves it or the business explicitly accepts the risk.

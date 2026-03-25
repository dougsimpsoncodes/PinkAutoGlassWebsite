# Phase 1 Market Filter — Error Review

**Reviewed:** 2026-03-24
**Files:** market.ts, metricsBuilder.ts, unifiedLeadsBuilder.ts, route.ts

---

## P0-1: Missing Zip Prefixes — Colorado (10 missing) and Arizona (8 missing)

**File:** `src/lib/market.ts:37-38`

Colorado only has `800–806`. The full range is **800–816**. Missing: `807, 808, 809, 810, 811, 812, 813, 814, 815, 816`.

Arizona only has `850–855`. Valid prefixes also include: `856, 857, 859, 860, 863, 864, 865`.

**Impact:** Leads from Pueblo (810), Grand Junction (815–816), Fort Collins (805 is there but 806 covers some too), Colorado mountain towns (807–809), Tucson (856–857), Flagstaff (860), and Show Low/eastern AZ (859, 863–865) will NOT be classified by zip. They'll only classify if they have a state code or matching utm_source — otherwise they fall through as `null` and disappear from filtered views.

**Fix:**
```typescript
const COLORADO_ZIP_PREFIXES = new Set([
  '800', '801', '802', '803', '804', '805', '806', '807', '808', '809',
  '810', '811', '812', '813', '814', '815', '816'
]);
const ARIZONA_ZIP_PREFIXES = new Set([
  '850', '851', '852', '853', '854', '855', '856', '857',
  '859', '860', '863', '864', '865'
]);
```

---

## P0-2: Gross Revenue Silently Drops Unmatched Installs Under Market Filter

**File:** `src/lib/metricsBuilder.ts:490-509`

When `market !== 'all'`, the code:
1. Gets all `omega_installs` for the period
2. Collects `matched_lead_id` values (filtering out nulls)
3. If `leadIds.length === 0`, **returns `{ total: 0, invoiceCount: 0 }`**
4. Filters rows to only those with `matched_lead_id` in the allowed set

**Bug:** Any install with `matched_lead_id = null` (unmatched cash jobs, walk-ins, installs not yet linked to a lead) is silently dropped. If ALL installs in a period are unmatched, gross revenue shows $0 even though real revenue exists.

**Impact:** Under-reports revenue when market filter is active. Could be significant — unmatched installs are common.

**Fix:** Unmatched installs should either (a) be included in both markets (they can't be classified), or (b) be excluded with a clear `_debug` field explaining how many were dropped. Option (a) is safer:

```typescript
if (market !== 'all') {
  const leadIds = [...new Set(rows.map((r: any) => r.matched_lead_id).filter(Boolean))];

  let allowedLeadIds = new Set<string>();
  if (leadIds.length > 0) {
    const { data: leads } = await supabase
      .from('leads')
      .select('id, state, zip, utm_source')
      .in('id', leadIds);
    allowedLeadIds = new Set(
      (leads || [])
        .filter((lead: any) => classifyLeadMarket(lead) === market)
        .map((lead: any) => lead.id)
    );
  }

  // Keep rows that either match the market OR have no lead to classify
  rows = rows.filter((row: any) =>
    !row.matched_lead_id || allowedLeadIds.has(row.matched_lead_id)
  );
}
```

---

## P1-1: Phone Format Mismatch in Call Suppression — No Normalization

**File:** `src/lib/metricsBuilder.ts:361`, `src/lib/unifiedLeadsBuilder.ts:304`

The suppression check does a **direct string comparison**:
```typescript
if (existingCallPhones.has(call.from_number)) { ... }
```

`existingCallPhones` contains `phone_e164` values from the `leads` table (e.g., `+17201234567`).
`call.from_number` comes from RingCentral and **may not be in the same format**.

RingCentral can return phone numbers as:
- `+17201234567` (E.164 — matches)
- `17201234567` (no plus — **mismatch**)
- `(720) 123-4567` (formatted — **mismatch**)

If formats don't match, suppression silently fails and calls get double-counted (once as a leads-table entry, once as an RC call).

**Fix:** Normalize both sides before comparison:
```typescript
// In fetchCallLeadPhones:
phones.add(normalizePhoneDigits(row.phone_e164) || row.phone_e164);

// In deduplicateCalls:
const normalizedFrom = normalizePhoneDigits(call.from_number);
if (normalizedFrom && existingCallPhones.has(normalizedFrom)) { ... }
```

---

## P1-2: `fetchCallLeadPhones` Has No Date Bounds — Suppresses Repeat Callers Across Periods

**File:** `src/lib/metricsBuilder.ts:398-415`, `src/lib/unifiedLeadsBuilder.ts:235-252`

The suppression query fetches ALL call-type lead phones **ever created** — no date filter. But `fetchFormLeads` and `fetchCalls` ARE date-bounded.

**Scenario:**
1. Customer calls Jan 15 → saved as lead in `leads` table
2. Same customer calls again Mar 20 → appears in `ringcentral_calls`
3. Dashboard views Mar 20 with market filter active
4. `fetchFormLeads` for Mar 20: doesn't include the Jan 15 lead (outside period)
5. `fetchCallLeadPhones`: includes the Jan 15 phone (no date filter)
6. RC call from Mar 20 is suppressed
7. **Result:** Repeat caller is invisible — not in form leads, not in call leads

**Impact:** Undercounts leads. Repeat customers (who called months ago, then call again) vanish from metrics.

**Fix:** Either:
- (a) Date-bound the suppression to the same period (so only same-period lead records suppress)
- (b) Accept global dedup as intentional, but document it prominently and add a `_debug` counter

---

## P1-3: Supabase `.in()` Query Can Exceed URL Length Limit

**File:** `src/lib/metricsBuilder.ts:499`

```typescript
const { data: leads } = await supabase
  .from('leads')
  .select('id, state, zip, utm_source')
  .in('id', leadIds);
```

Supabase uses PostgREST which encodes `.in()` as a URL query parameter. UUIDs are 36 chars each. With a 30-day period containing 500+ installs, the URL could exceed browser/proxy limits (~8KB).

**Impact:** Query silently fails or returns partial results for busy periods.

**Fix:** Batch the `.in()` query:
```typescript
const BATCH_SIZE = 100;
const allLeads: any[] = [];
for (let i = 0; i < leadIds.length; i += BATCH_SIZE) {
  const batch = leadIds.slice(i, i + BATCH_SIZE);
  const { data } = await supabase
    .from('leads')
    .select('id, state, zip, utm_source')
    .in('id', batch);
  allLeads.push(...(data || []));
}
```

---

## P1-4: `classifyLeadMarket` Only Handles 2-Letter State Abbreviations

**File:** `src/lib/market.ts:125-127`

```typescript
const state = lead.state?.trim().toUpperCase();
if (state === 'CO') return 'colorado';
if (state === 'AZ') return 'arizona';
```

If any lead has `state = 'Colorado'` or `state = 'Arizona'` (full name), it won't match. The form may normalize this, but data coming from other sources (Omega imports, manual entry, API integrations) may not.

**Fix:**
```typescript
const state = lead.state?.trim().toUpperCase();
if (state === 'CO' || state === 'COLORADO') return 'colorado';
if (state === 'AZ' || state === 'ARIZONA') return 'arizona';
```

---

## P2-1: Traffic and Click Events Not Market-Filtered

**File:** `src/lib/metricsBuilder.ts:517-557`

`fetchTraffic()` and `fetchClickEvents()` don't accept or use the `market` parameter. When viewing Arizona-only metrics, traffic/clicks still show totals across all markets.

**Impact:** Dashboard shows inconsistent data — leads/spend/revenue filtered to one market, but traffic/clicks are unfiltered. Could mislead on conversion rates.

**Fix:** Either:
- Add market filtering (requires joining sessions/events with page path or source classification)
- Or clearly label these metrics as "all markets" in the dashboard UI

---

## P2-2: `\bcolorado springs\b` Pattern Is Redundant

**File:** `src/lib/market.ts:45`

`/\bcolorado springs\b/i` on line 45 can never be the sole matcher because `/\bcolorado\b/i` on line 44 already matches any string containing "colorado springs". Dead code — not a bug, but clutters the patterns array.

---

## P2-3: Campaign Market Returns Null on Dual-Market Match Instead of Warning

**File:** `src/lib/market.ts:148-156`

```typescript
if (isColorado === isArizona) return null;
```

If a campaign name matches BOTH Colorado and Arizona patterns (e.g., "Denver Phoenix Cross-Market Campaign"), it returns `null` instead of picking one or logging a warning. The spend from that campaign disappears from both market views.

**Impact:** Spend silently vanishes from filtered views for any cross-market campaign names.

**Fix:** At minimum, log a warning so it's detectable. Ideally, attribute proportionally or let the first match win.

---

## Summary

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | P0 | Missing 10 CO + 8 AZ zip prefixes | Leads from major cities misclassified |
| 2 | P0 | Gross revenue drops unmatched installs | Revenue under-reported with market filter |
| 3 | P1 | Phone format mismatch in suppression | Double-counting or missed suppression |
| 4 | P1 | No date bounds on call suppression | Repeat callers invisible in metrics |
| 5 | P1 | `.in()` query unbounded | Fails silently on large datasets |
| 6 | P1 | State field only matches abbreviations | Full state names fall through |
| 7 | P2 | Traffic/clicks not market-filtered | Inconsistent dashboard metrics |
| 8 | P2 | Redundant colorado springs pattern | Dead code |
| 9 | P2 | Dual-market campaigns silently null | Spend disappears from both views |

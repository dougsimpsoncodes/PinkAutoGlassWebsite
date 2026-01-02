# Attribution System - Post-Deploy Checklist

## Completed ✅

### Code Changes
- [x] Centralized `buildAttribution()` helper in `src/lib/attribution.ts`
- [x] TypeScript `AdPlatform` union type
- [x] `/api/lead` uses centralized helper
- [x] `/api/booking/submit` uses centralized helper (JSON + multipart paths)
- [x] SSR guards verified in `tracking.ts`
- [x] Log scrubbing - sessionId removed from logs
- [x] RPC uses `SECURITY DEFINER` (no direct table writes)

### Database Migrations Applied
- [x] `20260102_update_ad_platform_constraint.sql` - Updated platform labels
- [x] `20260102_add_attribution_column_constraints.sql` - Length constraints + indexes

---

## Manual Verification Needed

### API Parity
- [ ] Test JSON submission with gclid → verify `ad_platform: 'google'`
- [ ] Test JSON submission with msclkid → verify `ad_platform: 'microsoft'`
- [ ] Test multipart submission (with file upload) → verify attribution preserved
- [ ] Test empty gclid/msclkid → verify normalized to `null`

### Mobile Testing
- [ ] Safari iOS - Quote form with gclid in URL
- [ ] Chrome Android - Booking form with msclkid in URL
- [ ] Verify click IDs persist across page navigation

### RLS Verification
- [ ] Confirm anon user can call `fn_insert_lead` RPC
- [ ] Confirm anon user cannot directly INSERT to `leads` table
- [ ] Confirm service role can read all leads (for admin dashboard)

---

## Monitoring Setup

### Alerts to Configure

```sql
-- Alert: ad_platform null rate > 10%
SELECT
  COUNT(*) FILTER (WHERE ad_platform IS NULL) * 100.0 / COUNT(*) as null_rate
FROM leads
WHERE created_at > NOW() - INTERVAL '1 day';
-- Alert if > 10

-- Alert: Session lookup hit rate
SELECT
  COUNT(*) FILTER (WHERE website_session_id IS NOT NULL) * 100.0 / COUNT(*) as hit_rate
FROM leads
WHERE created_at > NOW() - INTERVAL '1 day';
-- Track trend, alert if drops significantly

-- Alert: Constraint violations (check Supabase logs)
-- Look for: "violates check constraint"
```

### Dashboard Queries
```sql
-- Attribution breakdown
SELECT
  ad_platform,
  COUNT(*) as leads,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as pct
FROM leads
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY ad_platform
ORDER BY leads DESC;
```

---

## Optional: Backfill Script

Run this to set `ad_platform` for existing leads that have click IDs but null platform:

```sql
-- Dry run first
SELECT id, gclid, msclkid, ad_platform,
  CASE
    WHEN gclid IS NOT NULL THEN 'google'
    WHEN msclkid IS NOT NULL THEN 'microsoft'
    ELSE NULL
  END as new_platform
FROM leads
WHERE ad_platform IS NULL
  AND (gclid IS NOT NULL OR msclkid IS NOT NULL);

-- Apply (safe, idempotent)
UPDATE leads
SET ad_platform = CASE
  WHEN gclid IS NOT NULL THEN 'google'
  WHEN msclkid IS NOT NULL THEN 'microsoft'
  ELSE ad_platform
END
WHERE ad_platform IS NULL
  AND (gclid IS NOT NULL OR msclkid IS NOT NULL);
```

---

## Documentation Updates

- [ ] Update `docs/ATTRIBUTION.md` with final platform labels
- [ ] Document precedence rules: `gclid > msclkid > utm_source`
- [ ] Document session TTL behavior (localStorage, 90-day click ID expiry)
- [ ] Add to onboarding: "Attribution is server-derived, never trust client"

---

## Future Considerations

### Not Implemented (By Design)
- `gbraid`/`wbraid` capture - Keep off for simplicity; add later if needed
- Cross-tab session sync - Current behavior: each tab gets own session
- Cookie-based session fallback - Currently localStorage only

### Session Semantics (Current Behavior)
- Session ID format: `session_{timestamp}_{random}`
- Storage: `localStorage` under key `analytics_session_id`
- Click ID expiry: 90 days (configurable in `tracking.ts`)
- If sessionId fails regex validation: treated as undefined, relies on fallback

### Analytics/ETL Alignment
- [ ] Confirm BI dashboards use `'microsoft'` not `'bing'`
- [ ] Update any Looker/Metabase/Tableau dashboards
- [ ] Verify Google Ads conversion import still works
- [ ] Verify Microsoft Ads conversion import still works

---

## Test Cases for E2E

```typescript
// 1. gclid attribution
test('lead with gclid gets google platform', async () => {
  const res = await fetch('/api/lead', {
    method: 'POST',
    body: JSON.stringify({ ...baseForm, gclid: 'test_gclid' })
  });
  const lead = await getLeadFromDB(res.leadId);
  expect(lead.ad_platform).toBe('google');
});

// 2. msclkid attribution
test('lead with msclkid gets microsoft platform', async () => {
  const res = await fetch('/api/lead', {
    method: 'POST',
    body: JSON.stringify({ ...baseForm, msclkid: 'test_msclkid' })
  });
  const lead = await getLeadFromDB(res.leadId);
  expect(lead.ad_platform).toBe('microsoft');
});

// 3. Precedence: gclid wins
test('gclid takes precedence over msclkid', async () => {
  const res = await fetch('/api/lead', {
    method: 'POST',
    body: JSON.stringify({ ...baseForm, gclid: 'g123', msclkid: 'm456' })
  });
  const lead = await getLeadFromDB(res.leadId);
  expect(lead.gclid).toBe('g123');
  expect(lead.msclkid).toBeNull(); // or 'm456' depending on design
  expect(lead.ad_platform).toBe('google');
});

// 4. Empty string normalization
test('empty gclid normalized to null', async () => {
  const res = await fetch('/api/lead', {
    method: 'POST',
    body: JSON.stringify({ ...baseForm, gclid: '' })
  });
  const lead = await getLeadFromDB(res.leadId);
  expect(lead.gclid).toBeNull();
});

// 5. Direct traffic (no click IDs)
test('direct traffic has null platform', async () => {
  const res = await fetch('/api/lead', {
    method: 'POST',
    body: JSON.stringify({ ...baseForm }) // no gclid/msclkid
  });
  const lead = await getLeadFromDB(res.leadId);
  expect(lead.ad_platform).toBeNull();
});
```

---

## Sign-Off

- [ ] All manual verifications complete
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] E2E tests added
- [ ] Production deploy verified

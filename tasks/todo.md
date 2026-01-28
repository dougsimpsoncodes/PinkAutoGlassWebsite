# Security Review: Attribution System Changes

## Task
Review recent attribution system changes for security and compliance concerns.

## Checklist
- [x] Review `src/lib/attribution.ts` - Centralized attribution logic
- [x] Review `src/lib/validation.ts` - Zod schemas for gclid/msclkid/sessionId
- [x] Review `src/lib/tracking.ts` - Client-side click ID capture
- [x] Review `src/app/api/lead/route.ts` - Lead API
- [x] Review `src/app/api/booking/submit/route.ts` - Booking API
- [x] Review `20260102_update_ad_platform_constraint.sql` - DB constraint migration
- [x] Review `20260102_add_attribution_column_constraints.sql` - Length constraints migration
- [x] Review `20251129_fix_fn_insert_lead_attribution.sql` - RPC function
- [x] Verify .gitignore includes .env* pattern
- [x] Document security findings and recommendations

## Status: COMPLETE

---

## Security Review Findings

### POSITIVE FINDINGS (Security Controls in Place)

1. **Trust Boundary Enforcement** - PASS
   - `ad_platform` is NEVER accepted from client input
   - Server-side derivation in `attribution.ts:116-140` using `deriveAdPlatform()`
   - Precedence order: gclid > msclkid > known utm_source

2. **Input Validation** - PASS
   - Click IDs validated with Zod schemas (`validation.ts:40-52`)
   - Length caps: gclid/msclkid max 200 chars, sessionId max 100 chars
   - Regex patterns: `/^[a-zA-Z0-9_\-\.]+$/` prevents injection
   - Empty string preprocessing: transforms "" to undefined

3. **Database Constraints** - PASS
   - Length constraints match Zod validation (migration `20260102_add_attribution_column_constraints.sql`)
   - Enum constraint for ad_platform values
   - Indexes for efficient lookups

4. **Log Scrubbing** - PARTIAL PASS
   - `booking/submit/route.ts:248-253` masks sensitive IDs in logs:
     ```javascript
     console.log('Session attribution found:', {
       source: sessionData.utm_source,
       campaign: sessionData.utm_campaign,
       hasGclid: !!sessionData.gclid,  // Boolean only, not value
       hasMsclkid: !!sessionData.msclkid,
     });
     ```

5. **RPC Security** - PASS WITH CONCERNS
   - Uses SECURITY DEFINER for elevated privileges
   - search_path set to `public`
   - Permissions explicitly granted only to `anon` role

6. **Data Normalization** - PASS
   - `normalizeClickId()` in `attribution.ts:96-99` converts empty strings to null
   - Prevents storage inconsistencies

7. **Anti-Spoofing** - PASS
   - `buildAttribution()` prioritizes lookup values over body values
   - Session lookup (trusted, recorded at landing) wins over client-submitted values

8. **Secret Hygiene** - PASS
   - `.gitignore` includes `.env*` pattern (line 34)
   - No hardcoded secrets in reviewed files

---

### SECURITY CONCERNS IDENTIFIED

#### CONCERN 1: RPC search_path Missing 'extensions' Schema
**Severity: HIGH**
**File:** `supabase/migrations/20251129_fix_fn_insert_lead_attribution.sql:10`

The function uses:
```sql
SET search_path = public
```

But calls `uuid_generate_v4()` which lives in the `extensions` schema. This was the exact issue that caused 4 days of lead loss in December 2025 (documented in CLAUDE.md).

**Current code at line 13:**
```sql
v_id uuid := COALESCE(p_id, uuid_generate_v4());
```

**Risk:** If `p_id` is NULL, the function will fail silently when trying to call `uuid_generate_v4()`.

**Mitigation:** The API routes always generate UUIDs before calling the RPC (`const leadId = uuidv4();`), so `p_id` is never NULL in practice. However, this is a latent bug.

**Recommendation:** Update search_path to:
```sql
SET search_path = public, extensions
```

---

#### CONCERN 2: Client-Side Click IDs in localStorage Without Encryption
**Severity: LOW**
**File:** `src/lib/tracking.ts:43-52`

Click IDs are stored in localStorage:
```javascript
function storeClickId(key: string, value: string): void {
  const data: StoredClickId = {
    value,
    timestamp: Date.now(),
    landingPage: window.location.pathname + window.location.search,
  };
  localStorage.setItem(key, JSON.stringify(data));
}
```

**Risk:** Click IDs (gclid, msclkid) are not PII but are advertising identifiers. If compromised, an attacker could:
- Attribute false conversions to their ads
- Perform click fraud

**Mitigation:** This is standard industry practice. Google and Microsoft expect these IDs in localStorage. The 90-day expiration helps limit exposure.

**Recommendation:** Consider adding integrity checks (HMAC) if click fraud becomes a concern.

---

#### CONCERN 3: Session ID Generation Predictability
**Severity: LOW**
**File:** `src/lib/tracking.ts:147`

Session ID format:
```javascript
sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

**Risk:** `Math.random()` is not cryptographically secure. An attacker who knows the timestamp could potentially predict or brute-force session IDs.

**Mitigation:** Session IDs are used for attribution, not authentication. The RLS policies prevent cross-session data access.

**Recommendation:** For future hardening, consider using `crypto.randomUUID()` if supported, or a server-generated token.

---

#### CONCERN 4: Placeholder Email Pattern Could Be Abused
**Severity: MEDIUM**
**File:** `src/app/api/lead/route.ts:42-43`

```javascript
if (!transformedBody.email) {
  transformedBody.email = `quote-${Date.now()}@temp.pinkautoglass.com`;
}
```

**Risk:** This creates a predictable email pattern. If the pinkautoglass.com domain has a catch-all email, an attacker could:
- Send emails to `quote-{timestamp}@temp.pinkautoglass.com`
- Potentially receive lead notifications if misconfigured

**Mitigation:** The domain should NOT have a catch-all for the `temp` subdomain.

**Recommendation:**
- Ensure `temp.pinkautoglass.com` does not receive email
- Consider using `noreply+{uuid}@pinkautoglass.com` instead

---

#### CONCERN 5: No Rate Limiting on Lead Submission
**Severity: MEDIUM**
**Files:** `src/app/api/lead/route.ts`, `src/app/api/booking/submit/route.ts`

No visible rate limiting on form submissions.

**Risk:** An attacker could:
- Flood the database with fake leads
- Exhaust SMS/email quotas
- Cause denial of service

**Mitigation:** Honeypot and timestamp validation are present, but these can be bypassed by sophisticated bots.

**Recommendation:**
- Add IP-based rate limiting (e.g., 5 submissions per IP per hour)
- Consider CAPTCHA for suspicious patterns
- Add SMS abuse monitoring (Twilio has built-in fraud detection)

---

### COMPLIANCE NOTES

1. **GDPR/CCPA Considerations:**
   - Click IDs (gclid, msclkid) may be considered personal data under GDPR
   - 90-day retention aligns with advertising platform requirements
   - No opt-out mechanism visible for ad tracking

2. **Data Retention:**
   - Click IDs stored in localStorage for 90 days (line 32)
   - Database retention policy not visible in reviewed code

---

## Summary

| Category | Status | Notes |
|----------|--------|-------|
| Trust Boundary | PASS | ad_platform derived server-side only |
| Input Validation | PASS | Zod schemas with length caps and regex |
| Log Scrubbing | PASS | Sensitive IDs masked |
| RPC Security | NEEDS FIX | search_path missing 'extensions' |
| Data Normalization | PASS | Empty strings converted to null |
| Secret Hygiene | PASS | .gitignore covers .env* |
| Rate Limiting | MISSING | Recommend adding IP-based limits |

**Overall Assessment:** The attribution system has strong security fundamentals. The main actionable item is fixing the RPC search_path and adding rate limiting.

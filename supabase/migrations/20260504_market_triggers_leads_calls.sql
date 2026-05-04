-- P2c: triggers + backfill that populate `market` column on leads and ringcentral_calls
-- Mirrors classifyLeadMarket() and classifyCallMarket() from src/lib/market.ts.
--
-- Why triggers: lead INSERTs flow through fn_insert_lead RPC + multiple direct
-- writers (callLeadSync, sync/ringcentral, sync-omega cron, review-blast, drip
-- processor, supabase.ts insertLead wrapper). Modifying every caller would
-- guarantee gaps; modifying fn_insert_lead is forbidden by CLAUDE.md unless
-- critical-path tested. A BEFORE INSERT trigger covers ALL paths atomically.
--
-- WHEN clause: `NEW.market IS NULL` lets explicit market values from trusted
-- callers (backfill scripts, manual corrections) win over derivation. The
-- trigger only fills when the caller didn't.
--
-- Update fires on state/zip/utm_source change too: late-arriving lead enrichment
-- (state filled in by a cron, ZIP corrected by an admin) re-derives market
-- automatically.
--
-- Phone normalization: TS uses normalizePhoneDigits() which strips non-digits
-- and tolerates 10/11-digit forms. SQL must match — regexp_replace + IN clause.
--
-- Note: market_type column already exists with a different concept (in_market
-- vs out_of_market for Denver service area). Untouched here.
--
-- Safety: pure additive. Trigger writes to a nullable column we just added.
-- Cannot break fn_insert_lead because:
--   1. NEW.market is NULL pre-trigger → trigger sets it OR leaves NULL
--   2. The function reads inputs (state/zip/utm_source) that are part of
--      every lead insert today
--   3. No exception path can throw — IMMUTABLE function returns NULL on bad inputs

-- ─── Lead market derivation ─────────────────────────────────────────────
-- Mirror of classifyLeadMarket() in src/lib/market.ts:
--   1. state IN ('CO','COLORADO') → colorado
--   2. state IN ('AZ','ARIZONA')  → arizona
--   3. zip prefix in CO range     → colorado
--   4. zip prefix in AZ range     → arizona
--   5. utm_source contains a known satellite name → corresponding market
--   6. else NULL
--
-- Mark IMMUTABLE: same inputs always return same output. Lets Postgres cache
-- the result and use the function in expression indexes if ever needed.

CREATE OR REPLACE FUNCTION derive_lead_market(
  p_state TEXT,
  p_zip TEXT,
  p_utm_source TEXT
) RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_state TEXT;
  v_zip_prefix TEXT;
  v_utm TEXT;
BEGIN
  -- 1. State (uppercased for comparison; full names + abbreviations)
  v_state := upper(trim(p_state));
  IF v_state IN ('CO', 'COLORADO') THEN RETURN 'colorado'; END IF;
  IF v_state IN ('AZ', 'ARIZONA') THEN RETURN 'arizona'; END IF;

  -- 2. ZIP prefix (digits only, first 3 chars)
  v_zip_prefix := substring(regexp_replace(coalesce(p_zip, ''), '\D', '', 'g') FROM 1 FOR 3);
  IF length(v_zip_prefix) = 3 THEN
    -- CO: 800-816 (Denver metro through mountain towns, Pueblo, Grand Junction)
    IF v_zip_prefix BETWEEN '800' AND '816' THEN RETURN 'colorado'; END IF;
    -- AZ: 850-857, 859, 860, 863-865 (Phoenix metro through Tucson, Flagstaff)
    IF v_zip_prefix BETWEEN '850' AND '857' THEN RETURN 'arizona'; END IF;
    IF v_zip_prefix IN ('859', '860') THEN RETURN 'arizona'; END IF;
    IF v_zip_prefix BETWEEN '863' AND '865' THEN RETURN 'arizona'; END IF;
  END IF;

  -- 3. utm_source against satellite source lists. Source-of-truth list lives
  -- in src/lib/market.ts COLORADO_SATELLITE_SOURCES / ARIZONA_SATELLITE_SOURCES.
  -- Drift risk: if that TS list changes, this SQL list must update too.
  -- Parity test in src/lib/__tests__/market-classifier-parity.test.ts asserts equality.
  v_utm := lower(trim(coalesce(p_utm_source, '')));
  IF v_utm <> '' THEN
    IF v_utm LIKE '%windshieldcostcalculator%'
       OR v_utm LIKE '%windshielddenver%'
       OR v_utm LIKE '%chiprepairdenver%'
       OR v_utm LIKE '%chiprepairboulder%'
       OR v_utm LIKE '%aurorawindshield%'
       OR v_utm LIKE '%mobilewindshielddenver%'
       OR v_utm LIKE '%cheapestwindshield%'
       OR v_utm LIKE '%newwindshieldcost%'
       OR v_utm LIKE '%getawindshieldquote%'
       OR v_utm LIKE '%newwindshieldnearme%'
       OR v_utm LIKE '%windshieldpricecompare%'
       OR v_utm LIKE '%coloradospringswindshield%'
       OR v_utm LIKE '%autoglasscoloradosprings%'
       OR v_utm LIKE '%mobilewindshieldcoloradosprings%'
       OR v_utm LIKE '%windshieldreplacementfortcollins%'
    THEN RETURN 'colorado'; END IF;

    IF v_utm LIKE '%chiprepairmesa%'
       OR v_utm LIKE '%chiprepairphoenix%'
       OR v_utm LIKE '%chiprepairscottsdale%'
       OR v_utm LIKE '%chiprepairtempe%'
       OR v_utm LIKE '%windshieldcostphoenix%'
       OR v_utm LIKE '%mobilewindshieldphoenix%'
    THEN RETURN 'arizona'; END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION set_lead_market_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.market := derive_lead_market(NEW.state, NEW.zip, NEW.utm_source);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tag_lead_market ON leads;
CREATE TRIGGER tag_lead_market
BEFORE INSERT OR UPDATE OF state, zip, utm_source ON leads
FOR EACH ROW
WHEN (NEW.market IS NULL)
EXECUTE FUNCTION set_lead_market_trigger();

COMMENT ON FUNCTION derive_lead_market(TEXT, TEXT, TEXT) IS
  'Mirrors classifyLeadMarket() in src/lib/market.ts. Source-of-truth satellite lists must stay in sync (parity test in src/lib/__tests__/market-classifier-parity.test.ts). Returns "colorado", "arizona", or NULL.';

-- ─── Call market derivation ─────────────────────────────────────────────
-- Mirror of classifyCallMarket() in src/lib/market.ts:
--   to_number digits-only matches CO phone → colorado
--   to_number digits-only matches AZ phone → arizona
--   else NULL
--
-- Phone normalization: strip non-digits, tolerate 10/11-digit forms.

CREATE OR REPLACE FUNCTION derive_call_market(p_to_number TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN regexp_replace(coalesce(p_to_number, ''), '\D', '', 'g') IN ('17209187465', '7209187465')
      THEN 'colorado'
    WHEN regexp_replace(coalesce(p_to_number, ''), '\D', '', 'g') IN ('14807127465', '4807127465')
      THEN 'arizona'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION set_call_market_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.market := derive_call_market(NEW.to_number);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tag_call_market ON ringcentral_calls;
CREATE TRIGGER tag_call_market
BEFORE INSERT OR UPDATE OF to_number ON ringcentral_calls
FOR EACH ROW
WHEN (NEW.market IS NULL)
EXECUTE FUNCTION set_call_market_trigger();

COMMENT ON FUNCTION derive_call_market(TEXT) IS
  'Mirrors classifyCallMarket() in src/lib/market.ts. Hardcoded against the two production phone numbers; if a third number is added, update both this function and the TS classifier.';

-- ─── Backfill ────────────────────────────────────────────────────────────
-- Run after triggers are in place so any concurrent INSERTs during the
-- backfill window are tagged correctly by the trigger.
--
-- Idempotent: only updates rows where market IS NULL. Re-running has no effect.

UPDATE leads
SET market = derive_lead_market(state, zip, utm_source)
WHERE market IS NULL
  AND derive_lead_market(state, zip, utm_source) IS NOT NULL;

UPDATE ringcentral_calls
SET market = derive_call_market(to_number)
WHERE market IS NULL
  AND derive_call_market(to_number) IS NOT NULL;

-- ─── Call-derived lead inheritance (deterministic, FK-based) ─────────────
-- Leads that originated from a phone call have a session_id linked to a
-- user_session that may have a tagged market. Where the lead's own
-- state/zip/utm signal yielded NULL, inherit from the parent session.
--
-- This is deterministic (FK join) — not fuzzy phone/time matching.

UPDATE leads l
SET market = us.market
FROM user_sessions us
WHERE l.session_id = us.session_id
  AND l.market IS NULL
  AND us.market IS NOT NULL;

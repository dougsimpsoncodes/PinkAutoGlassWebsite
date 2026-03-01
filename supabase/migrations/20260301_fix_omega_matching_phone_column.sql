-- Fix match_omega_to_leads() to use phone_e164 instead of phone
-- The 'phone' column was never created in production — only phone_e164 exists.
-- This caused match_omega_to_leads() to silently fail since the 20260227 migration.

-- Also fix fn_backfill_lead_revenue() to handle the check_close_date_after_created constraint
-- by only setting close_date when it's after created_at.

SET search_path = public, extensions;

-- ============================================================================
-- 1. Fix match_omega_to_leads() — use phone_e164 instead of phone
-- ============================================================================
CREATE OR REPLACE FUNCTION match_omega_to_leads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Match quotes to leads by exact phone match (using phone_e164)
  UPDATE omega_quotes oq
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oq.matched_lead_id IS NULL
    AND oq.customer_phone IS NOT NULL
    AND l.phone_e164 IS NOT NULL
    AND l.is_test = false
    AND REGEXP_REPLACE(oq.customer_phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(l.phone_e164, '[^0-9]', '', 'g');

  -- Match quotes to leads by exact email match
  UPDATE omega_quotes oq
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oq.matched_lead_id IS NULL
    AND oq.customer_email IS NOT NULL
    AND l.email IS NOT NULL
    AND l.is_test = false
    AND LOWER(oq.customer_email) = LOWER(l.email);

  -- Match installs to leads by exact phone match (using phone_e164)
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_phone IS NOT NULL
    AND l.phone_e164 IS NOT NULL
    AND l.is_test = false
    AND REGEXP_REPLACE(oi.customer_phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(l.phone_e164, '[^0-9]', '', 'g');

  -- Match installs to leads by exact email match
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_email IS NOT NULL
    AND l.email IS NOT NULL
    AND l.is_test = false
    AND LOWER(oi.customer_email) = LOWER(l.email);

  -- Match installs to quotes
  UPDATE omega_installs oi
  SET
    matched_quote_id = oq.id
  FROM omega_quotes oq
  WHERE oi.matched_quote_id IS NULL
    AND oi.omega_quote_id IS NOT NULL
    AND oq.omega_quote_id = oi.omega_quote_id;
END;
$$;

-- ============================================================================
-- 2. Fix fn_backfill_lead_revenue() — respect check_close_date_after_created
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_backfill_lead_revenue()
RETURNS TABLE(
  quotes_updated INT,
  installs_updated INT,
  statuses_updated INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_quotes_updated INT := 0;
  v_installs_updated INT := 0;
  v_statuses_updated INT := 0;
BEGIN
  -- 1. Backfill quote_amount from matched omega_quotes
  WITH updated AS (
    UPDATE leads l
    SET quote_amount = oq.total_amount
    FROM omega_quotes oq
    WHERE oq.matched_lead_id = l.id
      AND l.is_test = false
      AND l.quote_amount IS NULL
      AND oq.total_amount IS NOT NULL
    RETURNING l.id
  )
  SELECT COUNT(*)::INT INTO v_quotes_updated FROM updated;

  -- 2. Backfill revenue_amount + close_date from matched omega_installs
  -- Only set close_date when install_date >= created_at (respects check constraint)
  WITH updated AS (
    UPDATE leads l
    SET
      revenue_amount = oi.total_revenue,
      close_date = CASE
        WHEN oi.install_date::DATE >= l.created_at::DATE THEN oi.install_date::DATE
        ELSE l.created_at::DATE
      END
    FROM omega_installs oi
    WHERE oi.matched_lead_id = l.id
      AND l.is_test = false
      AND l.revenue_amount IS NULL
      AND oi.total_revenue IS NOT NULL
      AND oi.status = 'completed'
    RETURNING l.id
  )
  SELECT COUNT(*)::INT INTO v_installs_updated FROM updated;

  -- 3. Update lead status to 'completed' for non-test leads with revenue
  WITH updated AS (
    UPDATE leads l
    SET status = 'completed'
    WHERE l.is_test = false
      AND l.revenue_amount IS NOT NULL
      AND l.revenue_amount > 0
      AND (l.status IS NULL OR l.status NOT IN ('completed', 'cancelled'))
    RETURNING l.id
  )
  SELECT COUNT(*)::INT INTO v_statuses_updated FROM updated;

  RETURN QUERY SELECT v_quotes_updated, v_installs_updated, v_statuses_updated;
END;
$$;

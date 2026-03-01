-- Fix fn_backfill_lead_revenue() to SUM revenue across all matched installs
-- instead of picking one non-deterministically.
--
-- Previously: UPDATE FROM omega_installs picked ONE install per lead when
-- multiple installs matched (repeat customers). Revenue was under-counted.
--
-- Now: Uses a subquery that aggregates total_revenue and picks the latest
-- install_date per lead, so repeat customers get their full revenue credited.

SET search_path = public, extensions;

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
  -- Aggregate: SUM revenue across all completed installs for each lead,
  -- and use the latest install_date as close_date.
  WITH install_agg AS (
    SELECT
      matched_lead_id,
      SUM(total_revenue) AS total_rev,
      MAX(install_date)  AS latest_install_date
    FROM omega_installs
    WHERE matched_lead_id IS NOT NULL
      AND total_revenue IS NOT NULL
      AND status = 'completed'
    GROUP BY matched_lead_id
  ),
  updated AS (
    UPDATE leads l
    SET
      revenue_amount = ia.total_rev,
      close_date = CASE
        WHEN ia.latest_install_date::DATE >= l.created_at::DATE THEN ia.latest_install_date::DATE
        ELSE l.created_at::DATE
      END
    FROM install_agg ia
    WHERE ia.matched_lead_id = l.id
      AND l.is_test = false
      AND l.revenue_amount IS NULL
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

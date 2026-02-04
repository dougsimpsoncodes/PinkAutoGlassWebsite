-- Revenue Backfill Function
-- Populates leads.revenue_amount, leads.quote_amount, leads.status,
-- and leads.close_date from matched omega_installs and omega_quotes.
--
-- Safe to run multiple times (idempotent): only updates leads where
-- the target field is still NULL and a match exists.

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
      AND l.quote_amount IS NULL
      AND oq.total_amount IS NOT NULL
    RETURNING l.id
  )
  SELECT COUNT(*)::INT INTO v_quotes_updated FROM updated;

  -- 2. Backfill revenue_amount + close_date from matched omega_installs
  WITH updated AS (
    UPDATE leads l
    SET
      revenue_amount = oi.total_revenue,
      close_date = oi.install_date::DATE
    FROM omega_installs oi
    WHERE oi.matched_lead_id = l.id
      AND l.revenue_amount IS NULL
      AND oi.total_revenue IS NOT NULL
      AND oi.status = 'completed'
    RETURNING l.id
  )
  SELECT COUNT(*)::INT INTO v_installs_updated FROM updated;

  -- 3. Update lead status to 'completed' for leads with revenue
  WITH updated AS (
    UPDATE leads l
    SET status = 'completed'
    WHERE l.revenue_amount IS NOT NULL
      AND l.revenue_amount > 0
      AND (l.status IS NULL OR l.status NOT IN ('completed', 'cancelled'))
    RETURNING l.id
  )
  SELECT COUNT(*)::INT INTO v_statuses_updated FROM updated;

  RETURN QUERY SELECT v_quotes_updated, v_installs_updated, v_statuses_updated;
END;
$$;

COMMENT ON FUNCTION fn_backfill_lead_revenue IS 'Backfills leads revenue/quote data from matched Omega installs and quotes. Idempotent.';

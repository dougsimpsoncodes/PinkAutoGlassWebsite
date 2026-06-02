-- Market derivation trigger for automated_quotes.
-- Mirrors the pattern already live for leads + ringcentral_calls
-- (20260504_market_triggers_leads_calls.sql).
--
-- Logic: CO plate state → colorado, AZ plate state → arizona.
-- The form's service-area gate already blocks non-CO/AZ plate states,
-- so this covers all live quotes. NULL is intentional when state is absent
-- (YMM quotes that skip plate lookup) — filtered to "all markets" in admin.

CREATE OR REPLACE FUNCTION public.derive_quote_market(p_state TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN upper(trim(p_state)) = 'CO' THEN 'colorado'
    WHEN upper(trim(p_state)) = 'AZ' THEN 'arizona'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.set_quote_market_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only derive when market is not explicitly supplied
  IF NEW.market IS NULL THEN
    NEW.market := public.derive_quote_market(NEW.state);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_quote_market ON public.automated_quotes;
CREATE TRIGGER trg_set_quote_market
  BEFORE INSERT OR UPDATE ON public.automated_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_quote_market_trigger();

-- Backfill existing null-market rows from state column
UPDATE public.automated_quotes
SET market = public.derive_quote_market(state)
WHERE market IS NULL
  AND state IS NOT NULL
  AND public.derive_quote_market(state) IS NOT NULL;

COMMENT ON FUNCTION public.derive_quote_market(TEXT) IS
  'Derives market (colorado|arizona) from plate state. CO→colorado, AZ→arizona, else NULL.';

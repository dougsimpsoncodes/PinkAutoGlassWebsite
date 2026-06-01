-- Update fn_quoter_funnel to recognise the new 'quote_priced' event_type.
--
-- Phase-0 (2026-06-01): tracking.ts now writes event_type='quote_priced' for
-- the price-shown diagnostic step so that every existing form_submit counter
-- across analytics surfaces is unaffected.  The funnel's sig_priced signal must
-- be updated to detect the new type; a legacy fallback covers rows written before
-- this migration.
--
-- sig_booked (form_submit + stage=booked) is unchanged because the booking step
-- still fires as a real form_submit.

CREATE OR REPLACE FUNCTION public.fn_quoter_funnel(
  range_start  timestamptz,
  range_end    timestamptz,
  exclude_test boolean     DEFAULT true,
  p_market     text        DEFAULT 'all'
)
RETURNS TABLE (
  source  text,
  stage   text,
  cnt     bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      us.session_id,
      CASE
        WHEN us.gclid IS NOT NULL OR lower(us.utm_source) = 'google'       THEN 'Google'
        WHEN us.msclkid IS NOT NULL OR lower(us.utm_source) IN ('bing','microsoft') THEN 'Microsoft'
        WHEN COALESCE(us.utm_source, '') <> ''                             THEN us.utm_source
        WHEN COALESCE(us.referrer, '') <> ''                               THEN 'Organic'
        ELSE 'Direct'
      END AS source
    FROM public.user_sessions us
    WHERE us.started_at >= range_start
      AND us.started_at <  range_end
      AND (NOT exclude_test OR us.is_test = false)
      AND (p_market = 'all' OR us.market = p_market)
  ),
  signals AS (
    SELECT
      b.session_id,
      b.source,
      EXISTS (
        SELECT 1 FROM public.page_views pv
        WHERE pv.session_id = b.session_id
          AND (pv.page_path = '/' OR pv.page_path LIKE '/quote%')
      ) AS sig_landed,
      EXISTS (
        SELECT 1 FROM public.analytics_events ae
        WHERE ae.session_id = b.session_id
          AND ae.event_name IN ('quote_attempt_plate','quote_attempt_vin','quote_attempt_ymm')
      ) AS sig_started,
      EXISTS (
        SELECT 1 FROM public.conversion_events ce
        WHERE ce.session_id = b.session_id
          -- Phase-0: new rows use event_type='quote_priced'; legacy rows used
          -- event_type='form_submit' AND metadata->>'stage'='priced'.
          AND (
            ce.event_type = 'quote_priced'
            OR (ce.event_type = 'form_submit' AND ce.metadata->>'stage' = 'priced')
          )
      ) AS sig_priced,
      EXISTS (
        SELECT 1 FROM public.conversion_events ce
        WHERE ce.session_id = b.session_id
          AND ce.event_type = 'form_submit'
          AND ce.metadata->>'stage' = 'booked'
      ) AS sig_booked
    FROM base b
  ),
  reached AS (
    SELECT
      session_id, source,
      TRUE                                                    AS r_traffic,
      (sig_landed OR sig_started OR sig_priced OR sig_booked) AS r_landed,
      (sig_started OR sig_priced OR sig_booked)               AS r_started,
      (sig_priced OR sig_booked)                              AS r_priced,
      sig_booked                                              AS r_booked
    FROM signals
  )
  SELECT source, 'traffic_source'::text AS stage, count(*)::bigint AS cnt
    FROM reached WHERE r_traffic GROUP BY source
  UNION ALL
  SELECT source, 'landed_quoter'::text, count(*)::bigint
    FROM reached WHERE r_landed GROUP BY source
  UNION ALL
  SELECT source, 'started_quote'::text, count(*)::bigint
    FROM reached WHERE r_started GROUP BY source
  UNION ALL
  SELECT source, 'price_shown'::text, count(*)::bigint
    FROM reached WHERE r_priced GROUP BY source
  UNION ALL
  SELECT source, 'booked'::text, count(*)::bigint
    FROM reached WHERE r_booked GROUP BY source
  ORDER BY source, stage;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) TO service_role;

COMMENT ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) IS
  'Quoter conversion funnel. Returns (source, stage, cnt). Stages: traffic_source, landed_quoter, started_quote, price_shown, booked. price_shown detects quote_priced event_type (Phase-0) with form_submit+stage=priced legacy fallback.';

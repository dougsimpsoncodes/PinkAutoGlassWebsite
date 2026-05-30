-- Quoter funnel aggregation function.
--
-- Returns one row per (source, stage, count) so the admin page never
-- touches raw session rows.  Funnel stages:
--
--   traffic_source  — every session in range, classified by source
--   landed_quoter   — sessions with a page_view on / or /quote/*
--   started_quote   — sessions with an analytics_event named
--                     quote_attempt_plate / quote_attempt_vin / quote_attempt_ymm
--   price_shown     — sessions with a conversion_event (event_type='form_submit',
--                     metadata->>'stage'='priced')
--   booked          — sessions with a conversion_event (event_type='form_submit',
--                     metadata->>'stage'='booked')
--
-- Source taxonomy (checked in priority order):
--   Google     — gclid IS NOT NULL  OR  lower(utm_source) = 'google'
--   Microsoft  — msclkid IS NOT NULL OR lower(utm_source) IN ('bing','microsoft')
--   <utm>      — any other non-empty utm_source  → that value verbatim
--   Organic    — referrer IS NOT NULL and not blank
--   Direct     — everything else
--
-- Parameters:
--   range_start  timestamptz  — inclusive lower bound (user_sessions.started_at)
--   range_end    timestamptz  — exclusive upper bound
--   exclude_test boolean      — when true, skip sessions where is_test = true
--   p_market     text         — 'all', 'colorado', or 'arizona' (matches market column)
--
-- NOTE: exclude_test filters only on user_sessions.is_test.  analytics_events /
-- conversion_events / page_views do not have an is_test column; they are
-- implicitly filtered by joining on session_id (the session row is excluded
-- upstream, so no child events survive).

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
-- PL/pgSQL OUT-parameter names (source, stage, cnt) collide with CTE column
-- aliases of the same name.  This directive resolves all ambiguous references
-- to the column rather than the variable, which is the correct behaviour.
#variable_conflict use_column
BEGIN
  RETURN QUERY
  WITH base AS (
    -- Base: all sessions in range after test exclusion and market filter,
    -- with source classified once.
    SELECT
      us.session_id,
      CASE
        WHEN us.gclid IS NOT NULL
          OR lower(us.utm_source) = 'google'
          THEN 'Google'
        WHEN us.msclkid IS NOT NULL
          OR lower(us.utm_source) IN ('bing', 'microsoft')
          THEN 'Microsoft'
        WHEN COALESCE(us.utm_source, '') <> ''
          THEN us.utm_source
        WHEN COALESCE(us.referrer, '') <> ''
          THEN 'Organic'
        ELSE 'Direct'
      END AS source
    FROM public.user_sessions us
    WHERE us.started_at >= range_start
      AND us.started_at <  range_end
      AND (NOT exclude_test OR us.is_test = false)
      AND (p_market = 'all' OR us.market = p_market)
  ),

  -- Per-session RAW signal for each funnel step. Each comes from an INDEPENDENT
  -- event source, so a session can have a downstream signal while missing an
  -- upstream one (e.g. the fire-and-forget quote_attempt diagnostic fails to
  -- write but the priced conversion records). We reconcile that below.
  --   sig_landed  — page_view on the quoter surface (homepage '/' or '/quote*').
  --                 AutomatedQuoteForm mounts at src/app/page.tsx ('/') and
  --                 src/app/quote/page.tsx ('/quote').
  --   sig_started — a quote_attempt_* analytics event.
  --   sig_priced  — form_submit conversion with metadata.stage = 'priced'.
  --   sig_booked  — form_submit conversion with metadata.stage = 'booked'.
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
          AND ae.event_name IN (
            'quote_attempt_plate',
            'quote_attempt_vin',
            'quote_attempt_ymm'
          )
      ) AS sig_started,
      EXISTS (
        SELECT 1 FROM public.conversion_events ce
        WHERE ce.session_id = b.session_id
          AND ce.event_type = 'form_submit'
          AND ce.metadata->>'stage' = 'priced'
      ) AS sig_priced,
      EXISTS (
        SELECT 1 FROM public.conversion_events ce
        WHERE ce.session_id = b.session_id
          AND ce.event_type = 'form_submit'
          AND ce.metadata->>'stage' = 'booked'
      ) AS sig_booked
    FROM base b
  ),

  -- MONOTONIC "reached" flags. Reaching a stage in the auto-quoter flow
  -- necessarily implies reaching every shallower stage (you cannot be priced
  -- without starting a quote; requestPrice() is only ever called from the three
  -- lookup handlers, each of which is the quote_attempt). So a deeper signal
  -- back-fills the shallower stages. This makes the funnel monotonic BY
  -- CONSTRUCTION (traffic >= landed >= started >= priced >= booked) and immune
  -- to a missing upstream telemetry event.
  reached AS (
    SELECT
      session_id,
      source,
      TRUE                                                    AS r_traffic,
      (sig_landed OR sig_started OR sig_priced OR sig_booked) AS r_landed,
      (sig_started OR sig_priced OR sig_booked)               AS r_started,
      (sig_priced OR sig_booked)                              AS r_priced,
      sig_booked                                              AS r_booked
    FROM signals
  )

  -- One (source, stage, cnt) row per stage. cnt = sessions that REACHED the
  -- stage (cumulative), so the funnel only narrows downward.
  -- NOTE on 'booked': counted from conversion_events, which undercounts today
  -- due to a known per-session dedup bug (first form_submit per session wins,
  -- so a 'booked' after a 'priced' in the same session is suppressed). The TRUE
  -- booking total is fetched separately from automated_quote_bookings in the
  -- API route and surfaced as a data-quality delta on the page.
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

-- Grant execute to service_role only; anon/authenticated are blocked.
REVOKE ALL ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) TO service_role;

COMMENT ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) IS
  'Quoter conversion funnel aggregation. Returns (source, stage, cnt) rows for the admin dashboard. Stages: traffic_source, landed_quoter, started_quote, price_shown, booked. See migration comments for stage definitions and known data-quality notes.';

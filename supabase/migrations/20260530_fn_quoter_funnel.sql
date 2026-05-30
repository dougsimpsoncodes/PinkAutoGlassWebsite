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
BEGIN
  RETURN QUERY
  WITH sessions AS (
    -- Base: all sessions in range after test exclusion and market filter.
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

  -- Stage 1: Traffic Source — every session
  stage_traffic AS (
    SELECT source, 'traffic_source' AS stage, count(*) AS cnt
    FROM sessions
    GROUP BY source
  ),

  -- Stage 2: Landed on Quoter — has a page_view on the quoter surface
  --   homepage ('/')  or  any /quote path
  --   AutomatedQuoteForm mounts at src/app/page.tsx (→ path '/')
  --   and src/app/quote/page.tsx (→ path '/quote').
  stage_landed AS (
    SELECT s.source, 'landed_quoter' AS stage, count(DISTINCT s.session_id) AS cnt
    FROM sessions s
    WHERE EXISTS (
      SELECT 1
      FROM public.page_views pv
      WHERE pv.session_id = s.session_id
        AND (pv.page_path = '/' OR pv.page_path LIKE '/quote%')
    )
    GROUP BY s.source
  ),

  -- Stage 3: Started a Quote — has a quote_attempt_* analytics event
  stage_started AS (
    SELECT s.source, 'started_quote' AS stage, count(DISTINCT s.session_id) AS cnt
    FROM sessions s
    WHERE EXISTS (
      SELECT 1
      FROM public.analytics_events ae
      WHERE ae.session_id = s.session_id
        AND ae.event_name IN (
          'quote_attempt_plate',
          'quote_attempt_vin',
          'quote_attempt_ymm'
        )
    )
    GROUP BY s.source
  ),

  -- Stage 4: Price Shown — form_submit conversion with stage='priced'
  --   trackFormSubmission('quote_form', {stage:'priced'}) writes:
  --     event_type = 'form_submit', metadata = {stage:'priced', ...}
  stage_priced AS (
    SELECT s.source, 'price_shown' AS stage, count(DISTINCT s.session_id) AS cnt
    FROM sessions s
    WHERE EXISTS (
      SELECT 1
      FROM public.conversion_events ce
      WHERE ce.session_id = s.session_id
        AND ce.event_type = 'form_submit'
        AND ce.metadata->>'stage' = 'priced'
    )
    GROUP BY s.source
  ),

  -- Stage 5: Booked — form_submit conversion with stage='booked'
  --   trackFormSubmission('quote_form', {stage:'booked'}) in QuoteBookingForm
  --   NOTE: This undercounts today due to a known dedup bug (first form_submit
  --   per session wins — so if 'priced' fired first, 'booked' is suppressed).
  --   The true booking total must be fetched separately from automated_quote_bookings.
  stage_booked AS (
    SELECT s.source, 'booked' AS stage, count(DISTINCT s.session_id) AS cnt
    FROM sessions s
    WHERE EXISTS (
      SELECT 1
      FROM public.conversion_events ce
      WHERE ce.session_id = s.session_id
        AND ce.event_type = 'form_submit'
        AND ce.metadata->>'stage' = 'booked'
    )
    GROUP BY s.source
  )

  SELECT source, stage, cnt FROM stage_traffic
  UNION ALL
  SELECT source, stage, cnt FROM stage_landed
  UNION ALL
  SELECT source, stage, cnt FROM stage_started
  UNION ALL
  SELECT source, stage, cnt FROM stage_priced
  UNION ALL
  SELECT source, stage, cnt FROM stage_booked
  ORDER BY source, stage;
END;
$$;

-- Grant execute to service_role only; anon/authenticated are blocked.
REVOKE ALL ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) TO service_role;

COMMENT ON FUNCTION public.fn_quoter_funnel(timestamptz, timestamptz, boolean, text) IS
  'Quoter conversion funnel aggregation. Returns (source, stage, cnt) rows for the admin dashboard. Stages: traffic_source, landed_quoter, started_quote, price_shown, booked. See migration comments for stage definitions and known data-quality notes.';

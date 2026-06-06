-- Keep internal QA/smoke traffic out of real website analytics.
-- user_sessions already has is_test; raw child event tables need the same flag
-- so historical/test rows can be tagged and admin reports can filter without
-- relying on fragile string-pattern exclusions.

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

ALTER TABLE public.conversion_events
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_page_views_not_test
  ON public.page_views (created_at DESC) WHERE is_test = false;

CREATE INDEX IF NOT EXISTS idx_conversion_events_not_test
  ON public.conversion_events (created_at DESC) WHERE is_test = false;

CREATE INDEX IF NOT EXISTS idx_analytics_events_not_test
  ON public.analytics_events (created_at DESC) WHERE is_test = false;

CREATE INDEX IF NOT EXISTS idx_page_views_session_not_test
  ON public.page_views (session_id) WHERE is_test = false;

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_not_test
  ON public.conversion_events (session_id) WHERE is_test = false;

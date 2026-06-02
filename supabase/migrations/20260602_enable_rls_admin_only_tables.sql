-- Enable RLS on admin-only tables that were flagged by Supabase linter.
-- All 6 tables are accessed exclusively via the service role key (admin routes
-- and cron jobs). Service role bypasses RLS automatically, so no policies are
-- needed — enabling RLS with no policies simply closes off anon/public access.

ALTER TABLE public.request_context    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gridscope_scans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gridscope_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_reviews_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omega_data_flags   ENABLE ROW LEVEL SECURITY;

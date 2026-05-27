-- Attribution health snapshots — lock to service role only.
-- The original 20260502203213_create_attribution_health_snapshots.sql shipped
-- without RLS, so the public schema row remained accessible to anon and
-- authenticated clients. Codex review flagged this as P2 on 2026-05-27.
-- The cron route writes via SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so denying anon/authenticated does not break any production callers.

ALTER TABLE public.attribution_health_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_attribution_health_snapshots
  ON public.attribution_health_snapshots;

CREATE POLICY deny_anon_attribution_health_snapshots
  ON public.attribution_health_snapshots
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Add is_test flag to user_sessions so test/dev traffic can be excluded from
-- funnel reports. Mirrors the pattern in 20260530_add_is_test_to_quotes_bookings.sql.
--
-- All existing rows default to false (real traffic).  Tagging known tester
-- sessions is a prod-specific data step that must be run separately against
-- production — that backfill is NOT included here (no prod data ops).
--
-- Until the backfill is run, exclude_test=true in fn_quoter_funnel filters
-- nothing historically.  The migration is still applied now so the column
-- exists and new sessions can be tagged going forward.

ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

-- Partial index so "real-only" reporting queries stay fast.
CREATE INDEX IF NOT EXISTS idx_user_sessions_not_test
  ON public.user_sessions (started_at DESC) WHERE is_test = false;

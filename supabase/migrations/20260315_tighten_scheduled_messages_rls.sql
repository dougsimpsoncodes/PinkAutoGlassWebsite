-- Remove overly permissive anon RLS policies on scheduled_messages.
-- Scheduler now uses service_role key internally, so anon access is unnecessary.
-- The service role full-access policy (FOR ALL USING true) remains.

DROP POLICY IF EXISTS "Anon can insert scheduled_messages" ON scheduled_messages;
DROP POLICY IF EXISTS "Anon can read scheduled_messages" ON scheduled_messages;
DROP POLICY IF EXISTS "Anon can update scheduled_messages" ON scheduled_messages;

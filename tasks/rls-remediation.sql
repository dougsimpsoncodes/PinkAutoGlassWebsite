-- =============================================================================
-- RLS REMEDIATION — COMPLETED Feb 7 2026
--
-- WHAT WE FOUND:
--   RLS was already ENABLED on all tables, but dangerous POLICIES existed:
--   1. admin_users had a {public} ALL policy (qual: true) — exposed password hashes
--   2. scheduled_messages had anon SELECT + UPDATE policies — exposed drip data
--   3. scheduled_messages had a {public} ALL policy — wide open
--
-- WHAT WE FIXED (executed via Supabase Management API):
--   1. Dropped "Service role has full access to admin users" (roles: {public})
--   2. Dropped "Anon can read scheduled_messages"
--   3. Dropped "Anon can update scheduled_messages"
--   4. Replaced {public} ALL on scheduled_messages with {service_role} only
--
-- VERIFIED: admin_users returns [] with anon key (was returning password hashes)
-- =============================================================================

-- These were the SQL statements executed:

DROP POLICY IF EXISTS "Service role has full access to admin users" ON admin_users;

DROP POLICY IF EXISTS "Anon can read scheduled_messages" ON scheduled_messages;
DROP POLICY IF EXISTS "Anon can update scheduled_messages" ON scheduled_messages;

DROP POLICY IF EXISTS "Service role full access on scheduled_messages" ON scheduled_messages;
CREATE POLICY "Service role full access on scheduled_messages"
  ON scheduled_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================================
-- REMAINING POLICIES (verified correct):
--
-- admin_users:     service_role ALL only
-- leads:           anon INSERT (via fn_insert_lead RPC), anon SELECT blocked (qual: false)
-- scheduled_msgs:  anon INSERT (drip scheduler), service_role ALL
-- analytics/events: anon INSERT, service_role ALL
-- vehicle_makes:   anon SELECT (public quote form data)
-- vehicle_models:  anon SELECT (public quote form data)
-- All other tables: service_role only (no anon access)
-- =============================================================================

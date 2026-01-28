-- Fix missing GRANTs for analytics tracking tables
-- Context: Client-side inserts with anon key were returning 401 Unauthorized
-- Root cause: Postgres privileges were not granted to role `anon` on these tables
-- Note: RLS policies exist, but PostgREST also requires table-level privileges

BEGIN;

-- Ensure anon can use the public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Explicitly grant required privileges for client-side tracking
GRANT SELECT, INSERT ON TABLE public.user_sessions TO anon;
GRANT INSERT ON TABLE public.page_views TO anon;
GRANT INSERT ON TABLE public.conversion_events TO anon;
GRANT INSERT ON TABLE public.analytics_events TO anon;

-- Optional: allow future upsert path on user_sessions from the client
-- Upsert may issue UPDATE on conflict target, so we grant UPDATE as well
GRANT UPDATE ON TABLE public.user_sessions TO anon;

-- Sequences: these tables use UUID defaults, but grant is harmless/idempotent
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- For good measure, grant to authenticated as well if ever used from logged-in clients
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_sessions TO authenticated;
GRANT INSERT ON TABLE public.page_views TO authenticated;
GRANT INSERT ON TABLE public.conversion_events TO authenticated;
GRANT INSERT ON TABLE public.analytics_events TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;

-- Verification queries:
-- SELECT grantee, privilege_type, table_name
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
--   AND table_name IN ('user_sessions','page_views','conversion_events','analytics_events')
-- ORDER BY table_name, grantee, privilege_type;


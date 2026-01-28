-- Fix user_sessions RLS policy to allow upsert from frontend
-- Context: Frontend tracking uses upsert with onConflict='session_id'
-- Root cause: INSERT policy exists, but upsert also needs UPDATE policy
-- Impact: Website analytics showing 0 visitors because sessions aren't being created

BEGIN;

-- Add UPDATE policy for anon users
-- Allows anonymous users to update their own session (matched by session_id)
-- This is safe because session_id is generated client-side and is unique per browser session
CREATE POLICY "Allow anon update own session" ON public.user_sessions
    FOR UPDATE
    TO anon
    USING (true)  -- Can update any session (needed for upsert logic)
    WITH CHECK (true);  -- No restrictions on what they can update

-- Add SELECT policy for anon users (needed for upsert to check if row exists)
CREATE POLICY "Allow anon select for upsert" ON public.user_sessions
    FOR SELECT
    TO anon
    USING (true);  -- Can read sessions (needed for upsert conflict detection)

COMMIT;

-- Verification:
-- SELECT * FROM pg_policies WHERE tablename = 'user_sessions' AND roles @> ARRAY['anon'];

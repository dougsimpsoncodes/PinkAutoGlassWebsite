-- Add unique constraint on session_id for upsert onConflict to work
-- The 409 Conflict error occurs because PostgreSQL needs a unique constraint
-- on the column specified in onConflict for upsert to work properly
-- Created: 2025-12-10

BEGIN;

-- Add unique constraint on session_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.user_sessions'::regclass
        AND conname = 'user_sessions_session_id_key'
    ) THEN
        ALTER TABLE public.user_sessions
        ADD CONSTRAINT user_sessions_session_id_key UNIQUE (session_id);
    END IF;
END $$;

COMMIT;

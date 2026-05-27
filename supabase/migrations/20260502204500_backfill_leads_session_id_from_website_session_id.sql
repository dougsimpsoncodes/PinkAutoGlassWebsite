-- Backfill legacy leads.website_session_id into leads.session_id where the live field is still empty.
-- Safe/idempotent first step in the expand/contract retirement path.

UPDATE public.leads
SET session_id = website_session_id
WHERE session_id IS NULL
  AND website_session_id IS NOT NULL;

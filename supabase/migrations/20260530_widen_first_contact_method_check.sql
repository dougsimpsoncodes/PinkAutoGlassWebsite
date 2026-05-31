-- Widen leads.check_first_contact_method to include 'sms' so the migration
-- history matches PRODUCTION reality.
--
-- Background (F05 — tasks/2026-05-30-reporting-consistency-audit.md):
-- Production was widened out-of-band and already allows ('call','form','sms')
-- (verified 2026-05-30 via the Supabase Management API; 79 real 'sms' leads
-- exist). But the repo's last constraint migration
-- (20251106_restore_utm_fields_to_leads.sql) still declared only
-- ('call','form'). A fresh DB rebuild or a staging reset from migration files
-- would therefore re-impose ('call','form') and SILENTLY REJECT every inbound
-- SMS lead. This migration makes the file history match the live schema.
--
-- Idempotent: drop-if-exists + re-add. On production this is a no-op (the
-- constraint already has this exact definition); on a fresh/stale DB it fixes
-- the rule.

ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS check_first_contact_method;

ALTER TABLE public.leads
  ADD CONSTRAINT check_first_contact_method
  CHECK (first_contact_method = ANY (ARRAY['call'::text, 'form'::text, 'sms'::text]));

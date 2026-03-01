-- Add a partial unique index on phone_e164 for non-test leads.
-- This prevents the race condition where a form submit and the cron
-- both observe "no lead" and both insert for the same phone.
--
-- Test leads (is_test = true) are excluded — they can have duplicates
-- since they're filtered out of all reporting.
-- Leads with NULL phone_e164 are excluded (some legacy leads lack it).

CREATE UNIQUE INDEX IF NOT EXISTS leads_phone_e164_non_test_unique
  ON leads (phone_e164)
  WHERE is_test = false AND phone_e164 IS NOT NULL;

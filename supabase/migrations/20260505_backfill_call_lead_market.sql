-- Backfill market on call-type leads from their originating ringcentral_calls row.
--
-- Background: callLeadSync.ts created lead rows for each unique caller, but never
-- carried the call's market over (the SELECT didn't include to_number, and the
-- BEFORE INSERT trigger derive_lead_market(state, zip, utm_source) had no signal
-- to work with — sync'd call leads have null state/zip/utm). Result: 43 of last
-- 7 days' call leads showed only in 'All Markets', not in Denver/Phoenix.
--
-- This migration matches each NULL-market call lead to its most recent inbound
-- call by normalized phone digits (lead.phone_e164 = call.from_number) and
-- copies the call's market over.
--
-- Idempotent: only updates rows where market IS NULL.

UPDATE leads l
SET market = c.call_market
FROM (
  SELECT DISTINCT ON (regexp_replace(coalesce(rc.from_number,''), '\D','','g'))
    regexp_replace(coalesce(rc.from_number,''), '\D','','g') AS from_digits,
    rc.market AS call_market
  FROM ringcentral_calls rc
  WHERE rc.direction = 'Inbound'
    AND rc.market IS NOT NULL
    AND coalesce(rc.from_number,'') <> ''
  ORDER BY regexp_replace(coalesce(rc.from_number,''), '\D','','g'), rc.start_time DESC
) c
WHERE l.is_test = false
  AND l.first_contact_method = 'call'
  AND l.market IS NULL
  AND regexp_replace(coalesce(l.phone_e164,''), '\D','','g') = c.from_digits;

-- Allow the canonical resolver's deterministic Microsoft method on ringcentral_calls.
--
-- Why: the 2026-04-14 constraint expansion added `google_call_view` and
-- `direct_match_conflict` but missed `microsoft_uploaded_call`, so backfills and
-- cron writes fail with check_attribution_method violations for those rows.

ALTER TABLE ringcentral_calls
DROP CONSTRAINT IF EXISTS check_attribution_method;

ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_attribution_method
CHECK (attribution_method IS NULL OR attribution_method IN (
  'google_call_view',
  'microsoft_uploaded_call',
  'direct_match',
  'direct_match_conflict',
  'time_correlation',
  'unknown'
));

COMMENT ON COLUMN ringcentral_calls.attribution_method IS
  'Resolver-assigned attribution method. Priority order (high→low): google_call_view > microsoft_uploaded_call > direct_match > direct_match_conflict > unknown. time_correlation is legacy and is no longer written by the canonical resolver — it remains in the allowlist so historical rows continue to validate.';

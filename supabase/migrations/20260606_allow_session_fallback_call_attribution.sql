-- Allow lower-confidence session fallback attribution on RingCentral calls.
--
-- Direct Google/Microsoft call evidence and direct phone_click matches remain
-- higher priority in callAttribution.ts. session_fallback is used only when an
-- otherwise unknown inbound call lines up with a recent paid search session and
-- no conflicting platform evidence is present.

ALTER TABLE ringcentral_calls
DROP CONSTRAINT IF EXISTS check_attribution_method;

ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_attribution_method
CHECK (attribution_method IS NULL OR attribution_method IN (
  'google_call_view',
  'microsoft_uploaded_call',
  'direct_match',
  'direct_match_conflict',
  'session_fallback',
  'time_correlation',
  'unknown'
));

COMMENT ON COLUMN ringcentral_calls.attribution_method IS
  'Resolver-assigned attribution method. Priority order (high→low): google_call_view > microsoft_uploaded_call > direct_match > direct_match_conflict > session_fallback > unknown. time_correlation is legacy and remains in the allowlist for historical rows.';

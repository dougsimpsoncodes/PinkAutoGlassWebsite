-- Expand ringcentral_calls attribution constraints to support the canonical resolver
--
-- Two changes:
--
-- 1. attribution_method: add 'google_call_view' (Rule 1, deterministic) and
--    'direct_match_conflict' (Rule 2 multi-platform conflict in 5-min window).
--    Keeps 'time_correlation' for backward compatibility with historical rows;
--    the canonical resolver no longer writes it.
--
-- 2. ad_platform: add 'google_organic', 'microsoft_organic', 'facebook' so the
--    ringcentral_calls allowlist matches what leads.check_leads_ad_platform
--    already permits (added 2026-01-02 in 20260102_update_ad_platform_constraint.sql).
--    Pure addition; nothing currently writes these values to ringcentral_calls,
--    but the schema asymmetry has been a known landmine and this fixes it.
--
-- Safe: pure constraint expansion. No existing data is touched.

-- ─── attribution_method ───────────────────────────────────────────────
ALTER TABLE ringcentral_calls
DROP CONSTRAINT IF EXISTS check_attribution_method;

ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_attribution_method
CHECK (attribution_method IS NULL OR attribution_method IN (
  'google_call_view',         -- Rule 1: Google call_view deterministic match (confidence 100)
  'direct_match',             -- Rule 2: phone_click → call match by time proximity (confidence 80-100)
  'direct_match_conflict',    -- Rule 2 conflict: multi-platform phone_clicks in same 5-min window (confidence 50)
  'time_correlation',         -- LEGACY: kept for historical rows; canonical resolver no longer writes it
  'unknown'                   -- Terminal: no usable evidence
));

COMMENT ON COLUMN ringcentral_calls.attribution_method IS
  'Resolver-assigned attribution method. Priority order (high→low): google_call_view > direct_match > direct_match_conflict > unknown. time_correlation is legacy and is no longer written by the canonical resolver — it remains in the allowlist so historical rows continue to validate.';

-- ─── ad_platform ──────────────────────────────────────────────────────
ALTER TABLE ringcentral_calls
DROP CONSTRAINT IF EXISTS check_ad_platform;

ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_ad_platform
CHECK (ad_platform IS NULL OR ad_platform IN (
  'google',             -- Paid Google Ads (gclid)
  'microsoft',          -- Paid Microsoft/Bing Ads (msclkid)
  'google_organic',     -- Organic Google search (utm_source=google, no gclid)
  'microsoft_organic',  -- Organic Bing search (utm_source=bing, no msclkid)
  'facebook',           -- Facebook traffic (utm_source=facebook)
  'organic',            -- Generic organic (legacy, kept for backwards compat)
  'direct',             -- Direct traffic
  'unknown'             -- Unknown source
));

COMMENT ON COLUMN ringcentral_calls.ad_platform IS
  'Marketing platform that drove the call. Allowed: google, microsoft, google_organic, microsoft_organic, facebook, organic, direct, unknown. Mirrors leads.check_leads_ad_platform allowlist as of 2026-04-14.';

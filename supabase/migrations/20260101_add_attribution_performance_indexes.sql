-- Performance indexes for dashboard attribution queries
-- These indexes optimize the batched session lookups used in unified dashboard

-- Composite index for Google Ads attribution (gclid lookups with time range)
CREATE INDEX IF NOT EXISTS idx_user_sessions_gclid_started_at
ON user_sessions (started_at)
WHERE gclid IS NOT NULL;

-- Composite index for Microsoft Ads attribution (msclkid lookups with time range)
CREATE INDEX IF NOT EXISTS idx_user_sessions_msclkid_started_at
ON user_sessions (started_at)
WHERE msclkid IS NOT NULL;

-- Index for conversion events by platform and time (used in dashboard queries)
CREATE INDEX IF NOT EXISTS idx_conversion_events_gclid_created_at
ON conversion_events (created_at)
WHERE gclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_events_msclkid_created_at
ON conversion_events (created_at)
WHERE msclkid IS NOT NULL;

-- Index for calls by platform and time range
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_start_time_platform
ON ringcentral_calls (start_time, ad_platform)
WHERE direction = 'Inbound';

-- Index for leads by platform and time range
CREATE INDEX IF NOT EXISTS idx_leads_created_at_platform
ON leads (created_at, ad_platform);

COMMENT ON INDEX idx_user_sessions_gclid_started_at IS 'Optimizes Google Ads session attribution lookups';
COMMENT ON INDEX idx_user_sessions_msclkid_started_at IS 'Optimizes Microsoft Ads session attribution lookups';

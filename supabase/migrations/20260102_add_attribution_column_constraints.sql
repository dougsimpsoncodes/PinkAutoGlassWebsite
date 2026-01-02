-- Add column length constraints and indexes for attribution fields
-- These match the Zod validation limits in src/lib/validation.ts

-- =============================================================================
-- COLUMN LENGTH CONSTRAINTS
-- =============================================================================

-- session_id: max 100 chars (matches sessionIdSchema)
-- Format: session_{timestamp}_{random} ~= 30-40 chars
ALTER TABLE leads
ADD CONSTRAINT check_leads_session_id_length
CHECK (website_session_id IS NULL OR LENGTH(website_session_id) <= 100);

-- gclid: max 200 chars (matches gclidSchema)
-- Typical gclid is ~100 chars
ALTER TABLE leads
ADD CONSTRAINT check_leads_gclid_length
CHECK (gclid IS NULL OR LENGTH(gclid) <= 200);

-- msclkid: max 200 chars (matches msclkidSchema)
-- Typical msclkid is ~50 chars
ALTER TABLE leads
ADD CONSTRAINT check_leads_msclkid_length
CHECK (msclkid IS NULL OR LENGTH(msclkid) <= 200);

-- utm_source: max 100 chars (matches utmSourceSchema)
ALTER TABLE leads
ADD CONSTRAINT check_leads_utm_source_length
CHECK (utm_source IS NULL OR LENGTH(utm_source) <= 100);

-- utm_medium: max 100 chars
ALTER TABLE leads
ADD CONSTRAINT check_leads_utm_medium_length
CHECK (utm_medium IS NULL OR LENGTH(utm_medium) <= 100);

-- utm_campaign: max 100 chars
ALTER TABLE leads
ADD CONSTRAINT check_leads_utm_campaign_length
CHECK (utm_campaign IS NULL OR LENGTH(utm_campaign) <= 100);

-- =============================================================================
-- INDEXES FOR ATTRIBUTION LOOKUPS
-- =============================================================================

-- Index on session_id for session→lead attribution lookup
CREATE INDEX IF NOT EXISTS idx_leads_website_session_id
ON leads(website_session_id)
WHERE website_session_id IS NOT NULL;

-- Index on gclid for Google Ads conversion dedup and lookup
CREATE INDEX IF NOT EXISTS idx_leads_gclid
ON leads(gclid)
WHERE gclid IS NOT NULL;

-- Index on msclkid for Microsoft Ads conversion dedup and lookup
CREATE INDEX IF NOT EXISTS idx_leads_msclkid
ON leads(msclkid)
WHERE msclkid IS NOT NULL;

-- Composite index for attribution dashboard queries
-- Covers: "Show me leads by ad_platform this week"
CREATE INDEX IF NOT EXISTS idx_leads_attribution_dashboard
ON leads(ad_platform, created_at DESC)
WHERE ad_platform IS NOT NULL;

-- =============================================================================
-- SIMILAR CONSTRAINTS FOR user_sessions TABLE
-- =============================================================================

-- session_id length on user_sessions
ALTER TABLE user_sessions
ADD CONSTRAINT check_user_sessions_session_id_length
CHECK (session_id IS NULL OR LENGTH(session_id) <= 100);

-- gclid length on user_sessions
ALTER TABLE user_sessions
ADD CONSTRAINT check_user_sessions_gclid_length
CHECK (gclid IS NULL OR LENGTH(gclid) <= 200);

-- msclkid length on user_sessions
ALTER TABLE user_sessions
ADD CONSTRAINT check_user_sessions_msclkid_length
CHECK (msclkid IS NULL OR LENGTH(msclkid) <= 200);

-- Index for session lookup by session_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id
ON user_sessions(session_id)
WHERE session_id IS NOT NULL;

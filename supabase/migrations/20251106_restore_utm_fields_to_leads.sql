-- Restore UTM tracking fields to leads table for proper marketing attribution
-- These were previously removed but are critical for campaign ROI tracking

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255),
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS msclkid TEXT,
ADD COLUMN IF NOT EXISTS website_session_id TEXT;

-- Add indexes for filtering by marketing source
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_leads_gclid ON leads(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_msclkid ON leads(msclkid) WHERE msclkid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(website_session_id) WHERE website_session_id IS NOT NULL;

-- Add ad_platform field for quick platform filtering
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS ad_platform VARCHAR(50);

-- Add constraint for valid platforms
ALTER TABLE leads
ADD CONSTRAINT check_leads_ad_platform
CHECK (ad_platform IS NULL OR ad_platform IN ('google', 'bing', 'organic', 'direct', 'unknown'));

-- Add index for platform
CREATE INDEX IF NOT EXISTS idx_leads_ad_platform ON leads(ad_platform);

-- Add first_contact_method field for unified customer tracking
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS first_contact_method VARCHAR(20) DEFAULT 'form';

-- Add constraint for valid contact methods
ALTER TABLE leads
ADD CONSTRAINT check_first_contact_method
CHECK (first_contact_method IN ('call', 'form'));

-- Comments for documentation
COMMENT ON COLUMN leads.utm_source IS 'Marketing source (e.g., google, bing, facebook)';
COMMENT ON COLUMN leads.utm_medium IS 'Marketing medium (e.g., cpc, organic, email)';
COMMENT ON COLUMN leads.utm_campaign IS 'Campaign identifier for ROI tracking';
COMMENT ON COLUMN leads.gclid IS 'Google Click ID for Google Ads attribution';
COMMENT ON COLUMN leads.msclkid IS 'Microsoft Click ID for Bing Ads attribution';
COMMENT ON COLUMN leads.website_session_id IS 'Links to user_sessions table for full journey tracking';
COMMENT ON COLUMN leads.ad_platform IS 'Platform that drove the lead: google, bing, organic, direct';
COMMENT ON COLUMN leads.first_contact_method IS 'How customer first reached out: call or form (for deduplication)';

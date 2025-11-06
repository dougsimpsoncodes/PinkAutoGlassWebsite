-- Add attribution fields to ringcentral_calls table for marketing funnel analysis
-- This enables tracking which marketing channels (Google Ads, Bing Ads, Organic) drive phone calls

ALTER TABLE ringcentral_calls
ADD COLUMN IF NOT EXISTS attribution_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS attribution_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ad_platform VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN ringcentral_calls.attribution_method IS 'Method used to attribute call: direct_match (website session), time_correlation (impression timing), unknown';
COMMENT ON COLUMN ringcentral_calls.attribution_confidence IS 'Confidence score 0-100: 100 for direct match, 60-80 for time correlation, 0 for unknown';
COMMENT ON COLUMN ringcentral_calls.ad_platform IS 'Marketing platform that drove the call: google, bing, organic, direct, unknown';

-- Create index for faster filtering by platform
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_ad_platform ON ringcentral_calls(ad_platform);
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_attribution_method ON ringcentral_calls(attribution_method);

-- Add check constraint for valid attribution methods
ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_attribution_method
CHECK (attribution_method IS NULL OR attribution_method IN ('direct_match', 'time_correlation', 'unknown'));

-- Add check constraint for valid platforms
ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_ad_platform
CHECK (ad_platform IS NULL OR ad_platform IN ('google', 'bing', 'organic', 'direct', 'unknown'));

-- Add check constraint for confidence range
ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_attribution_confidence
CHECK (attribution_confidence >= 0 AND attribution_confidence <= 100);

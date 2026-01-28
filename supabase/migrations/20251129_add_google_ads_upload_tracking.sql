-- Add tracking for offline conversion uploads to Google Ads
-- This prevents duplicate uploads and enables sync status reporting

ALTER TABLE ringcentral_calls
ADD COLUMN IF NOT EXISTS google_ads_uploaded_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN ringcentral_calls.google_ads_uploaded_at IS 'Timestamp when this call was uploaded to Google Ads as an offline conversion. NULL means not yet uploaded.';

-- Create index for faster filtering of pending uploads
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_google_ads_uploaded
ON ringcentral_calls(google_ads_uploaded_at)
WHERE google_ads_uploaded_at IS NULL;

-- Also add gclid storage to conversion_events if not present
ALTER TABLE conversion_events
ADD COLUMN IF NOT EXISTS gclid VARCHAR(255);

ALTER TABLE conversion_events
ADD COLUMN IF NOT EXISTS msclkid VARCHAR(255);

-- Add comments
COMMENT ON COLUMN conversion_events.gclid IS 'Google Click ID captured from URL parameters for attribution';
COMMENT ON COLUMN conversion_events.msclkid IS 'Microsoft Click ID captured from URL parameters for attribution';

-- Index for faster GCLID lookups during attribution
CREATE INDEX IF NOT EXISTS idx_conversion_events_gclid
ON conversion_events(gclid)
WHERE gclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversion_events_msclkid
ON conversion_events(msclkid)
WHERE msclkid IS NOT NULL;

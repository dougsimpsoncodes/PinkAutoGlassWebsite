-- Add tracking for offline conversion uploads to Microsoft Ads
-- This prevents duplicate uploads and enables sync status reporting

ALTER TABLE ringcentral_calls
ADD COLUMN IF NOT EXISTS microsoft_ads_uploaded_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN ringcentral_calls.microsoft_ads_uploaded_at IS 'Timestamp when this call was uploaded to Microsoft Ads as an offline conversion. NULL means not yet uploaded.';

-- Create index for faster filtering of pending uploads
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_microsoft_ads_uploaded
ON ringcentral_calls(microsoft_ads_uploaded_at)
WHERE microsoft_ads_uploaded_at IS NULL;

-- Fix ad_platform constraint to use 'microsoft' instead of 'bing'
-- This aligns with the canonical platform labels in src/lib/attribution.ts

-- Step 1: Drop the old constraint
ALTER TABLE ringcentral_calls
DROP CONSTRAINT IF EXISTS check_ad_platform;

-- Step 2: Update existing 'bing' records to 'microsoft'
UPDATE ringcentral_calls
SET ad_platform = 'microsoft'
WHERE ad_platform = 'bing';

-- Step 3: Add the new constraint with 'microsoft' instead of 'bing'
ALTER TABLE ringcentral_calls
ADD CONSTRAINT check_ad_platform
CHECK (ad_platform IS NULL OR ad_platform IN ('google', 'microsoft', 'organic', 'direct', 'unknown'));

-- Update the column comment to reflect the change
COMMENT ON COLUMN ringcentral_calls.ad_platform IS 'Marketing platform that drove the call: google, microsoft, organic, direct, unknown';

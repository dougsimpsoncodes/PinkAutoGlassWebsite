-- Update ad_platform check constraint to support new platform labels
-- Changes: 'bing' -> 'microsoft', add 'google_organic', 'microsoft_organic', 'facebook'

-- Step 1: Drop the old constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS check_leads_ad_platform;

-- Step 2: Update existing 'bing' values to 'microsoft' for consistency
UPDATE leads SET ad_platform = 'microsoft' WHERE ad_platform = 'bing';

-- Step 3: Add the updated constraint with new platform labels
-- Valid values:
--   'google'            - Paid Google Ads (has gclid)
--   'microsoft'         - Paid Microsoft/Bing Ads (has msclkid)
--   'google_organic'    - Organic Google search (utm_source=google, no gclid)
--   'microsoft_organic' - Organic Bing search (utm_source=bing, no msclkid)
--   'facebook'          - Facebook traffic (utm_source=facebook)
--   'organic'           - Generic organic (legacy, kept for backwards compat)
--   'direct'            - Direct traffic (legacy, kept for backwards compat)
--   'unknown'           - Unknown source (legacy, kept for backwards compat)
ALTER TABLE leads
ADD CONSTRAINT check_leads_ad_platform
CHECK (ad_platform IS NULL OR ad_platform IN (
  'google',
  'microsoft',
  'google_organic',
  'microsoft_organic',
  'facebook',
  'organic',
  'direct',
  'unknown'
));

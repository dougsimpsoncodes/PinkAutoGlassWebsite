-- Update Google Ads Daily Performance Table
-- Add missing columns for API sync

BEGIN;

-- Add missing columns
ALTER TABLE public.google_ads_daily_performance
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS channel_type TEXT,
ADD COLUMN IF NOT EXISTS interactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversions_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS all_conversions NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS all_conversions_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_through_conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Copy report_date to date column (for backwards compatibility)
UPDATE public.google_ads_daily_performance
SET date = report_date
WHERE date IS NULL;

-- Drop old unique constraint (if it exists)
DO $$
BEGIN
    ALTER TABLE public.google_ads_daily_performance
    DROP CONSTRAINT IF EXISTS google_ads_daily_performance_report_date_campaign_id_key;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add new unique constraint on date + campaign_id
ALTER TABLE public.google_ads_daily_performance
ADD CONSTRAINT google_ads_daily_performance_date_campaign_id_key
UNIQUE (date, campaign_id);

-- Create index on date column
CREATE INDEX IF NOT EXISTS idx_google_ads_daily_date
ON public.google_ads_daily_performance(date DESC);

COMMIT;

-- Call Attribution System
-- Adds tables for Google Ads call conversion tracking, individual call records,
-- and Google Business Profile call metrics.

-- ============================================================
-- Phase 1: Daily call conversion counts by conversion action
-- ============================================================
CREATE TABLE IF NOT EXISTS google_ads_call_conversions (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  conversion_action_id TEXT NOT NULL,
  conversion_action_name TEXT,
  call_conversions NUMERIC(10,2) DEFAULT 0,
  call_conversions_value NUMERIC(12,2) DEFAULT 0,
  sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, campaign_id, conversion_action_id)
);

CREATE INDEX IF NOT EXISTS idx_gads_call_conv_date
  ON google_ads_call_conversions(date);

-- ============================================================
-- Phase 2: Individual call records from Google Ads call_view
-- ============================================================
CREATE TABLE IF NOT EXISTS google_ads_calls (
  id BIGSERIAL PRIMARY KEY,
  resource_name TEXT UNIQUE NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ,
  call_duration_seconds INTEGER DEFAULT 0,
  caller_area_code TEXT,
  caller_country_code TEXT,
  call_status TEXT,
  call_type TEXT,
  call_tracking_display_location TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  ad_group_id TEXT,
  ad_group_name TEXT,
  matched_rc_call_id TEXT,
  match_method TEXT,
  sync_timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gads_calls_start
  ON google_ads_calls(start_date_time);
CREATE INDEX IF NOT EXISTS idx_gads_calls_matched
  ON google_ads_calls(matched_rc_call_id)
  WHERE matched_rc_call_id IS NOT NULL;

-- Reverse reference on ringcentral_calls
ALTER TABLE ringcentral_calls
  ADD COLUMN IF NOT EXISTS google_ads_call_match BOOLEAN DEFAULT false;
ALTER TABLE ringcentral_calls
  ADD COLUMN IF NOT EXISTS google_ads_call_resource_name TEXT;

CREATE INDEX IF NOT EXISTS idx_rc_calls_gads_match
  ON ringcentral_calls(google_ads_call_match)
  WHERE google_ads_call_match = true;

-- ============================================================
-- Phase 3: Google Business Profile call metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS gbp_call_metrics (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  location_name TEXT,
  total_calls INTEGER DEFAULT 0,
  missed_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  calls_under_30s INTEGER DEFAULT 0,
  calls_30s_to_120s INTEGER DEFAULT 0,
  calls_over_120s INTEGER DEFAULT 0,
  sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB,
  UNIQUE(date, location_name)
);

CREATE INDEX IF NOT EXISTS idx_gbp_calls_date
  ON gbp_call_metrics(date);

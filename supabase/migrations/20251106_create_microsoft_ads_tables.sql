-- Microsoft Ads (Bing) performance tracking tables
-- Mirrors Google Ads structure for consistent reporting

-- Daily campaign performance from Microsoft Ads API
CREATE TABLE IF NOT EXISTS microsoft_ads_daily_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  campaign_id BIGINT NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_status TEXT,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost_micros BIGINT DEFAULT 0,
  conversions DECIMAL(10, 2) DEFAULT 0,
  conversion_value_micros BIGINT DEFAULT 0,
  ctr DECIMAL(5, 4),
  average_cpc_micros BIGINT,
  cost DECIMAL(10, 2) GENERATED ALWAYS AS (cost_micros / 1000000.0) STORED,
  channel_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, campaign_id)
);

-- Keyword-level performance from Microsoft Ads API
CREATE TABLE IF NOT EXISTS microsoft_ads_keyword_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  campaign_id BIGINT NOT NULL,
  campaign_name TEXT NOT NULL,
  ad_group_id BIGINT NOT NULL,
  ad_group_name TEXT NOT NULL,
  keyword_id BIGINT NOT NULL,
  keyword_text TEXT NOT NULL,
  match_type TEXT,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost_micros BIGINT DEFAULT 0,
  conversions DECIMAL(10, 2) DEFAULT 0,
  conversion_value_micros BIGINT DEFAULT 0,
  ctr DECIMAL(5, 4),
  average_cpc_micros BIGINT,
  cost DECIMAL(10, 2) GENERATED ALWAYS AS (cost_micros / 1000000.0) STORED,
  quality_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, keyword_id)
);

-- Search terms report (actual queries that triggered ads)
CREATE TABLE IF NOT EXISTS microsoft_ads_search_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  campaign_id BIGINT NOT NULL,
  campaign_name TEXT NOT NULL,
  ad_group_id BIGINT NOT NULL,
  ad_group_name TEXT NOT NULL,
  keyword_id BIGINT,
  keyword_text TEXT,
  search_term TEXT NOT NULL,
  match_type TEXT,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  cost_micros BIGINT DEFAULT 0,
  conversions DECIMAL(10, 2) DEFAULT 0,
  cost DECIMAL(10, 2) GENERATED ALWAYS AS (cost_micros / 1000000.0) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, campaign_id, search_term)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ms_ads_daily_date ON microsoft_ads_daily_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_ms_ads_daily_campaign ON microsoft_ads_daily_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ms_ads_daily_date_campaign ON microsoft_ads_daily_performance(date DESC, campaign_id);

CREATE INDEX IF NOT EXISTS idx_ms_ads_keyword_date ON microsoft_ads_keyword_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_ms_ads_keyword_campaign ON microsoft_ads_keyword_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ms_ads_keyword_keyword ON microsoft_ads_keyword_performance(keyword_id);

CREATE INDEX IF NOT EXISTS idx_ms_ads_search_date ON microsoft_ads_search_terms(date DESC);
CREATE INDEX IF NOT EXISTS idx_ms_ads_search_campaign ON microsoft_ads_search_terms(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ms_ads_search_term ON microsoft_ads_search_terms(search_term);

-- Comments for documentation
COMMENT ON TABLE microsoft_ads_daily_performance IS 'Daily campaign-level performance metrics from Microsoft Advertising API (Bing Ads)';
COMMENT ON TABLE microsoft_ads_keyword_performance IS 'Keyword-level performance metrics from Microsoft Advertising API';
COMMENT ON TABLE microsoft_ads_search_terms IS 'Actual search queries that triggered Microsoft Ads with performance data';

-- Add updated_at trigger for timestamp management
CREATE OR REPLACE FUNCTION update_microsoft_ads_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ms_ads_daily_timestamp
  BEFORE UPDATE ON microsoft_ads_daily_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_microsoft_ads_timestamp();

CREATE TRIGGER update_ms_ads_keyword_timestamp
  BEFORE UPDATE ON microsoft_ads_keyword_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_microsoft_ads_timestamp();

CREATE TRIGGER update_ms_ads_search_timestamp
  BEFORE UPDATE ON microsoft_ads_search_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_microsoft_ads_timestamp();

-- Google Ads Data Storage Schema
-- Stores uploaded CSV data and AI-generated recommendations

-- Store uploaded file metadata
CREATE TABLE IF NOT EXISTS google_ads_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT,
  date_range_start DATE,
  date_range_end DATE,
  report_type TEXT NOT NULL, -- 'campaigns', 'search_terms', 'keywords', etc.
  file_name TEXT NOT NULL,
  file_size INTEGER,
  row_count INTEGER,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT
);

-- Store campaign performance data
CREATE TABLE IF NOT EXISTS google_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  campaign_name TEXT NOT NULL,
  campaign_id TEXT,
  status TEXT,
  campaign_type TEXT,
  budget DECIMAL(10,2),
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  avg_cpc DECIMAL(10,2),
  cost DECIMAL(10,2),
  conversions DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(10,2),
  quality_score DECIMAL(3,1)
);

-- Store search terms data (most important for optimization)
CREATE TABLE IF NOT EXISTS google_ads_search_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  search_term TEXT NOT NULL,
  match_type TEXT,
  campaign_name TEXT,
  ad_group TEXT,
  keyword TEXT,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  avg_cpc DECIMAL(10,2),
  cost DECIMAL(10,2),
  conversions DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(10,2),
  added_as_keyword BOOLEAN DEFAULT false,
  added_as_negative BOOLEAN DEFAULT false
);

-- Store keyword performance
CREATE TABLE IF NOT EXISTS google_ads_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  keyword TEXT NOT NULL,
  match_type TEXT,
  campaign_name TEXT,
  ad_group TEXT,
  quality_score INTEGER,
  expected_ctr TEXT,
  ad_relevance TEXT,
  landing_page_experience TEXT,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  avg_cpc DECIMAL(10,2),
  cost DECIMAL(10,2),
  conversions DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(10,2),
  first_page_cpc DECIMAL(10,2),
  top_of_page_cpc DECIMAL(10,2)
);

-- Store geographic performance
CREATE TABLE IF NOT EXISTS google_ads_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  location_name TEXT NOT NULL,
  location_type TEXT, -- 'City', 'State', 'Country'
  campaign_name TEXT,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  avg_cpc DECIMAL(10,2),
  cost DECIMAL(10,2),
  conversions DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(10,2)
);

-- Store ad schedule performance
CREATE TABLE IF NOT EXISTS google_ads_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  day_of_week TEXT,
  hour_of_day INTEGER,
  campaign_name TEXT,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  avg_cpc DECIMAL(10,2),
  cost DECIMAL(10,2),
  conversions DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(10,2)
);

-- Store device performance
CREATE TABLE IF NOT EXISTS google_ads_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  device TEXT NOT NULL, -- 'Mobile', 'Desktop', 'Tablet'
  campaign_name TEXT,
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  avg_cpc DECIMAL(10,2),
  cost DECIMAL(10,2),
  conversions DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  cost_per_conversion DECIMAL(10,2)
);

-- Store AI-generated optimization recommendations
CREATE TABLE IF NOT EXISTS ads_optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  upload_id UUID REFERENCES google_ads_uploads(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'search_terms', 'bidding', 'schedule', 'geography', 'device', 'ad_copy', 'keywords', 'budget'
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  expected_impact_metric TEXT,
  expected_impact_value DECIMAL(10,2),
  effort TEXT CHECK (effort IN ('low', 'medium', 'high')),
  implementation_steps TEXT[] NOT NULL,
  automation_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented', 'archived')),
  approved_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  results JSONB,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_ads_uploads_created ON google_ads_uploads(created_at DESC);
CREATE INDEX idx_ads_campaigns_upload ON google_ads_campaigns(upload_id);
CREATE INDEX idx_ads_search_terms_upload ON google_ads_search_terms(upload_id);
CREATE INDEX idx_ads_keywords_upload ON google_ads_keywords(upload_id);
CREATE INDEX idx_ads_recommendations_upload ON ads_optimization_recommendations(upload_id);
CREATE INDEX idx_ads_recommendations_status ON ads_optimization_recommendations(status);
CREATE INDEX idx_ads_recommendations_priority ON ads_optimization_recommendations(priority);

-- RLS Policies (admin only)
ALTER TABLE google_ads_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_search_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_optimization_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can do everything on google_ads_uploads" ON google_ads_uploads FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on google_ads_campaigns" ON google_ads_campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on google_ads_search_terms" ON google_ads_search_terms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on google_ads_keywords" ON google_ads_keywords FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on google_ads_locations" ON google_ads_locations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on google_ads_schedule" ON google_ads_schedule FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on google_ads_devices" ON google_ads_devices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can do everything on ads_optimization_recommendations" ON ads_optimization_recommendations FOR ALL USING (auth.role() = 'service_role');

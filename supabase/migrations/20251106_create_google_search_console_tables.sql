-- Google Search Console performance tracking tables
-- Tracks organic search impressions, clicks, and queries for complete funnel analysis

-- Daily page-level performance from Search Console API
CREATE TABLE IF NOT EXISTS google_search_console_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  page_url TEXT NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr DECIMAL(5, 4),
  position DECIMAL(5, 2),
  device_type TEXT, -- DESKTOP, MOBILE, TABLET
  country TEXT DEFAULT 'usa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, page_url, device_type)
);

-- Search query performance (which queries show our site)
CREATE TABLE IF NOT EXISTS google_search_console_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  query TEXT NOT NULL,
  page_url TEXT,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  ctr DECIMAL(5, 4),
  position DECIMAL(5, 2),
  device_type TEXT,
  country TEXT DEFAULT 'usa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, query, page_url, device_type)
);

-- Aggregated daily totals for funnel analysis
CREATE TABLE IF NOT EXISTS google_search_console_daily_totals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_impressions BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  average_ctr DECIMAL(5, 4),
  average_position DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gsc_performance_date ON google_search_console_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_performance_page ON google_search_console_performance(page_url);
CREATE INDEX IF NOT EXISTS idx_gsc_performance_date_page ON google_search_console_performance(date DESC, page_url);

CREATE INDEX IF NOT EXISTS idx_gsc_queries_date ON google_search_console_queries(date DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_query ON google_search_console_queries(query);
CREATE INDEX IF NOT EXISTS idx_gsc_queries_page ON google_search_console_queries(page_url);

CREATE INDEX IF NOT EXISTS idx_gsc_daily_date ON google_search_console_daily_totals(date DESC);

-- Comments for documentation
COMMENT ON TABLE google_search_console_performance IS 'Daily page-level organic search performance from Google Search Console API';
COMMENT ON TABLE google_search_console_queries IS 'Search queries that show site in Google organic results with performance metrics';
COMMENT ON TABLE google_search_console_daily_totals IS 'Aggregated daily totals for funnel reporting (Impressions → Clicks → Unique Customers)';

-- Add updated_at trigger for timestamp management
CREATE OR REPLACE FUNCTION update_gsc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gsc_performance_timestamp
  BEFORE UPDATE ON google_search_console_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_gsc_timestamp();

CREATE TRIGGER update_gsc_queries_timestamp
  BEFORE UPDATE ON google_search_console_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_gsc_timestamp();

CREATE TRIGGER update_gsc_daily_timestamp
  BEFORE UPDATE ON google_search_console_daily_totals
  FOR EACH ROW
  EXECUTE FUNCTION update_gsc_timestamp();

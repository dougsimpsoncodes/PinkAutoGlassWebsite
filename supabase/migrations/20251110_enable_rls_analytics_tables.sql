-- Enable RLS on analytics tables that were missing it
-- These tables store sensitive business data and should not be publicly accessible

-- Google Search Console tables
ALTER TABLE public.google_search_console_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_search_console_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_search_console_daily_totals ENABLE ROW LEVEL SECURITY;

-- Microsoft Ads tables
ALTER TABLE public.microsoft_ads_daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microsoft_ads_keyword_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microsoft_ads_search_terms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS anon_gsc_performance_none ON public.google_search_console_performance;
DROP POLICY IF EXISTS anon_gsc_queries_none ON public.google_search_console_queries;
DROP POLICY IF EXISTS anon_gsc_daily_none ON public.google_search_console_daily_totals;
DROP POLICY IF EXISTS anon_msft_daily_none ON public.microsoft_ads_daily_performance;
DROP POLICY IF EXISTS anon_msft_keyword_none ON public.microsoft_ads_keyword_performance;
DROP POLICY IF EXISTS anon_msft_search_none ON public.microsoft_ads_search_terms;

-- Create policies that deny all public access
-- Only service role (backend) can access these tables
CREATE POLICY anon_gsc_performance_none ON public.google_search_console_performance
  FOR ALL TO anon USING (false);

CREATE POLICY anon_gsc_queries_none ON public.google_search_console_queries
  FOR ALL TO anon USING (false);

CREATE POLICY anon_gsc_daily_none ON public.google_search_console_daily_totals
  FOR ALL TO anon USING (false);

CREATE POLICY anon_msft_daily_none ON public.microsoft_ads_daily_performance
  FOR ALL TO anon USING (false);

CREATE POLICY anon_msft_keyword_none ON public.microsoft_ads_keyword_performance
  FOR ALL TO anon USING (false);

CREATE POLICY anon_msft_search_none ON public.microsoft_ads_search_terms
  FOR ALL TO anon USING (false);

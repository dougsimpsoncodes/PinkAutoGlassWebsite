-- Google Ads & RingCentral Tracking Tables
-- Created: 2025-10-30
-- Purpose: Track Google Ads performance and RingCentral call volume for ROI analysis

BEGIN;

-- ============================================================================
-- GOOGLE ADS DAILY PERFORMANCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.google_ads_daily_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Date for this performance snapshot
    report_date DATE NOT NULL,

    -- Campaign details
    campaign_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    campaign_status TEXT, -- 'ENABLED', 'PAUSED', 'REMOVED'

    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost_micros BIGINT DEFAULT 0, -- Google Ads stores cost in micros (1 million = $1)
    conversions NUMERIC DEFAULT 0,

    -- Calculated metrics (stored for performance)
    ctr NUMERIC, -- click-through rate (clicks / impressions * 100)
    cpc NUMERIC, -- cost per click (cost / clicks)
    cost NUMERIC, -- cost in dollars (cost_micros / 1000000)

    -- Metadata
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(report_date, campaign_id)
);

-- ============================================================================
-- GOOGLE ADS KEYWORD PERFORMANCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.google_ads_keyword_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Date for this performance snapshot
    report_date DATE NOT NULL,

    -- Keyword details
    keyword_id TEXT NOT NULL,
    keyword_text TEXT NOT NULL,
    match_type TEXT, -- 'EXACT', 'PHRASE', 'BROAD'
    campaign_id TEXT NOT NULL,
    campaign_name TEXT,
    ad_group_id TEXT,
    ad_group_name TEXT,

    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost_micros BIGINT DEFAULT 0,
    conversions NUMERIC DEFAULT 0,

    -- Quality metrics
    quality_score INTEGER, -- 1-10

    -- Calculated
    ctr NUMERIC,
    cpc NUMERIC,
    cost NUMERIC,

    -- Metadata
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(report_date, keyword_id)
);

-- ============================================================================
-- GOOGLE ADS SEARCH TERMS (What users actually searched)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.google_ads_search_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Date for this performance snapshot
    report_date DATE NOT NULL,

    -- Search term (actual query user typed)
    search_term TEXT NOT NULL,
    search_term_match_type TEXT,

    -- Matched keyword
    keyword_id TEXT,
    keyword_text TEXT,
    campaign_id TEXT NOT NULL,
    campaign_name TEXT,

    -- Performance
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost_micros BIGINT DEFAULT 0,
    conversions NUMERIC DEFAULT 0,

    -- Calculated
    ctr NUMERIC,
    cost NUMERIC,

    -- Metadata
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(report_date, search_term, campaign_id)
);

-- ============================================================================
-- RINGCENTRAL CALL LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ringcentral_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- RingCentral call details
    call_id TEXT UNIQUE NOT NULL, -- RingCentral's unique call ID
    session_id TEXT, -- RingCentral session ID

    -- Call timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTEGER, -- seconds

    -- Call direction and participants
    direction TEXT NOT NULL, -- 'Inbound', 'Outbound'
    from_number TEXT NOT NULL,
    from_name TEXT,
    to_number TEXT NOT NULL,
    to_name TEXT,

    -- Call result
    result TEXT, -- 'Accepted', 'Missed', 'Voicemail', 'Rejected', 'Reply'
    action TEXT, -- 'Phone Call', 'VoIP Call', etc.

    -- Recording
    recording_id TEXT,
    recording_uri TEXT,
    recording_type TEXT, -- 'Automatic', 'OnDemand'
    recording_content_uri TEXT,

    -- Call quality
    transport TEXT, -- 'PSTN', 'VoIP'

    -- Business context (to be filled manually or via integration)
    lead_quality TEXT, -- 'hot', 'warm', 'cold', 'spam', 'existing_customer'
    notes TEXT,
    quote_given BOOLEAN DEFAULT false,
    quote_value NUMERIC,
    appointment_scheduled BOOLEAN DEFAULT false,
    service_type TEXT, -- 'windshield_repair', 'windshield_replacement', etc.

    -- Attribution (if we can match to a website session)
    website_session_id TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Metadata
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB -- Store full API response for reference
);

-- ============================================================================
-- RINGCENTRAL SMS MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ringcentral_sms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- RingCentral message details
    message_id TEXT UNIQUE NOT NULL,
    conversation_id TEXT, -- Group related messages

    -- Message timing
    message_time TIMESTAMPTZ NOT NULL,

    -- Direction and participants
    direction TEXT NOT NULL, -- 'Inbound', 'Outbound'
    from_number TEXT NOT NULL,
    from_name TEXT,
    to_number TEXT NOT NULL,
    to_name TEXT,

    -- Message content
    subject TEXT,
    message_text TEXT,

    -- Message status
    message_status TEXT, -- 'Sent', 'Delivered', 'DeliveryFailed', 'Received'
    read_status TEXT, -- 'Read', 'Unread'

    -- Attachments
    has_attachments BOOLEAN DEFAULT false,
    attachment_count INTEGER DEFAULT 0,

    -- Business context
    lead_quality TEXT,
    notes TEXT,

    -- Metadata
    sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- ============================================================================
-- ROI DAILY SUMMARY (Pre-calculated for fast dashboard loading)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roi_daily_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL UNIQUE,

    -- Google Ads metrics
    total_impressions INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_ad_spend NUMERIC DEFAULT 0,
    google_ads_conversions NUMERIC DEFAULT 0,

    -- Call metrics
    total_calls INTEGER DEFAULT 0,
    inbound_calls INTEGER DEFAULT 0,
    outbound_calls INTEGER DEFAULT 0,
    answered_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    avg_call_duration INTEGER, -- seconds

    -- SMS metrics
    total_sms INTEGER DEFAULT 0,
    inbound_sms INTEGER DEFAULT 0,
    outbound_sms INTEGER DEFAULT 0,

    -- Business outcomes
    quotes_given INTEGER DEFAULT 0,
    total_quote_value NUMERIC DEFAULT 0,
    appointments_scheduled INTEGER DEFAULT 0,

    -- Calculated ROI metrics
    cost_per_call NUMERIC, -- total_ad_spend / total_calls
    cost_per_click NUMERIC, -- total_ad_spend / total_clicks
    click_through_rate NUMERIC, -- (total_clicks / total_impressions) * 100

    -- Metadata
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Google Ads indexes
CREATE INDEX IF NOT EXISTS idx_google_ads_daily_report_date
    ON public.google_ads_daily_performance(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_google_ads_daily_campaign
    ON public.google_ads_daily_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_daily_sync
    ON public.google_ads_daily_performance(sync_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_google_ads_keyword_report_date
    ON public.google_ads_keyword_performance(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_google_ads_keyword_campaign
    ON public.google_ads_keyword_performance(campaign_id);

CREATE INDEX IF NOT EXISTS idx_google_ads_search_terms_report_date
    ON public.google_ads_search_terms(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_google_ads_search_terms_term
    ON public.google_ads_search_terms(search_term);

-- RingCentral indexes
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_start_time
    ON public.ringcentral_calls(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_direction
    ON public.ringcentral_calls(direction);
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_result
    ON public.ringcentral_calls(result);
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_from_number
    ON public.ringcentral_calls(from_number);
CREATE INDEX IF NOT EXISTS idx_ringcentral_calls_session
    ON public.ringcentral_calls(website_session_id);

CREATE INDEX IF NOT EXISTS idx_ringcentral_sms_time
    ON public.ringcentral_sms(message_time DESC);
CREATE INDEX IF NOT EXISTS idx_ringcentral_sms_conversation
    ON public.ringcentral_sms(conversation_id);

CREATE INDEX IF NOT EXISTS idx_roi_summary_date
    ON public.roi_daily_summary(report_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.google_ads_daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_keyword_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_search_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ringcentral_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ringcentral_sms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_daily_summary ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for API and admin dashboard)
CREATE POLICY "Service role full access google_ads_daily"
    ON public.google_ads_daily_performance
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access google_ads_keyword"
    ON public.google_ads_keyword_performance
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access google_ads_search_terms"
    ON public.google_ads_search_terms
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access ringcentral_calls"
    ON public.ringcentral_calls
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access ringcentral_sms"
    ON public.ringcentral_sms
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access roi_summary"
    ON public.roi_daily_summary
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION: Update ROI Daily Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_roi_daily_summary(target_date DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO public.roi_daily_summary (
        report_date,
        total_impressions,
        total_clicks,
        total_ad_spend,
        google_ads_conversions,
        total_calls,
        inbound_calls,
        outbound_calls,
        answered_calls,
        missed_calls,
        avg_call_duration,
        total_sms,
        inbound_sms,
        outbound_sms,
        quotes_given,
        total_quote_value,
        appointments_scheduled,
        cost_per_call,
        cost_per_click,
        click_through_rate,
        last_updated
    )
    SELECT
        target_date,
        -- Google Ads metrics
        COALESCE(SUM(ga.impressions), 0),
        COALESCE(SUM(ga.clicks), 0),
        COALESCE(SUM(ga.cost), 0),
        COALESCE(SUM(ga.conversions), 0),
        -- Call metrics
        COALESCE(COUNT(DISTINCT c.id), 0),
        COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.direction = 'Inbound'), 0),
        COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.direction = 'Outbound'), 0),
        COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.result = 'Accepted'), 0),
        COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.result = 'Missed'), 0),
        COALESCE(AVG(c.duration) FILTER (WHERE c.duration IS NOT NULL), 0),
        -- SMS metrics
        COALESCE(COUNT(DISTINCT s.id), 0),
        COALESCE(COUNT(DISTINCT s.id) FILTER (WHERE s.direction = 'Inbound'), 0),
        COALESCE(COUNT(DISTINCT s.id) FILTER (WHERE s.direction = 'Outbound'), 0),
        -- Business outcomes
        COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.quote_given = true), 0),
        COALESCE(SUM(c.quote_value), 0),
        COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.appointment_scheduled = true), 0),
        -- Calculated ROI
        CASE
            WHEN COUNT(DISTINCT c.id) > 0 THEN COALESCE(SUM(ga.cost), 0) / COUNT(DISTINCT c.id)
            ELSE 0
        END,
        CASE
            WHEN SUM(ga.clicks) > 0 THEN COALESCE(SUM(ga.cost), 0) / SUM(ga.clicks)
            ELSE 0
        END,
        CASE
            WHEN SUM(ga.impressions) > 0 THEN (SUM(ga.clicks)::NUMERIC / SUM(ga.impressions)::NUMERIC) * 100
            ELSE 0
        END,
        NOW()
    FROM
        google_ads_daily_performance ga
    FULL OUTER JOIN
        ringcentral_calls c ON DATE(c.start_time) = target_date
    FULL OUTER JOIN
        ringcentral_sms s ON DATE(s.message_time) = target_date
    WHERE
        ga.report_date = target_date
    ON CONFLICT (report_date)
    DO UPDATE SET
        total_impressions = EXCLUDED.total_impressions,
        total_clicks = EXCLUDED.total_clicks,
        total_ad_spend = EXCLUDED.total_ad_spend,
        google_ads_conversions = EXCLUDED.google_ads_conversions,
        total_calls = EXCLUDED.total_calls,
        inbound_calls = EXCLUDED.inbound_calls,
        outbound_calls = EXCLUDED.outbound_calls,
        answered_calls = EXCLUDED.answered_calls,
        missed_calls = EXCLUDED.missed_calls,
        avg_call_duration = EXCLUDED.avg_call_duration,
        total_sms = EXCLUDED.total_sms,
        inbound_sms = EXCLUDED.inbound_sms,
        outbound_sms = EXCLUDED.outbound_sms,
        quotes_given = EXCLUDED.quotes_given,
        total_quote_value = EXCLUDED.total_quote_value,
        appointments_scheduled = EXCLUDED.appointments_scheduled,
        cost_per_call = EXCLUDED.cost_per_call,
        cost_per_click = EXCLUDED.cost_per_click,
        click_through_rate = EXCLUDED.click_through_rate,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

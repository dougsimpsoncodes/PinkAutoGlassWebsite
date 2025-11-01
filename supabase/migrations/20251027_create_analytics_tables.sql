-- Analytics Tracking Tables Migration
-- Created: 2025-10-27
-- Purpose: Comprehensive analytics tracking for Pink Auto Glass website

BEGIN;

-- ============================================================================
-- PAGE VIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Session tracking
    session_id TEXT NOT NULL,
    visitor_id TEXT,

    -- Page information
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,

    -- UTM parameters (traffic source attribution)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,

    -- Device & browser
    user_agent TEXT,
    device_type TEXT, -- mobile, desktop, tablet
    browser TEXT,
    os TEXT,

    -- Geographic
    ip_address INET,
    country TEXT,
    region TEXT,
    city TEXT,

    -- Performance metrics
    page_load_time INTEGER, -- milliseconds
    time_on_page INTEGER, -- seconds
    scroll_depth INTEGER, -- percentage

    -- Engagement
    is_bounce BOOLEAN DEFAULT false,
    exit_page BOOLEAN DEFAULT false
);

-- Indexes for page_views
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON public.page_views(utm_source, utm_medium, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON public.page_views(device_type);

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    visitor_id TEXT,

    -- Session timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- seconds

    -- Traffic attribution (first touch)
    landing_page TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,

    -- Session metrics
    page_views_count INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,

    -- Device info
    device_type TEXT,
    browser TEXT,
    os TEXT,

    -- Geographic
    country TEXT,
    region TEXT,
    city TEXT,

    -- Engagement
    is_bounce BOOLEAN DEFAULT false,
    converted BOOLEAN DEFAULT false
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON public.user_sessions(utm_source, utm_medium);
CREATE INDEX IF NOT EXISTS idx_sessions_converted ON public.user_sessions(converted);

-- ============================================================================
-- CONVERSION EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Session tracking
    session_id TEXT NOT NULL,
    visitor_id TEXT,

    -- Conversion type
    event_type TEXT NOT NULL, -- 'phone_click', 'text_click', 'form_submit', 'quote_generated'
    event_category TEXT, -- 'conversion', 'lead_generation'
    event_label TEXT,
    event_value NUMERIC,

    -- Page context
    page_path TEXT NOT NULL,
    button_text TEXT,
    button_location TEXT, -- 'header', 'hero', 'footer', 'sticky'

    -- Attribution (first touch)
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,

    -- Device info
    device_type TEXT,

    -- Additional metadata
    metadata JSONB
);

-- Indexes for conversion_events
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON public.conversion_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_event_type ON public.conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversions_session_id ON public.conversion_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversions_utm_source ON public.conversion_events(utm_source, utm_medium, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_conversions_page_path ON public.conversion_events(page_path);

-- ============================================================================
-- ANALYTICS EVENTS TABLE (General events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Session tracking
    session_id TEXT NOT NULL,
    visitor_id TEXT,

    -- Event details
    event_name TEXT NOT NULL, -- 'scroll_depth', 'form_field_focus', 'vehicle_selected', etc.
    event_category TEXT,
    event_label TEXT,
    event_value NUMERIC,

    -- Page context
    page_path TEXT NOT NULL,

    -- Additional data
    metadata JSONB
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_page_path ON public.analytics_events(page_path);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for tracking)
CREATE POLICY "Allow anon insert page_views" ON public.page_views
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon insert sessions" ON public.user_sessions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon insert conversions" ON public.conversion_events
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon insert events" ON public.analytics_events
    FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access (for admin dashboard)
CREATE POLICY "Service role full access page_views" ON public.page_views
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access sessions" ON public.user_sessions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access conversions" ON public.conversion_events
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access events" ON public.analytics_events
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update session metrics
CREATE OR REPLACE FUNCTION public.update_session_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update page views count
    IF TG_TABLE_NAME = 'page_views' THEN
        UPDATE public.user_sessions
        SET page_views_count = page_views_count + 1
        WHERE session_id = NEW.session_id;
    END IF;

    -- Update conversions count
    IF TG_TABLE_NAME = 'conversion_events' THEN
        UPDATE public.user_sessions
        SET
            conversions_count = conversions_count + 1,
            converted = true
        WHERE session_id = NEW.session_id;
    END IF;

    -- Update events count
    IF TG_TABLE_NAME = 'analytics_events' THEN
        UPDATE public.user_sessions
        SET events_count = events_count + 1
        WHERE session_id = NEW.session_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-update session metrics
CREATE TRIGGER trg_page_view_metrics
    AFTER INSERT ON public.page_views
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_metrics();

CREATE TRIGGER trg_conversion_metrics
    AFTER INSERT ON public.conversion_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_metrics();

CREATE TRIGGER trg_event_metrics
    AFTER INSERT ON public.analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_metrics();

-- ============================================================================
-- ADMIN USER TABLE (for dashboard authentication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,

    -- Access control
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin users
CREATE POLICY "Service role manages admin users" ON public.admin_users
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

COMMIT;

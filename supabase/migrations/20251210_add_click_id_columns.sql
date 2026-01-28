-- Add missing click ID columns to conversion_events and page_views tables
-- These columns store ad platform click IDs for conversion attribution
-- Created: 2025-12-10

BEGIN;

-- Add columns to conversion_events table
ALTER TABLE public.conversion_events
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS msclkid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add columns to page_views table (for consistency)
ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS msclkid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT;

-- Add columns to user_sessions table (for session-level attribution)
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS msclkid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT;

-- Create indexes for click ID lookups (useful for attribution reporting)
CREATE INDEX IF NOT EXISTS idx_conversions_gclid ON public.conversion_events(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversions_msclkid ON public.conversion_events(msclkid) WHERE msclkid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversions_fbclid ON public.conversion_events(fbclid) WHERE fbclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_gclid ON public.user_sessions(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_msclkid ON public.user_sessions(msclkid) WHERE msclkid IS NOT NULL;

COMMIT;

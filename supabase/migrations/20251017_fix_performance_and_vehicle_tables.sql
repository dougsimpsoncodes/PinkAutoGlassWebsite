-- Fix Performance Warnings and Vehicle Tables Configuration
-- Generated: 2025-10-17

BEGIN;

-- ============================================================================
-- PART 1: Fix Duplicate Indexes
-- ============================================================================

-- Drop duplicate indexes on leads table
DROP INDEX IF EXISTS public.leads_created_at_desc_idx;
-- Keep leads_created_at_idx

-- Drop duplicate constraint (this will also drop the associated index)
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_reference_number_unique;
-- Keep leads_reference_number_key

-- Drop duplicate index on media table
DROP INDEX IF EXISTS public.media_lead_id_idx;
-- Keep idx_media_lead_id

-- ============================================================================
-- PART 2: Fix RLS Performance Issues (auth function calls)
-- ============================================================================

-- Fix media table RLS policies
DROP POLICY IF EXISTS "Service role can manage all media" ON public.media;
DROP POLICY IF EXISTS "Users can view their own media" ON public.media;
DROP POLICY IF EXISTS "Insert media - public" ON public.media;

-- Recreate with optimized auth function calls
CREATE POLICY "Service role can manage all media" ON public.media
  FOR ALL
  TO anon, authenticated, service_role
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Users can view their own media" ON public.media
  FOR SELECT
  TO anon, authenticated
  USING (lead_id IN (
    SELECT id FROM public.leads
    WHERE email = (select current_setting('request.jwt.claims', true)::json->>'email')
  ));

CREATE POLICY "Insert media - public" ON public.media
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);  -- Public insert allowed

-- Fix lead_activities table RLS policies
DROP POLICY IF EXISTS "Service role can manage all activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can view activities for their leads" ON public.lead_activities;

-- Recreate with optimized auth function calls
CREATE POLICY "Service role can manage all activities" ON public.lead_activities
  FOR ALL
  TO anon, authenticated, service_role
  USING ((select current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');

CREATE POLICY "Users can view activities for their leads" ON public.lead_activities
  FOR SELECT
  TO anon, authenticated
  USING (lead_id IN (
    SELECT id FROM public.leads
    WHERE email = (select current_setting('request.jwt.claims', true)::json->>'email')
  ));

-- ============================================================================
-- PART 3: Verify Vehicle Tables Configuration
-- ============================================================================

-- Ensure vehicle tables have proper ownership and are in public schema
ALTER TABLE IF EXISTS public.vehicle_makes OWNER TO postgres;
ALTER TABLE IF EXISTS public.vehicle_models OWNER TO postgres;

-- Ensure RLS is enabled
ALTER TABLE public.vehicle_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for vehicle tables to ensure they're correct
DROP POLICY IF EXISTS anon_vehicle_makes_select ON public.vehicle_makes;
DROP POLICY IF EXISTS anon_vehicle_models_select ON public.vehicle_models;

-- Create simple, permissive policies for anonymous read access
CREATE POLICY "anon_vehicle_makes_select"
  ON public.vehicle_makes
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

CREATE POLICY "anon_vehicle_models_select"
  ON public.vehicle_models
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Ensure proper grants
GRANT SELECT ON public.vehicle_makes TO anon, authenticated, service_role;
GRANT SELECT ON public.vehicle_models TO anon, authenticated, service_role;

-- Ensure sequences have proper grants
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vehicle_makes_id_seq' AND relkind = 'S') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.vehicle_makes_id_seq TO anon, authenticated, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vehicle_models_id_seq' AND relkind = 'S') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.vehicle_models_id_seq TO anon, authenticated, service_role;
  END IF;
END $$;

-- ============================================================================
-- PART 4: Force PostgREST Schema Cache Refresh
-- ============================================================================

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

COMMIT;

-- Verification queries (run these separately to verify)
-- SELECT * FROM public.vehicle_makes LIMIT 5;
-- SELECT * FROM public.vehicle_models LIMIT 5;
-- SET ROLE anon; SELECT * FROM public.vehicle_makes LIMIT 5; RESET ROLE;

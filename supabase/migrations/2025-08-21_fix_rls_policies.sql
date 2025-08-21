-- Fix RLS policies for public booking submissions
-- This ensures anonymous users can submit bookings

-- Drop and recreate the public insert policy for leads
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Public can create leads" ON leads
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Ensure the policy for media uploads works too
DROP POLICY IF EXISTS "Anyone can upload media" ON media_files;
CREATE POLICY "Public can upload media" ON media_files
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Allow public to create media associations during booking
DROP POLICY IF EXISTS "Anyone can associate media" ON media_associations;
CREATE POLICY "Public can associate media" ON media_associations
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Ensure RLS is enabled but allows public inserts
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_associations ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anonymous role
GRANT INSERT ON leads TO anon;
GRANT INSERT ON media_files TO anon;  
GRANT INSERT ON media_associations TO anon;
GRANT INSERT ON lead_attributions TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
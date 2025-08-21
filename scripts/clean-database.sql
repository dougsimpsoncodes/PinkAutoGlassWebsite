-- Clean all test data from Pink Auto Glass database
-- Run this in Supabase SQL Editor to start fresh

-- Delete from tables that exist (checking first)
DO $$
BEGIN
  -- Delete from lead_activities if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead_activities') THEN
    DELETE FROM lead_activities;
    RAISE NOTICE 'Cleared lead_activities table';
  END IF;

  -- Delete from media if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media') THEN
    DELETE FROM media;
    RAISE NOTICE 'Cleared media table';
  END IF;

  -- Delete from leads (this one definitely exists)
  DELETE FROM leads;
  RAISE NOTICE 'Cleared leads table';
END $$;

-- Verify the cleanup
SELECT 
  'leads' as table_name, 
  COUNT(*) as record_count 
FROM leads;

-- Check media table if it exists
SELECT 
  'media' as table_name, 
  COUNT(*) as record_count 
FROM media
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media');

-- You should see 0 records in all tables
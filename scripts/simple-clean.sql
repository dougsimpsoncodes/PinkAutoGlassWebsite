-- Simple cleanup - just delete all leads
DELETE FROM leads;

-- Verify it's empty
SELECT COUNT(*) as remaining_records FROM leads;
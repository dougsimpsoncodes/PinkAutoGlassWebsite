-- Fix leads created by the RC sync Step 5a bug.
--
-- Step 5a in /api/admin/sync/ringcentral inserted call-based leads without
-- first_contact_method. The DB default for that column is 'form', so these
-- rows landed as first_contact_method='form' even though they represent calls.
-- Fingerprint: utm_source='ringcentral_call' (only Step 5a set this value).

UPDATE leads
SET first_contact_method = 'call'
WHERE utm_source = 'ringcentral_call'
  AND first_contact_method = 'form'
  AND is_test = false;

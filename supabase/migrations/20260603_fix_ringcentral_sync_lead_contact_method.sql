-- Fix leads created by the RC sync Step 5a bug.
--
-- Step 5a in /api/admin/sync/ringcentral inserted call-based leads without
-- first_contact_method, causing them to display as 'form' type on the Leads
-- page. The fingerprint is utm_source = 'ringcentral_call' with a NULL
-- first_contact_method. Set them to 'call' so they're classified correctly
-- and suppressed from the RC calls list (no more form+call duplicate pairs).

UPDATE leads
SET first_contact_method = 'call'
WHERE utm_source = 'ringcentral_call'
  AND first_contact_method IS NULL
  AND is_test = false;

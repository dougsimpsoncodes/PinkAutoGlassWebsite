-- PR 2b transition safety: backfill export_candidates.uploaded_at from the
-- legacy per-source upload columns.
--
-- Without this, the first PR2b uploader run would see weeks of eligible
-- candidates with uploaded_at IS NULL whose calls/leads the OLD uploader
-- already sent — and re-upload them all. The uploader also has a runtime
-- defense (legacy-column check → backstamp), but the backfill makes the
-- steady state correct from the first run.

-- Calls → Google
UPDATE export_candidates ec
SET uploaded_at = rc.google_ads_uploaded_at
FROM ringcentral_calls rc
WHERE ec.source_type = 'call'
  AND ec.platform = 'google'
  AND ec.source_id = rc.call_id
  AND rc.google_ads_uploaded_at IS NOT NULL
  AND ec.uploaded_at IS NULL;

-- Calls → Microsoft
UPDATE export_candidates ec
SET uploaded_at = rc.microsoft_ads_uploaded_at
FROM ringcentral_calls rc
WHERE ec.source_type = 'call'
  AND ec.platform = 'microsoft'
  AND ec.source_id = rc.call_id
  AND rc.microsoft_ads_uploaded_at IS NOT NULL
  AND ec.uploaded_at IS NULL;

-- Leads → Google
UPDATE export_candidates ec
SET uploaded_at = l.google_ads_form_uploaded_at
FROM leads l
WHERE ec.source_type = 'lead'
  AND ec.platform = 'google'
  AND ec.source_id = l.id::text
  AND l.google_ads_form_uploaded_at IS NOT NULL
  AND ec.uploaded_at IS NULL;

-- Leads → Microsoft
UPDATE export_candidates ec
SET uploaded_at = l.microsoft_ads_form_uploaded_at
FROM leads l
WHERE ec.source_type = 'lead'
  AND ec.platform = 'microsoft'
  AND ec.source_id = l.id::text
  AND l.microsoft_ads_form_uploaded_at IS NOT NULL
  AND ec.uploaded_at IS NULL;

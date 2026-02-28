-- Track offline conversion uploads for lead forms
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS google_ads_form_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS microsoft_ads_form_uploaded_at TIMESTAMPTZ;

COMMENT ON COLUMN leads.google_ads_form_uploaded_at IS 'Timestamp when this lead was uploaded to Google Ads as an offline conversion. NULL means not yet uploaded.';
COMMENT ON COLUMN leads.microsoft_ads_form_uploaded_at IS 'Timestamp when this lead was uploaded to Microsoft Ads as an offline conversion. NULL means not yet uploaded.';

CREATE INDEX IF NOT EXISTS idx_leads_google_ads_form_uploaded
  ON leads(google_ads_form_uploaded_at)
  WHERE google_ads_form_uploaded_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_microsoft_ads_form_uploaded
  ON leads(microsoft_ads_form_uploaded_at)
  WHERE microsoft_ads_form_uploaded_at IS NULL;

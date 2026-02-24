-- Add fuzzy name + date range fallback to match_omega_to_leads
CREATE OR REPLACE FUNCTION match_omega_to_leads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 1. Match installs to leads by exact phone
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_phone IS NOT NULL
    AND l.phone_e164 IS NOT NULL
    AND REGEXP_REPLACE(oi.customer_phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(l.phone_e164, '[^0-9]', '', 'g');

  -- 2. Match installs to leads by exact email
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_email IS NOT NULL AND oi.customer_email != ''
    AND l.email IS NOT NULL AND l.email != ''
    AND LOWER(oi.customer_email) = LOWER(l.email);

  -- 3. Fuzzy fallback: name match + lead created within 30 days of install date
  UPDATE omega_installs oi
  SET
    matched_lead_id = l.id,
    match_confidence = 'fuzzy',
    matched_at = NOW()
  FROM leads l
  WHERE oi.matched_lead_id IS NULL
    AND oi.customer_name IS NOT NULL AND oi.customer_name != ''
    AND LOWER(oi.customer_name) = LOWER(TRIM(l.first_name || ' ' || l.last_name))
    AND oi.install_date::date BETWEEN (l.created_at::date - INTERVAL '30 days') AND (l.created_at::date + INTERVAL '30 days');

  -- 4. Match quotes to leads by exact phone
  UPDATE omega_quotes oq
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oq.matched_lead_id IS NULL
    AND oq.customer_phone IS NOT NULL
    AND l.phone_e164 IS NOT NULL
    AND REGEXP_REPLACE(oq.customer_phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(l.phone_e164, '[^0-9]', '', 'g');

  -- 5. Match quotes to leads by exact email
  UPDATE omega_quotes oq
  SET
    matched_lead_id = l.id,
    match_confidence = 'exact',
    matched_at = NOW()
  FROM leads l
  WHERE oq.matched_lead_id IS NULL
    AND oq.customer_email IS NOT NULL
    AND l.email IS NOT NULL
    AND LOWER(oq.customer_email) = LOWER(l.email);

  -- 6. Match installs to quotes
  UPDATE omega_installs oi
  SET matched_quote_id = oq.id
  FROM omega_quotes oq
  WHERE oi.matched_quote_id IS NULL
    AND oi.omega_quote_id IS NOT NULL
    AND oq.omega_quote_id = oi.omega_quote_id;

END;
$$;

COMMENT ON FUNCTION match_omega_to_leads IS 'Match Omega records to leads by phone/email (exact) then name+date (fuzzy)';

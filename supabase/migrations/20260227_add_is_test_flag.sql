-- Add is_test flag to leads table
-- Marks test/internal submissions so they can be excluded from all attribution
-- and reporting queries. Set to true for team member phones (EXCLUDED_DRIP_PHONES)
-- and internal test phones (TEST_PHONES) at lead creation time.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

-- Partial index: only indexes test leads (tiny, fast for exclusion queries)
CREATE INDEX IF NOT EXISTS idx_leads_is_test
  ON public.leads (is_test)
  WHERE is_test = TRUE;

-- Update fn_insert_lead to persist is_test from payload
CREATE OR REPLACE FUNCTION public.fn_insert_lead(
  p_id uuid,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_id uuid := COALESCE(p_id, uuid_generate_v4());
BEGIN
  INSERT INTO public.leads(
    id,
    client_generated_id,
    first_name,
    last_name,
    email,
    phone_e164,
    address,
    city,
    state,
    zip,
    vehicle_year,
    vehicle_make,
    vehicle_model,
    service_type,
    terms_accepted,
    privacy_acknowledgment,
    client_id,
    session_id,
    first_touch,
    last_touch,
    created_by,
    gclid,
    msclkid,
    ad_platform,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    insurance_carrier,
    is_test
  )
  VALUES(
    v_id,
    (p_payload->>'clientGeneratedId')::uuid,
    p_payload->>'firstName',
    p_payload->>'lastName',
    p_payload->>'email',
    p_payload->>'phoneE164',
    p_payload->>'address',
    p_payload->>'city',
    p_payload->>'state',
    p_payload->>'zip',
    NULLIF(p_payload->>'vehicleYear','')::int,
    p_payload->>'vehicleMake',
    p_payload->>'vehicleModel',
    NULLIF(p_payload->>'serviceType','')::public.service_type,
    COALESCE((p_payload->>'termsAccepted')::boolean, false),
    COALESCE((p_payload->>'privacyAcknowledgment')::boolean, false),
    p_payload->>'clientId',
    p_payload->>'sessionId',
    COALESCE(p_payload->'firstTouch', '{}'::jsonb),
    COALESCE(p_payload->'lastTouch', '{}'::jsonb),
    null,
    p_payload->>'gclid',
    p_payload->>'msclkid',
    p_payload->>'ad_platform',
    p_payload->>'utm_source',
    p_payload->>'utm_medium',
    p_payload->>'utm_campaign',
    p_payload->>'utm_term',
    p_payload->>'utm_content',
    p_payload->>'insuranceCarrier',
    COALESCE((p_payload->>'isTest')::boolean, false)
  );

  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.fn_insert_lead(uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_insert_lead(uuid, jsonb) TO anon;

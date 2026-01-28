-- Fix fn_insert_lead to include attribution columns (gclid, msclkid, ad_platform, UTM params)
-- The API passes these fields but the function was ignoring them

CREATE OR REPLACE FUNCTION public.fn_insert_lead(
  p_id uuid,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    -- Attribution columns (NEW)
    gclid,
    msclkid,
    ad_platform,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content
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
    -- Attribution values (NEW)
    p_payload->>'gclid',
    p_payload->>'msclkid',
    p_payload->>'ad_platform',
    p_payload->>'utm_source',
    p_payload->>'utm_medium',
    p_payload->>'utm_campaign',
    p_payload->>'utm_term',
    p_payload->>'utm_content'
  );

  RETURN v_id;
END $$;

-- Ensure permissions are correct
REVOKE ALL ON FUNCTION public.fn_insert_lead(uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_insert_lead(uuid, jsonb) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION public.fn_insert_lead(uuid, jsonb) IS
'Inserts a new lead with full attribution data (gclid, msclkid, ad_platform, UTM params).
Called from /api/booking/submit with session context.';

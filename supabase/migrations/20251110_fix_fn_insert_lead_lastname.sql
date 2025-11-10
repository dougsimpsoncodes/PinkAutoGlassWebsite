-- Fix fn_insert_lead to properly save lastName field
-- The function was reading p_payload->>'lastName' but this field wasn't being saved

CREATE OR REPLACE FUNCTION public.fn_insert_lead(
  p_id uuid,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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
    created_by
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
    null
  );

  RETURN v_id;
END $$;

-- Ensure permissions are correct
REVOKE ALL ON FUNCTION public.fn_insert_lead(uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_insert_lead(uuid, jsonb) TO anon;

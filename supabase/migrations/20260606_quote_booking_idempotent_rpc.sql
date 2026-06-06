-- Make auto-quoter booking creation idempotent per quote.
-- The API route has a precheck, but this RPC is the atomic boundary. The
-- advisory transaction lock prevents concurrent posts for the same quote from
-- inserting duplicate booking rows.

CREATE OR REPLACE FUNCTION public.fn_create_quote_booking(payload JSONB)
RETURNS TABLE(id UUID, booking_token TEXT) AS $$
DECLARE
  quote_uuid UUID := (payload->>'quote_id')::UUID;
  existing_id UUID;
  existing_token TEXT;
  new_id UUID := gen_random_uuid();
  new_token TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(quote_uuid::TEXT, 0));

  SELECT b.id, b.booking_token
    INTO existing_id, existing_token
  FROM public.automated_quote_bookings b
  WHERE b.quote_id = quote_uuid
  ORDER BY b.created_at ASC
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN QUERY SELECT existing_id, existing_token;
    RETURN;
  END IF;

  -- Customer-facing short token. 4 hex chars = 65,536 possibilities;
  -- collisions are rare at Pink's volume and the UNIQUE constraint rejects
  -- any that collide.
  new_token := 'PAG-' || upper(substr(md5(random()::text || new_id::text), 1, 4));

  INSERT INTO public.automated_quote_bookings (
    id, booking_token, quote_id,
    full_name, phone_e164, email,
    install_street, install_city, install_state, install_zip,
    preferred_install_date, preferred_install_window,
    sms_consent, variant_id, ip_address, user_agent, is_test
  ) VALUES (
    new_id,
    new_token,
    quote_uuid,
    payload->>'full_name',
    payload->>'phone_e164',
    NULLIF(payload->>'email', ''),
    payload->>'install_street',
    NULLIF(payload->>'install_city', ''),
    NULLIF(payload->>'install_state', ''),
    payload->>'install_zip',
    (payload->>'preferred_install_date')::DATE,
    payload->>'preferred_install_window',
    COALESCE((payload->>'sms_consent')::BOOLEAN, false),
    COALESCE(NULLIF(payload->>'variant_id', ''), 'control'),
    NULLIF(payload->>'ip_address', ''),
    NULLIF(payload->>'user_agent', ''),
    COALESCE((payload->>'is_test')::BOOLEAN, false)
  );

  RETURN QUERY SELECT new_id, new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

REVOKE ALL ON FUNCTION public.fn_create_quote_booking(JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_create_quote_booking(JSONB) TO service_role;

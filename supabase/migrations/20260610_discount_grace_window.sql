-- Discount rescue: 1-hour grace window on the booking RPC.
--
-- The /quote/book/[token] page evaluates the 24h discount window at RENDER
-- time; this RPC re-evaluates it at SUBMIT time. A customer who opened the
-- page just inside 24h and submitted just after it would see the discounted
-- price on screen but get booked at full price. The RPC therefore honors the
-- offer for 25 hours — the server is always at least as generous as anything
-- the page could have shown. Customer-facing copy and the page stay at 24h.
--
-- Only the interval changes from 20260610_quote_discount_rescue.sql; the
-- return type is unchanged so CREATE OR REPLACE is safe.

CREATE OR REPLACE FUNCTION public.fn_create_quote_booking(payload JSONB)
RETURNS TABLE(id UUID, booking_token TEXT, accepted_total_cents INTEGER, discount_pct NUMERIC) AS $$
DECLARE
  quote_uuid UUID := (payload->>'quote_id')::UUID;
  existing_id UUID;
  existing_token TEXT;
  existing_accepted INTEGER;
  existing_pct NUMERIC;
  new_id UUID := gen_random_uuid();
  new_token TEXT;
  q_total INTEGER;
  q_discounted INTEGER;
  q_pct NUMERIC;
  q_offered_at TIMESTAMPTZ;
  final_total INTEGER;
  final_pct NUMERIC;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(quote_uuid::TEXT, 0));

  SELECT b.id, b.booking_token, b.accepted_total_cents, b.discount_pct
    INTO existing_id, existing_token, existing_accepted, existing_pct
  FROM public.automated_quote_bookings b
  WHERE b.quote_id = quote_uuid
  ORDER BY b.created_at ASC
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN QUERY SELECT existing_id, existing_token, existing_accepted, existing_pct;
    RETURN;
  END IF;

  SELECT q.quote_total_cents, q.discounted_total_cents, q.discount_pct, q.discount_offered_at
    INTO q_total, q_discounted, q_pct, q_offered_at
  FROM public.automated_quotes q
  WHERE q.id = quote_uuid;

  -- 24h offer + 1h grace: see header comment.
  IF q_offered_at IS NOT NULL
     AND q_discounted IS NOT NULL
     AND now() - q_offered_at <= interval '25 hours' THEN
    final_total := q_discounted;
    final_pct := q_pct;
  ELSE
    final_total := q_total;
    final_pct := NULL;
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
    sms_consent, variant_id, ip_address, user_agent, is_test,
    accepted_total_cents, discount_pct
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
    COALESCE((payload->>'is_test')::BOOLEAN, false),
    final_total,
    final_pct
  );

  RETURN QUERY SELECT new_id, new_token, final_total, final_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

-- Complete the lockdown 20260610_quote_discount_rescue.sql intended. That
-- migration revoked from PUBLIC and granted service_role, but Supabase's
-- default privileges had ALSO granted EXECUTE to anon/authenticated at
-- CREATE time — and REVOKE FROM PUBLIC does not touch per-role grants.
-- Only the service-role book route may call this function.
REVOKE EXECUTE ON FUNCTION public.fn_create_quote_booking(JSONB) FROM anon, authenticated;

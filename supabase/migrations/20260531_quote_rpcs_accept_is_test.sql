-- Thread is_test through the quote + booking create RPCs (codex pre-deploy
-- F-market-3, 2026-05-31).
--
-- Background: 20260530_add_is_test_to_quotes_bookings.sql added
-- automated_quotes.is_test and automated_quote_bookings.is_test as
-- NOT NULL DEFAULT false — but fn_create_automated_quote / fn_create_quote_booking
-- never set the column, so EVERY new quote/booking is stored is_test=false even
-- for internal/test sessions. That silently defeats the Quotes-page test filter
-- and the Quoter-Funnel booking exclusion for any test traffic created AFTER the
-- column was added.
--
-- Fix: CREATE OR REPLACE both functions, copied VERBATIM from their canonical
-- definitions (20260509_automated_quotes.sql / 20260527_automated_quote_bookings.sql)
-- with EXACTLY ONE change each: append is_test to the INSERT column list + VALUES,
-- reading COALESCE((payload->>'is_test')::BOOLEAN, false). Callers that omit
-- is_test behave identically to before (false). Additive + backward-compatible.
-- No table/column changes. Idempotent (pure CREATE OR REPLACE).

-- ── fn_create_automated_quote (verbatim + is_test) ────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_create_automated_quote(payload JSONB)
RETURNS TABLE(id UUID, quote_token UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_quote_id UUID;
  v_quote_token UUID;
  v_status automated_quote_status;
  v_line_items JSONB;
  v_line_item_count INTEGER;
BEGIN
  IF payload IS NULL OR jsonb_typeof(payload) <> 'object' THEN
    RAISE EXCEPTION 'payload must be a JSON object';
  END IF;

  v_status := CASE payload->>'status'
    WHEN 'ready_exact' THEN 'ready_exact'::automated_quote_status
    WHEN 'ready_estimate' THEN 'ready_estimate'::automated_quote_status
    WHEN 'needs_confirmation' THEN 'needs_confirmation'::automated_quote_status
    WHEN 'manual_review' THEN 'manual_review'::automated_quote_status
    ELSE 'manual_review'::automated_quote_status
  END;

  INSERT INTO automated_quotes (
    status,
    status_reason,
    pricing_version,
    zip,
    state,
    ip_address,
    user_agent,
    session_id,
    client_id,
    plate_last4,
    plate_state,
    vin,
    vehicle_year,
    vehicle_make,
    vehicle_model,
    vehicle_trim,
    vehicle_style,
    vehicle_engine,
    vehicle_drive_type,
    vehicle_transmission,
    selected_nags_prefix,
    selected_nags_number,
    selected_nags_color,
    selected_nags_hardware_indicator,
    selected_nags_premium_indicator,
    selected_product_id,
    selected_brand,
    selected_part_description,
    selected_ship_from_branch_id,
    selected_ship_from_branch_name,
    selected_qty_available,
    selected_estimated_delivery_date,
    selected_estimated_delivery_time,
    supplier_cost_cents,
    quote_total_cents,
    quote_low_cents,
    quote_high_cents,
    currency,
    confidence_reasons,
    platetovin_request,
    platetovin_response,
    mygrant_request,
    mygrant_response,
    is_test
  )
  VALUES (
    v_status,
    NULLIF(payload->>'status_reason', ''),
    COALESCE(NULLIF(payload->>'pricing_version', ''), 'cash-windshield-v1'),
    NULLIF(payload->>'zip', ''),
    NULLIF(payload->>'state', ''),
    NULLIF(payload->>'ip_address', '')::INET,
    NULLIF(payload->>'user_agent', ''),
    NULLIF(payload->>'session_id', ''),
    NULLIF(payload->>'client_id', ''),
    NULLIF(payload->>'plate_last4', ''),
    NULLIF(payload->>'plate_state', ''),
    NULLIF(payload->>'vin', ''),
    NULLIF(payload->>'vehicle_year', '')::INTEGER,
    NULLIF(payload->>'vehicle_make', ''),
    NULLIF(payload->>'vehicle_model', ''),
    NULLIF(payload->>'vehicle_trim', ''),
    NULLIF(payload->>'vehicle_style', ''),
    NULLIF(payload->>'vehicle_engine', ''),
    NULLIF(payload->>'vehicle_drive_type', ''),
    NULLIF(payload->>'vehicle_transmission', ''),
    NULLIF(payload->>'selected_nags_prefix', ''),
    NULLIF(payload->>'selected_nags_number', ''),
    NULLIF(payload->>'selected_nags_color', ''),
    NULLIF(payload->>'selected_nags_hardware_indicator', ''),
    NULLIF(payload->>'selected_nags_premium_indicator', ''),
    NULLIF(payload->>'selected_product_id', ''),
    NULLIF(payload->>'selected_brand', ''),
    NULLIF(payload->>'selected_part_description', ''),
    NULLIF(payload->>'selected_ship_from_branch_id', ''),
    NULLIF(payload->>'selected_ship_from_branch_name', ''),
    NULLIF(payload->>'selected_qty_available', '')::INTEGER,
    NULLIF(payload->>'selected_estimated_delivery_date', ''),
    NULLIF(payload->>'selected_estimated_delivery_time', ''),
    NULLIF(payload->>'supplier_cost_cents', '')::INTEGER,
    NULLIF(payload->>'quote_total_cents', '')::INTEGER,
    NULLIF(payload->>'quote_low_cents', '')::INTEGER,
    NULLIF(payload->>'quote_high_cents', '')::INTEGER,
    COALESCE(NULLIF(payload->>'currency', ''), 'USD'),
    COALESCE(payload->'confidence_reasons', '[]'::jsonb),
    payload->'platetovin_request',
    payload->'platetovin_response',
    payload->'mygrant_request',
    payload->'mygrant_response',
    COALESCE((payload->>'is_test')::BOOLEAN, false)
  )
  RETURNING automated_quotes.id, automated_quotes.quote_token
  INTO v_quote_id, v_quote_token;

  v_line_items := CASE
    WHEN jsonb_typeof(payload->'line_items') = 'array' THEN payload->'line_items'
    ELSE '[]'::jsonb
  END;
  v_line_item_count := jsonb_array_length(v_line_items);

  IF v_line_item_count > 20 THEN
    RAISE EXCEPTION 'line_items exceeds the maximum allowed count';
  END IF;

  INSERT INTO automated_quote_line_items (
    quote_id,
    sort_order,
    kind,
    description,
    amount_cents,
    taxable,
    vendor_part_number,
    metadata
  )
  SELECT
    v_quote_id,
    COALESCE(NULLIF(item.value->>'sort_order', '')::INTEGER, item.ordinality::INTEGER),
    COALESCE(NULLIF(item.value->>'kind', ''), 'margin_adjustment'),
    COALESCE(NULLIF(item.value->>'description', ''), 'Quote line item'),
    GREATEST(COALESCE(NULLIF(item.value->>'amount_cents', '')::INTEGER, 0), 0),
    COALESCE(NULLIF(item.value->>'taxable', '')::BOOLEAN, false),
    NULLIF(item.value->>'vendor_part_number', ''),
    COALESCE(item.value->'metadata', '{}'::jsonb)
  FROM jsonb_array_elements(v_line_items) WITH ORDINALITY AS item(value, ordinality);

  RETURN QUERY SELECT v_quote_id, v_quote_token;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_create_automated_quote(JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_create_automated_quote(JSONB) TO anon, authenticated;

-- ── fn_create_quote_booking (verbatim + is_test) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_create_quote_booking(payload JSONB)
RETURNS TABLE(id UUID, booking_token TEXT) AS $$
DECLARE
  new_id UUID := gen_random_uuid();
  new_token TEXT;
BEGIN
  -- Customer-facing short token. 4 hex chars = 65,536 possibilities;
  -- collisions extremely rare at Pink's volume and the UNIQUE constraint
  -- will reject any that do collide (caller retries).
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
    (payload->>'quote_id')::UUID,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

REVOKE ALL ON FUNCTION public.fn_create_quote_booking(JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_create_quote_booking(JSONB) TO service_role;

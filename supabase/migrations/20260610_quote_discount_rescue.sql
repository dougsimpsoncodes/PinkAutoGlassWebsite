-- Discount rescue flow: 15-minute unbooked discount offer.
--
-- Replaces quote_unbooked_5m (customer+team at 5 min) with
-- quote_unbooked_15m_discount (customer-only 10% offer at 15 min, with a
-- short-token booking link). The 5m event type stays in the CHECK constraint
-- so historical rows remain valid.

-- 1) Discount state on the quote row. discounted_total_cents is snapshotted
--    when the 15m event fires so later admin price edits cannot change the
--    offer the customer received.
ALTER TABLE public.automated_quotes
  ADD COLUMN IF NOT EXISTS discount_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS discounted_total_cents integer,
  ADD COLUMN IF NOT EXISTS discount_offered_at timestamptz,
  ADD COLUMN IF NOT EXISTS booking_link_token text;

-- Short high-entropy token for SMS links (UUID is too long for SMS segments;
-- the 8-char quote_token prefix is too guessable for a PII-bearing page).
-- 16 hex chars from gen_random_uuid (core PG13+, no pgcrypto dependency)
-- = 64 bits of entropy.
UPDATE public.automated_quotes
  SET booking_link_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)
  WHERE booking_link_token IS NULL;

ALTER TABLE public.automated_quotes
  ALTER COLUMN booking_link_token SET DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

CREATE UNIQUE INDEX IF NOT EXISTS idx_automated_quotes_booking_link_token
  ON public.automated_quotes (booking_link_token);

-- 2) Accepted-price snapshot on the booking row. Records the deal at booking
--    time regardless of later quote edits.
ALTER TABLE public.automated_quote_bookings
  ADD COLUMN IF NOT EXISTS accepted_total_cents integer,
  ADD COLUMN IF NOT EXISTS discount_pct numeric(5,2);

-- One booking per quote, enforced at the DB level (verified no duplicates in
-- prod before this migration).
CREATE UNIQUE INDEX IF NOT EXISTS idx_automated_quote_bookings_quote_unique
  ON public.automated_quote_bookings (quote_id);

-- 3) Explicit due time for notification events. The processor queries
--    scheduled_for <= now() instead of inferring due time from created_at,
--    which removes clock-skew issues and supports per-event delays.
ALTER TABLE public.automated_quote_notification_events
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

CREATE INDEX IF NOT EXISTS idx_automated_quote_notification_events_due
  ON public.automated_quote_notification_events (event_type, status, scheduled_for)
  WHERE status IN ('pending', 'failed', 'partial');

-- 4) Allow the new event type. quote_unbooked_5m stays valid for historical rows.
ALTER TABLE public.automated_quote_notification_events
  DROP CONSTRAINT IF EXISTS automated_quote_notification_events_event_type_check;
ALTER TABLE public.automated_quote_notification_events
  ADD CONSTRAINT automated_quote_notification_events_event_type_check
  CHECK (event_type IN (
    'quote_ready',
    'quote_unbooked_5m',
    'quote_unbooked_15m_discount',
    'appointment_booked'
  ));

-- 5) Retire in-flight 5m events so the old processor path can be removed
--    without leaving permanently-pending rows.
UPDATE public.automated_quote_notification_events
  SET status = 'skipped',
      last_error = 'migrated_to_discount_flow'
  WHERE event_type = 'quote_unbooked_5m'
    AND status IN ('pending', 'processing', 'failed', 'partial');

-- 6) Booking RPC: snapshot the accepted price atomically with the insert.
--    The discount is resolved INSIDE the RPC from the quote row so every
--    booking path (wizard tab, rescue link, anything future) gets the same
--    rule: an unexpired offer (24h) always applies. Return type changes, so
--    drop first (CREATE OR REPLACE cannot change RETURNS).
DROP FUNCTION IF EXISTS public.fn_create_quote_booking(JSONB);

CREATE FUNCTION public.fn_create_quote_booking(payload JSONB)
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

  IF q_offered_at IS NOT NULL
     AND q_discounted IS NOT NULL
     AND now() - q_offered_at <= interval '24 hours' THEN
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

REVOKE ALL ON FUNCTION public.fn_create_quote_booking(JSONB) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_create_quote_booking(JSONB) TO service_role;

COMMENT ON COLUMN public.automated_quotes.discounted_total_cents IS
  'Snapshot of the 10% rescue-offer price at the moment the 15m discount event fired. Null until offered.';
COMMENT ON COLUMN public.automated_quotes.booking_link_token IS
  'Short high-entropy token for the /quote/book/[token] rescue booking page.';
COMMENT ON COLUMN public.automated_quote_bookings.accepted_total_cents IS
  'Price the customer accepted at booking time (discounted when a rescue offer was active).';

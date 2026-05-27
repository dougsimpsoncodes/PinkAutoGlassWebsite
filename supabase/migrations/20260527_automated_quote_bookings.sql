-- Auto-quoter booking flow v1.
-- Captures the customer's commitment from the priced quote — name, phone,
-- install address, preferred install window. Inserted before notifications
-- fire so the booking is durable even if email/SMS later fail; ops can
-- chase notification failures from the row's notification_status column.

CREATE TABLE IF NOT EXISTS public.automated_quote_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.automated_quotes(id) ON DELETE RESTRICT,
  booking_token TEXT NOT NULL UNIQUE,

  -- Customer info (Q4: lean capture)
  full_name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  email TEXT,  -- nullable; email is optional per Q4

  -- Install location (mobile-only; address is where the tech goes)
  install_street TEXT NOT NULL,
  install_city TEXT,
  install_state TEXT,
  install_zip TEXT NOT NULL,

  -- Time preference (Q5: half-day windows)
  preferred_install_date DATE NOT NULL,
  preferred_install_window TEXT NOT NULL CHECK (preferred_install_window IN ('AM', 'PM')),

  -- TCPA compliance: explicit consent at booking
  sms_consent BOOLEAN NOT NULL DEFAULT false,

  -- Booking status — Pink ops moves this through the pipeline
  status TEXT NOT NULL DEFAULT 'pending_confirmation'
    CHECK (status IN ('pending_confirmation', 'confirmed', 'completed', 'canceled', 'no_show')),

  -- Notification status — separate from booking status so notification
  -- failures don't block the booking record (per Codex council reco
  -- on PR review 2026-05-27).
  notification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (notification_status IN ('pending', 'email_sent', 'sms_sent', 'both_sent', 'failed', 'partial', 'skipped')),
  notification_error TEXT,

  -- Variant tracking (Phase 2 prep — only 'control' ships in v1)
  variant_id TEXT NOT NULL DEFAULT 'control',

  -- Audit
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Sanity check — phone stored in E.164 format
  CONSTRAINT chk_phone_e164 CHECK (phone_e164 ~ '^\+[1-9][0-9]{1,14}$')
);

CREATE INDEX IF NOT EXISTS idx_automated_quote_bookings_quote_id
  ON public.automated_quote_bookings (quote_id);
CREATE INDEX IF NOT EXISTS idx_automated_quote_bookings_phone_e164
  ON public.automated_quote_bookings (phone_e164);
CREATE INDEX IF NOT EXISTS idx_automated_quote_bookings_status
  ON public.automated_quote_bookings (status);
CREATE INDEX IF NOT EXISTS idx_automated_quote_bookings_preferred_date
  ON public.automated_quote_bookings (preferred_install_date);

-- RLS deny-anon (matches automated_quotes pattern)
ALTER TABLE public.automated_quote_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_automated_quote_bookings
  ON public.automated_quote_bookings;
CREATE POLICY deny_anon_automated_quote_bookings
  ON public.automated_quote_bookings
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_automated_quote_bookings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, extensions;

DROP TRIGGER IF EXISTS trg_automated_quote_bookings_updated_at
  ON public.automated_quote_bookings;
CREATE TRIGGER trg_automated_quote_bookings_updated_at
BEFORE UPDATE ON public.automated_quote_bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_automated_quote_bookings_updated_at();

-- Atomic create-booking RPC. Issues a short PAG-XXXX token, inserts the
-- row, returns id + token. Service role can call from API route; anon
-- cannot (RLS denies + function is SECURITY DEFINER).
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
    sms_consent, variant_id, ip_address, user_agent
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
    NULLIF(payload->>'user_agent', '')
  );

  RETURN QUERY SELECT new_id, new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

COMMENT ON TABLE public.automated_quote_bookings IS
  'Customer-submitted install bookings from the auto-quoter. One row per booking; references the original quote. notification_status is decoupled from status so notification failures do not block the booking record.';

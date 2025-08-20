-- Align leads table schema with API payload structure
-- This migration is idempotent and can be run multiple times safely

-- Create trigger function first (outside DO block)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

DO $$
BEGIN
  -- Create service_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
    CREATE TYPE service_type AS ENUM ('repair', 'replacement');
  END IF;

  -- Create time_preference enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_preference') THEN
    CREATE TYPE time_preference AS ENUM ('morning', 'afternoon', 'flexible');
  END IF;

  -- Create lead_status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'scheduled', 'completed', 'cancelled');
  END IF;

  -- Create leads table if it doesn't exist
  CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'reference_number') THEN
    ALTER TABLE leads ADD COLUMN reference_number varchar(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'service_type') THEN
    ALTER TABLE leads ADD COLUMN service_type service_type NOT NULL DEFAULT 'repair';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'mobile_service') THEN
    ALTER TABLE leads ADD COLUMN mobile_service boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'first_name') THEN
    ALTER TABLE leads ADD COLUMN first_name varchar(50) NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_name') THEN
    ALTER TABLE leads ADD COLUMN last_name varchar(50) NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
    ALTER TABLE leads ADD COLUMN phone varchar(20) NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone_e164') THEN
    ALTER TABLE leads ADD COLUMN phone_e164 varchar(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'email') THEN
    ALTER TABLE leads ADD COLUMN email varchar(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'vehicle_year') THEN
    ALTER TABLE leads ADD COLUMN vehicle_year int;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'vehicle_make') THEN
    ALTER TABLE leads ADD COLUMN vehicle_make varchar(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'vehicle_model') THEN
    ALTER TABLE leads ADD COLUMN vehicle_model varchar(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'address') THEN
    -- Check if street_address exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'street_address') THEN
      ALTER TABLE leads RENAME COLUMN street_address TO address;
    ELSE
      ALTER TABLE leads ADD COLUMN address varchar(200);
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'city') THEN
    ALTER TABLE leads ADD COLUMN city varchar(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'state') THEN
    ALTER TABLE leads ADD COLUMN state char(2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'zip') THEN
    -- Check if zip_code exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'zip_code') THEN
      ALTER TABLE leads RENAME COLUMN zip_code TO zip;
    ELSE
      ALTER TABLE leads ADD COLUMN zip varchar(10);
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferred_date') THEN
    ALTER TABLE leads ADD COLUMN preferred_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'time_preference') THEN
    ALTER TABLE leads ADD COLUMN time_preference time_preference NOT NULL DEFAULT 'flexible';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
    ALTER TABLE leads ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'sms_consent') THEN
    ALTER TABLE leads ADD COLUMN sms_consent boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'terms_accepted') THEN
    ALTER TABLE leads ADD COLUMN terms_accepted boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'privacy_acknowledgment') THEN
    ALTER TABLE leads ADD COLUMN privacy_acknowledgment boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
    ALTER TABLE leads ADD COLUMN source varchar(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
    ALTER TABLE leads ADD COLUMN status lead_status NOT NULL DEFAULT 'new';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ip_address') THEN
    ALTER TABLE leads ADD COLUMN ip_address varchar(45);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'referral_code') THEN
    ALTER TABLE leads ADD COLUMN referral_code varchar(32);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'client_id') THEN
    ALTER TABLE leads ADD COLUMN client_id uuid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'session_id') THEN
    ALTER TABLE leads ADD COLUMN session_id uuid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'first_touch') THEN
    ALTER TABLE leads ADD COLUMN first_touch jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_touch') THEN
    ALTER TABLE leads ADD COLUMN last_touch jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'acquisition_channel') THEN
    ALTER TABLE leads ADD COLUMN acquisition_channel text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'gclid') THEN
    ALTER TABLE leads ADD COLUMN gclid text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'fbclid') THEN
    ALTER TABLE leads ADD COLUMN fbclid text;
  END IF;

  -- Update column types and constraints
  ALTER TABLE leads 
    ALTER COLUMN mobile_service SET NOT NULL,
    ALTER COLUMN mobile_service SET DEFAULT false,
    ALTER COLUMN time_preference SET NOT NULL,
    ALTER COLUMN time_preference SET DEFAULT 'flexible',
    ALTER COLUMN terms_accepted SET NOT NULL,
    ALTER COLUMN terms_accepted SET DEFAULT false,
    ALTER COLUMN privacy_acknowledgment SET NOT NULL,
    ALTER COLUMN privacy_acknowledgment SET DEFAULT false,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'new';

  -- Ensure preferred_date is DATE type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferred_date' AND data_type != 'date') THEN
    ALTER TABLE leads ALTER COLUMN preferred_date TYPE date USING preferred_date::date;
  END IF;

  -- Map legacy service types
  UPDATE leads SET service_type = 'repair' WHERE service_type::text IN ('windshield_repair', 'chip_repair');
  UPDATE leads SET service_type = 'replacement' WHERE service_type::text IN ('windshield_replacement', 'full_replacement');

  -- Drop obsolete columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'best_time_to_call') THEN
    ALTER TABLE leads DROP COLUMN best_time_to_call;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'vehicle_trim') THEN
    ALTER TABLE leads DROP COLUMN vehicle_trim;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferred_time_start') THEN
    ALTER TABLE leads DROP COLUMN preferred_time_start;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferred_time_end') THEN
    ALTER TABLE leads DROP COLUMN preferred_time_end;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'flexible_scheduling') THEN
    ALTER TABLE leads DROP COLUMN flexible_scheduling;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_source') THEN
    ALTER TABLE leads DROP COLUMN utm_source;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_medium') THEN
    ALTER TABLE leads DROP COLUMN utm_medium;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_campaign') THEN
    ALTER TABLE leads DROP COLUMN utm_campaign;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_term') THEN
    ALTER TABLE leads DROP COLUMN utm_term;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_content') THEN
    ALTER TABLE leads DROP COLUMN utm_content;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'used_geolocation') THEN
    ALTER TABLE leads DROP COLUMN used_geolocation;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'geolocation_accuracy') THEN
    ALTER TABLE leads DROP COLUMN geolocation_accuracy;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'form_session_id') THEN
    ALTER TABLE leads DROP COLUMN form_session_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'data_retention_expires_at') THEN
    ALTER TABLE leads DROP COLUMN data_retention_expires_at;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'latitude') THEN
    ALTER TABLE leads DROP COLUMN latitude;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'longitude') THEN
    ALTER TABLE leads DROP COLUMN longitude;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'time_window') THEN
    ALTER TABLE leads DROP COLUMN time_window;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'damage_description') THEN
    ALTER TABLE leads DROP COLUMN damage_description;
  END IF;

  -- Create indexes if they don't exist
  CREATE UNIQUE INDEX IF NOT EXISTS leads_phone_date_unique 
    ON leads (lower(phone), preferred_date) 
    WHERE phone IS NOT NULL AND preferred_date IS NOT NULL;

  CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
  CREATE INDEX IF NOT EXISTS leads_created_at_desc_idx ON leads (created_at DESC);

  -- Add reference_number unique constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_reference_number_unique') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_reference_number_unique UNIQUE (reference_number);
  END IF;

  -- Create updated_at trigger if it doesn't exist (function already created above)
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leads_updated_at_trigger') THEN
    CREATE TRIGGER leads_updated_at_trigger
      BEFORE UPDATE ON leads
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

END $$;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
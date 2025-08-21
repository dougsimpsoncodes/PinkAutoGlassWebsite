BEGIN;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_attributions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.leads FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.lead_attributions FROM PUBLIC, anon;
REVOKE USAGE ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon;

DROP POLICY IF EXISTS "Allow anonymous users to insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous users to read back their own lead" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous insert for lead attribution" ON public.lead_attributions;
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_vehicle_year_ck') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_vehicle_year_ck
      CHECK (vehicle_year BETWEEN 1990 AND (extract(year from now())::int + 2));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_terms_accepted_ck') THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_terms_accepted_ck
      CHECK (terms_accepted = true);
  END IF;
END$;

CREATE POLICY "anon_insert_leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  btrim(coalesce(first_name,'')) <> '' AND
  btrim(coalesce(last_name,'')) <> '' AND
  btrim(coalesce(phone,'')) <> '' AND
  (coalesce(email,'') ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+') AND
  terms_accepted = true AND
  coalesce(sms_consent, false) = true
);

GRANT INSERT ON public.leads TO anon;

CREATE OR REPLACE FUNCTION public.handle_new_lead_attribution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  ft jsonb := coalesce(NEW.first_touch, '{}'::jsonb);
  lt jsonb := coalesce(NEW.last_touch,  '{}'::jsonb);
BEGIN
  INSERT INTO public.lead_attributions
    (lead_id, session_id, touch_type, utm, click_ids, channel, referrer, landing_page, created_at)
  VALUES
    (NEW.id, NEW.session_id, 'first',
     coalesce(ft->'utm','{}'::jsonb),
     coalesce(ft->'click_ids','[]'::jsonb),
     NULL,
     nullif(ft->>'referrer',''),
     nullif(ft->>'landing_page',''),
     now()),
    (NEW.id, NEW.session_id, 'last',
     coalesce(lt->'utm','{}'::jsonb),
     coalesce(lt->'click_ids','[]'::jsonb),
     NULL,
     nullif(lt->>'referrer',''),
     nullif(lt->>'landing_page',''),
     now());
  RETURN NEW;
END;
$;

REVOKE ALL ON FUNCTION public.handle_new_lead_attribution() FROM PUBLIC;
ALTER FUNCTION public.handle_new_lead_attribution() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_new_lead_create_attribution ON public.leads;
CREATE TRIGGER on_new_lead_create_attribution
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_lead_attribution();

COMMIT;

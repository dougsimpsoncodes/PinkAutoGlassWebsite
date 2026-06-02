-- Create the system_settings table for persistent server-side state.
-- Currently used to track last drip-failure alert sent time (dedup guard).
-- All writes come from server-side service role (bypasses RLS); public read
-- allows client-side feature flags if needed in future.

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for system_settings" ON public.system_settings
FOR SELECT USING (TRUE);

-- Seed initial keys
INSERT INTO public.system_settings (key, value)
VALUES ('last_drip_failure_alert_sent_at', NULL)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_system_settings_timestamp_trigger
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.update_system_settings_timestamp();

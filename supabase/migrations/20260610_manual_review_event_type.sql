-- Manual-review communications are now recorded as notification events
-- (claim → send → complete with per-channel statuses) instead of being
-- fire-and-forget. The event_type CHECK constraint must allow 'manual_review'.

ALTER TABLE public.automated_quote_notification_events
  DROP CONSTRAINT IF EXISTS automated_quote_notification_events_event_type_check;
ALTER TABLE public.automated_quote_notification_events
  ADD CONSTRAINT automated_quote_notification_events_event_type_check
  CHECK (event_type IN (
    'quote_ready',
    'quote_unbooked_5m',
    'quote_unbooked_15m_discount',
    'appointment_booked',
    'manual_review'
  ));

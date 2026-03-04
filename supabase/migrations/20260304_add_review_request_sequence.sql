-- Add 'review_request' to allowed sequence_name values.
-- The original constraint only included quick_quote_drip and booking_drip.
ALTER TABLE scheduled_messages
  DROP CONSTRAINT IF EXISTS scheduled_messages_sequence_name_check;

ALTER TABLE scheduled_messages
  ADD CONSTRAINT scheduled_messages_sequence_name_check
  CHECK (sequence_name IN ('quick_quote_drip', 'booking_drip', 'review_request'));

-- Add 'processing' to allowed status values.
-- The processor atomically claims messages by setting status='processing',
-- but this value was missing from the original constraint, causing process-drip
-- to silently fail every night since launch.
ALTER TABLE scheduled_messages
  DROP CONSTRAINT IF EXISTS scheduled_messages_status_check;

ALTER TABLE scheduled_messages
  ADD CONSTRAINT scheduled_messages_status_check
  CHECK (status IN ('pending', 'processing', 'sent', 'cancelled', 'failed', 'skipped'));

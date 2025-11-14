-- Migration: Update time_preference enum to use 'anytime' instead of 'flexible'
-- Date: 2025-11-14
-- Purpose: Align database enum with UI labels for better UX consistency

BEGIN;

-- Step 1: Add the new 'anytime' value to the enum
ALTER TYPE time_preference ADD VALUE IF NOT EXISTS 'anytime';

-- Step 2: Update existing 'flexible' values to 'anytime'
UPDATE leads
SET time_preference = 'anytime'
WHERE time_preference = 'flexible';

-- Step 3: Update column default
ALTER TABLE leads
ALTER COLUMN time_preference SET DEFAULT 'anytime';

-- Note: PostgreSQL doesn't allow removing enum values that are in use.
-- The 'flexible' value will remain in the enum type but won't be used.
-- If needed in future, create new enum type and migrate:
--   CREATE TYPE time_preference_new AS ENUM ('morning', 'afternoon', 'anytime');
--   ALTER TABLE leads ALTER COLUMN time_preference TYPE time_preference_new USING time_preference::text::time_preference_new;
--   DROP TYPE time_preference;
--   ALTER TYPE time_preference_new RENAME TO time_preference;

COMMIT;

-- Verify the migration
-- SELECT DISTINCT time_preference FROM leads;

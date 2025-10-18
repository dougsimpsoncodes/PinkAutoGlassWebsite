-- Submission abuse detection table
-- Fast duplicate/burst detection using fingerprints
-- Auto-cleanup with TTL to keep table small

CREATE TABLE IF NOT EXISTS submission_counters (
  fingerprint VARCHAR(32) PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash VARCHAR(64), -- Hashed IP for privacy
  metadata JSONB -- Store additional context if needed
);

-- Index for TTL-based cleanup
CREATE INDEX IF NOT EXISTS idx_submission_counters_last_seen
  ON submission_counters(last_seen);

-- Function to increment or insert counter
CREATE OR REPLACE FUNCTION increment_submission_counter(
  p_fingerprint VARCHAR(32),
  p_ip_hash VARCHAR(64) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS submission_counters AS $$
DECLARE
  v_counter submission_counters;
BEGIN
  -- Try to increment existing counter
  UPDATE submission_counters
  SET
    count = count + 1,
    last_seen = NOW(),
    metadata = COALESCE(p_metadata, metadata)
  WHERE fingerprint = p_fingerprint
  RETURNING * INTO v_counter;

  -- If no row existed, insert new one
  IF NOT FOUND THEN
    INSERT INTO submission_counters (
      fingerprint,
      count,
      ip_hash,
      metadata
    ) VALUES (
      p_fingerprint,
      1,
      p_ip_hash,
      p_metadata
    )
    RETURNING * INTO v_counter;
  END IF;

  RETURN v_counter;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old counters (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_submission_counters()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM submission_counters
  WHERE last_seen < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE submission_counters ENABLE ROW LEVEL SECURITY;

-- Service role can read/write (API uses service role for this table)
CREATE POLICY "Service role can manage counters"
  ON submission_counters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon role cannot access (security)
CREATE POLICY "Anon role cannot access counters"
  ON submission_counters
  FOR ALL
  TO anon
  USING (false);

-- Add comment
COMMENT ON TABLE submission_counters IS
  'Tracks submission fingerprints for duplicate/abuse detection. Auto-cleaned after 24h.';

-- Form token jti table for single-use enforcement
CREATE TABLE IF NOT EXISTS form_token_jti (
  jti VARCHAR(32) PRIMARY KEY,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  route VARCHAR(255), -- For audit trail
  metadata JSONB -- For debugging
);

-- Unique index on jti (critical for race condition prevention)
CREATE UNIQUE INDEX IF NOT EXISTS idx_form_token_jti_unique
  ON form_token_jti(jti);

-- Index for TTL-based cleanup
CREATE INDEX IF NOT EXISTS idx_form_token_jti_expires_at
  ON form_token_jti(expires_at);

-- Function to clean up expired jtis (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_jtis()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM form_token_jti
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE form_token_jti ENABLE ROW LEVEL SECURITY;

-- Service role can read/write (API uses service role for this table)
CREATE POLICY "Service role can manage jtis"
  ON form_token_jti
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon role cannot access (security)
CREATE POLICY "Anon role cannot access jtis"
  ON form_token_jti
  FOR ALL
  TO anon
  USING (false);

-- Add comment
COMMENT ON TABLE form_token_jti IS
  'Tracks used form token jtis for replay prevention. Auto-cleaned on expiration.';

-- SECURITY DEFINER function for jti check-and-mark (atomic, anon-safe)
-- This prevents exposing service_role key to client/edge bundles
CREATE OR REPLACE FUNCTION check_and_mark_jti(
  p_jti VARCHAR(32),
  p_route VARCHAR(255),
  p_expires_at TIMESTAMPTZ
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Try to insert jti (will fail if already exists due to unique constraint)
  BEGIN
    INSERT INTO form_token_jti (jti, route, expires_at)
    VALUES (p_jti, p_route, p_expires_at);

    -- Success - jti was not used before
    v_result := jsonb_build_object(
      'valid', true,
      'first_use', true
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- JTI already exists - replay attempt
      v_result := jsonb_build_object(
        'valid', false,
        'reason', 'replay_attempt',
        'first_use', false
      );
  END;

  RETURN v_result;
END;
$$;

-- Grant execute to anon (safe because function controls all access)
GRANT EXECUTE ON FUNCTION check_and_mark_jti TO anon;
GRANT EXECUTE ON FUNCTION check_and_mark_jti TO authenticated;

-- SECURITY DEFINER function for submission counter (atomic, anon-safe)
CREATE OR REPLACE FUNCTION check_and_increment_submission(
  p_fingerprint VARCHAR(32),
  p_ip_hash VARCHAR(64),
  p_metadata JSONB DEFAULT NULL
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_counter submission_counters;
  v_window_minutes NUMERIC;
  v_action TEXT;
  v_reason TEXT;
BEGIN
  -- Atomic upsert
  INSERT INTO submission_counters (fingerprint, count, ip_hash, metadata)
  VALUES (p_fingerprint, 1, p_ip_hash, p_metadata)
  ON CONFLICT (fingerprint) DO UPDATE
  SET
    count = submission_counters.count + 1,
    last_seen = NOW(),
    metadata = COALESCE(p_metadata, submission_counters.metadata)
  RETURNING * INTO v_counter;

  -- Evaluate thresholds
  v_window_minutes := EXTRACT(EPOCH FROM (NOW() - v_counter.first_seen)) / 60;

  IF v_counter.count >= 5 AND v_window_minutes <= 15 THEN
    v_action := 'challenge';
    v_reason := 'high_frequency';
  ELSIF v_counter.count >= 10 AND v_window_minutes <= 60 THEN
    v_action := 'defer';
    v_reason := 'burst_detected';
  ELSE
    v_action := 'allow';
    v_reason := NULL;
  END IF;

  -- Return evaluation
  RETURN jsonb_build_object(
    'action', v_action,
    'reason', v_reason,
    'count', v_counter.count,
    'window_minutes', v_window_minutes,
    'first_seen', v_counter.first_seen,
    'last_seen', v_counter.last_seen
  );
END;
$$;

-- Grant execute to anon (safe because function controls all access)
GRANT EXECUTE ON FUNCTION check_and_increment_submission TO anon;
GRANT EXECUTE ON FUNCTION check_and_increment_submission TO authenticated;

-- No raw network address, token, client text or fingerprint. Fixed window expiry.
CREATE TABLE verification.abuse_counters (
  key text PRIMARY KEY,
  count bigint NOT NULL CHECK (count > 0),
  expires_at timestamptz NOT NULL
);
CREATE INDEX abuse_counter_expiry ON verification.abuse_counters(expires_at);
-- Detect unsafe replacement of a key/prefix during a live origin window.
CREATE TABLE verification.abuse_origin_windows (
  key text PRIMARY KEY,
  configuration text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX abuse_origin_expiry ON verification.abuse_origin_windows(expires_at);

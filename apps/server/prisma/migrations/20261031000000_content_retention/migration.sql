-- ADR-0005 fixed content deadline: creation for never-started Checks, otherwise
-- the first end. Later Re-checks, edits and renewals never move it.
ALTER TABLE verification.checks ADD COLUMN started_at TIMESTAMPTZ(3);
ALTER TABLE verification.checks ADD COLUMN content_expires_at TIMESTAMPTZ(3);
UPDATE verification.checks SET content_expires_at = COALESCE(ended_at, created_at) + interval '24 hours';
ALTER TABLE verification.checks ALTER COLUMN content_expires_at SET NOT NULL;
CREATE INDEX checks_content_expiry ON verification.checks(content_expires_at);
-- The content-free Check row stays as the tombstone (IDs, lifecycle times).
ALTER TABLE verification.checks ADD COLUMN deleted_at TIMESTAMPTZ(3);
-- No key data enters WAL, replicas or pg_dump --no-unlogged-table-data.
CREATE UNLOGGED TABLE verification.transient_keys (
  day INTEGER PRIMARY KEY,
  key BYTEA NOT NULL CHECK (octet_length(key) = 32)
);
-- Existing plaintext cannot be admitted through the encrypted persistence codec.
-- Preserve settlement/release metadata before deleting pre-migration content.
INSERT INTO verification.settlement_intents(check_id, position, generation, outcome)
 SELECT check_id, position, generation, 'release' FROM verification.reference_slots WHERE status='running'
 ON CONFLICT DO NOTHING;
DELETE FROM verification.check_events;
DELETE FROM verification.reference_slots;
UPDATE verification.checks SET deleted_at=CURRENT_TIMESTAMP;
-- The verdict is now an authenticated ciphertext envelope, validated on decode.
ALTER TABLE verification.manual_overrides DROP CONSTRAINT manual_overrides_verdict_check;

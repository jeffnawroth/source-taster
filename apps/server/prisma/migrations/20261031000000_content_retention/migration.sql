-- ADR-0005 fixed content deadline: creation for never-started Checks, otherwise
-- the first end. Later Re-checks, edits and renewals never move it.
ALTER TABLE verification.checks ADD COLUMN started_at TIMESTAMPTZ(3);
ALTER TABLE verification.checks ADD COLUMN content_expires_at TIMESTAMPTZ(3);
UPDATE verification.checks SET content_expires_at = COALESCE(ended_at, created_at) + interval '24 hours';
ALTER TABLE verification.checks ALTER COLUMN content_expires_at SET NOT NULL;
CREATE INDEX checks_content_expiry ON verification.checks(content_expires_at);
-- The content-free Check row stays as the tombstone (IDs, lifecycle times).
ALTER TABLE verification.checks ADD COLUMN deleted_at TIMESTAMPTZ(3);

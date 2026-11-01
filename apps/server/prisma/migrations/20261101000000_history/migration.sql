ALTER TABLE verification.checks
 ADD COLUMN history_stored_at timestamptz(3),
 ADD COLUMN history_days integer,
 ADD COLUMN history_order bigint NOT NULL DEFAULT 0,
 ADD COLUMN history_locked boolean NOT NULL DEFAULT false;
CREATE TABLE verification.history_consents (
 owner_id text PRIMARY KEY, account_id text NOT NULL, enabled boolean NOT NULL DEFAULT false,
 authority_version integer NOT NULL DEFAULT 0, extended_until timestamptz(3)
);
CREATE INDEX checks_history_owner ON verification.checks(owner_id, history_stored_at);
-- Consented History survives transient-key shredding; these keys belong in the
-- bounded History backup, and are deleted with their entry.
CREATE TABLE verification.history_keys (check_id uuid PRIMARY KEY REFERENCES verification.checks(id), key bytea NOT NULL);

CREATE SEQUENCE verification.history_storage_order OWNED BY verification.checks.history_order;

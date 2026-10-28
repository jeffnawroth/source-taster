ALTER TABLE verification.reference_slots ADD COLUMN structured JSONB;
CREATE TABLE verification.reference_results (
 id UUID PRIMARY KEY, check_id UUID NOT NULL, position INTEGER NOT NULL,
 content JSONB NOT NULL, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT reference_results_slot_fkey FOREIGN KEY(check_id,position) REFERENCES verification.reference_slots(check_id,position) ON DELETE CASCADE
);
CREATE TABLE verification.source_rates (source TEXT PRIMARY KEY,next_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE verification.source_requests (id UUID PRIMARY KEY,source TEXT NOT NULL,expires_at TIMESTAMPTZ(3) NOT NULL);
CREATE INDEX source_requests_source_expiry ON verification.source_requests(source,expires_at);

CREATE INDEX reference_results_slot_created ON verification.reference_results(check_id,position,created_at);

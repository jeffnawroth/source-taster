ALTER TABLE verification.checks ADD COLUMN guest_context_id uuid;
CREATE TABLE verification.authority_fences (owner_id uuid PRIMARY KEY, version integer NOT NULL CHECK(version > 0));

-- ADR-0003: the verification Owner tombstone. IDs only, never content. It is
-- written in the same transaction that purges the Owner's content and is
-- re-applied after a restore (ADR-0005), so a deleted Owner stays refused.
CREATE TABLE verification.owner_tombstones (
  owner_id uuid PRIMARY KEY,
  deleted_at timestamptz(3) NOT NULL DEFAULT now()
);

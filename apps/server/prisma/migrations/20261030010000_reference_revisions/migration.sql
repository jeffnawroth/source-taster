ALTER TABLE verification.reference_slots ADD COLUMN removed BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE verification.field_revisions (
  check_id UUID NOT NULL, position INTEGER NOT NULL, revision INTEGER NOT NULL,
  content JSONB NOT NULL, provenance TEXT NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(check_id,position,revision),
  FOREIGN KEY(check_id,position) REFERENCES verification.reference_slots(check_id,position) ON DELETE CASCADE
);
INSERT INTO verification.field_revisions(check_id,position,revision,content,provenance)
 SELECT check_id,position,revision,structured,COALESCE(structured->'structuring'->>'path','parser')
 FROM verification.reference_slots WHERE structured IS NOT NULL;

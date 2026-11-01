-- ADR-0017 (#105): the short-lived PDF Verification report. `options` and
-- `file` hold sealed envelopes (see checks/content.ts), never plaintext. A row
-- lives at most 15 minutes and never beyond its Check's deletion deadline.
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "check_id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "state" TEXT NOT NULL,
    "failure" TEXT,
    "intermediate" BOOLEAN,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "file" JSONB,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reports_check_id_idx" ON "reports"("check_id");
CREATE INDEX "reports_expiry" ON "reports"("expires_at");
ALTER TABLE "reports" ADD CONSTRAINT "reports_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

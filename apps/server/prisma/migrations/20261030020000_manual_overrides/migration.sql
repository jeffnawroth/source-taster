-- SPDX-License-Identifier: AGPL-3.0-or-later
CREATE TABLE "manual_overrides" (
  "result_id" UUID PRIMARY KEY REFERENCES "reference_results"("id") ON DELETE CASCADE,
  "id" UUID NOT NULL UNIQUE,
  "verdict" TEXT NOT NULL CHECK ("verdict" IN ('correct', 'exists-with-deviations', 'mixed-citation', 'doi-conflict', 'not-found', 'not-verifiable')),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

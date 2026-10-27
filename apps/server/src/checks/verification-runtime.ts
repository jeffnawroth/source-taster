// SPDX-License-Identifier: AGPL-3.0-or-later
// Composition seam for #81 clock/abort and #96 dispatch/commit authority. This
// module supplies no cancellation, lease or hosted authorization policy itself.
import { createDoiVerification, developmentProfile } from "@source-taster/core";
import type { Db } from "../db/prisma.ts";
import type { Config } from "../config.ts";
import {
  createDoiAdapters,
  systemSourceClock,
  type SourceClock,
} from "../sources/doi.ts";
import { sourceBudget } from "../sources/budget.ts";
export function referenceExecution(
  config: Config,
  db: Db,
  context: {
    clock?: SourceClock;
    signal?: AbortSignal;
    beforeSource?: (source: "doi.org" | "crossref") => Promise<void>;
  } = {},
) {
  const clock = context.clock ?? systemSourceClock;
  return createDoiVerification({
    ...createDoiAdapters({
      resolverBase: config.resolverBase,
      crossrefBase: config.crossrefBase,
      budget: sourceBudget(db, context.signal, clock),
      beforeRequest: context.beforeSource,
      clock,
      signal: context.signal,
    }),
    now: clock.now,
    rules: {
      version: `doi-tracer-1-entities-4.5.0-uncalibrated-unicode-${process.versions.unicode}-icu-${process.versions.icu}`,
      calibration: "uncalibrated",
      unicode: process.versions.unicode!,
      icu: process.versions.icu!,
      profile: developmentProfile,
    },
  });
}

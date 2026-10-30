// SPDX-License-Identifier: AGPL-3.0-or-later
// Composition seam for #81 clock/abort and #96 dispatch/commit authority. This
// module supplies no cancellation, lease or hosted authorization policy itself.
import {
  createDoiVerification,
  createBibliographicVerification,
  comparisonLimits,
  journalAbbreviationRules,
  type Evidence,
} from "@source-taster/core";
import { createHash } from "node:crypto";
import type { Db } from "../db/prisma.ts";
import type { Config } from "../config.ts";
import {
  createDoiAdapters,
  systemSourceClock,
  type SourceClock,
  type SourceDispatch,
} from "../sources/doi.ts";
import { crossrefAdapter } from "../sources/crossref.ts";
import { openalexAdapter } from "../sources/openalex.ts";
import { googlebooksAdapter } from "../sources/googlebooks.ts";
import { openlibraryAdapter } from "../sources/openlibrary.ts";
import { sourceBudget } from "../sources/budget.ts";
export function referenceExecution(
  config: Config,
  db: Db,
  context: {
    apiVersion?: number;
    clock?: SourceClock;
    signal?: AbortSignal;
    dispatchSource?: (
      send: () => Promise<SourceDispatch | null>,
    ) => Promise<SourceDispatch | null>;
    beforeSource?: (source: Evidence["source"]) => Promise<void>;
  } = {},
) {
  const clock = context.clock ?? systemSourceClock;
  const adapters = createDoiAdapters({
    resolverBase: config.resolverBase,
    crossrefBase: config.crossrefBase,
    budget: sourceBudget(db, context.signal, clock, config.catalogRates),
    beforeRequest: context.beforeSource,
    dispatch: context.dispatchSource,
    clock,
    signal: context.signal,
  });
  const options = {
    ...adapters,
    now: clock.now,
    parameters: config.comparisonProfile,
    rules: {
      version: `comparison-75-3-date-ranges-20261028-journal-76-1-entities-4.5.0-uncalibrated-${createHash(
        "sha256",
      )
        .update(
          JSON.stringify({
            parameters: config.comparisonProfile,
            limits: comparisonLimits,
            journalAbbreviations: journalAbbreviationRules,
          }),
        )
        .digest(
          "hex",
        )}-unicode-${process.versions.unicode}-icu-${process.versions.icu}`,
      calibration: "uncalibrated",
      unicode: process.versions.unicode!,
      icu: process.versions.icu!,
      profile: { ...config.comparisonProfile },
    },
  } as const;
  return context.apiVersion === 2 && config.bibliographicPreview
    ? createBibliographicVerification({
        ...options,
        catalogRates: config.catalogRates,
        sources: [
          ...(config.openalexEnabled
            ? [openalexAdapter(adapters.request, config.openalexBase!)]
            : []),
          crossrefAdapter(
            adapters.request,
            config.crossrefBase,
            adapters.source,
            adapters.project,
          ),
          ...(config.openlibraryEnabled
            ? [openlibraryAdapter(adapters.request, config.openlibraryBase!)]
            : []),
          ...(config.googlebooksEnabled
            ? [googlebooksAdapter(adapters.request, config.googlebooksBase!)]
            : []),
        ],
      })
    : createDoiVerification(options);
}

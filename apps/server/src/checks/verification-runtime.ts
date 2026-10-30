// SPDX-License-Identifier: AGPL-3.0-or-later
// Composition seam for #81 clock/abort and #96 dispatch/commit authority. This
// module supplies no cancellation, lease or hosted authorization policy itself.
import {
  createDoiVerification,
  createBibliographicVerification,
  comparisonLimits,
  defaultSearchSettings,
  referenceDeadlineMs,
  type SearchSettings,
  type SourceName,
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
import { europepmcAdapter } from "../sources/europepmc.ts";
import { semanticscholarAdapter } from "../sources/semanticscholar.ts";
import { arxivAdapter } from "../sources/arxiv.ts";
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
    beforeSource?: (source: SourceName) => Promise<void>;
  } = {},
) {
  const clock = context.clock ?? systemSourceClock;
  const article = context.apiVersion === 2 && config.bibliographicPreview;
  // Version 1 stays frozen: default pacing, and a permit wait bounded only by
  // the Reference deadline.
  const settings: SearchSettings = article
    ? config.searchSettings
    : {
        ...defaultSearchSettings,
        sources: Object.fromEntries(
          Object.entries(defaultSearchSettings.sources).map(([name, s]) => [
            name,
            { ...s, maxWaitMs: referenceDeadlineMs },
          ]),
        ) as SearchSettings["sources"],
      };
  const adapters = createDoiAdapters({
    resolverBase: config.resolverBase,
    crossrefBase: config.crossrefBase,
    budget: sourceBudget(db, context.signal, clock, settings),
    ...(article ? { settings, timeoutReason: "timeout" } : {}),
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
      version: `comparison-75-3-date-ranges-20261028-entities-4.5.0-uncalibrated-${createHash(
        "sha256",
      )
        .update(
          JSON.stringify({
            parameters: config.comparisonProfile,
            limits: comparisonLimits,
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
  return article
    ? createBibliographicVerification({
        ...options,
        settings,
        // Exact settings enter the Search strategy version (spec #70).
        settingsVersion: createHash("sha256")
          .update(JSON.stringify(canonical(settings)))
          .digest("hex")
          .slice(0, 16),
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
          ...(config.europepmcEnabled
            ? [europepmcAdapter(adapters.request, config.europepmcBase!)]
            : []),
          ...(config.semanticscholarEnabled
            ? [
                semanticscholarAdapter(
                  adapters.request,
                  config.semanticscholarBase!,
                ),
              ]
            : []),
          ...(config.arxivEnabled
            ? [arxivAdapter(adapters.request, config.arxivBase!)]
            : []),
        ],
      })
    : createDoiVerification(options);
}
function canonical(value: unknown): unknown {
  return value && typeof value === "object"
    ? Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [
            key,
            canonical((value as Record<string, unknown>)[key]),
          ]),
      )
    : value;
}

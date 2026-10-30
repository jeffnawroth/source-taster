// SPDX-License-Identifier: AGPL-3.0-or-later
// Composition seam for #81 clock/abort and #96 dispatch/commit authority. This
// module supplies no cancellation, lease or hosted authorization policy itself.
import {
  createDoiVerification,
  createBibliographicVerification,
  comparisonLimits,
  journalAbbreviationRules,
  defaultSearchSettings,
  referenceDeadlineMs,
  type SearchSettings,
  type SourceName,
  type StructuredReference,
  isBookReference,
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
import { googlebooksAdapter } from "../sources/googlebooks.ts";
import { openlibraryAdapter } from "../sources/openlibrary.ts";
import { sourceBudget } from "../sources/budget.ts";
import { identifierBatches } from "../sources/batch.ts";
// Identifier lookups of all Reference runs in this process share batches.
const processBatches = identifierBatches();
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
  const bibliographic =
    context.apiVersion === 2 && !!config.bibliographicPreview;
  // Version 1 stays frozen: default pacing, and a permit wait bounded only by
  // the Reference deadline.
  const settings: SearchSettings = bibliographic
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
  // Exact settings enter the Search strategy version (spec #70).
  const settingsVersion = createHash("sha256")
    .update(JSON.stringify(canonical(settings)))
    .digest("hex")
    .slice(0, 16);
  const rules = {
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
  } as const;
  return (
    reference: StructuredReference,
    execution?: { startedAt: number },
  ) => {
    // Extended Crossref/OpenAlex book metadata only on the /v2 book route.
    const bookMetadata = bibliographic && isBookReference(reference.csl.type);
    const adapters = createDoiAdapters({
      bookMetadata,
      resolverBase: config.resolverBase,
      crossrefBase: config.crossrefBase,
      budget: sourceBudget(db, context.signal, clock, settings),
      ...(bibliographic ? { settings, timeoutReason: "timeout" } : {}),
      beforeRequest: context.beforeSource,
      dispatch: context.dispatchSource,
      clock,
      signal: context.signal,
      batches: processBatches,
    });
    const options = {
      ...adapters,
      now: clock.now,
      parameters: config.comparisonProfile,
      rules,
    } as const;
    const verify = bibliographic
      ? createBibliographicVerification({
          ...options,
          settings,
          settingsVersion,
          sources: [
            ...(config.openalexEnabled
              ? [
                  openalexAdapter(
                    adapters.request,
                    config.openalexBase!,
                    bookMetadata,
                  ),
                ]
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
                    adapters.batched,
                    config.semanticscholarBase!,
                  ),
                ]
              : []),
            ...(config.arxivEnabled
              ? [
                  arxivAdapter(
                    adapters.request,
                    adapters.batched,
                    config.arxivBase!,
                  ),
                ]
              : []),
            ...(config.openlibraryEnabled
              ? [openlibraryAdapter(adapters.request, config.openlibraryBase!)]
              : []),
            ...(config.googlebooksEnabled
              ? [googlebooksAdapter(adapters.request, config.googlebooksBase!)]
              : []),
          ],
        })
      : createDoiVerification(options);
    return verify(reference, execution);
  };
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

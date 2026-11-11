// SPDX-License-Identifier: AGPL-3.0-or-later
// Deterministic Check snapshots that exercise every block the report layout
// can emit: overview counts, a manual Verdict beside the system Verdict,
// differing fields, a Best match with a doi.org link, a Correction suggestion,
// a Verdict without a match, every Status, diacritics and long unbroken URLs.
// They are parsed with the published Check schema, so a drift in the contract
// fails here instead of producing an unrepresentative sample. The PDF is made
// by the production path (`generateReport`, the resource-limited worker).
import { Check } from "@source-taster/contract-verification/v2";
import type { ReportLanguage } from "@source-taster/contract-verification/report";
import { generateReport } from "../../src/reports/generate.ts";

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const observedAt = "2026-11-05T08:00:00.000Z";
const scoringRules = {
  version: "scoring-rules-2026.1+sample",
  calibration: "uncalibrated" as const,
  unicode: "16.0.0",
  icu: "77.1",
  profile: { title: 40, author: 30, issued: 10 },
};
const score = (value: number, fullAgreement: boolean) => ({
  value,
  fullAgreement,
});

function verdict(
  verdictName:
    | "correct"
    | "exists-with-deviations"
    | "mixed-citation"
    | "doi-conflict"
    | "not-found"
    | "not-verifiable",
  doi: string,
  title: string,
  differing: boolean,
) {
  const csl = {
    type: "article-journal",
    title,
    author: [{ family: "Müller", given: "Jürgen" }],
    issued: { literal: "2010" },
    "container-title": "Zeitschrift für Größenforschung",
    volume: "12",
    page: "3-17",
    DOI: doi,
  };
  const candidate = {
    id: doi,
    source: "crossref" as const,
    origin: "doi" as const,
    slot: 1,
    retrievedAt: observedAt,
    csl,
    raw: { type: "journal-article" },
    fields: [
      {
        field: "title",
        reference: "Größe & Maß (2010)",
        candidate: title,
        score: score(differing ? 61 : 100, !differing),
        reason: "compared" as const,
      },
      {
        field: "issued",
        reference: { literal: "2009" },
        candidate: { literal: "2010" },
        score: score(differing ? 0 : 100, !differing),
        reason: "compared" as const,
        agreement: !differing,
      },
      {
        field: "custom-field",
        reference: ["a", "b"],
        candidate: null,
        score: null,
        reason: "missing-candidate" as const,
        agreement: false,
      },
    ],
    score: score(differing ? 61 : 100, !differing),
  };
  return {
    kind: "verdict" as const,
    verdict: verdictName,
    reference: {
      originalText: "Müller, J. (2010). Größe & Maß.",
      span: { start: 0, end: 31 },
      csl: { title: "Größe & Maß (2010)" },
      fieldSources: {},
      structuring: { path: "parser" as const, version: "sample" },
    },
    scoringRules,
    searchStrategyVersion: "sample",
    searchConfiguration: {},
    identity: {
      kind: "supplied-doi" as const,
      candidateId: doi,
    },
    bestMatchId: doi,
    candidates: [candidate],
    evidence: [],
    reasons: [differing ? "fields-differ" : "identified"] as (
      "fields-differ" | "identified"
    )[],
    failedSources: [],
    retraction: "unknown" as const,
  };
}

const notFound = {
  ...verdict("not-found", "10.1000/none", "unused", false),
  verdict: "not-found" as const,
  identity: { kind: "unresolved" as const },
  bestMatchId: null,
  candidates: [],
  reasons: ["identity-unresolved", "sources-unavailable"] as (
    "identity-unresolved" | "sources-unavailable"
  )[],
  failedSources: ["crossref", "openalex"] as ("crossref" | "openalex")[],
};

function slot(
  n: number,
  originalText: string,
  outcome: unknown,
  extra: Record<string, unknown> = {},
) {
  return {
    slot: n,
    originalText,
    outcome,
    progress: "ended",
    revision: 1,
    fields: {},
    revisions: [],
    results: [],
    manualOverride: null,
    manualOverrideReset: false,
    quotaEffect: "new-work",
    ...extra,
  };
}
const status = (name: string) => ({ kind: "status", status: name });

function check(state: "ended" | "running", references: unknown[]) {
  return Check.parse({
    id: id(1),
    state,
    lastEventSeq: 1,
    lastEventCursor: "cursor",
    leaseRenewAfterMs: 30_000,
    endReason: state === "ended" ? "completed" : null,
    references,
  });
}

/** A finished Check: every Verdict shape and every Status that can end a Check. */
export function finalSample() {
  return check("ended", [
    slot(
      1,
      "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 12. Кириллица, ə, ǂ, ᵹ.",
      verdict("correct", "10.1038/nphys1170", "Measured measurement", false),
    ),
    slot(
      2,
      "Müller, J. (2010). Größe & Maß (2010). Zeitschrift für Größenforschung 12, 3-17. https://example.org/a/very/long/path/without/any/natural/break/points/that/must/wrap/across/the/line/boundary/1234567890/abcdefghijklmnopqrstuvwxyz",
      verdict(
        "exists-with-deviations",
        "10.5555/gro-masz.2010",
        "Größe, Maß und Gewicht",
        true,
      ),
      {
        manualOverride: {
          id: id(20),
          resultId: id(21),
          verdict: "correct",
          createdAt: "2026-11-05T08:30:00.000Z",
        },
      },
    ),
    slot(3, "Unknown, A. (1999). Nobody wrote this.", notFound),
    slot(4, "Cancelled before it ran (2020).", status("cancelled")),
    slot(5, "The check failed for this one (2021).", status("failed")),
  ]);
}

/** A running Check: an intermediate snapshot with unfinished Statuses. */
export function intermediateSample() {
  return check("running", [
    slot(
      1,
      "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 12.",
      verdict("correct", "10.1038/nphys1170", "Measured measurement", false),
    ),
    slot(2, "Still being checked (2020).", status("running"), {
      progress: "crossref",
    }),
    slot(3, "Not yet checked (2021).", status("not-checked"), {
      progress: "queued",
    }),
  ]);
}

/**
 * A finished Check long enough to span several pages, so paragraphs, lists and
 * long wrapping DOI links straddle page breaks.
 */
export function longSample() {
  const references = Array.from({ length: 28 }, (_, index) => {
    const n = index + 1;
    const doi = `10.5555/${"long-identifier-segment-".repeat(n === 1 ? 45 : 1 + (n % 4))}${n}`;
    const text = `Schröder, K., & Núñez, P. (${2000 + n}). ${"Ein langer Titel über Größe, Maß und Gewicht von Quellen. ".repeat(n === 1 ? 120 : 1 + (n % 3))}Journal ${n}, ${n}(2), ${n}-${n + 14}. https://doi.org/${doi}`;
    return slot(
      n,
      text,
      n % 5 === 0
        ? notFound
        : verdict(
            (
              [
                "correct",
                "exists-with-deviations",
                "mixed-citation",
                "doi-conflict",
                "not-found",
                "not-verifiable",
              ] as const
            )[n % 6]!,
            doi,
            `Titel ${n}: ${"Größe und Maß ".repeat(1 + (n % 3))}`,
            n % 2 === 1,
          ),
    );
  });
  return check("ended", references);
}

export interface Sample {
  name: string;
  language: ReportLanguage;
  pdf: Uint8Array;
}

/** DE and EN reports of both samples, generated by the production worker path. */
export async function generateSamples(): Promise<Sample[]> {
  const out: Sample[] = [];
  for (const language of ["en", "de"] as const)
    for (const [name, sample] of [
      ["final", finalSample()],
      ["intermediate", intermediateSample()],
      ["long", longSample()],
    ] as const)
      out.push({
        name: `report-${name}-${language}`,
        language,
        pdf: await generateReport({
          check: sample,
          language,
          style: "apa",
          documentName:
            language === "de" ? "Bachelorarbeit Größe.docx" : "Thesis 3.docx",
          capturedAt: "2026-11-05T08:00:00.000Z",
        }),
      });
  return out;
}

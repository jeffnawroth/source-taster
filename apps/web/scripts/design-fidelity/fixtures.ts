// SPDX-License-Identifier: AGPL-3.0-or-later
// Data-only projection into accepted #194's throwaway fixture model. The
// prototype's renderer, classes, layout, tokens and CSS remain untouched.
import type { Page } from "@playwright/test";
import {
  Check as CheckSchema,
  type Check,
  type CheckResponse,
  type ReferenceSlot,
  type ReferenceOutcome,
  type StructuredCsl,
  type SourceEvidence,
  type Verdict,
} from "@source-taster/contract-verification/v2";
import type { Bibliography } from "@source-taster/contract-verification/bibliography";
import { AiStructuringResult } from "@source-taster/contract-verification/ai";
import en from "../../../../packages/i18n/messages/en.json" with { type: "json" };
import de from "../../../../packages/i18n/messages/de.json" with { type: "json" };

type Locale = "en" | "de";
type Localized = [string, string];
type PrototypeVerdict =
  | "correct"
  | "deviations"
  | "mixed"
  | "doi-conflict"
  | "not-found"
  | "not-verifiable";
type Step = "ok" | "diff" | "bad" | "warn" | "none";
interface PrototypeReference {
  id: number;
  title: string;
  au: string;
  yr: string;
  meta: string;
  verdict: PrototypeVerdict | null;
  sysVerdict: PrototypeVerdict | null;
  status:
    | "idle"
    | "queued"
    | "running"
    | "done"
    | "failed"
    | "cancelled"
    | "not-checked";
  reason: Localized;
  trail: ["s" | "e", Localized, Step][];
  rows: [string, string, string, 0 | 1, string[]][] | null;
  srcs: [string, Step, Localized, number][];
  candidates: { src: string; score: number; title: string; yr: string }[];
  step: number;
  fields: Record<string, string>;
  draft: null;
  hist: null;
  override: { verdict: PrototypeVerdict; note: Localized } | null;
  overrideFixture: null;
  exportPick: boolean;
  accepted: boolean;
  revision: number;
  suggestion?: { style: string; track: string[]; by: string[] };
}
export interface FixtureNormalization {
  path: string;
  kind:
    | "reference-data"
    | "input-data"
    | "quota-data"
    | "account-data"
    | "original-input-text";
  before: unknown;
  after: unknown;
}
export interface NormalizationOptions {
  /** Exact input submitted through the real product driver. */
  inputText?: string;
  /** Match the real open detail, rather than the prototype's default slot 3. */
  selectedSlot?: number;
  /** Only actual server-generated suggestions may be inserted. */
  bibliography?: Bibliography;
  quota?: { granted: number; remaining: number; reserved: number };
  account?: {
    kind: "guest" | "free";
    email?: string;
    name?: string;
    plan?: string;
  };
}
export interface FixtureAlignment {
  source: "actual-verification-api-v2";
  checkId: string;
  locale: Locale;
  referenceSlots: number[];
  normalizations: FixtureNormalization[];
  limitations: string[];
}
export interface StructuringFixtureAlignment {
  source: "actual-structuring-api";
  referencePositions: number[];
  normalizations: FixtureNormalization[];
  limitations: string[];
}
const verdicts: Record<Verdict, PrototypeVerdict> = {
  correct: "correct",
  "exists-with-deviations": "deviations",
  "mixed-citation": "mixed",
  "doi-conflict": "doi-conflict",
  "not-found": "not-found",
  "not-verifiable": "not-verifiable",
};
const names: Record<SourceEvidence["source"], string> = {
  "doi.org": "doi.org",
  crossref: "Crossref",
  openalex: "OpenAlex",
  europepmc: "Europe PMC",
  semanticscholar: "Semantic Scholar",
  arxiv: "arXiv",
  openlibrary: "Open Library",
  googlebooks: "Google Books",
  url: "URL",
  internetarchive: "Internet Archive",
};
const reasonKeys = {
  "url-unavailable": "reason_url_unavailable",
  "web-original-unavailable": "reason_web_original_unavailable",
  "outside-coverage": "reason_outside_coverage",
  "doi-nonexistent": "reason_doi_nonexistent",
  "foreign-doi": "reason_foreign_doi",
  "mandatory-resolution-incomplete": "reason_resolution_incomplete",
  "metadata-unavailable": "reason_metadata_unavailable",
  "url-verification-incomplete": "reason_url_incomplete",
  "identity-unresolved": "reason_identity_unresolved",
  "development-route-incomplete": "reason_route_incomplete",
  identified: "reason_identified",
  "fields-differ": "reason_fields_differ",
  "mixed-components": "reason_mixed_components",
  "search-completed": "reason_search_completed",
  "ambiguous-identity": "reason_ambiguous_identity",
  "insufficient-search": "reason_insufficient_search",
  "sources-unavailable": "reason_sources_unavailable",
} as const satisfies Record<
  Extract<ReferenceOutcome, { kind: "verdict" }>["reasons"][number],
  keyof typeof en
>;
const evidenceSteps: Partial<Record<SourceEvidence["outcome"], Step>> = {
  exists: "ok",
  redirect: "ok",
  candidate: "ok",
  nonexistent: "bad",
  unavailable: "warn",
  "no-record": "none",
};
const verdictSteps: Record<Verdict, Step> = {
  correct: "ok",
  "exists-with-deviations": "diff",
  "mixed-citation": "diff",
  "doi-conflict": "bad",
  "not-found": "none",
  "not-verifiable": "warn",
};
const fieldKeys: Record<string, string> = {
  issued: "year",
  "container-title": "journal",
  DOI: "doi",
  ISBN: "isbn",
  page: "pages",
};
const localized = (key: keyof typeof en): Localized => [de[key], en[key]];
function fieldValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value))
    return value.map(fieldValue).filter(Boolean).join("; ");
  if (typeof value === "object")
    return Object.values(value).map(fieldValue).filter(Boolean).join(" ");
  if (typeof value === "string") return value;
  return typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
    ? `${value}`
    : "";
}
function authors(csl: StructuredCsl) {
  return (
    csl.author
      ?.map(
        (author) =>
          author.literal ??
          [author.given, author.family].filter(Boolean).join(" "),
      )
      .join("; ") ?? ""
  );
}
function displayField(key: string, value: unknown): string {
  if (key === "author" && Array.isArray(value))
    return authors({ author: value as NonNullable<StructuredCsl["author"]> });
  return fieldValue(value);
}

/** Positions before a Check exists are not committed Reference slots. */
export function projectStructuredReference(
  reference: AiStructuringResult["references"][number],
  position: number,
): PrototypeReference {
  const csl = reference.csl;
  return {
    id: position,
    title: csl.title ?? reference.originalText,
    au: authors(csl),
    yr: csl.issued?.literal ?? "",
    meta: [
      csl["container-title"],
      csl.volume,
      csl.issue,
      csl.page,
      csl.publisher,
      csl.DOI ? `doi:${csl.DOI}` : undefined,
      csl.ISBN ? `ISBN ${csl.ISBN}` : undefined,
    ]
      .filter(Boolean)
      .join(" · "),
    verdict: null,
    sysVerdict: null,
    status: "idle",
    reason: ["", ""],
    // Decorative empty track only. No Data source or future search is named.
    trail: [
      ["s", ["", ""], "warn"],
      ["s", ["", ""], "warn"],
      ["s", ["", ""], "warn"],
    ],
    rows: null,
    srcs: [],
    candidates: [],
    step: 0,
    fields: Object.fromEntries(
      Object.entries(csl).map(([key, value]) => [
        fieldKeys[key] ?? key,
        displayField(key, value),
      ]),
    ),
    draft: null,
    hist: null,
    override: null,
    overrideFixture: null,
    exportPick: false,
    accepted: false,
    revision: 1,
  };
}

/** Align the source counted fixture with free Structuring, without inventing a Check. */
export async function normalizeStructuringPrototype(
  page: Page,
  result: AiStructuringResult,
  inputText: string,
): Promise<StructuringFixtureAlignment> {
  const structured = AiStructuringResult.parse(result);
  const references = structured.references.map((reference, index) =>
    projectStructuredReference(reference, index + 1),
  );
  const normalizations = await page.evaluate(
    ({ references, inputText }) => {
      interface Port {
        REFS: PrototypeReference[];
        INPUT_TEXT: string;
        state: {
          refs: PrototypeReference[];
          input: string;
          stage: string;
          view: string;
          selected: number | null;
        };
        act: { nav(view: string): void };
      }
      const ST = (window as unknown as { ST: Port }).ST;
      if (!ST?.state || !ST.act)
        throw new Error("Accepted #194 prototype state is unavailable.");
      const changes: FixtureNormalization[] = [];
      const record = (
        path: string,
        kind: FixtureNormalization["kind"],
        before: unknown,
        after: unknown,
      ) => {
        if (JSON.stringify(before) !== JSON.stringify(after))
          changes.push({
            path,
            kind,
            before: before ?? null,
            after: after ?? null,
          });
      };
      for (const reference of references) {
        const before = ST.state.refs.find((item) => item.id === reference.id);
        for (const key of Object.keys({
          ...before,
          ...reference,
        }) as (keyof PrototypeReference)[])
          record(
            `references.${reference.id}.${key}`,
            "reference-data",
            before?.[key],
            reference[key],
          );
      }
      record(
        "references.length",
        "reference-data",
        ST.state.refs.length,
        references.length,
      );
      record("inputText", "input-data", ST.state.input, inputText);
      record("stage", "reference-data", ST.state.stage, "counted");
      ST.REFS = structuredClone(references);
      ST.state.refs = structuredClone(references);
      ST.INPUT_TEXT = inputText;
      ST.state.input = inputText;
      ST.state.stage = "counted";
      ST.state.selected = null;
      ST.act.nav("check");
      return changes;
    },
    { references, inputText },
  );
  return {
    source: "actual-structuring-api",
    referencePositions: references.map((reference) => reference.id),
    normalizations,
    limitations: [
      "Positions identify recognized input order, not allocated Check slots; no Check or result is fabricated.",
      "Three empty decorative track nodes have no Data source labels and represent no observed or promised searches.",
      "Prototype markup, classes, layout, tokens, CSS and pre-search action recipes remain unchanged.",
    ],
  };
}
/** Same grouping policy as the built EvidenceTrack: one queried source,
 * first-query order, with the most telling actually observed outcome. */
function queried(evidence: readonly SourceEvidence[]) {
  const bySource = new Map<string, SourceEvidence>(),
    rank: Step[] = ["ok", "bad", "warn", "none"];
  for (const entry of evidence) {
    const step = evidenceSteps[entry.outcome];
    if (!step) continue;
    const previous = bySource.get(entry.source);
    if (
      !previous ||
      rank.indexOf(step) < rank.indexOf(evidenceSteps[previous.outcome]!)
    )
      bySource.set(entry.source, entry);
  }
  return [...bySource.values()];
}
function evidenceText(entry: SourceEvidence): Localized {
  const key =
    `evidence_${entry.outcome.replaceAll("-", "_")}` as keyof typeof en;
  if (!(key in en)) throw new Error(`Unmapped evidence label ${entry.outcome}`);
  return localized(key);
}
export function projectReference(
  reference: ReferenceSlot,
  options: NormalizationOptions = {},
): PrototypeReference {
  const outcome = reference.outcome,
    csl = reference.fields;
  const verdict = outcome.kind === "verdict" ? outcome.verdict : null;
  const sources = outcome.kind === "verdict" ? queried(outcome.evidence) : [];
  const reason: Localized =
    outcome.kind === "verdict"
      ? [
          outcome.reasons.map((code) => de[reasonKeys[code]]).join(" "),
          outcome.reasons.map((code) => en[reasonKeys[code]]).join(" "),
        ]
      : ["", ""];
  const best =
    outcome.kind === "verdict"
      ? outcome.candidates.find(
          (candidate) => candidate.id === outcome.bestMatchId,
        )
      : undefined;
  const fields = Object.fromEntries(
    Object.entries(csl).map(([key, value]) => [
      fieldKeys[key] ?? key,
      displayField(key, value),
    ]),
  );
  const rows = best
    ? best.fields.map(
        (comparison): [string, string, string, 0 | 1, string[]] => [
          fieldKeys[comparison.field] ?? comparison.field,
          displayField(comparison.field, comparison.reference),
          displayField(comparison.field, comparison.candidate),
          comparison.agreement === false ||
          (comparison.score && !comparison.score.fullAgreement)
            ? 1
            : 0,
          [names[best.source]],
        ],
      )
    : null;
  const trail: PrototypeReference["trail"] = sources.map((entry) => [
    "s",
    [names[entry.source], names[entry.source]],
    evidenceSteps[entry.outcome]!,
  ]);
  if (outcome.kind === "status" && outcome.status === "running") {
    const source =
      reference.progress in names
        ? names[reference.progress as SourceEvidence["source"]]
        : "";
    trail.push([
      "s",
      source ? [source, source] : localized("reference_queued"),
      "warn",
    ]);
  }
  if (verdict)
    trail.push([
      "e",
      localized(
        (
          {
            correct: "verdict_correct",
            "exists-with-deviations": "verdict_exists",
            "mixed-citation": "verdict_mixed",
            "doi-conflict": "verdict_doi_conflict",
            "not-found": "verdict_not_found",
            "not-verifiable": "verdict_not_verifiable",
          } as const
        )[verdict],
      ),
      verdictSteps[verdict],
    ]);
  const status =
    outcome.kind === "verdict"
      ? "done"
      : outcome.status === "running" && reference.progress === "queued"
        ? "queued"
        : outcome.status;
  const result: PrototypeReference = {
    id: reference.slot,
    title: csl.title ?? reference.originalText,
    au: authors(csl),
    yr: csl.issued?.literal ?? "",
    meta: [
      csl["container-title"],
      csl.volume,
      csl.issue,
      csl.page,
      csl.publisher,
      csl.DOI ? `doi:${csl.DOI}` : undefined,
      csl.ISBN ? `ISBN ${csl.ISBN}` : undefined,
    ]
      .filter(Boolean)
      .join(" · "),
    verdict: verdict ? verdicts[verdict] : null,
    sysVerdict: verdict ? verdicts[verdict] : null,
    status,
    reason,
    trail,
    rows,
    srcs: sources.map((entry) => [
      names[entry.source],
      evidenceSteps[entry.outcome]!,
      evidenceText(entry),
      entry.durationMs,
    ]),
    candidates:
      outcome.kind === "verdict"
        ? outcome.candidates.map((candidate) => ({
            src: names[candidate.source],
            score: (candidate.score?.value ?? 0) / 100_000_000,
            title: candidate.csl.title ?? "",
            yr: candidate.csl.issued?.literal ?? "",
          }))
        : [],
    step: status === "done" ? trail.length : 0,
    fields,
    draft: null,
    hist: null,
    override: reference.manualOverride
      ? { verdict: verdicts[reference.manualOverride.verdict], note: ["", ""] }
      : null,
    overrideFixture: null,
    exportPick: false,
    accepted: false,
    revision: reference.revision,
  };
  const suggestion = options.bibliography?.entries.find(
    (entry) => entry.slot === reference.slot,
  )?.suggestion;
  if (suggestion)
    result.suggestion = {
      style: options.bibliography!.style,
      track: [suggestion.text],
      by: best ? [names[best.source]] : [],
    };
  return result;
}
/** Align fixture values only. Designed markup/classes/styles are not changed.
 * Call after the real product state has been reached and before source actions.
 * Every replaced source value is retained in the returned report. */
export async function normalizePrototype(
  page: Page,
  snapshot: Check | CheckResponse,
  locale: Locale,
  options: NormalizationOptions = {},
): Promise<FixtureAlignment> {
  const check = CheckSchema.parse(
    "data" in snapshot ? snapshot.data : snapshot,
  );
  const references = check.references.map((reference) =>
    projectReference(reference, options),
  );
  const originals = Object.fromEntries(
    check.references.map((reference) => [
      reference.slot,
      reference.originalText,
    ]),
  );
  const normalizations = await page.evaluate(
    ({ references, originals, options }) => {
      interface Port {
        REFS: PrototypeReference[];
        INPUT_TEXT: string;
        ACCOUNT: { free: { name: string; email: string; plan: string } };
        state: {
          view: string;
          stage: string;
          refs: PrototypeReference[];
          input: string;
          selected: number | null;
          quota: { granted: number; remaining: number; reserved: number };
          account: string;
          quotaMode: string;
        };
        act: { nav(view: string): void };
        fixtureOriginals?: Record<string, string>;
        fixtureObserver?: MutationObserver;
      }
      const ST = (window as unknown as { ST: Port }).ST;
      if (!ST?.state || !ST.act)
        throw new Error("Accepted #194 prototype state is unavailable.");
      const changed: FixtureNormalization[] = [];
      function replace(
        path: string,
        kind: FixtureNormalization["kind"],
        before: unknown,
        after: unknown,
      ) {
        if (JSON.stringify(before) !== JSON.stringify(after))
          changed.push({
            path,
            kind,
            before: before ?? null,
            after: after ?? null,
          });
      }
      for (const reference of references) {
        const before = ST.state.refs.find((item) => item.id === reference.id);
        const keys = Object.keys({
          ...before,
          ...reference,
        }) as (keyof PrototypeReference)[];
        for (const key of keys)
          replace(
            `references.${reference.id}.${key}`,
            "reference-data",
            before?.[key],
            reference[key],
          );
      }
      replace(
        "references.length",
        "reference-data",
        ST.state.refs.length,
        references.length,
      );
      ST.REFS = structuredClone(references);
      ST.state.refs = structuredClone(references);
      if (options.inputText !== undefined) {
        replace("inputText", "input-data", ST.state.input, options.inputText);
        ST.INPUT_TEXT = options.inputText;
        ST.state.input = options.inputText;
      }
      if (options.selectedSlot !== undefined) {
        if (
          !references.some((reference) => reference.id === options.selectedSlot)
        )
          throw new Error(
            `Selected slot ${options.selectedSlot} is not in the real Check.`,
          );
        replace(
          "selectedSlot",
          "reference-data",
          ST.state.selected,
          options.selectedSlot,
        );
        ST.state.selected = options.selectedSlot;
      } else if (
        ST.state.selected !== null &&
        !references.some((reference) => reference.id === ST.state.selected)
      ) {
        replace(
          "selectedSlot",
          "reference-data",
          ST.state.selected,
          references[0]?.id ?? null,
        );
        ST.state.selected = references[0]?.id ?? null;
      }
      if (options.quota) {
        replace("quota", "quota-data", ST.state.quota, options.quota);
        ST.state.quota = { ...options.quota };
        ST.state.quotaMode = "enough";
      }
      if (options.account) {
        replace(
          "account.kind",
          "account-data",
          ST.state.account,
          options.account.kind,
        );
        ST.state.account = options.account.kind;
        for (const key of ["email", "name", "plan"] as const)
          if (options.account[key] !== undefined) {
            replace(
              `account.${key}`,
              "account-data",
              ST.ACCOUNT.free[key],
              options.account[key],
            );
            ST.ACCOUNT.free[key] = options.account[key]!;
          }
      }
      // The source fixture re-composes the original string from title/author/year.
      // Real input has its own immutable spelling, independently of parsed fields.
      // Replace that text node only; preserve its .orig element, layout and styles.
      ST.fixtureOriginals = originals;
      const alignOriginal = () => {
        const original =
          ST.state.selected === null
            ? undefined
            : ST.fixtureOriginals?.[ST.state.selected];
        const node = document.querySelector(".v-D .detail .orig");
        if (node && original !== undefined && node.textContent !== original)
          node.textContent = original;
      };
      ST.fixtureObserver?.disconnect();
      ST.act.nav(ST.state.view);
      for (const [slot, original] of Object.entries(originals))
        changed.push({
          path: `references.${slot}.originalText`,
          kind: "original-input-text",
          before: "Prototype composition from fixture fields",
          after: original,
        });
      alignOriginal();
      const app = document.querySelector("#app");
      if (app) {
        ST.fixtureObserver = new MutationObserver(alignOriginal);
        ST.fixtureObserver.observe(app, { childList: true, subtree: true });
      }
      return changed;
    },
    { references, originals, options },
  );
  return {
    source: "actual-verification-api-v2",
    checkId: check.id,
    locale,
    referenceSlots: references.map((reference) => reference.id),
    normalizations,
    limitations: [
      "Prototype-owned wording and field/candidate formatting remain unchanged; differences still fail pixel comparison.",
      "Prototype status/verdict classes, evidence glyphs, component structure and CSS are never normalized.",
      ...(options.bibliography
        ? []
        : [
            "No bibliography response supplied: no server-generated Correction suggestion is inserted.",
          ]),
    ],
  };
}

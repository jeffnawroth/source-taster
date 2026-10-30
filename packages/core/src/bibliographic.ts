// SPDX-License-Identifier: AGPL-3.0-or-later
// One per-source allocator and the existing exact comparison engine. No I/O here.
import {
  compare,
  comparisonLimits,
  normalizeDoi,
  type ComparisonProfile,
} from "./comparison.ts";
import type { StructuredReference, Csl } from "./structuring.ts";
import {
  doiTracerLimits,
  outside,
  type Candidate,
  type DoiResolver,
  type Evidence,
  type CandidateDataSource,
  type TransportFailure,
  type RetrievedCandidate,
  type ScoringRules,
  type VerdictResult,
} from "./verification.ts";
import {
  flattenSearchSettings,
  type SearchSettings,
} from "./search-settings.ts";
export type QueryKind = "combined" | "title" | "authors-year";
export type IdentifierKind = "doi" | "pmid" | "pmcid" | "arxiv";
export interface BibliographicSource {
  name: CandidateDataSource;
  identifiers: readonly IdentifierKind[];
  lookup(
    kind: IdentifierKind,
    value: string,
    deadline: number,
  ): Promise<{ candidate?: RetrievedCandidate; evidence: Evidence }>;
  /** Absent for identifier-only access such as direct arXiv. */
  search?(
    reference: Csl,
    kind: QueryKind,
    deadline: number,
  ): Promise<{ candidates: RetrievedCandidate[]; evidence: Evidence }>;
}
// ADR-0007 article route. Each identifier goes to its responsible sources in
// order; a later source is asked only while no earlier one supplied the record.
export const identifierRoutes: Readonly<
  Record<IdentifierKind, readonly CandidateDataSource[]>
> = Object.freeze({
  doi: ["openalex", "crossref"],
  pmid: ["openalex", "europepmc"],
  pmcid: ["openalex", "europepmc"],
  arxiv: ["semanticscholar", "arxiv"],
});
export const searchOrder: readonly CandidateDataSource[] = [
  "openalex",
  "crossref",
  "europepmc",
  "semanticscholar",
];
export const articleSearchConfiguration = Object.freeze({
  referenceDeadlineMs: doiTracerLimits.referenceDeadlineMs,
  maxResponseBytes: doiTracerLimits.maxResponseBytes,
  candidateBudget: doiTracerLimits.candidateBudget,
  ...comparisonLimits,
  openalexPool: "unauthenticated-development",
  semanticscholarPool: "unauthenticated-development",
  providerOrder: searchOrder.join(","),
  candidateAllocation:
    "identifier(0-3),combined,title,authors-year,title,authors-year;carry-forward-received-only",
  identifierOrder: "DOI,PMID,PMCID,arXiv",
  identifierRoutes:
    "DOI:openalex,crossref;PMID:openalex,europepmc;PMCID:openalex,europepmc;arXiv:semanticscholar,arxiv",
  implementedIdentifierRoutes:
    "openalex:DOI,PMID;crossref:DOI;europepmc:PMID,PMCID;semanticscholar:arXiv;arxiv:arXiv",
  unimplementedCapabilities: "ISBN,book,web,cross-process-identifier-batching",
  identifierBatching:
    "process-local;semanticscholar-window-then-permit;arxiv-until-permit;entry-demultiplexed-1",
  negativeCoverage:
    "development-openalex-and-crossref-and-every-enabled-search-source-complete-title-author-year",
  failureHandling:
    "continue-and-name-transport-failed;http-error-per-call;timeout-or-rate-budget-skips-remaining-source-calls;data-findings-not-failed;all-applicable-transport-failed-not-verifiable",
  nameProjection: "openalex-display-name-last-token-family-1",
  receivedEvidence: "normalized-pmcid-arxiv-affirmative-retraction-2",
  identityEvidence: "consistent-connected-groups-counterevidence-4",
});
// Article Verdict derivation (identity groups, missing comparisons and
// counterevidence, tie and Mixed citation precedence) beyond the shared #75
// comparison rules. Every outcome-changing edit needs a new value.
export const articleVerdictRules = "article-verdict-78-2";
// ADR-0007 per-call rule: an HTTP error or unreachable source is retried at
// most once per call, and later operations of that source still run. Only a
// timeout or an exhausted rate budget makes a Data source unavailable for the
// rest of the Reference, so one slow source cannot spend the whole deadline.
const sourceExhausted = new Set(["timeout", "rate-budget"]);
// Only transport failures make a Data source failed. A data finding such as
// identifier-mismatch or invalid-metadata still blocks Not found, but the
// source answered and is never named as failed (ADR-0007).
export const transportFailures: ReadonlySet<string> = new Set<TransportFailure>(
  [
    "timeout",
    "rate-budget",
    "http-error",
    "request-unavailable",
    "deadline",
    "after-source-failure",
  ],
);
const failed = (e: Evidence) =>
  e.outcome === "unavailable" && transportFailures.has(e.reason ?? "");
const valueOf = (c: Candidate) => c.score?.value ?? -1;
/** A four-digit publication year in the issued date, if any. */
export const issuedYear = (csl: Csl) =>
  csl.issued?.literal.match(/\b[12]\d{3}\b/u)?.[0];
export const normalizePmid = (value: string) =>
  value
    .trim()
    .replace(/\/+$/u, "")
    .replace(/^(?:https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/|pmid:\s*)/iu, "");
export const normalizePmcid = (value: string) =>
  value
    .trim()
    .replace(/\/+$/u, "")
    .replace(
      /^(?:https?:\/\/(?:(?:www\.)?ncbi\.nlm\.nih\.gov\/pmc|pmc\.ncbi\.nlm\.nih\.gov)\/articles\/|pmcid:\s*)/iu,
      "",
    )
    .toUpperCase();
/** Version-free native arXiv identifier (new and old schemes). */
export const normalizeArxiv = (value: string) =>
  value
    .trim()
    .replace(/\/+$/u, "")
    .replace(
      /^(?:https?:\/\/(?:www\.|export\.)?arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*)/iu,
      "",
    )
    .replace(/\.pdf$/iu, "")
    .replace(/v\d+$/u, "");
const identifierKeys = {
  doi: "DOI",
  pmid: "PMID",
  pmcid: "PMCID",
  arxiv: "arXiv",
} as const;
const normalizers = {
  DOI: normalizeDoi,
  PMID: normalizePmid,
  PMCID: normalizePmcid,
  arXiv: normalizeArxiv,
} as const;
function sourceRelation(a: RetrievedCandidate, b: RetrievedCandidate) {
  let shared = a.source === b.source && a.id === b.id;
  let conflicting = false;
  for (const key of ["DOI", "PMID", "PMCID", "arXiv"] as const) {
    if (!a.csl[key] || !b.csl[key]) continue;
    const normalize = normalizers[key];
    if (normalize(a.csl[key]) !== normalize(b.csl[key])) conflicting = true;
    else shared = true;
  }
  return { shared, conflicting };
}
function identityGroup<T extends RetrievedCandidate>(
  candidate: T,
  records: readonly T[],
) {
  // Shared keys connect records, but a bridge cannot erase contradictions
  // elsewhere in the connected group. Only the given records enter this group.
  const members = new Set([candidate]);
  const pending = [candidate];
  while (pending.length) {
    const current = pending.pop()!;
    for (const record of records)
      if (!members.has(record) && sourceRelation(current, record).shared) {
        members.add(record);
        pending.push(record);
      }
  }
  const group = [...members];
  const conflicting = group.some((record, i) =>
    group
      .slice(i + 1)
      .some((other) => sourceRelation(record, other).conflicting),
  );
  return { members, conflicting };
}
const fieldScore = (c: Candidate, field: string) =>
  c.fields.find((f) => f.field === field)?.score?.value;
const incompleteIdentity = (c: Candidate) =>
  ["title", "author"].some((field) => fieldScore(c, field) === undefined);
const unsafe = (c: Candidate) =>
  c.fields.some(
    (f) =>
      f.reason === "resource-limit" ||
      (f.field === "author" && f.reason === "not-determinable"),
  );
export function createBibliographicVerification(ports: {
  resolver: DoiResolver;
  sources: BibliographicSource[];
  now(): number;
  rules: ScoringRules;
  parameters: ComparisonProfile;
  settings: SearchSettings;
  /** Identity of the exact settings, computed by the composition root. */
  settingsVersion: string;
}) {
  return async (
    reference: StructuredReference,
    execution?: { startedAt: number },
  ): Promise<VerdictResult> => {
    const profile = ports.parameters;
    const deadline =
      (execution?.startedAt ?? ports.now()) +
      doiTracerLimits.referenceDeadlineMs;
    const result: VerdictResult = {
      kind: "verdict",
      verdict: "not-verifiable",
      reference,
      scoringRules: {
        ...ports.rules,
        version: `${ports.rules.version}-${articleVerdictRules}`,
      },
      searchStrategyVersion: `article-search-78-2-${ports.sources.map((s) => s.name).join("-")}-settings-${ports.settingsVersion}-uncalibrated`,
      searchConfiguration: {
        ...articleSearchConfiguration,
        ...flattenSearchSettings(ports.settings),
        enabledSources: ports.sources.map((s) => s.name).join(","),
      },
      identity: { kind: "unresolved" },
      bestMatchId: null,
      candidates: [],
      evidence: [],
      reasons: ["insufficient-search"],
      failedSources: [],
      retraction: "unknown",
    };
    const note = (
      source: Evidence["source"],
      operation: Evidence["operation"],
      outcome: Evidence["outcome"],
      reason: string,
    ): Evidence => ({
      source,
      operation,
      outcome,
      reason,
      attempts: 0,
      durationMs: 0,
      observedAt: new Date(ports.now()).toISOString(),
    });
    if (outside.has(reference.csl.type ?? "")) {
      result.reasons = ["outside-coverage"];
      return result;
    }
    const doi = reference.csl.DOI ? normalizeDoi(reference.csl.DOI) : undefined;
    let resolution: Evidence | undefined;
    if (doi) {
      resolution = await ports.resolver.resolve(doi, deadline);
      result.evidence.push(resolution);
    }
    const mandatoryComplete = () =>
      !doi ||
      resolution?.outcome === "exists" ||
      resolution?.outcome === "nonexistent";
    const article = ![
      "book",
      "chapter",
      "entry-dictionary",
      "entry-encyclopedia",
      "entry",
      "classic",
      "pamphlet",
      "webpage",
      "post-weblog",
      "post",
    ].includes(reference.csl.type ?? "");
    const states = new Map(
      ports.sources.map((source) => [
        source.name,
        {
          source,
          candidates: [] as Candidate[],
          received: new Map<
            QueryKind,
            { candidates: RetrievedCandidate[]; evidence: Evidence }
          >(),
          offsets: new Map<QueryKind, number>(),
          complete: true,
          // Set after a timeout or rate-budget failure: this source's
          // remaining calls are recorded as after-source-failure, not sent.
          exhausted: false,
        },
      ]),
    );
    const retractionCandidates = new Map<string, RetrievedCandidate>();
    function rememberRetractions(received: RetrievedCandidate[]) {
      for (const candidate of received)
        if (candidate.retractionEvidence) {
          const key = JSON.stringify([candidate.source, candidate.id]);
          if (!retractionCandidates.has(key))
            retractionCandidates.set(key, candidate);
        }
    }
    function add(retrieved: RetrievedCandidate, identifiers: string[] = []) {
      const state = states.get(retrieved.source)!;
      const existing = state.candidates.find((c) => c.id === retrieved.id);
      if (existing) {
        existing.identifiers = [
          ...new Set([...(existing.identifiers ?? []), ...identifiers]),
        ];
        return existing;
      }
      if (state.candidates.length >= 5) return;
      const candidate = {
        ...retrieved,
        identifiers,
        slot: state.candidates.length + 1,
        ...compare(reference, retrieved.csl, profile, retrieved),
      };
      state.candidates.push(candidate);
      result.candidates.push(candidate);
      result.candidates.sort(
        (a, b) =>
          valueOf(b) - valueOf(a) ||
          a.source.localeCompare(b.source) ||
          a.id.localeCompare(b.id),
      );
      const best = result.candidates[0];
      result.bestMatchId = best?.score ? best.id : null;
      return candidate;
    }
    const strong = (c: Candidate) =>
      !unsafe(c) &&
      !!c.score &&
      c.score.value >= profile.overallScore &&
      ["title", "author"].every(
        (f) => (fieldScore(c, f) ?? -1) >= profile.strongField,
      );
    const hasCounterevidence = (c: Candidate) =>
      ["title", "author"].some((f) => {
        const score = fieldScore(c, f);
        return score !== undefined && score < profile.counterevidence;
      });
    const matching = (c: Candidate) =>
      (c.score?.value ?? -1) >= profile.overallScore ||
      strong(c) ||
      ["title", "author"].some(
        (f) => (fieldScore(c, f) ?? -1) >= profile.strongField,
      );
    const topTie = () => {
      const top = result.candidates[0];
      return result.candidates.filter(
        (c) => top && valueOf(c) === valueOf(top),
      );
    };
    // Equal sufficiently matching top Scores across different Sources stay
    // ambiguous, independent of whether every tied comparison is complete.
    const matchingTopTieAcrossSources = () => {
      const [top, ...others] = topTie();
      if (!top || !matching(top)) return false;
      const group = identityGroup(top, result.candidates);
      return others.some((c) => !group.members.has(c));
    };
    // A different Source is settled by counterevidence or by complete title and
    // author comparisons; unavailable comparisons alone are never negative
    // evidence. Members of a conflicting group may be different Sources, so
    // each one must be settled on its own.
    const unsettled = (c: Candidate) =>
      !hasCounterevidence(c) && incompleteIdentity(c);
    const unresolvedComparison = (candidate: Candidate) => {
      const group = identityGroup(candidate, result.candidates);
      const members = [...group.members];
      return group.conflicting
        ? members.some(unsettled)
        : members.every(unsettled);
    };
    function identity(): Candidate | undefined {
      const top = result.candidates[0];
      if (!top || result.candidates.some(unsafe) || ports.now() >= deadline)
        return;
      const tied = topTie();
      // Only supported supplied identifiers actually retrieved on their exact path count as proof.
      const proven = result.candidates.filter(
        (c) =>
          !unsafe(c) &&
          !hasCounterevidence(c) &&
          c.identifiers?.some((id) =>
            id.startsWith("doi:") ? resolution?.outcome === "exists" : true,
          ),
      );
      const provedTop = proven.filter((c) => valueOf(c) === valueOf(top));
      if (provedTop.length) {
        const group = identityGroup(provedTop[0]!, result.candidates);
        if (provedTop.every((candidate) => group.members.has(candidate))) {
          if (group.conflicting) return;
          return provedTop[0];
        }
      }
      const group = identityGroup(top, result.candidates);
      // Display order cannot hide sufficient evidence from a tied record of
      // this same Source. A lower-scoring record never supplies the Best match.
      const representative = tied.find(strong);
      if (
        group.conflicting ||
        tied.some((c) => !group.members.has(c)) ||
        !representative
      )
        return;
      const competitors = result.candidates.filter(
        (c) => !group.members.has(c),
      );
      // An unavailable comparison is not a low competing Score. Verified
      // identifier proof above remains separate from bibliographic lead evidence.
      if (competitors.some(unresolvedComparison)) return;
      const competitor = competitors[0];
      if (competitor && valueOf(top) - valueOf(competitor) < profile.lead)
        return;
      return representative;
    }
    function identified(candidate: Candidate) {
      result.bestMatchId = candidate.id;
      result.identity = {
        kind: candidate.identifiers?.some((i) => i.startsWith("doi:"))
          ? "supplied-doi"
          : candidate.identifiers?.length
            ? "supplied-identifier"
            : "independent-bibliography",
        candidateId: candidate.id,
      };
      if (
        doi &&
        resolution?.outcome === "exists" &&
        candidate.csl.DOI &&
        normalizeDoi(candidate.csl.DOI) !== doi &&
        strong(candidate)
      ) {
        result.verdict = "doi-conflict";
        result.reasons = ["foreign-doi"];
        return;
      }
      if (reference.csl.URL && reference.csl.URL !== candidate.csl.URL) {
        result.reasons = ["url-verification-incomplete"];
        return;
      }
      const differs = candidate.fields.some(
        (f) =>
          (f.score && !f.score.fullAgreement) ||
          (f.reason === "unweighted" &&
            f.reference !== null &&
            f.candidate !== null &&
            typeof f.reference === "string" &&
            typeof f.candidate === "string" &&
            (f.field === "PMID"
              ? normalizePmid(f.reference) !== normalizePmid(f.candidate)
              : f.field === "PMCID"
                ? normalizePmcid(f.reference) !== normalizePmcid(f.candidate)
                : f.reference !== f.candidate)),
      );
      result.verdict = differs ? "exists-with-deviations" : "correct";
      result.reasons = [differs ? "fields-differ" : "identified"];
    }
    const stop = () => {
      const candidate = identity();
      if (!candidate || !mandatoryComplete() || !article) return false;
      if (resolution?.outcome === "nonexistent") {
        result.verdict = "doi-conflict";
        result.reasons = ["doi-nonexistent"];
      } else identified(candidate);
      return true;
    };
    function finish(early = false) {
      const best = result.candidates.find(
        (candidate) => candidate.id === result.bestMatchId,
      );
      // Reports reach the Best match through its consistent identity group;
      // a conflicting group only keeps the Best match record's own report.
      const records = [...result.candidates, ...retractionCandidates.values()];
      const group = best ? identityGroup(best, records) : undefined;
      const retractions = group
        ? [...retractionCandidates.values()].filter((candidate) =>
            group.conflicting
              ? candidate.source === best!.source && candidate.id === best!.id
              : [...group.members].some(
                  (member) =>
                    member.source === candidate.source &&
                    member.id === candidate.id,
                ),
          )
        : [];
      if (retractions.length) {
        result.retraction = "retracted";
        result.retractionEvidence = retractions.map(
          (candidate) => candidate.retractionEvidence!,
        );
      }
      if (early)
        for (const state of states.values())
          if (!result.evidence.some((e) => e.source === state.source.name))
            result.evidence.push(
              note(
                state.source.name,
                "combined",
                "skipped",
                "early-termination",
              ),
            );
      // Disabled is not failed: recorded, never part of the failure set.
      for (const name of searchOrder)
        if (!states.has(name))
          result.evidence.push(
            note(name, "combined", "disabled", "operator-disabled"),
          );
      if (reference.csl.arXiv && !states.has("arxiv"))
        result.evidence.push(
          note("arxiv", "arxiv", "disabled", "operator-disabled"),
        );
      result.failedSources = [
        ...new Set(result.evidence.filter(failed).map((e) => e.source)),
      ];
      return result;
    }
    type State = NonNullable<ReturnType<typeof states.get>>;
    function attempted(state: State, evidence: Evidence) {
      result.evidence.push(evidence);
      if (evidence.outcome === "unavailable") state.complete = false;
      // A source that timed out or was rate-limited is not asked again for
      // this Reference; the search continues with the other sources.
      if (failed(evidence) && sourceExhausted.has(evidence.reason!))
        state.exhausted = true;
    }
    // DOI handling precedes the other identifiers (ADR-0007).
    const identifiers: [IdentifierKind, string | undefined][] = [
      ["doi", doi],
      ["pmid", reference.csl.PMID],
      ["pmcid", reference.csl.PMCID],
      ["arxiv", reference.csl.arXiv],
    ];
    let unsupportedIdentifier = false;
    for (const [kind, raw] of identifiers) {
      if (!raw) continue;
      const key = identifierKeys[kind];
      const value = kind === "doi" ? raw : normalizers[key](raw);
      let routed = false;
      for (const name of identifierRoutes[kind]) {
        const state = states.get(name);
        // Operator-disabled sources are noted once by finish().
        if (!state) continue;
        if (!state.source.identifiers.includes(kind)) {
          result.evidence.push(
            note(
              name,
              kind,
              "unsupported",
              "identifier-capability-unavailable",
            ),
          );
          continue;
        }
        routed = true;
        if (state.candidates.length >= 3) continue;
        const carried = result.candidates.find(
          (c) => c.csl[key] && normalizers[key](c.csl[key]) === value,
        );
        if (carried) {
          carried.identifiers = [
            ...new Set([...(carried.identifiers ?? []), `${kind}:${value}`]),
          ];
          continue;
        }
        const response = state.exhausted
          ? {
              evidence: note(name, kind, "unavailable", "after-source-failure"),
            }
          : await state.source.lookup(kind, value, deadline);
        attempted(state, response.evidence);
        const retrieved = response.candidate;
        if (retrieved) {
          rememberRetractions([retrieved]);
          if (state.candidates.some((c) => c.id === retrieved.id))
            response.evidence.skippedDuplicates = [retrieved.id];
          add(retrieved, [`${kind}:${value}`]);
        }
        if (stop()) return finish(true);
      }
      if (!routed) unsupportedIdentifier = true;
    }
    if (article)
      for (const state of states.values()) {
        if (!state.source.search) continue;
        let carry = 0;
        for (const kind of [
          "combined",
          "title",
          "authors-year",
          "title",
          "authors-year",
        ] as const) {
          if (state.candidates.length >= 5) break;
          const requested = Math.min(1 + carry, 5 - state.candidates.length);
          let received = state.received.get(kind);
          if (!received) {
            const usable =
              kind === "title"
                ? !!reference.csl.title
                : kind === "authors-year"
                  ? !!reference.csl.author?.length
                  : !!reference.csl.title || !!reference.csl.author?.length;
            received = !usable
              ? {
                  candidates: [],
                  evidence: note(
                    state.source.name,
                    kind,
                    "unsupported",
                    "missing-query-fields",
                  ),
                }
              : state.exhausted
                ? {
                    candidates: [],
                    evidence: note(
                      state.source.name,
                      kind,
                      "unavailable",
                      "after-source-failure",
                    ),
                  }
                : await state.source.search(reference.csl, kind, deadline);
            received.evidence.skippedDuplicates = [];
            rememberRetractions(received.candidates);
            received.evidence.unusedSlots = 0;
            attempted(state, received.evidence);
            state.received.set(kind, received);
            if (!["candidate", "no-record"].includes(received.evidence.outcome))
              state.complete = false;
          }
          let filled = 0,
            offset = state.offsets.get(kind) ?? 0;
          while (offset < received.candidates.length && filled < requested) {
            const retrieved = received.candidates[offset++]!;
            if (state.candidates.some((c) => c.id === retrieved.id)) {
              received.evidence.skippedDuplicates!.push(retrieved.id);
              continue;
            }
            add(retrieved);
            filled++;
            if (stop()) {
              received.evidence.unusedSlots = requested - filled;
              return finish(true);
            }
          }
          state.offsets.set(kind, offset);
          carry = requested - filled;
          received.evidence.unusedSlots = carry;
        }
      }
    if (resolution?.outcome === "nonexistent") {
      result.verdict = "doi-conflict";
      result.reasons = ["doi-nonexistent"];
      return finish();
    }
    // A total outage of every applicable enabled source is Not verifiable,
    // never Not found (ADR-0007/0008). Notes are not source responses.
    const contacted = [...states.values()].map((state) =>
      result.evidence.filter(
        (e) =>
          e.source === state.source.name &&
          !["skipped", "disabled", "unsupported"].includes(e.outcome),
      ),
    );
    const applicable = contacted.filter((evidence) => evidence.length);
    if (
      applicable.length &&
      applicable.every((evidence) => evidence.every(failed))
    ) {
      result.reasons = mandatoryComplete()
        ? ["sources-unavailable"]
        : ["sources-unavailable", "mandatory-resolution-incomplete"];
      return finish();
    }
    if (!mandatoryComplete()) {
      result.reasons = ["mandatory-resolution-incomplete"];
      return finish();
    }
    if (result.candidates.some(unsafe)) {
      result.reasons = ["development-route-incomplete"];
      return finish();
    }
    const chosen = identity();
    if (
      doi &&
      resolution?.outcome === "exists" &&
      chosen &&
      strong(chosen) &&
      chosen.csl.DOI &&
      normalizeDoi(chosen.csl.DOI) !== doi
    ) {
      identified(chosen);
      return finish();
    }
    if (
      topTie().some(
        (candidate) => identityGroup(candidate, result.candidates).conflicting,
      )
    ) {
      result.reasons = ["ambiguous-identity"];
      return finish();
    }
    if (
      !chosen &&
      !matchingTopTieAcrossSources() &&
      result.candidates.some(unresolvedComparison)
    ) {
      result.reasons = ["insufficient-search"];
      return finish();
    }
    // Mixed components must be distinct, consistently identified Sources.
    const consistent = (c: Candidate) =>
      !identityGroup(c, result.candidates).conflicting;
    const mixed = result.candidates.some((a) =>
      result.candidates.some(
        (b) =>
          !identityGroup(a, result.candidates).members.has(b) &&
          consistent(a) &&
          consistent(b) &&
          !unsafe(a) &&
          !unsafe(b) &&
          (fieldScore(a, "title") ?? -1) >= profile.mixedComponent &&
          (fieldScore(b, "author") ?? -1) >= profile.mixedComponent &&
          fieldScore(a, "author") !== undefined &&
          fieldScore(a, "author")! < profile.contradiction &&
          fieldScore(b, "title") !== undefined &&
          fieldScore(b, "title")! < profile.contradiction,
      ),
    );
    if (article && mixed) {
      result.verdict = "mixed-citation";
      result.reasons = ["mixed-components"];
    } else if (article && chosen) identified(chosen);
    else if (doi && resolution?.outcome === "exists")
      result.reasons = ["identity-unresolved"];
    else if (!article || reference.csl.ISBN)
      result.reasons = ["development-route-incomplete"];
    else if (result.candidates.some((c) => unsafe(c) || matching(c)))
      result.reasons = ["ambiguous-identity"];
    else if (
      !unsupportedIdentifier &&
      states.has("openalex") &&
      states.has("crossref") &&
      [...states.values()].every(
        (s) => s.complete && (!s.source.search || s.received.size === 3),
      ) &&
      reference.csl.title &&
      reference.csl.author?.length &&
      issuedYear(reference.csl) &&
      ports.now() < deadline
    ) {
      result.verdict = "not-found";
      result.reasons = ["search-completed"];
    }
    return finish();
  };
}

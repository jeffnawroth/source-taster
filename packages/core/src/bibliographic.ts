// SPDX-License-Identifier: AGPL-3.0-or-later
// One per-source allocator and the existing exact comparison engine. No I/O here.
import { normalizeIsbn } from "./isbn.ts";
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
  type RetrievedCandidate,
  type ScoringRules,
  type VerdictResult,
} from "./verification.ts";
const bookTypes = new Set([
  "book",
  "chapter",
  "entry-dictionary",
  "entry-encyclopedia",
  "entry",
  "classic",
  "pamphlet",
]);
export const isBookReference = (type?: string) => bookTypes.has(type ?? "");
export type QueryKind = "combined" | "title" | "authors-year";
export type IdentifierKind = "doi" | "pmid" | "pmcid" | "isbn";
export interface BibliographicSource {
  name: "openalex" | "crossref" | "openlibrary" | "googlebooks";
  identifiers: readonly IdentifierKind[];
  lookup(
    kind: IdentifierKind,
    value: string,
    deadline: number,
  ): Promise<{ candidate?: RetrievedCandidate; evidence: Evidence }>;
  search(
    reference: Csl,
    kind: QueryKind,
    deadline: number,
  ): Promise<{ candidates: RetrievedCandidate[]; evidence: Evidence }>;
}
export const articleSearchConfiguration = Object.freeze({
  ...doiTracerLimits,
  ...comparisonLimits,
  openalexRequestsPerSecond: 1,
  openalexConcurrency: 1,
  openalexPool: "unauthenticated-development",
  providerOrder: "openalex,crossref",
  candidateAllocation:
    "identifier(0-3),combined,title,authors-year,title,authors-year;carry-forward-received-only",
  identifierOrder: "DOI,PMID,PMCID",
  implementedIdentifierRoutes: "openalex:DOI,PMID;crossref:DOI",
  unimplementedCapabilities:
    "PMCID,arXiv,ISBN,book,web,Europe-PMC,Semantic-Scholar",
  negativeCoverage:
    "development-openalex-and-crossref-complete-title-author-year",
  nameProjection: "openalex-display-name-last-token-family-1",
  receivedEvidence: "normalized-pmcid-affirmative-retraction-1",
  identityEvidence: "consistent-connected-groups-counterevidence-4",
});
// Article Verdict derivation (identity groups, missing comparisons and
// counterevidence, tie and Mixed citation precedence) beyond the shared #75
// comparison rules. Every outcome-changing edit needs a new value.
export const articleVerdictRules = "article-verdict-77-9";
export const bookSearchConfiguration = Object.freeze({
  route: "book",
  identifierOrder: "DOI,ISBN",
  identifierSources: "openlibrary,googlebooks",
  providerOrder: "openalex,crossref,openlibrary,googlebooks",
  implementedIdentifierRoutes:
    "openalex:DOI;crossref:DOI;openlibrary:ISBN;googlebooks:ISBN",
  unimplementedCapabilities: "PMCID,arXiv,web,Europe-PMC,Semantic-Scholar",
  negativeCoverage: "all-four-book-sources-complete-title-author-year",
  isbnNormalization: "validated-isbn13-1",
  openlibraryRequestsPerSecond: 3,
  googlebooksRequestsPerSecond: 1,
  sourceFailurePolicy: "stop-failed-source-1",
});
export interface CatalogRates {
  openlibrary: number;
  googlebooks: number;
}

const valueOf = (c: Candidate) => c.score?.value ?? -1;
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
function sourceRelation(a: RetrievedCandidate, b: RetrievedCandidate) {
  let shared = a.source === b.source && a.id === b.id;
  let conflicting = false;
  for (const key of ["DOI", "PMID", "PMCID"] as const) {
    if (!a.csl[key] || !b.csl[key]) continue;
    const normalize =
      key === "DOI"
        ? normalizeDoi
        : key === "PMCID"
          ? normalizePmcid
          : normalizePmid;
    if (normalize(a.csl[key]) !== normalize(b.csl[key])) conflicting = true;
    else shared = true;
  }
  if (a.csl.type === "book" && b.csl.type === "book") {
    const aIsbn = normalizeIsbn(a.csl.ISBN ?? ""),
      bIsbn = normalizeIsbn(b.csl.ISBN ?? "");
    if (aIsbn && bIsbn) {
      if (aIsbn === bIsbn) shared = true;
      else conflicting = true;
    }
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
  catalogRates?: CatalogRates;
}) {
  return async (
    reference: StructuredReference,
    execution?: { startedAt: number },
  ): Promise<VerdictResult> => {
    const profile = ports.parameters;
    const catalogRates = ports.catalogRates ?? {
      openlibrary: bookSearchConfiguration.openlibraryRequestsPerSecond,
      googlebooks: bookSearchConfiguration.googlebooksRequestsPerSecond,
    };
    const deadline =
      (execution?.startedAt ?? ports.now()) +
      doiTracerLimits.referenceDeadlineMs;
    const book = isBookReference(reference.csl.type);
    const sources = ports.sources.filter(
      (s) => book || !["openlibrary", "googlebooks"].includes(s.name),
    );
    const result: VerdictResult = {
      kind: "verdict",
      verdict: "not-verifiable",
      reference,
      scoringRules: {
        ...ports.rules,
        version: `${ports.rules.version}-${articleVerdictRules}`,
      },
      searchStrategyVersion: `article-search-77-9-identity-evidence-${sources.map((s) => s.name).join("-")}-uncalibrated`,
      searchConfiguration: {
        ...articleSearchConfiguration,
        enabledSources: sources.map((s) => s.name).join(","),
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
    if (book) {
      result.scoringRules.version += "-book-verdict-79-2-isbn-edition";
      result.searchStrategyVersion = `book-search-79-3-${sources.map((s) => s.name).join("-")}-${catalogRates.openlibrary}-${catalogRates.googlebooks}-uncalibrated`;
      Object.assign(result.searchConfiguration, bookSearchConfiguration, {
        openlibraryRequestsPerSecond: catalogRates.openlibrary,
        googlebooksRequestsPerSecond: catalogRates.googlebooks,
      });
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
    const article =
      !book &&
      !["webpage", "post-weblog", "post"].includes(reference.csl.type ?? "");
    const states = new Map(
      sources.map((source) => [
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
          failed: false,
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
      if (book) {
        for (const field of [
          "edition",
          "publisher",
          "publisher-place",
        ] as const) {
          const referenceValue = reference.csl[field],
            candidateValue = retrieved.csl[field];
          if (!referenceValue && !candidateValue) continue;
          candidate.fields.push({
            field,
            reference: referenceValue ?? null,
            candidate: candidateValue ?? null,
            score: null,
            reason: !referenceValue
              ? "missing-reference"
              : !candidateValue
                ? "missing-candidate"
                : "unweighted",
            ...(referenceValue && candidateValue
              ? {
                  agreement:
                    referenceValue.normalize("NFKC").trim().toLowerCase() ===
                    candidateValue.normalize("NFKC").trim().toLowerCase(),
                }
              : {}),
          });
        }
        const isbn = candidate.fields.find((f) => f.field === "ISBN");
        if (
          isbn &&
          typeof isbn.reference === "string" &&
          typeof isbn.candidate === "string"
        ) {
          const confirmed = normalizeIsbn(isbn.candidate);
          if (confirmed)
            isbn.agreement = normalizeIsbn(isbn.reference) === confirmed;
        }
      }
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
    const incompatibleBookType = (c: Candidate) =>
      book &&
      c.csl.type !== undefined &&
      c.csl.type !==
        (["book", "classic", "pamphlet"].includes(reference.csl.type ?? "")
          ? "book"
          : "chapter");
    const strong = (c: Candidate) =>
      !unsafe(c) &&
      !incompatibleBookType(c) &&
      !c.identityAmbiguous &&
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
          !c.identityAmbiguous &&
          !incompatibleBookType(c) &&
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
      if (top.identityAmbiguous || incompatibleBookType(top)) return;
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
          f.agreement === false ||
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
                : book && f.field === "ISBN"
                  ? (normalizeIsbn(f.reference) ?? f.reference) !==
                    (normalizeIsbn(f.candidate) ?? f.candidate)
                  : f.reference !== f.candidate)),
      );
      result.verdict = differs ? "exists-with-deviations" : "correct";
      result.reasons = [differs ? "fields-differ" : "identified"];
    }
    const stop = () => {
      const candidate = identity();
      if (!candidate || !mandatoryComplete() || !(article || book))
        return false;
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
      if (book)
        for (const source of ["openlibrary", "googlebooks"] as const)
          if (!states.has(source))
            result.evidence.push(
              note(source, "combined", "disabled", "operator-disabled"),
            );
      if (!states.has("openalex"))
        result.evidence.push(
          note("openalex", "combined", "disabled", "operator-disabled"),
        );
      result.failedSources = [
        ...new Set(
          result.evidence
            .filter((e) => e.outcome === "unavailable")
            .map((e) => e.source),
        ),
      ];
      return result;
    }
    const identifiers: [IdentifierKind, string | undefined][] = [
      ["doi", doi],
      ...(!book
        ? ([
            ["pmid", reference.csl.PMID],
            ["pmcid", reference.csl.PMCID],
          ] as [IdentifierKind, string | undefined][])
        : ([["isbn", reference.csl.ISBN]] as [
            IdentifierKind,
            string | undefined,
          ][])),
    ];
    let unsupportedIdentifier = false;
    for (const [kind, raw] of identifiers) {
      if (!raw) continue;
      if (!sources.some((source) => source.identifiers.includes(kind))) {
        unsupportedIdentifier = true;
        result.evidence.push(
          note(
            "openalex",
            kind,
            "unsupported",
            "identifier-capability-unavailable",
          ),
        );
        continue;
      }
      const value =
        kind === "pmid"
          ? normalizePmid(raw)
          : kind === "pmcid"
            ? normalizePmcid(raw)
            : kind === "isbn"
              ? normalizeIsbn(raw)
              : raw;
      if (!value) {
        unsupportedIdentifier = true;
        continue;
      }
      for (const state of states.values()) {
        if (
          (book && state.failed) ||
          !state.source.identifiers.includes(kind) ||
          state.candidates.length >= 3
        )
          continue;
        const key =
          kind === "doi"
            ? "DOI"
            : kind === "pmid"
              ? "PMID"
              : kind === "pmcid"
                ? "PMCID"
                : "ISBN";
        const carried = result.candidates.find(
          (c) =>
            c.csl[key] &&
            (kind === "doi"
              ? normalizeDoi(c.csl[key]) === value
              : kind === "isbn"
                ? normalizeIsbn(c.csl[key]) === value
                : c.csl[key].toLowerCase() === value.toLowerCase()),
        );
        if (carried) {
          carried.identifiers = [
            ...new Set([...(carried.identifiers ?? []), `${kind}:${value}`]),
          ];
          continue;
        }
        const response = await state.source.lookup(kind, value, deadline);
        result.evidence.push(response.evidence);
        if (response.evidence.outcome === "unavailable") {
          state.complete = false;
          state.failed = true;
        }
        const retrieved = response.candidate;
        if (retrieved) {
          rememberRetractions([retrieved]);
          if (state.candidates.some((c) => c.id === retrieved.id))
            response.evidence.skippedDuplicates = [retrieved.id];
          add(retrieved, [`${kind}:${value}`]);
        }
        if (stop()) return finish(true);
      }
    }
    if (article || book)
      for (const state of states.values()) {
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
            received =
              book && state.failed
                ? {
                    candidates: [],
                    evidence: note(
                      state.source.name,
                      kind,
                      "skipped",
                      "after-source-failure",
                    ),
                  }
                : usable
                  ? await state.source.search(reference.csl, kind, deadline)
                  : {
                      candidates: [],
                      evidence: note(
                        state.source.name,
                        kind,
                        "unsupported",
                        "missing-query-fields",
                      ),
                    };
            received.evidence.skippedDuplicates = [];
            rememberRetractions(received.candidates);
            received.evidence.unusedSlots = 0;
            result.evidence.push(received.evidence);
            state.received.set(kind, received);
            if (!["candidate", "no-record"].includes(received.evidence.outcome))
              state.complete = false;
            if (received.evidence.outcome === "unavailable")
              state.failed = true;
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
    if (!mandatoryComplete()) {
      result.reasons = ["mandatory-resolution-incomplete"];
      return finish();
    }
    if (
      book &&
      states.size > 0 &&
      [...states.values()].every((s) => s.failed)
    ) {
      result.reasons = ["sources-unavailable"];
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
      !incompatibleBookType(c) &&
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
    if ((article || book) && mixed) {
      result.verdict = "mixed-citation";
      result.reasons = ["mixed-components"];
    } else if ((article || book) && chosen) identified(chosen);
    else if (doi && resolution?.outcome === "exists")
      result.reasons = ["identity-unresolved"];
    else if (!(article || book) || (!book && reference.csl.ISBN))
      result.reasons = ["development-route-incomplete"];
    else if (result.candidates.some((c) => unsafe(c) || matching(c)))
      result.reasons = ["ambiguous-identity"];
    else if (
      !unsupportedIdentifier &&
      (book
        ? ["openalex", "crossref", "openlibrary", "googlebooks"].every((name) =>
            sources.some((s) => s.name === name),
          )
        : states.size === 2) &&
      [...states.values()].every((s) => s.complete && s.received.size === 3) &&
      reference.csl.title &&
      reference.csl.author?.length &&
      reference.csl.issued?.literal.match(/\b[12]\d{3}\b/u) &&
      ports.now() < deadline
    ) {
      result.verdict = "not-found";
      result.reasons = ["search-completed"];
    }
    return finish();
  };
}

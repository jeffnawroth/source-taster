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
  type RetrievedCandidate,
  type ScoringRules,
  type VerdictResult,
} from "./verification.ts";
export type QueryKind = "combined" | "title" | "authors-year";
export type IdentifierKind = "doi" | "pmid" | "pmcid";
export interface BibliographicSource {
  name: "openalex" | "crossref";
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
});
const valueOf = (c: Candidate) => c.score?.value ?? -1;
const normalizePmid = (value: string) =>
  value
    .trim()
    .replace(/\/+$/u, "")
    .replace(/^(?:https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/|pmid:\s*)/iu, "");
function sameSource(a: Candidate, b: Candidate) {
  // Conflicting known identifiers distinguish Sources, even if another key agrees.
  let shared = false;
  for (const key of ["DOI", "PMID", "PMCID"] as const) {
    if (!a.csl[key] || !b.csl[key]) continue;
    const normalize =
      key === "DOI" ? normalizeDoi : (value: string) => value.toLowerCase();
    if (normalize(a.csl[key]) !== normalize(b.csl[key])) return false;
    shared = true;
  }
  return shared || (a.source === b.source && a.id === b.id);
}
const fieldScore = (c: Candidate, field: string) =>
  c.fields.find((f) => f.field === field)?.score?.value;
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
      scoringRules: ports.rules,
      searchStrategyVersion: `article-search-77-2-supported-identifiers-${ports.sources.map((s) => s.name).join("-")}-uncalibrated`,
      searchConfiguration: {
        ...articleSearchConfiguration,
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
        },
      ]),
    );
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
        ...compare(reference, retrieved.csl, profile),
      };
      state.candidates.push(candidate);
      result.candidates.push(candidate);
      result.candidates.sort(
        (a, b) =>
          valueOf(b) - valueOf(a) ||
          a.source.localeCompare(b.source) ||
          a.id.localeCompare(b.id),
      );
      result.bestMatchId = result.candidates[0]?.id ?? null;
      return candidate;
    }
    const strong = (c: Candidate) =>
      !unsafe(c) &&
      !!c.score &&
      c.score.value >= profile.overallScore &&
      ["title", "author"].every(
        (f) => (fieldScore(c, f) ?? -1) >= profile.strongField,
      );
    const counter = (c: Candidate) =>
      ["title", "author"].some((f) => {
        const score = fieldScore(c, f);
        return score !== undefined && score < profile.counterevidence;
      });
    function identity(): Candidate | undefined {
      const top = result.candidates[0];
      if (!top || result.candidates.some(unsafe) || ports.now() >= deadline)
        return;
      const tied = result.candidates.filter((c) => valueOf(c) === valueOf(top));
      // Only supported supplied identifiers actually retrieved on their exact path count as proof.
      const proven = result.candidates.filter(
        (c) =>
          !unsafe(c) &&
          !counter(c) &&
          c.identifiers?.some((id) =>
            id.startsWith("doi:") ? resolution?.outcome === "exists" : true,
          ),
      );
      const provedTop = proven.filter((c) => valueOf(c) === valueOf(top));
      if (
        provedTop.length &&
        provedTop.every((c) => sameSource(c, provedTop[0]!))
      )
        return provedTop[0];
      if (tied.some((c) => !sameSource(c, top)) || !strong(top)) return;
      const competitor = result.candidates.find((c) => !sameSource(c, top));
      if (competitor && valueOf(top) - valueOf(competitor) < profile.lead)
        return;
      return top;
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
      ["pmid", reference.csl.PMID],
      ["pmcid", reference.csl.PMCID],
    ];
    let unsupportedIdentifier = false;
    for (const [kind, raw] of identifiers) {
      if (!raw) continue;
      if (!ports.sources.some((source) => source.identifiers.includes(kind))) {
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
            ? raw.toUpperCase().replace(/^.*\//u, "")
            : raw;
      for (const state of states.values()) {
        if (
          !state.source.identifiers.includes(kind) ||
          state.candidates.length >= 3
        )
          continue;
        const key = kind === "doi" ? "DOI" : kind === "pmid" ? "PMID" : "PMCID";
        const carried = result.candidates.find(
          (c) =>
            c.csl[key] &&
            (kind === "doi"
              ? normalizeDoi(c.csl[key]) === value
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
        if (response.evidence.outcome === "unavailable") state.complete = false;
        const retrieved = response.candidate;
        if (retrieved) {
          if (state.candidates.some((c) => c.id === retrieved.id))
            response.evidence.skippedDuplicates = [retrieved.id];
          add(retrieved, [`${kind}:${value}`]);
        }
        if (stop()) return finish(true);
      }
    }
    if (article)
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
            received = usable
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
            received.evidence.unusedSlots = 0;
            result.evidence.push(received.evidence);
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
    const mixed = result.candidates.some((a) =>
      result.candidates.some(
        (b) =>
          !sameSource(a, b) &&
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
    else if (
      result.candidates.some(
        (c) =>
          unsafe(c) ||
          (c.score?.value ?? -1) >= profile.overallScore ||
          strong(c) ||
          ["title", "author"].some(
            (f) => (fieldScore(c, f) ?? -1) >= profile.strongField,
          ),
      )
    )
      result.reasons = ["ambiguous-identity"];
    else if (
      !unsupportedIdentifier &&
      states.size === 2 &&
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

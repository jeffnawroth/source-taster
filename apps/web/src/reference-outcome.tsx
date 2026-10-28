// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  ReferenceOutcome,
  Score,
  Verdict,
} from "@source-taster/contract-verification/v2";
import { m } from "@source-taster/i18n";
const verdicts = {
  correct: ["✓", "text-green-900", "verdict_correct"],
  "exists-with-deviations": ["△", "text-amber-950", "verdict_exists"],
  "mixed-citation": ["✕", "text-red-900", "verdict_mixed"],
  "doi-conflict": ["✕", "text-red-900", "verdict_doi_conflict"],
  "not-found": ["✕", "text-red-900", "verdict_not_found"],
  "not-verifiable": ["?", "text-slate-700", "verdict_not_verifiable"],
} as const satisfies Record<Verdict, readonly [string, string, keyof typeof m]>;
const reasons = {
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
} as const;
// Evidence reasons are transport diagnostics, never primary product text.
// Unknown future reasons retain a safe localized explanation.
const evidenceReasons = {
  deadline: "limitation_deadline",
  "rate-budget": "limitation_rate_budget",
  "response-size": "limitation_response_size",
  "request-unavailable": "limitation_request_unavailable",
  "http-error": "limitation_request_unavailable",
  "invalid-resolver-response": "limitation_invalid_resolver_response",
  "not-in-crossref": "limitation_not_in_crossref",
  "invalid-metadata": "limitation_invalid_metadata",
  "identifier-mismatch": "limitation_identifier_mismatch",
  "probe-unavailable": "limitation_probe_unavailable",
  "identifier-capability-unavailable": "limitation_identifier_capability",
  "missing-query-fields": "limitation_missing_query_fields",
  "operator-disabled": "evidence_disabled",
  "early-termination": "evidence_skipped",
} as const satisfies Record<string, keyof typeof m>;
function limitation(reason: string) {
  return Object.hasOwn(evidenceReasons, reason)
    ? m[evidenceReasons[reason as keyof typeof evidenceReasons]]()
    : m.limitation_unknown();
}
const fields = {
  title: "field_title",
  author: "field_author",
  issued: "field_issued",
  "container-title": "field_container",
  "container-title-short": "field_container_short",
  DOI: "field_doi",
  volume: "field_volume",
  page: "field_page",
  issue: "field_issue",
  ISBN: "field_isbn",
  PMID: "field_pmid",
  PMCID: "field_pmcid",
  URL: "field_url",
} as const;
const origins = {
  doi: "origin_doi",
  pmid: "origin_pmid",
  pmcid: "origin_pmcid",
  combined: "origin_combined",
  title: "origin_title",
  "authors-year": "origin_authors_year",
} as const;
function raw(value: unknown): string {
  if (value === null || value === undefined) return m.evidence_missing();
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(raw).join("; ");
  if (typeof value === "object") return Object.values(value).map(raw).join(" ");
  return typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
    ? `${value}`
    : "";
}
/** Display only: never used to rank Candidates or derive Verdicts. */
function percent(s: Score) {
  const units = (BigInt(s.value) + 5000n) / 10000n;
  const capped = !s.fullAgreement && units >= 10000n ? 9999n : units;
  return `${capped / 100n}.${String(capped % 100n).padStart(2, "0")} %`;
}
function sourceLink(doi: string | undefined) {
  return doi && /^10\.\d{4,9}\/\S+$/iu.test(doi)
    ? `https://doi.org/${encodeURIComponent(doi)}`
    : null;
}
export function ReferenceOutcomeView({
  outcome,
}: {
  outcome: ReferenceOutcome;
}) {
  if (outcome.kind === "status") {
    const keys = {
      running: "status_running",
      cancelled: "status_cancelled",
      failed: "status_failed",
      "not-checked": "status_not_checked",
    } as const;
    return (
      <p className="mt-2 font-semibold text-teal-900">
        {m[keys[outcome.status]]()}
      </p>
    );
  }
  const [icon, color, key] = verdicts[outcome.verdict];
  return (
    <div className="mt-3 space-y-3">
      <p className={`font-semibold ${color}`}>
        <span aria-hidden="true">{icon} </span>
        <span>{m[key]()}</span>
      </p>
      {outcome.retraction === "retracted" && (
        <div className="border-l-4 border-amber-700 bg-amber-50 p-3 text-slate-900">
          <p className="font-semibold">{m.retraction_reported()}</p>
          <p>{m.retraction_independent()}</p>
        </div>
      )}
      <p className="text-sm font-semibold">{m.doi_uncalibrated()}</p>
      {outcome.reasons.map((reason) => (
        <p key={reason}>{m[reasons[reason]]()}</p>
      ))}
      <details>
        <summary className="cursor-pointer py-2 font-semibold">
          {m.evidence_details()}
        </summary>
        <p className="break-words text-sm">
          {m.scoring_rules_label()}: {outcome.scoringRules.version}
        </p>
        <p className="break-words text-sm">
          {m.search_strategy_label()}: {outcome.searchStrategyVersion}
        </p>
        {outcome.retractionEvidence?.map((evidence) => (
          <p
            className="break-words text-sm"
            key={`${evidence.source}:${evidence.candidateId}`}
          >
            {m.retraction_provenance({
              source: evidence.source === "openalex" ? "OpenAlex" : "Crossref",
              candidateId: evidence.candidateId,
              observedAt: evidence.observedAt,
            })}
          </p>
        ))}
        <p className="text-sm">
          Unicode {outcome.scoringRules.unicode} / ICU{" "}
          {outcome.scoringRules.icu}
        </p>
        <p className="text-sm">
          {m.identity_label()}:{" "}
          {outcome.identity.kind === "unresolved"
            ? m.identity_unresolved()
            : outcome.identity.kind === "supplied-doi"
              ? m.identity_doi()
              : outcome.identity.kind === "supplied-identifier"
                ? m.identity_identifier()
                : m.identity_bibliography()}
        </p>
        <ul>
          {outcome.evidence.map((e, i) => (
            <li className="my-3 break-words" key={i}>
              <strong>{e.source}</strong> · {m[origins[e.operation]]()}:{" "}
              {m[
                `evidence_${e.outcome.replaceAll("-", "_")}` as
                  | "evidence_exists"
                  | "evidence_nonexistent"
                  | "evidence_candidate"
                  | "evidence_no_record"
                  | "evidence_unavailable"
                  | "evidence_disabled"
                  | "evidence_skipped"
                  | "evidence_unsupported"
              ]()}{" "}
              ({e.observedAt})
              {e.reason && (
                <p>
                  {m.evidence_limitation()}: {limitation(e.reason)}
                </p>
              )}
            </li>
          ))}
        </ul>
        {outcome.candidates.map((candidate) => (
          <section
            key={candidate.id}
            className="mt-5 border-t border-slate-400 pt-4"
          >
            <h3 className="font-semibold">
              {m.candidate_label()}: {candidate.csl.title ?? candidate.id} (
              {candidate.source})
            </h3>
            <p>
              {m.candidate_origin()}: {m[origins[candidate.origin]]()} ·{" "}
              {m.candidate_slot({ slot: candidate.slot })}
            </p>
            <p className="break-words">
              {m.candidate_record()}: {candidate.id}
            </p>
            {!!candidate.identifiers?.length && (
              <p className="break-words">
                {m.candidate_identifiers()}: {candidate.identifiers.join(", ")}
              </p>
            )}
            <p>
              {m.score_label()}:{" "}
              {candidate.score
                ? percent(candidate.score)
                : m.evidence_missing()}
            </p>
            {candidate.id === outcome.bestMatchId && (
              <p>{m.best_match_label()}</p>
            )}
            {sourceLink(candidate.csl.DOI) && (
              <a
                className="inline-block py-2 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={sourceLink(candidate.csl.DOI)!}
              >
                {m.source_open()}
              </a>
            )}
            <dl className="space-y-3">
              {candidate.fields.map((field) => (
                <div
                  key={field.field}
                  className={
                    field.score && !field.score.fullAgreement
                      ? "rounded border-l-4 border-amber-700 pl-3"
                      : ""
                  }
                >
                  <dt className="font-semibold">
                    {field.field in fields
                      ? m[fields[field.field as keyof typeof fields]]()
                      : field.field}
                    :{" "}
                    {field.score
                      ? field.score.fullAgreement
                        ? m.field_agrees()
                        : m.field_differs()
                      : field.reason === "unweighted"
                        ? m.field_unweighted()
                        : m.field_excluded()}
                  </dt>
                  <dd className="break-words">
                    {m.reference_label()}: {raw(field.reference)}
                  </dd>
                  <dd className="break-words">
                    {m.candidate_label()}: {raw(field.candidate)}
                  </dd>
                  <dd>
                    {field.score
                      ? percent(field.score)
                      : field.reason === "resource-limit"
                        ? m.field_resource_limit()
                        : field.reason === "not-determinable"
                          ? m.field_not_determinable()
                          : field.reason === "missing-reference"
                            ? m.field_missing_reference()
                            : field.reason === "missing-candidate"
                              ? m.field_missing_candidate()
                              : m.field_unweighted()}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </details>
    </div>
  );
}

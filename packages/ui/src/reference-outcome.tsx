// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  ManualOverride,
  ReferenceOutcome,
  VerdictResult,
  Candidate,
  Score,
  SourceEvidence,
} from "@source-taster/contract-verification/v2";
import {
  VerdictBadge,
  VerdictGlyph,
  StatusBadge,
  verdictLabels,
} from "./outcome-badges.tsx";
import { m } from "@source-taster/i18n";
import { JournalAbbreviationExplanation } from "./journal-abbreviation.tsx";
const reasons = {
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
} as const;
/** Display names of Data sources; evidence keeps the stable identifiers. */
export const sourceNames = {
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
} as const satisfies Record<SourceEvidence["source"], string>;
// Evidence reasons are transport diagnostics, never primary product text.
// Unknown future reasons retain a safe localized explanation.
const evidenceReasons = {
  deadline: "limitation_deadline",
  timeout: "limitation_timeout",
  "after-source-failure": "limitation_after_source_failure",
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
  "url-verification-incomplete": "reason_url_incomplete",
  "unsafe-destination": "limitation_unsafe_url",
  "invalid-url": "limitation_unsafe_url",
  "inconclusive-response": "limitation_web_inconclusive",
  "redirect-limit": "limitation_redirect_limit",
  "archive-mismatch": "limitation_archive_mismatch",
  "unsupported-encoding": "limitation_web_inconclusive",
} as const satisfies Record<string, keyof typeof m>;
function limitation(reason: string) {
  return Object.hasOwn(evidenceReasons, reason)
    ? m[evidenceReasons[reason as keyof typeof evidenceReasons]]()
    : m.limitation_unknown();
}
export const fieldLabels = {
  type: "field_type",
  arXiv: "field_arxiv",
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
  publisher: "field_publisher",
  "publisher-place": "field_place",
  "article-number": "field_article_number",
  edition: "field_edition",
  ISSN: "field_issn",
} as const;
const origins = {
  doi: "origin_doi",
  pmid: "origin_pmid",
  pmcid: "origin_pmcid",
  isbn: "origin_isbn",
  combined: "origin_combined",
  title: "origin_title",
  "authors-year": "origin_authors_year",
  arxiv: "origin_arxiv",
  url: "origin_url",
  archive: "origin_archive",
} as const;
function raw(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && !value.length)
  )
    return m.workspace_unknown();
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
function sourceLink(candidate: Candidate) {
  if (candidate.source === "url" || candidate.source === "internetarchive") {
    try {
      const url = new URL(candidate.csl.URL ?? "");
      if (
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password
      )
        return url.href;
    } catch {
      /* Untrusted transport values are never executable links. */
    }
    return null;
  }
  const doi = candidate.csl.DOI;
  if (doi && /^10\.\d{4,9}\/\S+$/iu.test(doi))
    return `https://doi.org/${encodeURIComponent(doi)}`;
  if (
    candidate.source === "openlibrary" &&
    /^openlibrary:\/(?:books\/OL\d+M|works\/OL\d+W)$/u.test(candidate.id)
  )
    return `https://openlibrary.org${candidate.id.slice("openlibrary:".length)}`;
  if (
    candidate.source === "googlebooks" &&
    /^googlebooks:[\w-]+$/u.test(candidate.id)
  )
    return `https://books.google.com/books?id=${encodeURIComponent(candidate.id.slice("googlebooks:".length))}`;
  if (
    candidate.source === "openalex" &&
    /^https:\/\/openalex\.org\/W\d+$/u.test(candidate.id)
  )
    return candidate.id;
  const europepmc = /^(MED|PMC):(PMC\d+|\d+)$/u.exec(candidate.id);
  if (candidate.source === "europepmc" && europepmc)
    return `https://europepmc.org/article/${europepmc[1]}/${europepmc[2]}`;
  const arxiv = /^arXiv:([\w./-]+)$/u.exec(candidate.id);
  if (candidate.source === "arxiv" && arxiv)
    return `https://arxiv.org/abs/${arxiv[1]}`;
  const s2 = /^S2:([0-9a-f]{40})$/u.exec(candidate.id);
  return candidate.source === "semanticscholar" && s2
    ? `https://www.semanticscholar.org/paper/${s2[1]}`
    : null;
}
/** The first transport failure explains why a failed Data source is named. */
// Data findings (invalid metadata, identifier mismatch) never name a source
// as failed, so only transport reasons explain a failed source.
const failureCauses: Partial<Record<string, () => string>> = {
  timeout: m.failure_timeout,
  "rate-budget": m.failure_rate_limit,
  deadline: m.failure_deadline,
  "http-error": m.failure_error,
  "request-unavailable": m.failure_error,
};
function failureCause(
  outcome: VerdictResult,
  source: SourceEvidence["source"],
) {
  const cause = outcome.evidence
    .filter((e) => e.source === source && e.outcome === "unavailable")
    .map((e) => failureCauses[e.reason ?? ""])
    .find(Boolean);
  return (cause ?? m.failure_error)();
}
export function ReferenceOutcomeSummary({
  outcome,
  manualOverride,
}: {
  outcome: ReferenceOutcome;
  manualOverride?: ManualOverride | null;
}) {
  if (outcome.kind === "status") {
    return <StatusBadge status={outcome.status} />;
  }
  const key = verdictLabels[outcome.verdict];
  return (
    <>
      {manualOverride && <ManualVerdictLabel manualOverride={manualOverride} />}
      <p className="feed-reason">
        <VerdictBadge verdict={manualOverride?.verdict ?? outcome.verdict} />
        {manualOverride && (
          <span className="manual-system">
            {m.override_system({ verdict: m[key]() })}
          </span>
        )}
        {" · "}
        {outcome.reasons.map((reason) => m[reasons[reason]]()).join(" ")}
      </p>
    </>
  );
}
export function ReferenceOutcomeView({
  outcome,
  originalText,
  manualOverride,
  contextLabel,
}: {
  outcome: ReferenceOutcome;
  contextLabel?: string;
  originalText?: string;
  manualOverride?: ManualOverride | null;
}) {
  if (outcome.kind === "status") {
    const keys = {
      running: "status_running",
      cancelled: "status_cancelled",
      failed: "status_failed",
      "not-checked": "status_not_checked",
    } as const;
    return (
      <div>
        <p className="mt-2 font-semibold text-text">
          {m[keys[outcome.status]]()}
        </p>
        {originalText !== undefined && <OriginalInput text={originalText} />}
      </div>
    );
  }
  const key = verdictLabels[outcome.verdict];
  return (
    <div className="mt-3 space-y-3">
      {manualOverride && <ManualVerdictLabel manualOverride={manualOverride} />}
      <p className="font-semibold">
        <VerdictGlyph verdict={outcome.verdict} />
        <span>
          {manualOverride ? m.override_system({ verdict: m[key]() }) : m[key]()}
        </span>
      </p>
      {outcome.retraction === "retracted" && (
        <div className="border-l-4 border-border-emphasis bg-surface-sunken p-3 text-text">
          <p className="font-semibold">{m.retraction_reported()}</p>
          <p>{m.retraction_independent()}</p>
        </div>
      )}
      <p className="text-sm font-semibold">{m.doi_uncalibrated()}</p>
      {outcome.reasons.map((reason) => (
        <p key={reason}>{m[reasons[reason]]()}</p>
      ))}
      {outcome.reasons.some((r) =>
        ["web-original-unavailable", "url-unavailable"].includes(r),
      ) && (
        <p className="break-words">
          {m.web_original_url()}: {outcome.reference.csl.URL}
        </p>
      )}
      {!!outcome.failedSources.length && (
        <section
          aria-label={[m.failed_sources_heading(), contextLabel]
            .filter(Boolean)
            .join(" · ")}
        >
          <p className="font-semibold">{m.failed_sources_heading()}</p>
          <ul className="list-disc pl-6">
            {outcome.failedSources.map((source) => (
              <li key={source}>
                {sourceNames[source]}: {failureCause(outcome, source)}
              </li>
            ))}
          </ul>
        </section>
      )}
      {originalText !== undefined && <OriginalInput text={originalText} />}
      <BestMatchComparison outcome={outcome} contextLabel={contextLabel} />
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
              source: sourceNames[evidence.source],
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
                : outcome.identity.kind === "web-url"
                  ? m.identity_web_url()
                  : outcome.identity.kind === "web-archive"
                    ? m.identity_web_archive()
                    : m.identity_bibliography()}
        </p>
        <ul>
          {outcome.evidence.map((e, i) => (
            <li className="my-3 break-words" key={i}>
              <strong>{sourceNames[e.source]}</strong> ·{" "}
              {m[origins[e.operation]]()}:{" "}
              {m[
                `evidence_${e.outcome.replaceAll("-", "_")}` as
                  | "evidence_redirect"
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
              {e.web && (
                <dl>
                  <dt>{m.web_original_url()}</dt>
                  <dd>{e.web.originalUrl}</dd>
                  <dt>{m.web_observed_url()}</dt>
                  <dd>{e.web.finalUrl}</dd>
                  <dt>HTTP</dt>
                  <dd>{e.web.status}</dd>
                  {e.web.title && (
                    <>
                      <dt>{m.web_observed_title()}</dt>
                      <dd>{e.web.title}</dd>
                    </>
                  )}
                  {e.web.redirectTarget && (
                    <>
                      <dt>{m.web_redirect_target()}</dt>
                      <dd>{e.web.redirectTarget}</dd>
                    </>
                  )}
                  {e.web.timestamp && (
                    <>
                      <dt>{m.web_archive_capture()}</dt>
                      <dd>{e.web.timestamp}</dd>
                    </>
                  )}
                </dl>
              )}
              {e.reason && (
                <p>
                  {m.evidence_limitation()}: {limitation(e.reason)}
                </p>
              )}
            </li>
          ))}
        </ul>
        {/* /v2 supplies descending internal Scores and stable ties. Display rounding never orders Candidates. */}
        {outcome.candidates.map((candidate) => (
          <section
            key={candidate.id}
            className="mt-5 border-t border-border-emphasis pt-4"
          >
            <h3 className="font-semibold">
              {m.candidate_label()}: {candidate.csl.title ?? candidate.id} (
              {sourceNames[candidate.source]})
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
            {sourceLink(candidate) && (
              <a
                className="inline-block py-2 underline"
                target="_blank"
                rel="noopener noreferrer"
                href={sourceLink(candidate)!}
              >
                {m.source_open()}
              </a>
            )}
            <dl className="space-y-3">
              {candidate.fields.map((field) => (
                <div
                  key={field.field}
                  className={
                    (field.score && !field.score.fullAgreement) ||
                    field.agreement === false
                      ? "rounded border-l-4 border-border-emphasis pl-3"
                      : ""
                  }
                >
                  <dt className="font-semibold">
                    {field.field in fieldLabels
                      ? m[
                          fieldLabels[field.field as keyof typeof fieldLabels]
                        ]()
                      : field.field}
                    :{" "}
                    {field.score
                      ? field.score.fullAgreement
                        ? m.field_agrees()
                        : m.field_differs()
                      : field.agreement !== undefined
                        ? field.agreement
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
                  {field.journalAbbreviation && (
                    <JournalAbbreviationExplanation
                      evidence={field.journalAbbreviation}
                    />
                  )}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </details>
    </div>
  );
}

function OriginalInput({ text }: { text: string }) {
  return (
    <div className="my-4">
      <h3 className="font-semibold">{m.structuring_original()}</h3>
      <p className="whitespace-pre-wrap break-words">{text}</p>
    </div>
  );
}
/** Find the recorded Best match by ID. A tied, evidenced representative may be displayed later. */
function BestMatchComparison({
  outcome,
  contextLabel,
}: {
  outcome: VerdictResult;
  contextLabel?: string;
}) {
  const best = outcome.candidates.find(
    (candidate) => candidate.id === outcome.bestMatchId,
  );
  return (
    <section
      aria-label={[m.workspace_comparison(), contextLabel]
        .filter(Boolean)
        .join(" · ")}
    >
      {best ? (
        <>
          <p className="font-semibold">{m.best_match_label()}</p>
          <p className="break-words">
            {m.candidate_record()}: {best.id}
          </p>
        </>
      ) : (
        <p>{m.workspace_no_best()}</p>
      )}
      {outcome.identity.kind === "unresolved" && (
        <p>{m.identity_unresolved()}</p>
      )}
      {best && sourceLink(best) && (
        <a
          className="inline-block py-2 underline"
          target="_blank"
          rel="noopener noreferrer"
          href={sourceLink(best)!}
        >
          {m.source_open()}
        </a>
      )}
      <table className="check-comparison">
        <caption className="text-left font-semibold">
          {m.workspace_comparison()}
        </caption>
        <thead>
          <tr>
            <th scope="col">{m.reference_label()}</th>
            <th scope="col">{m.workspace_best()}</th>
          </tr>
        </thead>
        {(Object.keys(fieldLabels) as (keyof typeof fieldLabels)[]).map(
          (field) => {
            const comparison = best?.fields.find(
              (value) => value.field === field,
            );
            const deviates =
              (comparison?.score && !comparison.score.fullAgreement) ||
              comparison?.agreement === false;
            return (
              <tbody key={field} data-deviates={!!deviates}>
                <tr>
                  <th scope="rowgroup" colSpan={2}>
                    {m[fieldLabels[field]]()}:{" "}
                    <span className="font-normal">
                      {comparison?.score
                        ? comparison.score.fullAgreement
                          ? m.field_agrees()
                          : m.field_differs()
                        : comparison?.agreement !== undefined
                          ? comparison.agreement
                            ? m.field_agrees()
                            : m.field_differs()
                          : m.field_excluded()}{" "}
                      ·{" "}
                      {comparison?.score
                        ? percent(comparison.score)
                        : comparison?.reason === "missing-reference"
                          ? m.field_missing_reference()
                          : comparison?.reason === "missing-candidate"
                            ? m.field_missing_candidate()
                            : comparison?.reason === "not-determinable"
                              ? m.field_not_determinable()
                              : comparison?.reason === "resource-limit"
                                ? m.field_resource_limit()
                                : comparison?.reason === "unweighted"
                                  ? m.field_unweighted()
                                  : m.workspace_not_compared()}
                    </span>
                  </th>
                </tr>
                <tr>
                  <td>
                    {raw(
                      comparison
                        ? comparison.reference
                        : outcome.reference.csl[field],
                    )}
                  </td>
                  <td>
                    {raw(comparison ? comparison.candidate : best?.csl[field])}
                  </td>
                </tr>
              </tbody>
            );
          },
        )}
      </table>
    </section>
  );
}

function ManualVerdictLabel({
  manualOverride,
}: {
  manualOverride: ManualOverride;
}) {
  const key = verdictLabels[manualOverride.verdict];
  return (
    <p className="manual-tag mt-2 font-semibold">
      <VerdictGlyph verdict={manualOverride.verdict} />
      {m.override_manual({ verdict: m[key]() })}
    </p>
  );
}

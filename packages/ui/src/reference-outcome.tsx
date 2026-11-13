// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ReactNode } from "react";
import type {
  ManualOverride,
  ReferenceOutcome,
  VerdictResult,
  Candidate,
  Score,
  SourceEvidence,
} from "@source-taster/contract-verification/v2";
import type { Verdict } from "@source-taster/contract-verification/v2";
import { Check, ChevronRight, Info, PencilLine, Plus, X } from "lucide-react";
import {
  evidenceLabel,
  evidenceStep,
  queriedSources,
  StepIcon,
} from "./evidence-steps.tsx";
import {
  VerdictGlyph,
  StatusIcon,
  statusLabels,
  verdictLabels,
  type Status,
} from "./outcome-badges.tsx";
import { m } from "@source-taster/i18n";
import { getLocale } from "@source-taster/i18n/runtime";
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

/** Reasons as one sentence, for the feed card and the verdict block. */
/** D's mono line under a Correction suggestion: the style, then the source it was rebuilt from. */
export function suggestionProvenance(
  outcome: ReferenceOutcome,
  styleLabel: string,
) {
  const best =
    outcome.kind === "verdict"
      ? outcome.candidates.find((c) => c.id === outcome.bestMatchId)
      : undefined;
  return [styleLabel, best && sourceNames[best.source]]
    .filter(Boolean)
    .join(" · ");
}
export function outcomeReasons(outcome: ReferenceOutcome) {
  return outcome.kind === "verdict"
    ? outcome.reasons.map((reason) => m[reasons[reason]]())
    : [];
}
export function VerdictChip({
  verdict,
  size,
}: {
  verdict: Verdict;
  size?: "lg";
}) {
  return (
    <span
      className={size ? `verdict-chip ${size}` : "verdict-chip"}
      data-verdict={verdict}
    >
      <VerdictGlyph verdict={verdict} />
      <span>{m[verdictLabels[verdict]]()}</span>
    </span>
  );
}
export function StatusChip({ status }: { status: Status }) {
  return (
    <span className="status-chip" data-status={status}>
      <StatusIcon status={status} />
      <span>{m[statusLabels[status]]()}</span>
    </span>
  );
}
/** The card's result: the effective Verdict chip and, if set, the manual tag. */
export function ReferenceOutcomeSummary({
  outcome,
  manualOverride,
}: {
  outcome: ReferenceOutcome;
  manualOverride?: ManualOverride | null;
}) {
  if (outcome.kind === "status") return <StatusChip status={outcome.status} />;
  return (
    <>
      <VerdictChip verdict={manualOverride?.verdict ?? outcome.verdict} />
      {manualOverride && <ManualVerdictLabel manualOverride={manualOverride} />}
    </>
  );
}
/** D's verdict card: the large chip, the manual tag and the plain reasons. */
export function VerdictBlock({
  outcome,
  manualOverride,
  children,
}: {
  outcome: ReferenceOutcome;
  manualOverride?: ManualOverride | null;
  children?: ReactNode;
}) {
  const verdict =
    outcome.kind === "verdict"
      ? (manualOverride?.verdict ?? outcome.verdict)
      : undefined;
  return (
    <div className="detail-verdict" data-verdict={verdict}>
      <h3 className="detail-verdict-row">
        {outcome.kind === "verdict" ? (
          <VerdictChip verdict={verdict!} size="lg" />
        ) : (
          <StatusChip status={outcome.status} />
        )}
        {outcome.kind === "verdict" && manualOverride && (
          <ManualVerdictLabel manualOverride={manualOverride} />
        )}
      </h3>
      {outcome.kind === "verdict" && manualOverride && (
        <p className="detail-system">
          <VerdictGlyph verdict={outcome.verdict} />
          <span>
            {m.override_system({
              verdict: m[verdictLabels[outcome.verdict]](),
            })}
          </span>
        </p>
      )}
      {outcomeReasons(outcome).map((reason) => (
        <p key={reason} className="detail-reason">
          {reason}
        </p>
      ))}
      {outcome.kind === "status" && outcome.status !== "running" && (
        <p className="detail-reason">{m.detail_status_evidence()}</p>
      )}
      {children}
    </div>
  );
}
/** Kept for historical results and callers that render a whole outcome. */
export function ReferenceOutcomeHeader(props: {
  outcome: ReferenceOutcome;
  manualOverride?: ManualOverride | null;
}) {
  return <VerdictBlock {...props} />;
}
export function DetailSection({
  title,
  action,
  label,
  children,
}: {
  title: string;
  action?: ReactNode;
  label?: string;
  children: ReactNode;
}) {
  return (
    <section className="detail-section" aria-label={label}>
      <div className="detail-section-head">
        <h3 className="detail-eyebrow">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
export function OriginalInput({ text }: { text: string }) {
  return (
    <DetailSection title={m.shell_original_input()}>
      <p className="detail-original">{text}</p>
    </DetailSection>
  );
}
const identityMessages = {
  unresolved: "identity_unresolved",
  "supplied-doi": "identity_doi",
  "supplied-identifier": "identity_identifier",
  "web-url": "identity_web_url",
  "web-archive": "identity_web_archive",
} as const;
function fieldVerdict(field: Candidate["fields"][number]) {
  if (field.score)
    return field.score.fullAgreement ? m.field_agrees() : m.field_differs();
  if (field.agreement !== undefined)
    return field.agreement ? m.field_agrees() : m.field_differs();
  return field.reason === "unweighted"
    ? m.field_unweighted()
    : m.field_excluded();
}
function fieldScore(field: Candidate["fields"][number]) {
  if (field.score) return percent(field.score);
  switch (field.reason) {
    case "resource-limit":
      return m.field_resource_limit();
    case "not-determinable":
      return m.field_not_determinable();
    case "missing-reference":
      return m.field_missing_reference();
    case "missing-candidate":
      return m.field_missing_candidate();
    default:
      return m.field_unweighted();
  }
}
function CandidateEntry({
  candidate,
  best,
}: {
  candidate: Candidate;
  best: boolean;
}) {
  const link = sourceLink(candidate);
  const year = candidate.csl.issued?.literal;
  return (
    <li className="detail-cand">
      <p className="detail-cand-meta">
        {sourceNames[candidate.source]} · {m.score_label()}{" "}
        {candidate.score ? percent(candidate.score) : m.evidence_missing()}
      </p>
      <h3 className="detail-cand-title">
        {candidate.csl.title ?? candidate.id}
        {year && ` (${year})`}
      </h3>
      {best && <p className="detail-note">{m.best_match_label()}</p>}
      <details className="detail-disclosure">
        <summary>
          <ChevronRight aria-hidden="true" size={16} />
          {m.shell_candidate_fields()}
        </summary>
        <div className="detail-disclosure-body">
          <p className="detail-note">
            {m.candidate_origin()}: {m[origins[candidate.origin]]()} ·{" "}
            {m.candidate_slot({ slot: candidate.slot })}
          </p>
          <p className="detail-note">
            {m.candidate_record()}: {candidate.id}
          </p>
          {!!candidate.identifiers?.length && (
            <p className="detail-note">
              {m.candidate_identifiers()}: {candidate.identifiers.join(", ")}
            </p>
          )}
          {link && (
            <a
              className="detail-link"
              target="_blank"
              rel="noopener noreferrer"
              href={link}
            >
              {m.source_open()}
            </a>
          )}
          <dl className="detail-fields">
            {candidate.fields.map((field) => (
              <div
                key={field.field}
                data-deviates={
                  (field.score && !field.score.fullAgreement) ||
                  field.agreement === false ||
                  undefined
                }
              >
                <dt>
                  {field.field in fieldLabels
                    ? m[fieldLabels[field.field as keyof typeof fieldLabels]]()
                    : field.field}
                  : {fieldVerdict(field)}
                </dt>
                <dd>
                  {m.reference_label()}: {raw(field.reference)}
                </dd>
                <dd>
                  {m.candidate_label()}: {raw(field.candidate)}
                </dd>
                <dd>{fieldScore(field)}</dd>
                {field.journalAbbreviation && (
                  <JournalAbbreviationExplanation
                    evidence={field.journalAbbreviation}
                  />
                )}
              </div>
            ))}
          </dl>
        </div>
      </details>
    </li>
  );
}
/**
 * D's lower detail: the Data sources queried, the Candidates behind a toggle
 * and the evidence trail, then the rules and identity provenance behind a
 * quiet Disclosure.
 */
export function EvidenceDetails({
  outcome,
  contextLabel,
}: {
  outcome: ReferenceOutcome;
  contextLabel?: string;
}) {
  if (outcome.kind === "status") return null;
  const sources = queriedSources(outcome.evidence);
  return (
    <div className="detail-evidence">
      {outcome.retraction === "retracted" && (
        <div className="detail-callout">
          <p className="font-semibold">{m.retraction_reported()}</p>
          <p>{m.retraction_independent()}</p>
        </div>
      )}
      <p className="detail-nrow">
        <Info aria-hidden="true" size={16} />
        <span>{m.doi_uncalibrated()}</span>
      </p>
      {outcome.reasons.some((r) =>
        ["web-original-unavailable", "url-unavailable"].includes(r),
      ) && (
        <p className="detail-note">
          {m.web_original_url()}: {outcome.reference.csl.URL}
        </p>
      )}
      {!!sources.length && (
        <DetailSection title={m.shell_sources_queried()}>
          <ul className="detail-list">
            {sources.map((evidence) => (
              <li
                key={evidence.source}
                className="detail-src"
                data-state={evidenceStep[evidence.outcome]}
              >
                <span className="detail-mark">
                  <StepIcon state={evidenceStep[evidence.outcome]!} />
                </span>
                <span className="detail-src-name">
                  {sourceNames[evidence.source]}
                </span>
                <span className="detail-src-text">
                  {evidenceLabel(evidence.outcome)}
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
      {!!outcome.failedSources.length && (
        <DetailSection
          title={m.failed_sources_heading()}
          label={[m.failed_sources_heading(), contextLabel]
            .filter(Boolean)
            .join(" · ")}
        >
          <ul className="detail-list">
            {outcome.failedSources.map((source) => (
              <li key={source} className="detail-src" data-state="warn">
                <span className="detail-mark">
                  <StepIcon state="warn" />
                </span>
                <span className="detail-src-name">{sourceNames[source]}</span>
                <span className="sr-only">: </span>
                <span className="detail-src-text">
                  {failureCause(outcome, source)}
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}
      {/* /v2 supplies descending internal Scores and stable ties. Display rounding never orders Candidates. */}
      {!!outcome.candidates.length && (
        <DetailSection title={m.shell_candidates_heading()}>
          <details className="detail-candidates">
            <summary className="detail-toggle">
              <Plus aria-hidden="true" size={16} className="when-closed" />
              <X aria-hidden="true" size={16} className="when-open" />
              {m.shell_candidates_toggle({
                count: String(outcome.candidates.length),
              })}
            </summary>
            <ul className="detail-list">
              {outcome.candidates.map((candidate) => (
                <CandidateEntry
                  key={candidate.id}
                  candidate={candidate}
                  best={candidate.id === outcome.bestMatchId}
                />
              ))}
            </ul>
          </details>
        </DetailSection>
      )}
      {!!outcome.evidence.length && (
        <DetailSection title={m.shell_evidence_trail()}>
          <ol className="detail-list">
            {outcome.evidence.map((e, i) => (
              <li
                className="detail-trail"
                data-state={evidenceStep[e.outcome] ?? "none"}
                key={i}
              >
                <span className="detail-mark">
                  <StepIcon state={evidenceStep[e.outcome] ?? "none"} />
                </span>
                <div className="detail-trail-body">
                  <p>
                    <span className="detail-src-name">
                      {sourceNames[e.source]}
                    </span>{" "}
                    · {m[origins[e.operation]]()}{" "}
                    <span className="detail-muted">
                      · {evidenceLabel(e.outcome)}
                    </span>
                  </p>
                  {e.web && (
                    <dl className="detail-web">
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
                  {e.reason &&
                    limitation(e.reason) !== evidenceLabel(e.outcome) && (
                      <p className="detail-note">
                        {m.evidence_limitation()}: {limitation(e.reason)}
                      </p>
                    )}
                </div>
                <time
                  className="detail-trail-time"
                  dateTime={e.observedAt}
                  title={e.observedAt}
                >
                  {new Intl.DateTimeFormat(getLocale(), {
                    timeStyle: "medium",
                  }).format(new Date(e.observedAt))}
                </time>
              </li>
            ))}
          </ol>
        </DetailSection>
      )}
      <details className="detail-disclosure">
        <summary>
          <ChevronRight aria-hidden="true" size={16} />
          {m.evidence_details()}
        </summary>
        <div className="detail-disclosure-body">
          <p>
            {m.scoring_rules_label()}: {outcome.scoringRules.version}
          </p>
          <p>
            {m.search_strategy_label()}: {outcome.searchStrategyVersion}
          </p>
          {outcome.retractionEvidence?.map((evidence) => (
            <p key={`${evidence.source}:${evidence.candidateId}`}>
              {m.retraction_provenance({
                source: sourceNames[evidence.source],
                candidateId: evidence.candidateId,
                observedAt: evidence.observedAt,
              })}
            </p>
          ))}
          <p>
            Unicode {outcome.scoringRules.unicode} / ICU{" "}
            {outcome.scoringRules.icu}
          </p>
          <p>
            {m.identity_label()}:{" "}
            {outcome.identity.kind in identityMessages
              ? m[
                  identityMessages[
                    outcome.identity.kind as keyof typeof identityMessages
                  ]
                ]()
              : m.identity_bibliography()}
          </p>
        </div>
      </details>
    </div>
  );
}
export function ReferenceOutcomeView({
  outcome,
  originalText,
  manualOverride,
  contextLabel,
  header,
}: {
  header?: ReactNode;
  outcome: ReferenceOutcome;
  contextLabel?: string;
  originalText?: string;
  manualOverride?: ManualOverride | null;
}) {
  return (
    <div className="detail-stack">
      {header ?? (
        <VerdictBlock outcome={outcome} manualOverride={manualOverride} />
      )}
      {originalText !== undefined && <OriginalInput text={originalText} />}
      {outcome.kind === "verdict" && (
        <BestMatchComparison outcome={outcome} contextLabel={contextLabel} />
      )}
      <EvidenceDetails outcome={outcome} contextLabel={contextLabel} />
    </div>
  );
}
function fieldState(
  comparison: VerdictResult["candidates"][number]["fields"][number] | undefined,
) {
  const deviates =
    (comparison?.score && !comparison.score.fullAgreement) ||
    comparison?.agreement === false;
  const agrees =
    !deviates &&
    (comparison?.score?.fullAgreement || comparison?.agreement === true);
  const reason = comparison?.score
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
              : m.workspace_not_compared();
  const scored = !!comparison?.score || comparison?.agreement !== undefined;
  return {
    deviates: !!deviates,
    agrees: !!agrees,
    note: scored ? reason : `${m.field_excluded()} · ${reason}`,
  };
}
/** D's field table: one row per field, your value beside the Best match.
 *  Find the recorded Best match by ID; a tied representative may show later. */
export function BestMatchComparison({
  outcome,
  contextLabel,
  action,
  children,
}: {
  outcome: VerdictResult;
  contextLabel?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const best = outcome.candidates.find(
    (candidate) => candidate.id === outcome.bestMatchId,
  );
  const link = best && sourceLink(best);
  return (
    <DetailSection
      title={m.shell_field_by_field()}
      action={action}
      label={[m.workspace_comparison(), contextLabel]
        .filter(Boolean)
        .join(" · ")}
    >
      {best ? (
        <p className="detail-best">
          <span>
            {m.best_match_label()} · {sourceNames[best.source]}
          </span>
          <span className="detail-record">
            {m.candidate_record()}: {best.id}
          </span>
          {link && (
            <a target="_blank" rel="noopener noreferrer" href={link}>
              {m.source_open()}
            </a>
          )}
        </p>
      ) : (
        <p className="detail-note">{m.workspace_no_best()}</p>
      )}
      {outcome.identity.kind === "unresolved" && (
        <p className="detail-note">{m.identity_unresolved()}</p>
      )}
      <table className="detail-compare">
        <caption className="sr-only">{m.workspace_comparison()}</caption>
        <thead>
          <tr>
            <th scope="col">{m.shell_field()}</th>
            <th scope="col">{m.shell_your_reference()}</th>
            <th scope="col">{m.workspace_best()}</th>
          </tr>
        </thead>
        {(Object.keys(fieldLabels) as (keyof typeof fieldLabels)[]).map(
          (field) => {
            const comparison = best?.fields.find(
              (value) => value.field === field,
            );
            const state = fieldState(comparison);
            const yours = raw(
              comparison ? comparison.reference : outcome.reference.csl[field],
            );
            const theirs = raw(
              comparison ? comparison.candidate : best?.csl[field],
            );
            // A field neither side has and nothing compared tells nothing.
            if (
              !comparison &&
              yours === m.workspace_unknown() &&
              theirs === m.workspace_unknown()
            )
              return null;
            return (
              <tbody key={field} data-deviates={state.deviates}>
                <tr>
                  <th scope="row">{m[fieldLabels[field]]()}</th>
                  <td>
                    <span className="compare-label" aria-hidden="true">
                      {m.shell_your_reference()}
                    </span>
                    <span
                      className={
                        yours === m.workspace_unknown()
                          ? "compare-unknown"
                          : state.deviates
                            ? "compare-deviating"
                            : undefined
                      }
                    >
                      {yours}
                    </span>
                    {state.deviates ? (
                      <span className="compare-differs">
                        <VerdictGlyph verdict="exists-with-deviations" />
                        {m.field_differs()}
                      </span>
                    ) : state.agrees ? (
                      <span className="compare-agrees">
                        <Check aria-hidden="true" size={14} />
                        <span className="sr-only">{m.field_agrees()}</span>
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className="compare-label" aria-hidden="true">
                      {m.workspace_best()}
                    </span>
                    <span
                      className={
                        theirs === m.workspace_unknown()
                          ? "compare-unknown"
                          : undefined
                      }
                    >
                      {theirs}
                    </span>
                    <small className="compare-note">{state.note}</small>
                  </td>
                </tr>
              </tbody>
            );
          },
        )}
      </table>
      {children}
    </DetailSection>
  );
}

export function ManualVerdictLabel({
  manualOverride,
}: {
  manualOverride: ManualOverride;
}) {
  const key = verdictLabels[manualOverride.verdict];
  return (
    <span className="manual-tag">
      <PencilLine aria-hidden="true" size={13} />
      {m.override_manual({ verdict: m[key]() })}
    </span>
  );
}

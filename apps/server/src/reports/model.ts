// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0017: a pure projection of one frozen Check snapshot into the report's
// reading order. It holds no persistence, performs no verification and does
// not touch Quota. The PDF adapter only lays this model out.
import type {
  Check,
  VerdictResult,
} from "@source-taster/contract-verification/v2";
import type { ReportLanguage } from "@source-taster/contract-verification/report";
import type { CitationStyle } from "@source-taster/contract-common";
import { m } from "@source-taster/i18n";
import { render } from "../citations/renderer.ts";
import { suggestionFields } from "../citations/suggestion.ts";

/** One piece of reading content below a heading, in reading order. */
export type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "labelled"; label: string; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "link"; label: string; url: string };
export interface Section {
  heading: string;
  blocks: Block[];
}
export interface ReportModel {
  language: ReportLanguage;
  title: string;
  /** The document title shown by viewers: the report title and, if given, the document name. */
  metaTitle: string;
  /** Pagination furniture; never part of the reading order. */
  footer: string;
  pageLabel(page: number, total: number): string;
  /** Title, document name, date and snapshot label. */
  front: Block[];
  overview: Section;
  references: Section[];
}

const verdictLabels = {
  correct: "verdict_correct",
  "exists-with-deviations": "verdict_exists",
  "mixed-citation": "verdict_mixed",
  "doi-conflict": "verdict_doi_conflict",
  "not-found": "verdict_not_found",
  "not-verifiable": "verdict_not_verifiable",
} as const;
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
const statuses = {
  running: "status_running",
  cancelled: "status_cancelled",
  failed: "status_failed",
  "not-checked": "status_not_checked",
} as const;
const sourceNames: Record<string, string> = {
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
const fieldLabels = {
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

/** Values are the Reference's own data: shown as supplied, never translated. */
function raw(value: unknown, unknown: string): string {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && !value.length)
  )
    return unknown;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => raw(v, unknown)).join("; ");
  if (typeof value === "object")
    return Object.values(value)
      .map((v) => raw(v, unknown))
      .join(" ");
  return typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
    ? `${value}`
    : "";
}
const stamp = (iso: string) => `${iso.slice(0, 16).replace("T", " ")} UTC`;

export interface ReportInput {
  check: Check;
  language: ReportLanguage;
  style: CitationStyle;
  documentName?: string;
  /** When the snapshot was frozen (generation began). */
  capturedAt: string;
}

export function buildReport(input: ReportInput): ReportModel {
  const { check, language } = input;
  const locale = { locale: language } as const;
  const unknown = m.workspace_unknown({}, locale);
  const references = check.references;
  const intermediate = check.state !== "ended";
  const when = stamp(input.capturedAt);
  const verdictName = (key: keyof typeof verdictLabels) =>
    m[verdictLabels[key]]({}, locale);

  const eligible = references.map((reference) => suggestionFields(reference));
  const present = eligible.flatMap((fields, index) =>
    fields ? [{ index, fields }] : [],
  );
  const suggestions = present.length
    ? render(
        present.map((entry) => entry.fields),
        input.style,
        true,
      ).entries
    : [];
  const suggestionFor = (index: number) => {
    const at = present.findIndex((entry) => entry.index === index);
    return at >= 0 ? (suggestions[at]?.text ?? null) : null;
  };
  const styleName = input.style;

  const counts = new Map<string, number>();
  const versions = new Set<string>();
  for (const reference of references) {
    const outcome = reference.outcome;
    const label =
      outcome.kind === "status"
        ? m[statuses[outcome.status]]({}, locale)
        : verdictName(
            (reference.manualOverride?.verdict ??
              outcome.verdict) as keyof typeof verdictLabels,
          );
    counts.set(label, (counts.get(label) ?? 0) + 1);
    if (outcome.kind === "verdict") versions.add(outcome.scoringRules.version);
  }

  const front: Block[] = [];
  if (input.documentName)
    front.push({
      kind: "labelled",
      label: m.report_document({}, locale),
      text: input.documentName,
    });
  front.push({
    kind: "labelled",
    label: m.report_date({}, locale),
    text: when,
  });
  front.push({
    kind: "paragraph",
    text: (intermediate ? m.report_intermediate : m.report_final)(
      { date: when },
      locale,
    ),
  });

  const overview: Section = {
    heading: m.report_overview({}, locale),
    blocks: [
      {
        kind: "labelled",
        label: m.report_check_state({}, locale),
        text: (intermediate ? m.report_state_running : m.report_state_ended)(
          {},
          locale,
        ),
      },
      {
        kind: "paragraph",
        text: m.report_summary_total({ count: references.length }, locale),
      },
      {
        kind: "list",
        items: [...counts].map(([label, count]) =>
          m.report_summary_item({ label, count }, locale),
        ),
      },
      ...(versions.size
        ? [
            {
              kind: "labelled" as const,
              label: m.report_scoring_versions({}, locale),
              text: [...versions].join(", "),
            },
          ]
        : []),
    ],
  };

  const sections = references.map((reference, index): Section => {
    const blocks: Block[] = [
      {
        kind: "labelled",
        label: m.structuring_original({}, locale),
        text: reference.originalText,
      },
    ];
    const outcome = reference.outcome;
    if (outcome.kind === "status") {
      blocks.push({
        kind: "labelled",
        label: m.report_status({}, locale),
        text: m[statuses[outcome.status]]({}, locale),
      });
    } else {
      const manual = reference.manualOverride;
      blocks.push({
        kind: "labelled",
        label: m.report_verdict({}, locale),
        text: verdictName(manual?.verdict ?? outcome.verdict),
      });
      if (manual) {
        blocks.push({
          kind: "paragraph",
          text: m.override_manual(
            { verdict: verdictName(manual.verdict) },
            locale,
          ),
        });
        blocks.push({
          kind: "paragraph",
          text: m.override_system(
            { verdict: verdictName(outcome.verdict) },
            locale,
          ),
        });
        blocks.push({
          kind: "paragraph",
          text: m.report_manual_since(
            { date: stamp(manual.createdAt) },
            locale,
          ),
        });
      }
      blocks.push(...explanation(outcome, locale, unknown));
      blocks.push({
        kind: "labelled",
        label: m.scoring_rules_label({}, locale),
        text: outcome.scoringRules.version,
      });
    }
    const suggestion = suggestionFor(index);
    blocks.push({
      kind: "labelled",
      label: m.correction_heading({}, locale),
      text: suggestion ?? m.report_no_suggestion({}, locale),
    });
    if (suggestion)
      blocks.push({
        kind: "paragraph",
        text: m.report_suggestion_style({ style: styleName }, locale),
      });
    return {
      heading: m.report_reference_heading({ slot: reference.slot }, locale),
      blocks,
    };
  });

  return {
    language,
    title: m.report_title({}, locale),
    metaTitle: input.documentName
      ? `${m.report_title({}, locale)} – ${input.documentName}`
      : m.report_title({}, locale),
    footer: m.report_footer({}, locale),
    pageLabel: (page, total) => m.report_page({ page, total }, locale),
    front,
    overview,
    references: sections,
  };
}

function explanation(
  outcome: VerdictResult,
  locale: { readonly locale: ReportLanguage },
  unknown: string,
): Block[] {
  const blocks: Block[] = [];
  if (outcome.reasons.length)
    blocks.push({
      kind: "labelled",
      label: m.report_reasons({}, locale),
      text: outcome.reasons.map((r) => m[reasons[r]]({}, locale)).join(" "),
    });
  if (outcome.retraction === "retracted")
    blocks.push({ kind: "paragraph", text: m.report_retracted({}, locale) });
  if (outcome.failedSources.length)
    blocks.push({
      kind: "labelled",
      label: m.failed_sources_heading({}, locale),
      text: outcome.failedSources.map((s) => sourceNames[s] ?? s).join(", "),
    });
  const best = outcome.candidates.find((c) => c.id === outcome.bestMatchId);
  if (!best) {
    blocks.push({ kind: "paragraph", text: m.workspace_no_best({}, locale) });
    return blocks;
  }
  blocks.push({
    kind: "labelled",
    label: m.best_match_label({}, locale),
    text: best.id,
  });
  const differing = best.fields.filter(
    (field) =>
      (field.score && !field.score.fullAgreement) || field.agreement === false,
  );
  if (!differing.length)
    blocks.push({
      kind: "paragraph",
      text: m.report_no_differences({}, locale),
    });
  else {
    blocks.push({
      kind: "paragraph",
      text: m.report_differences({}, locale),
    });
    blocks.push({
      kind: "list",
      items: differing.map((field) => {
        const label =
          field.field in fieldLabels
            ? m[fieldLabels[field.field as keyof typeof fieldLabels]](
                {},
                locale,
              )
            : field.field;
        return `${label}. ${m.report_reference_value({}, locale)}: ${raw(field.reference, unknown)}. ${m.report_candidate_value({}, locale)}: ${raw(field.candidate, unknown)}`;
      }),
    });
  }
  const doi = best.csl.DOI;
  if (doi && /^10\.\d{4,9}\/\S+$/iu.test(doi))
    blocks.push({
      kind: "link",
      label: m.report_doi_link({}, locale),
      url: `https://doi.org/${encodeURIComponent(doi)}`,
    });
  return blocks;
}

// SPDX-License-Identifier: AGPL-3.0-or-later
import type { AiStructuringResult as StructuringResult } from "@source-taster/contract-verification/ai";
import { AiProvenance } from "./ai-provenance.tsx";
import type { ImportResult } from "@source-taster/contract-verification/import";
import { m } from "@source-taster/i18n";

const fieldLabels = {
  type: "library_type",
  arXiv: "field_arxiv",
  author: "field_author",
  issued: "field_issued",
  title: "field_title",
  "container-title": "field_container",
  "container-title-short": "field_container_short",
  publisher: "field_publisher",
  "publisher-place": "field_place",
  volume: "field_volume",
  issue: "field_issue",
  page: "field_page",
  "article-number": "field_article_number",
  edition: "field_edition",
  DOI: "field_doi",
  URL: "field_url",
  ISBN: "field_isbn",
  ISSN: "field_issn",
  PMID: "field_pmid",
  PMCID: "field_pmcid",
} as const;

/** What a Structuring recognised, as the summary line announces it. */
export function structuringSummary(result: StructuringResult | ImportResult) {
  return ("guidance" in result
    ? result.guidance
    : result.references.length
      ? "recognized"
      : "no-references") === "no-references"
    ? "guidance" in result
      ? m.structuring_no_references()
      : m.library_no_references()
    : result.references.length === 1
      ? m.structuring_summary_one()
      : m.structuring_summary({ count: String(result.references.length) });
}

export function StructuringResults({
  result,
  inputText,
  upgradeUrl,
}: {
  result: StructuringResult | ImportResult;
  inputText?: string;
  upgradeUrl?: string;
}) {
  return (
    <div className="mt-10 space-y-6">
      <p
        role="status"
        aria-label={m.structuring_summary_label()}
        className="rounded-xl bg-surface-sunken p-4 text-text"
      >
        {structuringSummary(result)}
      </p>
      {"ai" in result && result.ai?.reason && (
        <p data-testid="ai-unavailable">
          {{
            guest: m.ai_guest,
            "feature-unavailable": m.ai_feature_unavailable,
            "configuration-unavailable": m.ai_configuration_unavailable,
          }[result.ai.reason]()}
          {/* A plan to upgrade to exists only where the service sells one;
              standalone builds pass no upgrade link (#194 D). */}
          {result.ai.upgrade && upgradeUrl && (
            <>
              {" "}
              {m.ai_upgrade_hint()}
              <a
                className="ml-2 underline"
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.quota_upgrade()}
              </a>
            </>
          )}
        </p>
      )}
      {"ai" in result &&
        result.ai?.fallbacks.map((fallback) => (
          <div key={fallback.span.start} data-testid="ai-fallback">
            <p>{m.ai_fallback()}</p>
            <p className="whitespace-pre-wrap">
              {inputText?.slice(fallback.span.start, fallback.span.end)}
            </p>
          </div>
        ))}
      {result.references.length > 0 && (
        <section aria-labelledby="structured-title">
          <h2 id="structured-title" className="mb-4 text-2xl font-semibold">
            {m.structuring_heading()}
          </h2>
          <p className="mb-4 text-text-secondary">
            {m.structuring_exact_notice()}
          </p>
          <ol className="space-y-6">
            {result.references.map((reference) => (
              <li
                key={reference.span.start}
                className="rounded-xl border border-border-emphasis bg-surface p-5"
              >
                {"ai" in reference && reference.ai && (
                  <AiProvenance ai={reference.ai} />
                )}
                <h3 className="font-semibold">{m.structuring_original()}</h3>
                <p className="mt-2 whitespace-pre-wrap break-words">
                  {reference.originalText}
                </p>
                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)]">
                  {(
                    Object.keys(reference.csl) as (keyof typeof fieldLabels)[]
                  ).map((key) => (
                    <ReactField
                      key={key}
                      label={
                        key in fieldLabels
                          ? m[fieldLabels[key]]()
                          : m.library_type()
                      }
                      value={reference.fieldSources[key]?.raw ?? ""}
                    />
                  ))}
                </dl>
                {"imported" in reference &&
                  reference.imported &&
                  reference.imported.unsupported.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold">
                        {m.library_unsupported()}
                      </h3>
                      <ul>
                        {reference.imported.unsupported.map((field, index) => (
                          <li key={index}>
                            {field.name}: {field.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {reference.authorsTruncated && (
                  <p className="mt-3">{m.structuring_truncated()}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
      {result.rejected.length > 0 && (
        <details className="rounded-xl border border-border-emphasis bg-surface p-5">
          <summary className="cursor-pointer font-semibold">
            {m.structuring_rejected()}
          </summary>
          <ul className="mt-4 space-y-3">
            {result.rejected.map((entry) => (
              <li
                key={entry.span.start}
                className="whitespace-pre-wrap break-words"
              >
                {entry.originalText}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
function ReactField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-semibold">{label}</dt>
      <dd className="min-w-0 whitespace-pre-wrap break-words">{value}</dd>
    </>
  );
}

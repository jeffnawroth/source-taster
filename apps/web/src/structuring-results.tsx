// SPDX-License-Identifier: AGPL-3.0-or-later
import type { StructuringResult } from "@source-taster/contract-verification";
import { m } from "@source-taster/i18n";

const fieldLabels = {
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

export function StructuringResults({ result }: { result: StructuringResult }) {
  return (
    <div className="mt-10 space-y-6">
      <p role="status" className="rounded-xl bg-teal-50 p-4 text-teal-950">
        {result.guidance === "no-references"
          ? m.structuring_no_references()
          : m.structuring_summary({ count: String(result.references.length) })}
      </p>
      {result.references.length > 0 && (
        <section aria-labelledby="structured-title">
          <h2 id="structured-title" className="mb-4 text-2xl font-semibold">
            {m.structuring_heading()}
          </h2>
          <p className="mb-4 text-slate-700">{m.structuring_exact_notice()}</p>
          <ol className="space-y-6">
            {result.references.map((reference) => (
              <li
                key={reference.span.start}
                className="rounded-xl border border-slate-300 bg-white p-5"
              >
                <h3 className="font-semibold">{m.structuring_original()}</h3>
                <p className="mt-2 whitespace-pre-wrap break-words">
                  {reference.originalText}
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  {(
                    Object.keys(reference.csl) as (keyof typeof fieldLabels)[]
                  ).map((key) => (
                    <ReactField
                      key={key}
                      label={m[fieldLabels[key]]()}
                      value={reference.fieldSources[key]?.raw ?? ""}
                    />
                  ))}
                </dl>
                {reference.authorsTruncated && (
                  <p className="mt-3">{m.structuring_truncated()}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
      {result.rejected.length > 0 && (
        <details className="rounded-xl border border-slate-300 bg-white p-5">
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
      <dd className="whitespace-pre-wrap break-words">{value}</dd>
    </>
  );
}

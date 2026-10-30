// SPDX-License-Identifier: AGPL-3.0-or-later
// arXiv API (ADR-0007): identifier lookup only, after the Semantic Scholar
// index. arXiv is never a bibliographic search source and exposes no retraction.
import { normalizeArxiv } from "@source-taster/core";
import type {
  BibliographicSource,
  RetrievedCandidate,
} from "@source-taster/core";
import type { BatchResponse } from "./batch.ts";
import {
  answered,
  batchableArxiv,
  displayName,
  lookupResult,
  noRecord,
  unreadable,
  type SourceBatch,
  type SourceRequest,
} from "./shared.ts";
const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};
function text(xml: string) {
  return xml
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gu, "$1")
    .replace(
      /&(#x[\da-f]{1,6}|#\d{1,7}|[a-z]{2,4});/giu,
      (all, name: string) => {
        if (name.startsWith("#")) {
          const code =
            name[1]?.toLowerCase() === "x"
              ? Number.parseInt(name.slice(2), 16)
              : Number.parseInt(name.slice(1), 10);
          return code <= 0x10ffff ? String.fromCodePoint(code) : all;
        }
        return entities[name] ?? all;
      },
    )
    .replace(/\s+/gu, " ")
    .trim();
}
const element = (xml: string, name: string) => {
  const match = new RegExp(
    `<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`,
    "u",
  ).exec(xml);
  return match ? text(match[1]!) : undefined;
};
/**
 * The Atom entries of a bounded response by version-free identifier, and
 * whether the feed is a complete answer to the identifiers sent: closed, from
 * the first result, with a result count equal to its entries, and only
 * records that were sent. arXiv omits an identifier without a record from
 * the results; an error entry carries no record identifier.
 */
function entries(atom: string, sent: string[]) {
  const records = new Map<string, string>();
  const listed = [...atom.matchAll(/<entry>[\s\S]*?<\/entry>/gu)];
  let complete =
    /<\/feed>\s*$/u.test(atom) &&
    element(atom, "opensearch:startIndex") === "0" &&
    element(atom, "opensearch:totalResults") === String(listed.length);
  for (const [entry] of listed) {
    const match = element(entry, "id")?.match(/arxiv\.org\/abs\/(.+)$/u);
    if (!match) {
      complete = false;
      continue;
    }
    const id = normalizeArxiv(match[1]!);
    if (!sent.includes(id)) complete = false;
    records.set(id, entry);
  }
  return { records, complete };
}
/** One Atom entry; its raw value is the entry alone, never other lookups. */
function project(
  entry: string,
  arXiv: string,
  retrievedAt: string,
): RetrievedCandidate {
  const title = element(entry, "title");
  const published = element(entry, "published")?.slice(0, 10);
  const doi = element(entry, "arxiv:doi");
  const authors = [...entry.matchAll(/<author>([\s\S]*?)<\/author>/gu)]
    .map((a) => element(a[1]!, "name"))
    .filter((name): name is string => !!name)
    .map(displayName);
  return {
    id: `arXiv:${arXiv}`,
    source: "arxiv",
    origin: "arxiv",
    retrievedAt,
    raw: entry,
    csl: {
      arXiv,
      ...(title ? { title } : {}),
      ...(authors.length ? { author: authors } : {}),
      ...(published ? { issued: { literal: published } } : {}),
      // The publisher DOI an author reported; never an inferred arXiv DOI.
      ...(doi ? { DOI: doi } : {}),
    },
  };
}
const query = (base: string, ids: string[]) => {
  const url = new URL("/api/query", base);
  url.searchParams.set("id_list", ids.join(","));
  url.searchParams.set("max_results", String(ids.length));
  return url;
};
export function arxivAdapter(
  request: SourceRequest,
  batched: SourceBatch,
  base: string,
): BibliographicSource {
  return {
    name: "arxiv",
    identifiers: ["arxiv"],
    async lookup(kind, value, deadline) {
      // ADR-0007: lookups collected across Checks until the next
      // three-second opportunity share one id_list request.
      const { body, evidence, ids }: BatchResponse = batchableArxiv(value)
        ? await batched(
            "arxiv",
            kind,
            value,
            deadline,
            true,
            (ids) => ({ url: query(base, ids) }),
            "atom",
          )
        : await request("arxiv", query(base, [value]), deadline, kind, "atom");
      if (!answered(evidence) || typeof body !== "string")
        return { evidence: unreadable(evidence) };
      const { records, complete } = entries(body, ids ?? [value]);
      const entry = records.get(value);
      if (!entry)
        // Absence is no record only in a complete answer, and only for an
        // identifier in arXiv's record form; arXiv silently omits other forms
        // of existing records (math.GT/0309136, HEP-TH/9901001).
        return complete && batchableArxiv(value)
          ? noRecord(evidence)
          : { evidence: unreadable(evidence) };
      const own = { ...evidence, raw: entry };
      return lookupResult(
        own,
        project(entry, value, own.observedAt),
        (c) => c.csl.arXiv === value,
      );
    },
  };
}

// SPDX-License-Identifier: AGPL-3.0-or-later
// arXiv API (ADR-0007): identifier lookup only, after the Semantic Scholar
// index. arXiv is never a bibliographic search source and exposes no retraction.
import { normalizeArxiv } from "@source-taster/core";
import type {
  BibliographicSource,
  RetrievedCandidate,
} from "@source-taster/core";
import {
  answered,
  displayName,
  lookupResult,
  noRecord,
  unreadable,
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
/** First Atom entry of a bounded response; error entries are not records. */
function project(
  atom: string,
  retrievedAt: string,
): RetrievedCandidate | undefined {
  const entry = /<entry>([\s\S]*?)<\/entry>/u.exec(atom)?.[1];
  if (!entry) return;
  const id = element(entry, "id");
  const match = id?.match(/arxiv\.org\/abs\/(.+)$/u);
  if (!match) return;
  const arXiv = normalizeArxiv(match[1]!);
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
    raw: atom,
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
export function arxivAdapter(
  request: SourceRequest,
  base: string,
): BibliographicSource {
  return {
    name: "arxiv",
    identifiers: ["arxiv"],
    async lookup(kind, value, deadline) {
      const url = new URL("/api/query", base);
      url.searchParams.set("id_list", value);
      url.searchParams.set("max_results", "1");
      const { body, evidence } = await request(
        "arxiv",
        url,
        deadline,
        kind,
        "atom",
      );
      if (!answered(evidence) || typeof body !== "string")
        return { evidence: unreadable(evidence) };
      const candidate = project(body, evidence.observedAt);
      if (!candidate) return noRecord(evidence);
      return lookupResult(evidence, candidate, (c) => c.csl.arXiv === value);
    },
  };
}

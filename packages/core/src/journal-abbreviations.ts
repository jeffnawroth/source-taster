// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0018. Pure comparison over a pinned catalog and metadata already received.
import data from "./data/nlm-journals.json" with { type: "json" };
import { clean, foldClean } from "./comparison-normalization.ts";
import type { Csl } from "./structuring.ts";
// The committed snapshot is generated and validated by scripts/nlm-snapshot.ts.
// An explicit shape also avoids the language service's large-JSON size limit.
const snapshot = data as {
  snapshotDate: string;
  sourceSha256: string;
  journals: string[][];
};
export const journalAbbreviationRules = Object.freeze({
  version: "journal-76-1",
  snapshotDate: snapshot.snapshotDate,
  sourceSha256: snapshot.sourceSha256,
});
export interface ReceivedJournal {
  source: string;
  raw: unknown;
}
export interface JournalAttestation {
  source: "nlm" | "crossref" | "europepmc" | "semanticscholar";
  role: "candidate" | "reference";
  journalTitle: string;
  abbreviation: string;
  nlmId?: string;
  snapshotDate?: string;
}
export interface JournalAbbreviation {
  outcome: "match" | "different" | "not-determinable";
  reason: "attested-match" | "attested-other-journal" | "no-attestation";
  attestations: JournalAttestation[];
}
const forms = (raw: string, abbreviation = false) => {
  return preparedForms(clean(raw, true), abbreviation);
};
function preparedForms(prepared: string, abbreviation = false) {
  return [false, true].map((extended) => {
    const value = foldClean(prepared, extended);
    return abbreviation ? value.replace(/\s/gu, "") : value;
  });
}
function equal(a: string, b: string, abbreviation = false) {
  return equalPrepared(clean(a, true), clean(b, true), abbreviation);
}
function equalPrepared(a: string, b: string, abbreviation = false) {
  const x = preparedForms(a, abbreviation),
    y = preparedForms(b, abbreviation);
  return x.some((value, i) => value !== "" && value === y[i]);
}
function qualifier(raw: string) {
  const prepared = clean(raw, true);
  const match = /\s*(?:\(([^()]*)\)|\[([^[\]]*)\])\s*$/u.exec(prepared);
  return {
    base: match ? prepared.slice(0, match.index) : prepared,
    qualifier: match?.[1] ?? match?.[2],
  };
}
interface Journal {
  nlmId: string;
  title: string;
  abbreviations: string[];
  issns: string[];
}
const byTitle = new Map<string, Journal[]>(),
  byIssn = new Map<string, Journal[]>(),
  byAbbreviation = new Map<string, Journal[]>(),
  byNlmId = new Map<string, Journal[]>();
function index(map: Map<string, Journal[]>, keys: string[], journal: Journal) {
  for (const key of new Set(keys)) {
    if (!key) continue;
    const entries = map.get(key) ?? [];
    entries.push(journal);
    map.set(key, entries);
  }
}
const issnKey = (value: string) => value.replace(/[^\dX]/giu, "").toUpperCase();
for (const row of snapshot.journals) {
  const [nlmId, title, medline, iso, print, online] = row as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const journal = {
    nlmId,
    title,
    abbreviations: [...new Set([medline, iso].filter(Boolean))],
    issns: [print, online].filter(Boolean),
  };
  index(byTitle, forms(title), journal);
  index(byNlmId, [nlmId], journal);
  index(byIssn, journal.issns.map(issnKey), journal);
  index(
    byAbbreviation,
    journal.abbreviations.flatMap((a) => forms(a, true)),
    journal,
  );
}
function lookup(map: Map<string, Journal[]>, keys: string[]) {
  return [...new Set(keys.flatMap((key) => map.get(key) ?? []))];
}
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function strings(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value]).filter(
    (v): v is string => typeof v === "string" && v.trim() !== "",
  );
}
function receivedAbbreviations(
  candidate: Csl,
  received?: ReceivedJournal,
): JournalAttestation[] {
  const raw = record(received?.raw);
  const source = received?.source ?? "crossref";
  const title = candidate["container-title"] ?? "";
  let values: string[] = [];
  if (source === "crossref") values = strings(raw["short-container-title"]);
  if (source === "europepmc") {
    values = strings(
      record(record(raw.journalInfo).journal).medlineAbbreviation,
    );
  }
  if (source === "semanticscholar")
    values = strings(record(raw.publicationVenue).alternate_names);
  if (["crossref", "europepmc", "semanticscholar"].includes(source))
    values.push(...strings(candidate["container-title-short"]));
  return [...new Set(values)]
    .filter((a) => !equal(a, title))
    .map((abbreviation) => ({
      source: source as JournalAttestation["source"],
      role: "candidate",
      journalTitle: title,
      abbreviation,
    }));
}
function nlmAttestation(
  journal: Journal,
  abbreviation: string,
  role: JournalAttestation["role"],
): JournalAttestation {
  return {
    source: "nlm",
    role,
    journalTitle: journal.title,
    abbreviation,
    nlmId: journal.nlmId,
    snapshotDate: snapshot.snapshotDate,
  };
}
export function compareJournalAbbreviation(
  supplied: string,
  candidate: Csl,
  received?: ReceivedJournal,
): JournalAbbreviation {
  const raw = record(received?.raw);
  const journal = record(record(raw.journalInfo).journal);
  const issns = [
    ...strings(candidate.ISSN),
    ...strings(raw.ISSN),
    ...strings(journal.issn),
    ...strings(journal.essn),
  ];
  const identifiedById =
    received?.source === "europepmc"
      ? lookup(byNlmId, [...strings(journal.nlmid), ...strings(journal.nlmId)])
      : [];
  const identifiedByIssn = lookup(byIssn, issns.map(issnKey));
  const identifiedByTitle = lookup(
    byTitle,
    forms(candidate["container-title"] ?? ""),
  );
  const identified = identifiedById.length
    ? identifiedById
    : identifiedByIssn.length
      ? identifiedByIssn
      : identifiedByTitle;
  // Historical titles can share an ISSN. A full title can disambiguate that
  // catalog set, while an already unique identifier remains authoritative.
  const titleIntersection = identified.filter((j) =>
    identifiedByTitle.includes(j),
  );
  const journals =
    identified.length > 1 && titleIntersection.length
      ? titleIntersection
      : identified;
  const attestations = [
    ...journals.flatMap((j) =>
      j.abbreviations.map((a) => nlmAttestation(j, a, "candidate")),
    ),
    ...receivedAbbreviations(candidate, received),
  ];
  const canonical = qualifier(candidate["container-title"] ?? "");
  const reference = qualifier(supplied);
  const matches = attestations.filter((a) => {
    const attested = qualifier(a.abbreviation);
    // Conflicting qualifiers never disappear through punctuation normalization.
    if (
      reference.qualifier &&
      attested.qualifier &&
      !equalPrepared(reference.qualifier, attested.qualifier)
    )
      return false;
    if (a.source === "nlm") {
      if (journals.length !== 1) return false;
      if (equal(supplied, a.abbreviation, true)) return true;
      // Only an identified catalog journal proves an omitted qualifier.
      return (
        !reference.qualifier &&
        Boolean(attested.qualifier) &&
        equalPrepared(reference.base, attested.base, true)
      );
    }
    const qualifiersAgree = [reference.qualifier, attested.qualifier].every(
      (q) =>
        q === undefined ||
        canonical.qualifier === undefined ||
        equalPrepared(q, canonical.qualifier),
    );
    if (!qualifiersAgree) return false;
    if (equal(supplied, a.abbreviation, true)) return true;
    return (
      Boolean(canonical.qualifier) &&
      Boolean(reference.qualifier || attested.qualifier) &&
      equalPrepared(reference.base, attested.base, true)
    );
  });
  if (matches.length)
    return {
      outcome: "match",
      reason: "attested-match",
      attestations: matches,
    };
  // A mismatch requires affirmative evidence on BOTH sides. A missing catalog
  // entry or an arbitrary unrecognized acronym is never negative evidence.
  const others = lookup(byAbbreviation, forms(supplied, true)).filter(
    (j) =>
      !journals.includes(j) &&
      (journals.length > 0 ||
        !equal(j.title, candidate["container-title"] ?? "")),
  );
  // An ambiguous Candidate journal cannot prove a differing abbreviation,
  // even if the supplied abbreviation is also attested outside that group.
  if (journals.length <= 1 && attestations.length && others.length)
    return {
      outcome: "different",
      reason: "attested-other-journal",
      attestations: [
        ...attestations,
        ...others.flatMap((j) =>
          j.abbreviations
            .filter((a) => equal(a, supplied, true))
            .map((a) => nlmAttestation(j, a, "reference")),
        ),
      ],
    };
  return {
    outcome: "not-determinable",
    reason: "no-attestation",
    attestations,
  };
}

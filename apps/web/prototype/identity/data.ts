// PROTOTYPE (#191): static synthetic data. Not real bibliographic claims.
import type { VerdictKey } from "./tokens.ts";

export type Lang = "de" | "en";
type L = Record<Lang, string>;

export const verdictLabel: Record<VerdictKey, L> = {
  correct: { de: "Korrekt", en: "Correct" },
  exists: { de: "Existiert, mit Abweichungen", en: "Exists, with deviations" },
  mixed: { de: "Gemischte Referenz", en: "Mixed citation" },
  doi: { de: "DOI-Konflikt", en: "DOI conflict" },
  notfound: { de: "Nicht gefunden", en: "Not found" },
  unverifiable: { de: "Nicht verifizierbar", en: "Not verifiable" },
};
export const verdictShort: Record<VerdictKey, L> = {
  correct: { de: "Korrekt", en: "Correct" },
  exists: { de: "Abweichungen", en: "Deviations" },
  mixed: { de: "Gemischt", en: "Mixed" },
  doi: { de: "DOI-Konflikt", en: "DOI conflict" },
  notfound: { de: "Nicht gefunden", en: "Not found" },
  unverifiable: { de: "Nicht verifizierbar", en: "Not verifiable" },
};

export const copy = {
  tagline: {
    de: "Quellen prüfen, mit Belegen.",
    en: "Check sources, with evidence.",
  },
  newCheck: { de: "Neue Prüfung", en: "New check" },
  history: { de: "Verlauf", en: "History" },
  checkTitle: {
    de: "Seminararbeit_Medienpädagogik.docx",
    en: "Seminar_paper_media_education.docx",
  },
  checkMeta: {
    de: "Geprüft am 6. Nov. 2026 · 8 Referenzen",
    en: "Checked 6 Nov 2026 · 8 references",
  },
  all: { de: "Alle", en: "All" },
  back: { de: "Zurück zur Liste", en: "Back to list" },
  reference: { de: "Ihre Referenz", en: "Your reference" },
  bestMatch: { de: "Bester Treffer", en: "Best match" },
  field: { de: "Feld", en: "Field" },
  differs: { de: "weicht ab", en: "differs" },
  matches: { de: "stimmt überein", en: "matches" },
  suggestion: { de: "Korrekturvorschlag", en: "Suggested correction" },
  suggestionNote: {
    de: "Übernehmen Sie den Vorschlag nur, wenn er zu Ihrer Quelle passt.",
    en: "Only apply the suggestion if it fits the source you used.",
  },
  copy: { de: "Kopieren", en: "Copy" },
  checked: { de: "Geprüfte Quellen", en: "Sources checked" },
  evidence: { de: "Belege", en: "Evidence" },
  noMatch: { de: "Kein Treffer", en: "No match" },
  of: { de: "von", en: "of" },
  summary: {
    de: "3 von 8 Referenzen stimmen vollständig überein. 5 brauchen einen zweiten Blick.",
    en: "3 of 8 references match fully. 5 deserve a second look.",
  },
  trustLine: {
    de: "Open Source · EU-Hosting · Löschung nach 24 Stunden",
    en: "Open source · EU hosting · Deleted after 24 hours",
  },
} satisfies Record<string, L>;

export interface FieldRow {
  field: L;
  ref: string;
  match: string;
  differs?: boolean;
}
export interface Ref {
  id: number;
  verdict: VerdictKey;
  title: string;
  byline: string; // authors, year
  venue: string;
  doi?: string;
  explain: L;
  fields?: FieldRow[];
  sources: string[];
  suggestion?: string;
}

const F = {
  authors: { de: "Autor:innen", en: "Authors" },
  year: { de: "Jahr", en: "Year" },
  title: { de: "Titel", en: "Title" },
  venue: { de: "Quelle", en: "Source" },
  pages: { de: "Seiten", en: "Pages" },
  doi: { de: "DOI", en: "DOI" },
};

export const refs: Ref[] = [
  {
    id: 1,
    verdict: "correct",
    title: "Soziale Systeme: Grundriß einer allgemeinen Theorie",
    byline: "Luhmann, N. (1984)",
    venue: "Suhrkamp, Frankfurt am Main",
    explain: {
      de: "Titel, Autor und Jahr stimmen mit dem Katalogeintrag überein.",
      en: "Title, author and year match the catalogue record.",
    },
    fields: [
      { field: F.authors, ref: "Luhmann, N.", match: "Luhmann, Niklas" },
      { field: F.year, ref: "1984", match: "1984" },
      { field: F.title, ref: "Soziale Systeme: Grundriß einer allgemeinen Theorie", match: "Soziale Systeme: Grundriß einer allgemeinen Theorie" },
    ],
    sources: ["Open Library", "Google Books"],
  },
  {
    id: 2,
    verdict: "exists",
    title: "Digitale Lehre in der Hochschulbildung",
    byline: "Mayer, T. (2019)",
    venue: "Zeitschrift für Hochschulentwicklung, 14(3), 45–62",
    doi: "10.3217/zfhe-14-03/04",
    explain: {
      de: "Die Arbeit existiert. Jahr, Titel und Seitenangabe weichen vom Eintrag ab.",
      en: "The work exists. Year, title and page range differ from the record.",
    },
    fields: [
      { field: F.authors, ref: "Mayer, T.", match: "Mayer, Tobias" },
      { field: F.year, ref: "2019", match: "2020", differs: true },
      { field: F.title, ref: "Digitale Lehre in der Hochschulbildung", match: "Digitale Hochschullehre: Formate und Wirkungen", differs: true },
      { field: F.venue, ref: "Zeitschrift für Hochschulentwicklung, 14(3)", match: "Zeitschrift für Hochschulentwicklung, 14(3)" },
      { field: F.pages, ref: "45–62", match: "45–61", differs: true },
      { field: F.doi, ref: "10.3217/zfhe-14-03/04", match: "10.3217/zfhe-14-03/04" },
    ],
    sources: ["doi.org", "Crossref", "OpenAlex"],
    suggestion:
      "Mayer, T. (2020). Digitale Hochschullehre: Formate und Wirkungen. Zeitschrift für Hochschulentwicklung, 14(3), 45–61. https://doi.org/10.3217/zfhe-14-03/04",
  },
  {
    id: 3,
    verdict: "correct",
    title: "The FAIR Guiding Principles for scientific data management and stewardship",
    byline: "Wilkinson, M. D. et al. (2016)",
    venue: "Scientific Data, 3, 160018",
    doi: "10.1038/sdata.2016.18",
    explain: {
      de: "DOI aufgelöst; alle Felder stimmen überein.",
      en: "DOI resolved; all fields match.",
    },
    fields: [
      { field: F.authors, ref: "Wilkinson, M. D. et al.", match: "Wilkinson, Mark D.; Dumontier, M.; …" },
      { field: F.year, ref: "2016", match: "2016" },
      { field: F.doi, ref: "10.1038/sdata.2016.18", match: "10.1038/sdata.2016.18" },
    ],
    sources: ["doi.org", "Crossref"],
  },
  {
    id: 4,
    verdict: "mixed",
    title: "Lernen mit Medien im Zeitalter der Digitalisierung",
    byline: "Schmidt, K. & Weber, L. (2017)",
    venue: "Medienpädagogik, 29, 112–130",
    explain: {
      de: "Der Titel gehört zu einer anderen Arbeit als Autor:innen und Quelle.",
      en: "The title belongs to a different work than the authors and source.",
    },
    fields: [
      { field: F.authors, ref: "Schmidt, K. & Weber, L.", match: "Schmidt, Katrin; Weber, Lena", differs: false },
      { field: F.title, ref: "Lernen mit Medien im Zeitalter der Digitalisierung", match: "Kompetenzorientierte Medienbildung in Schulen", differs: true },
      { field: F.venue, ref: "Medienpädagogik, 29", match: "Medienpädagogik, 29" },
    ],
    sources: ["Crossref", "OpenAlex", "Semantic Scholar"],
  },
  {
    id: 5,
    verdict: "doi",
    title: "Datenschutz im digitalen Klassenzimmer",
    byline: "Krüger, M. (2021)",
    venue: "Recht der Datenverarbeitung, 37(2), 71–79",
    doi: "10.1007/s11623-021-1234-5",
    explain: {
      de: "Der DOI führt zu einer anderen Arbeit als der angegebene Titel.",
      en: "The DOI leads to a different work than the title given.",
    },
    fields: [
      { field: F.title, ref: "Datenschutz im digitalen Klassenzimmer", match: "Kryptografie in der Praxis", differs: true },
      { field: F.doi, ref: "10.1007/s11623-021-1234-5", match: "10.1007/s11623-021-1234-5" },
    ],
    sources: ["doi.org", "Crossref"],
  },
  {
    id: 6,
    verdict: "notfound",
    title: "Resilienz durch Kollaboration: Eine Studie an deutschen Universitäten",
    byline: "Hoffmann, A. (2022)",
    venue: "Journal für Hochschuldidaktik, 18(1), 5–24",
    explain: {
      de: "Nach der Suche in 6 Quellen wurde keine passende Arbeit gefunden. Das ist kein Beweis, dass sie nicht existiert.",
      en: "No matching work was found after searching 6 sources. This is not proof that it does not exist.",
    },
    sources: ["Crossref", "OpenAlex", "Europe PMC", "Semantic Scholar", "arXiv", "Open Library"],
  },
  {
    id: 7,
    verdict: "unverifiable",
    title: "Digitalisierung in der Bildung: Bericht zur Lage 2023",
    byline: "Bundesministerium für Bildung und Forschung (2023)",
    venue: "https://www.example-ministerium.de/berichte/lage-2023.pdf",
    explain: {
      de: "Die Webseite war nicht erreichbar. Es liegt kein Ergebnis vor, weder für noch gegen die Referenz.",
      en: "The web page was unreachable. There is no result either for or against the reference.",
    },
    sources: ["URL", "Internet Archive"],
  },
  {
    id: 8,
    verdict: "correct",
    title: "Forschungsmethoden und Evaluation in den Sozial- und Humanwissenschaften",
    byline: "Bortz, J. & Döring, N. (2016)",
    venue: "Springer, Berlin",
    doi: "10.1007/978-3-642-41089-5",
    explain: {
      de: "DOI aufgelöst; Titel, Autor:innen und Jahr stimmen überein.",
      en: "DOI resolved; title, authors and year match.",
    },
    fields: [
      { field: F.authors, ref: "Bortz, J. & Döring, N.", match: "Bortz, Jürgen; Döring, Nicola" },
      { field: F.year, ref: "2016", match: "2016" },
    ],
    sources: ["doi.org", "Crossref"],
  },
];

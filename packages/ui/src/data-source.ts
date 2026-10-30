// SPDX-License-Identifier: AGPL-3.0-or-later
export const dataSourceNames: Readonly<Record<string, string>> = {
  "doi.org": "doi.org",
  crossref: "Crossref",
  openalex: "OpenAlex",
  openlibrary: "Open Library",
  googlebooks: "Google Books",
};
export const dataSourceName = (source: string) =>
  dataSourceNames[source] ?? source;

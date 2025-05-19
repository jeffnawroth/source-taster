/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { ReferenceMetadata } from '../interface'
import { parseAuthors } from '../helpers/authorParser'

/**
 * Extracts metadata from APA 7 online newspaper articles
 * Example: Wakabayashi, D. (2020, October 21). Google antitrust fight thrusts low-key C.E.O. into the line of fire. The New York Times. https://www.nytimes.com/2020/10/21/technology/google-antitrust-sundar-pichai.html
 */
export function extractApaNewspaperArticleReference(reference: string): ReferenceMetadata[] | null {
  // Newspaper articles have an additional publication info (newspaper name) before the URL
  // Wichtig: Erfordere ein Komma nach dem Jahr und einen Monat für Zeitungsartikel, um diese von Büchern zu unterscheiden
  const apaNewspaperPattern = /^([^(]+)\s+\((\d{4}),\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?\)\.\s+([^.]+)\.\s+([^.]+)\.\s+(https:\/\/www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)$/

  const match = reference.match(apaNewspaperPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const month = match[3] ? match[3].trim() : null
  const day = match[4] ? Number.parseInt(match[4], 10) : null

  // Title is match[5]
  const title = match[5].trim()

  // Newspaper name is match[6]
  const newspaper = match[6].trim()

  // URL is match[7]
  const url = match[7].trim()

  return [{
    originalEntry: reference,
    authors,
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
    title,
    containerTitle: newspaper,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: null,
    url,
    sourceType: 'Newspaper article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}

/**
 * Extracts metadata from APA 7 print newspaper articles
 * Example: Popkin, G. (2020, August 12). Global warming could unlock carbon from tropical soil. The New York Times, D3.
 */
export function extractApaPrintNewspaperArticleReference(reference: string): ReferenceMetadata[] | null {
  // Pattern für Zeitungsartikel in gedruckter Form mit Seitenzahl
  // Macht den Monats- und Tagesteil optional
  const apaPrintNewspaperPattern = /^([^(]+)\s+\((\d{4})(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?\)\.\s+([^.]+)\.\s+([^,]+),\s+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)\.$/

  const match = reference.match(apaPrintNewspaperPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const month = match[3] ? match[3].trim() : null
  const day = match[4] ? Number.parseInt(match[4], 10) : null

  // Title is match[5]
  const title = match[5].trim()

  // Newspaper name is match[6]
  const newspaper = match[6].trim()

  // Pages is match[7]
  const pages = match[7].trim()

  return [{
    originalEntry: reference,
    authors,
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
    title,
    containerTitle: newspaper,
    volume: null,
    issue: null,
    pages,
    doi: null,
    publisher: null,
    url: null,
    sourceType: 'Newspaper article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}

/**
 * Extracts metadata from APA 7 print newspaper articles with no author and no date
 * Example: Global warming could unlock carbon from tropical soil. (n.d.). The New York Times, D3.
 */
export function extractApaPrintNewspaperNoAuthorNoDateReference(reference: string): ReferenceMetadata[] | null {
  // Pattern für Zeitungsartikel in gedruckter Form ohne Autor und ohne Datum
  const apaPrintNewspaperNoAuthorNoDatePattern = /^([^.(]+)\.\s+\(n\.d\.\)\.\s+([^,]+),\s+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)\.$/

  const match = reference.match(apaPrintNewspaperNoAuthorNoDatePattern)

  if (!match) {
    return null
  }

  // Title is the first part (no author)
  const title = match[1].trim()

  // Newspaper name is match[2]
  const newspaper = match[2].trim()

  // Pages is match[3]
  const pages = match[3].trim()

  return [{
    originalEntry: reference,
    authors: null, // Kein Autor
    year: null,
    month: null,
    day: null,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: true, // Kein Datum
    title,
    containerTitle: newspaper,
    volume: null,
    issue: null,
    pages,
    doi: null,
    publisher: null,
    url: null,
    sourceType: 'Newspaper article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}

/**
 * Extracts metadata from APA 7 print newspaper articles without an author (with year only or full date)
 * Example: Global warming could unlock carbon from tropical soil. (2020, August 12). The New York Times, D3.
 * Example: Global warming could unlock carbon from tropical soil. (2020). The New York Times, D3.
 */
export function extractApaPrintNewspaperNoAuthorReference(reference: string): ReferenceMetadata[] | null {
  // Pattern für Zeitungsartikel in gedruckter Form ohne Autor mit Seitenzahl
  // Macht den Monats- und Tagesteil optional
  const apaPrintNewspaperNoAuthorPattern = /^([^.(]+)\.\s+\((\d{4})(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?\)\.\s+([^,]+),\s+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)\.$/

  const match = reference.match(apaPrintNewspaperNoAuthorPattern)

  if (!match) {
    return null
  }

  // Title is the first part (no author)
  const title = match[1].trim()

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const month = match[3] ? match[3].trim() : null
  const day = match[4] ? Number.parseInt(match[4], 10) : null

  // Newspaper name is match[5]
  const newspaper = match[5].trim()

  // Pages is match[6]
  const pages = match[6].trim()

  return [{
    originalEntry: reference,
    authors: null, // Kein Autor
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
    title,
    containerTitle: newspaper,
    volume: null,
    issue: null,
    pages,
    doi: null,
    publisher: null,
    url: null,
    sourceType: 'Newspaper article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}

/**
 * Extracts metadata from APA 7 print newspaper articles with no date
 * Example: Popkin, G. (n.d.). Global warming could unlock carbon from tropical soil. The New York Times, D3.
 */
export function extractApaPrintNewspaperNoDateReference(reference: string): ReferenceMetadata[] | null {
  // Pattern für Zeitungsartikel in gedruckter Form ohne Datum
  const apaPrintNewspaperNoDatePattern = /^([^(]+)\s+\(n\.d\.\)\.\s+([^.]+)\.\s+([^,]+),\s+([A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)\.$/

  const match = reference.match(apaPrintNewspaperNoDatePattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

  // Title is match[2]
  const title = match[2].trim()

  // Newspaper name is match[3]
  const newspaper = match[3].trim()

  // Pages is match[4]
  const pages = match[4].trim()

  return [{
    originalEntry: reference,
    authors,
    year: null,
    month: null,
    day: null,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: true,
    title,
    containerTitle: newspaper,
    volume: null,
    issue: null,
    pages,
    doi: null,
    publisher: null,
    url: null,
    sourceType: 'Newspaper article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}

/**
 * Extracts metadata from APA 7 online newspaper articles with no author
 * Example: Global warming could unlock carbon from tropical soil. (2020, August 12). The New York Times. https://www.nytimes.com/2020/08/12/climate/global-warming-soil-carbon.html
 */
export function extractApaNewspaperNoAuthorReference(reference: string): ReferenceMetadata[] | null {
  // Pattern für Zeitungsartikel ohne Autor mit URL
  const apaNewspaperNoAuthorPattern = /^([^.(]+)\.\s+\((\d{4}),\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?\)\.\s+([^.]+)\.\s+(https:\/\/www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)$/

  const match = reference.match(apaNewspaperNoAuthorPattern)

  if (!match) {
    return null
  }

  // Title is the first part (no author)
  const title = match[1].trim()

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const month = match[3] ? match[3].trim() : null
  const day = match[4] ? Number.parseInt(match[4], 10) : null

  // Newspaper name is match[5]
  const newspaper = match[5].trim()

  // URL is match[6]
  const url = match[6].trim()

  return [{
    originalEntry: reference,
    authors: null, // Kein Autor
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
    title,
    containerTitle: newspaper,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: null,
    url,
    sourceType: 'Newspaper article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
  }]
}

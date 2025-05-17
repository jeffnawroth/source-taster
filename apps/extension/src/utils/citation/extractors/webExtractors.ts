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
  }]
}

/**
 * Extracts metadata from APA 7 blog post or website references with specific dates
 * Example: McCombes, S. (2020, June 19). How to write a problem statement. Scribbr. https://www.scribbr.com/research-process/problem-statement/
 */
export function extractApaBlogPostReference(reference: string): ReferenceMetadata[] | null {
  const apaBlogPostPattern = /^([^(]+)\s+\((\d{4})([a-z]?)(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?\)\.\s+([^.]+)\.\s+([^.]+)\.\s+(https:\/\/www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)$/

  const match = reference.match(apaBlogPostPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const yearSuffix = match[3] ? match[3].trim() : null
  const month = match[4] ? match[4].trim() : null
  const day = match[5] ? Number.parseInt(match[5], 10) : null

  // Title is match[6]
  const title = match[6].trim()

  // Publisher/website name is match[7]
  const publisher = match[7].trim()

  // URL is match[8]
  const url = match[8].trim()

  return [{
    originalEntry: reference,
    authors,
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix,
    noDate: false,
    title,
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher,
    url,
    sourceType: 'Blog post',
  }]
}

/**
 * Extracts metadata from APA 7 webpages with retrieval dates
 * Example: Worldometer. (n.d.). World population clock. Retrieved October 20, 2020, from https://www.worldometers.info/world-population/
 */
export function extractApaWebpageRetrievalReference(reference: string): ReferenceMetadata[] | null {
  // Specific pattern for webpages with retrieval dates
  const apaWebpagePattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+Retrieved\s+([^,]+,\s+\d{4}),\s+from\s+(https:\/\/www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)$/

  const match = reference.match(apaWebpagePattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors (removing trailing whitespace)
  const authorString = match[1].trim()
  const authors = authorString ? parseAuthors(authorString) : null

  // Extract and parse date information
  const dateString = match[2] ? match[2].trim() : null
  const yearSuffix = match[3] ? match[3].trim() : null
  const yearEndString = match[4] ? match[4].trim() : null
  const monthString = match[5] ? match[5].trim() : null
  const dayString = match[6] ? match[6].trim() : null

  let year: number | null = null
  let yearEnd: number | null = null
  let month: string | null = null
  let day: number | null = null
  let dateRange = false
  let noDate = false

  // Check if the date is "n.d." (no date)
  if (!dateString && reference.includes('(n.d.)')) {
    year = null
    noDate = true
  }
  else if (dateString) {
    year = Number.parseInt(dateString, 10)

    // Check for year range
    if (yearEndString) {
      yearEnd = Number.parseInt(yearEndString, 10)
      dateRange = true
    }

    // Check for month and day
    if (monthString) {
      month = monthString
      if (dayString) {
        day = Number.parseInt(dayString, 10)
      }
    }
  }

  // Title is match[7]
  const title = match[7].trim()

  // Retrieval date is match[8]
  const retrievalDate = match[8].trim()

  // URL is match[9]
  const url = match[9].trim()

  return [{
    originalEntry: reference,
    authors,
    year,
    month,
    day,
    dateRange,
    yearEnd,
    yearSuffix,
    noDate,
    title,
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: null, // No explicit publisher in this format
    url,
    retrievalDate,
    sourceType: 'Webpage',
  }]
}

/**
 * Extracts metadata from APA 7 references without authors (legal citations, etc.)
 * Example: King James Bible. (2017). King James Bible Online. https://www.kingjamesbibleonline.org/
 */
export function extractApaNoAuthorReference(reference: string): ReferenceMetadata[] | null {
  // Updated pattern to include optional retrieval date
  const apaNoAuthorPattern = /^([^.]+)\.\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.(?:\s+Retrieved\s+([^,]+,\s+\d{4}),\s+from)?\s+(https:\/\/www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)$/

  const match = reference.match(apaNoAuthorPattern)

  if (!match) {
    return null
  }

  // Title is now the first element
  const title = match[1].trim()

  // Extract and parse date information
  const dateString = match[2] ? match[2].trim() : null
  const yearSuffix = match[3] ? match[3].trim() : null
  const yearEndString = match[4] ? match[4].trim() : null
  const monthString = match[5] ? match[5].trim() : null
  const dayString = match[6] ? match[6].trim() : null

  let year: number | null = null
  let yearEnd: number | null = null
  let month: string | null = null
  let day: number | null = null
  let dateRange = false
  let noDate = false

  // Check if the date is "n.d." (no date)
  if (!dateString && reference.includes('(n.d.)')) {
    year = null
    noDate = true
  }
  else if (dateString) {
    year = Number.parseInt(dateString, 10)

    // Check for year range
    if (yearEndString) {
      yearEnd = Number.parseInt(yearEndString, 10)
      dateRange = true
    }

    // Check for month and day
    if (monthString) {
      month = monthString
      if (dayString) {
        day = Number.parseInt(dayString, 10)
      }
    }
  }

  // Retrieval date is match[8] if it exists
  const retrievalDate = match[8] ? match[8].trim() : null

  // Publisher/Source is match[7]
  const publisher = match[7].trim()

  // URL is match[9] with the updated pattern
  const url = match[9].trim()

  return [{
    originalEntry: reference,
    authors: null, // Explicitly set to null for unknown author
    year,
    month,
    day,
    dateRange,
    yearEnd,
    yearSuffix,
    noDate,
    title,
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher,
    url,
    retrievalDate,
    sourceType: 'Online source',
  }]
}

/**
 * Extracts metadata from APA 7 online sources with paragraph numbers
 * Example: Smith, P. (2019). How to cite with paragraph numbers. Research Guide. https://example.com/citing-guide (para. 5)
 */
export function extractApaSourceWithParagraphReference(reference: string): ReferenceMetadata[] | null {
  const apaParagraphPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+([^.]+)\.\s+(https:\/\/www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)\s+\((para\.?\s+\d+(?:-\d+)?)\)$/

  const match = reference.match(apaParagraphPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

  // Extract date components
  const dateString = match[2] ? match[2].trim() : null
  const yearSuffix = match[3] ? match[3].trim() : null
  const yearEndString = match[4] ? match[4].trim() : null
  const monthString = match[5] ? match[5].trim() : null
  const dayString = match[6] ? match[6].trim() : null

  let year: number | null = null
  let yearEnd: number | null = null
  let month: string | null = null
  let day: number | null = null
  let dateRange = false
  let noDate = false

  // Check if the date is "n.d." (no date)
  if (!dateString && reference.includes('(n.d.)')) {
    year = null
    noDate = true
  }
  else if (dateString) {
    year = Number.parseInt(dateString, 10)

    // Check for year range
    if (yearEndString) {
      yearEnd = Number.parseInt(yearEndString, 10)
      dateRange = true
    }

    // Check for month and day
    if (monthString) {
      month = monthString
      if (dayString) {
        day = Number.parseInt(dayString, 10)
      }
    }
  }

  // Title is match[7]
  const title = match[7].trim()

  // Source/Website name is match[8]
  const publisher = match[8].trim()

  // URL is match[9]
  const url = match[9].trim()

  // Paragraph number is match[10]
  const paragraphNumber = match[10].trim()

  return [{
    originalEntry: reference,
    authors,
    year,
    month,
    day,
    dateRange,
    yearEnd,
    yearSuffix,
    noDate,
    title,
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher,
    url,
    paragraphNumber,
    sourceType: 'Online source',
  }]
}

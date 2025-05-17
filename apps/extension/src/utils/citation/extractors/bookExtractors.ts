/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { ReferenceMetadata } from '../interface'
import { parseAuthors } from '../helpers/authorParser'

/**
 * Extracts metadata from APA 7 book references with edition information
 * Examples:
 * Coghlan, D. (2019). Doing action research in your own organization (5th ed.). SAGE Publications.
 * Smith, J. (2020). Research methods handbook (Rev. ed.). Oxford University Press.
 * Johnson, A. (2018). Statistical analysis (2nd ed.). Pearson.
 * Smith, T. (2020). The citation manual for students: A quick guide (Rev. ed.). Wiley. https://www.ebook.com/citation-manual-students
 * Smith, T. (2020). The citation manual for students: A quick guide (Rev. ed.). Wiley. https://doi.org/10.1000/182
 */
export function extractApaBookWithEditionReference(reference: string): ReferenceMetadata[] | null {
  // Erweitert für verschiedene Editionen wie "Rev. ed.", "2nd ed.", etc.
  // und optional mit URL oder DOI am Ende
  const apaBookWithEditionPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^(]+)\s+\(([^)]+)\)\.\s+([^.]+)(?:\.|\.\s+(https:\/\/(?:doi\.org\/[\w./]+|www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)))$/

  const match = reference.match(apaBookWithEditionPattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors (removing trailing whitespace)
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

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

  // Edition information is match[8]
  const edition = match[8].trim()

  // Publisher is match[9]
  const publisher = match[9].trim()

  // URL is match[10] if it exists
  const urlString = match[10] ? match[10].trim() : null

  // Check if it's a DOI or a URL
  let doi: string | null = null
  let url: string | null = null

  if (urlString) {
    if (urlString.startsWith('https://doi.org/')) {
      doi = urlString
    }
    else {
      url = urlString
    }
  }

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
    doi,
    publisher,
    url,
    edition,
    sourceType: 'Book',
  }]
}

/**
 * Extracts metadata from APA 7 book chapter references
 * Example: Gaffney, D., & Puschmann, C. (2014). Data collection on Twitter. In K. Weller, A. Bruns, J. Burgess, M. Mahrt, & C. Puschmann (Eds.), Twitter and society (pp. 55–67). Peter Lang Publishing.
 */
export function extractApaBookChapterReference(reference: string): ReferenceMetadata[] | null {
  // Erweitert für verschiedene Contributor-Rollen (Eds., Trans., etc.)
  const apaBookChapterPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+In\s+([^(]+)\s+\(((?:Ed|Eds|Trans|Narr|Narrs)\.)[^)]*\),\s+([^(]+)(?:\s+\(([^)]+)\))?\s+\(((?:p|pp)\.\s+\d+(?:–\d+)?)\)\.\s+([^.]+)\.$/

  const match = reference.match(apaBookChapterPattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors (removing trailing whitespace)
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

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

  // Chapter title is match[7]
  const title = match[7].trim()

  // Editor information
  const editorString = match[8].trim()
  const editorRole = match[9].trim() // Hier erfassen wir die genaue Rolle (Ed., Eds., Trans., etc.)
  const contributors = [{
    name: editorString,
    role: editorRole,
  }]

  // Book title is match[10]
  const containerTitle = match[10].trim()

  // Edition information is match[11] if it exists
  const edition = match[11] ? match[11].trim() : null

  // Page information is match[12]
  const pageInfo = match[12].trim()
  // Extrahiere den Typ der Seitenangabe (p. oder pp.)
  const pageType = pageInfo.startsWith('p.') ? 'p.' : 'pp.'
  // Entferne das Präfix für die Speicherung der reinen Seitenzahlen
  const pages = pageInfo.replace(/^(?:p|pp)\.\s+/, '')

  // Publisher is match[13]
  const publisher = match[13].trim()

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
    containerTitle,
    volume: null,
    issue: null,
    pages,
    pageType,
    doi: null,
    publisher,
    url: null,
    edition,
    contributors,
    sourceType: 'Book chapter',
  }]
}

/**
 * Extracts metadata from APA 7 book references
 * Examples:
 * Voss, C., & Raz, T. (2017). Never split the difference: Negotiating as if your life depended on it. Harper Business.
 * Smith, T. (2020). The citation manual for students: A quick guide. Wiley. https://doi.org/10.1000/182
 * Johnson, K. (2019). Research methods. Oxford Press. https://www.example.com/research-methods
 */
export function extractApaBookReference(reference: string): ReferenceMetadata[] | null {
  // Updated pattern to optionally include DOI or URL at the end
  // Wichtig: Stellen Sie sicher, dass keine Kommas im Publisher-Teil vorkommen, um Journal-Artikel auszuschließen
  const apaBookPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+(?:\[([^[\]]+)\]|([^.[\]]+))(?:\s+\[([^[\]]+)\])?\.\s+([^,.]+)(?:\.|\.\s+(https:\/\/(?:doi\.org\/[\w./]+|www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)))$/

  const match = reference.match(apaBookPattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors (removing trailing whitespace)
  const authorString = match[1].trim()
  const authors = parseAuthors(authorString)

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

  // Extract title information
  let title: string | null

  if (match[7]) {
    // We have an unknown title - set to null
    title = null
  }
  else {
    // We have a standard title
    title = match[8].trim()
  }

  // Check if we have a bracketed description
  const description = match[9] ? match[9].trim() : null
  if (description && title !== null) {
    // Add the description to the title in brackets
    title = `${title} [${description}]`
  }

  // Publisher is match[10]
  const publisher = match[10].trim()

  // URL/DOI is match[11] if it exists
  const urlString = match[11] ? match[11].trim() : null

  // Check if it's a DOI
  let doi: string | null = null
  let url: string | null = null

  if (urlString) {
    if (urlString.startsWith('https://doi.org/')) {
      doi = urlString
    }
    else {
      url = urlString
    }
  }

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
    doi,
    publisher,
    url,
    sourceType: 'Book',
  }]
}

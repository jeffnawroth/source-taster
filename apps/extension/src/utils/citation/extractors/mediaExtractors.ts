/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { ReferenceMetadata } from '../interface'
import { parseAuthors } from '../helpers/authorParser'

/**
 * Extracts metadata from APA 7 media references (YouTube videos, etc.)
 * Example: Bloomberg QuickTake. (2020, July 1). How to build a city around bikes, fast [Video]. YouTube. https://youtu.be/h-I6HFQXquU
 */
export function extractApaMediaReference(reference: string): ReferenceMetadata[] | null {
  const apaMediaPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^[.]+)\s+\[([^[\]]+)\]\.\s+([^.]+)\.\s+(https:\/\/(?:youtu\.be\/|www\.youtube\.com\/|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?))$/

  const match = reference.match(apaMediaPattern)

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

  // Extract title and media type
  const title = match[7].trim()
  const mediaType = match[8].trim()
  const platform = match[9].trim()
  const url = match[10].trim()

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
    title, // Nur den Titel ohne den Medientyp
    containerTitle: platform, // Die Plattform (z.B. YouTube) als Container-Titel
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: null, // Publisher auf null setzen
    url,
    sourceType: mediaType, // Medientyp (z.B. "Video") als sourceType
  }]
}

/**
 * Extracts metadata from APA 7 artwork references
 * Example: Van Gogh, V. (1878–1882). [Portrait of a woman] [Painting]. Rijksmuseum, Amsterdam, The Netherlands.
 */
export function extractApaArtworkReference(reference: string): ReferenceMetadata[] | null {
  const apaArtworkPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+\[([^[\]]+)\]\s+\[([^[\]]+)\]\.\s+([^,]+),\s+(.+)\.$/

  const match = reference.match(apaArtworkPattern)

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

  // For artwork, the title is deliberately unknown (in square brackets), so set to null
  // but keep the type information
  const title = match[7].trim()
  const artworkType = match[8].trim()
  const museum = match[9].trim()
  const location = match[10] ? match[10].trim() : null

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
    title: `[${title}]`,
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: museum,
    url: null,
    sourceType: artworkType,
    location,
  }]
}

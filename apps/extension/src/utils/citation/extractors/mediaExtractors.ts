/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { Author, DateInfo, ReferenceMetadata, SourceInfo, TitleInfo } from '../interface'
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
  const author = parseAuthors(authorString)

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

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month,
    day,
    dateRange,
    yearEnd,
    yearSuffix,
    noDate,
    inPress: false,
    approximateDate: false,
    season: null,
  }

  const titleInfo: TitleInfo = {
    title,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: platform, // Die Plattform (z.B. YouTube) als Container-Titel
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: null,
    url,
    sourceType: mediaType, // Medientyp (z.B. "Video") als sourceType
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
    articleNumber: null,
    isStandAlone: true,
  }

  return [{
    originalEntry: reference,
    author,
    date: dateInfo,
    title: titleInfo,
    source: sourceInfo,
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
  const author = parseAuthors(authorString)

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

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month,
    day,
    dateRange,
    yearEnd,
    yearSuffix,
    noDate,
    inPress: false,
    approximateDate: false,
    season: null,
  }

  const titleInfo: TitleInfo = {
    title: `[${title}]`, // Behalte die eckigen Klammern für unbekannte Titel bei
  }

  const sourceInfo: SourceInfo = {
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: museum,
    url: null,
    sourceType: artworkType,
    location,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
    articleNumber: null,
    isStandAlone: true,
  }

  return [{
    originalEntry: reference,
    author,
    date: dateInfo,
    title: titleInfo,
    source: sourceInfo,
  }]
}

/**
 * Extracts metadata from APA 7 film or TV show references
 * Example: Spielberg, S. (Director). (1993). Schindler's list [Film]. Universal Pictures.
 * Example: Hooper, T. (Director), & Lloyd Webber, A. (Composer). (2019). Cats [Film]. Universal Pictures.
 * Example: Simon, D., Colesberry, R., & Kostroff Noble, N. (Executive producers). (2002–2008). The wire [TV series]. HBO.
 */
export function extractApaFilmTvReference(reference: string): ReferenceMetadata[] | null {
  const apaFilmTvPattern = /^([^(]+)\s+\(([^)]+)\)\.\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^[.]+)\s+\[([^[\]]+)\]\.\s+([^.]+)\.$/

  const match = reference.match(apaFilmTvPattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors (removing trailing whitespace) with role information
  const authorString = match[1].trim()

  // Extrahiere die Rolle des Autors (Director, Producer, etc.)
  const authorRoleString = match[2].trim()

  // Parse die Autoren zunächst ohne Rollen
  const authorsWithoutRole = parseAuthors(authorString)

  // Füge die Rolle allen Autoren hinzu
  const author: Author[] = authorsWithoutRole.map(a => ({
    name: a.name,
    role: authorRoleString, // Die Rolle aus dem Match direkt zuweisen
  }))

  // Extract and parse date information
  const dateString = match[3] ? match[3].trim() : null
  const yearSuffix = match[4] ? match[4].trim() : null
  const yearEndString = match[5] ? match[5].trim() : null
  const monthString = match[6] ? match[6].trim() : null
  const dayString = match[7] ? match[7].trim() : null

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
  const title = match[8].trim()
  const mediaType = match[9].trim() // Film, TV series, etc.
  const studio = match[10].trim()

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month,
    day,
    dateRange,
    yearEnd,
    yearSuffix,
    noDate,
    inPress: false,
    approximateDate: false,
    season: null,
  }

  const titleInfo: TitleInfo = {
    title,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: null,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: studio,
    url: null,
    sourceType: mediaType,
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
    articleNumber: null,
    isStandAlone: true,
  }

  return [{
    originalEntry: reference,
    author,
    date: dateInfo,
    title: titleInfo,
    source: sourceInfo,
  }]
}

/**
 * Extracts metadata from APA 7 podcast episode references
 * Example: Glass, I. (Host). (2011, August 12). Amusement park [Audio podcast episode]. In This American life. WBEZ Chicago. https://www.thisamericanlife.org/radio-archives/episode/443/amusement-park
 */
export function extractApaPodcastReference(reference: string): ReferenceMetadata[] | null {
  const apaPodcastPattern = /^([^(]+)\s+\(([^)]+)\)\.\s+\((?:(\d{4})(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^[.]+)\s+\[([^[\]]+)\]\.\s+In\s+([^.]+)\.\s+([^.]+)\.\s+(https:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)$/

  const match = reference.match(apaPodcastPattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors with role
  const authorString = match[1].trim()
  const authorRoleString = match[2].trim()

  // Parse die Autoren zunächst ohne Rollen
  const authorsWithoutRole = parseAuthors(authorString)

  // Füge die Rolle allen Autoren hinzu
  const author: Author[] = authorsWithoutRole.map(a => ({
    name: a.name,
    role: authorRoleString, // Die Rolle (z.B. "Host") zuweisen
  }))

  // Extract date components
  const year = match[3] ? Number.parseInt(match[3].trim(), 10) : null
  const month = match[4] ? match[4].trim() : null
  const day = match[5] ? Number.parseInt(match[5].trim(), 10) : null

  // Episode title and type
  const title = match[6].trim()
  const episodeType = match[7].trim() // z.B. "Audio podcast episode"

  // Podcast series name
  const podcastSeries = match[8].trim()

  // Publisher/Network
  const publisher = match[9].trim()

  // URL
  const url = match[10] ? match[10].trim() : null

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: year === null,
    inPress: false,
    approximateDate: false,
    season: null,
  }

  const titleInfo: TitleInfo = {
    title,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: podcastSeries, // Der Podcast-Name als Container
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher,
    url,
    sourceType: episodeType,
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
    articleNumber: null,
    isStandAlone: false, // Eine Podcast-Episode ist Teil einer größeren Serie
  }

  return [{
    originalEntry: reference,
    author,
    date: dateInfo,
    title: titleInfo,
    source: sourceInfo,
  }]
}

/**
 * Extracts metadata from APA 7 music references
 * Example: Bowie, D. (1971). Life on mars? [Song]. On Hunky dory. RCA Records.
 */
export function extractApaMusicReference(reference: string): ReferenceMetadata[] | null {
  const apaMusicPattern = /^([^(]+)\s+\((?:(\d{4})(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^[.]+)\s+\[([^[\]]+)\]\.\s+On\s+([^.]+)\.\s+([^.]+)\.$/

  const match = reference.match(apaMusicPattern)

  if (!match) {
    // If pattern doesn't match, return null
    return null
  }

  // Extract authors (musicians/composers)
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

  // Extract date components
  const year = match[2] ? Number.parseInt(match[2].trim(), 10) : null
  const month = match[3] ? match[3].trim() : null
  const day = match[4] ? Number.parseInt(match[4].trim(), 10) : null

  // Song title and type
  const title = match[5].trim()
  const songType = match[6].trim() // z.B. "Song"

  // Album name
  const album = match[7].trim()

  // Record label / Publisher
  const recordLabel = match[8].trim()

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: year === null,
    inPress: false,
    approximateDate: false,
    season: null,
  }

  const titleInfo: TitleInfo = {
    title,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: album, // Das Album als Container
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: recordLabel,
    url: null,
    sourceType: songType,
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
    articleNumber: null,
    isStandAlone: false, // Ein Song ist Teil eines Albums
  }

  return [{
    originalEntry: reference,
    author,
    date: dateInfo,
    title: titleInfo,
    source: sourceInfo,
  }]
}

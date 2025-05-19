/* eslint-disable regexp/no-dupe-disjunctions */
/* eslint-disable regexp/optimal-quantifier-concatenation */
/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { DateInfo, ReferenceMetadata, SourceInfo, TitleInfo } from '../interface'
import { parseAuthors } from '../helpers/authorParser'

/**
 * Extracts metadata from APA 7 journal article references
 * Example: Andreff, W. (2000). The evolving European model of professional sports finance. Journal of Sports Economics, 1(3), 257–276. https://doi.org/10.1177/152700250000100304
 */
export function extractApaJournalReference(reference: string): ReferenceMetadata[] | null {
  const apaPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+(?:\[([^[\]]+)\]|([^.[\]]+))(?:\s+\[([^[\]]+)\])?\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+(\d+(?:–|-)\d+)\.\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?))$/

  const match = reference.match(apaPattern)

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

  // Extract title information
  // match[7] = unknown title in brackets
  // match[8] = standard title
  // match[9] = bracketed description
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

  // Adjust indices for the remaining fields based on the pattern
  const journalIndex = 10
  const volumeIndex = 11
  const issueIndex = 12
  const pagesIndex = 13
  const urlIndex = 14

  const urlString = match[urlIndex].trim()
  const isDoi = urlString.startsWith('https://doi.org/')

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
    containerTitle: match[journalIndex].trim(),
    volume: match[volumeIndex].trim(),
    issue: match[issueIndex].trim(),
    pages: match[pagesIndex].trim(),
    doi: isDoi ? urlString : null,
    publisher: null,
    url: isDoi ? null : urlString,
    sourceType: 'Journal article',
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
    isStandAlone: false,
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
 * Extracts metadata from APA 7 journal article references with volume prefix
 * Example: Smith, P. (2018). Analysis of urban development. Journal of Urban Studies, Vol. 12(No. 3), pp. 45-67. https://doi.org/10.1177/123456789
 */
export function extractApaJournalWithPrefixReference(reference: string): ReferenceMetadata[] | null {
  const apaJournalWithPrefixPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+([^,]+),\s+((?:Vol|Vols)\.?\s+\d+)\((?:(No\.?\s+\d+)|(\d+))\),\s+((?:p|pp)\.?\s+\d+(?:–\d+)?)\.\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?))$/

  const match = reference.match(apaJournalWithPrefixPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

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

  // Journal name is match[8]
  const journal = match[8].trim()

  // Volume information with prefix (Vol./Vols.)
  const volumeInfo = match[9].trim()
  // Extrahiere Volume-Präfix und Nummer
  const volumePrefixMatch = volumeInfo.match(/(Vol|Vols)\.?\s+(\d+)/)
  const volumePrefix = volumePrefixMatch ? volumePrefixMatch[1] : null
  const volume = volumePrefixMatch ? volumePrefixMatch[2] : null

  // Issue information with or without prefix
  const issueWithPrefix = match[10] ? match[10].trim() : null
  const issueWithoutPrefix = match[11] ? match[11].trim() : null

  let issuePrefix: string | null = null
  let issue: string | null = null

  if (issueWithPrefix) {
    const issuePrefixMatch = issueWithPrefix.match(/(No)\.?\s+(\d+)/)
    issuePrefix = issuePrefixMatch ? issuePrefixMatch[1] : null
    issue = issuePrefixMatch ? issuePrefixMatch[2] : null
  }
  else if (issueWithoutPrefix) {
    issue = issueWithoutPrefix
  }

  // Page information
  const pageInfo = match[12].trim()
  // Extrahiere den Typ der Seitenangabe (p. oder pp.)
  const pageType = pageInfo.startsWith('p.') ? 'p.' : 'pp.'
  // Entferne das Präfix für die Speicherung der reinen Seitenzahlen
  const pages = pageInfo.replace(/^(?:p|pp)\.?\s+/, '')

  // URL or DOI
  const urlString = match[13].trim()
  const isDoi = urlString.startsWith('https://doi.org/')

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
    containerTitle: journal,
    volume,
    issue,
    pages,
    doi: isDoi ? urlString : null,
    publisher: null,
    url: isDoi ? null : urlString,
    sourceType: 'Journal article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType,
    paragraphNumber: null,
    volumePrefix,
    issuePrefix,
    supplementInfo: null,
    articleNumber: null,
    isStandAlone: false,
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
 * Extracts metadata from APA 7 journal supplement references
 * Example: Jones, R. (2020). Special analysis. Journal of Research, 15(Suppl. 2), S123-S135. https://doi.org/10.1177/12345678
 */
export function extractApaJournalSupplementReference(reference: string): ReferenceMetadata[] | null {
  const apaSupplementPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+([^,]+),\s+(\d+)\((Suppl\.?\s+\d+)\),\s+([^.]+)\.\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?))$/

  const match = reference.match(apaSupplementPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

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

  // Journal name is match[8]
  const journal = match[8].trim()

  // Volume is match[9]
  const volume = match[9].trim()

  // Supplement info is match[10]
  const supplementInfo = match[10].trim()

  // Pages is match[11]
  const pages = match[11].trim()

  // URL or DOI is match[12]
  const urlString = match[12].trim()
  const isDoi = urlString.startsWith('https://doi.org/')

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
    containerTitle: journal,
    volume,
    issue: null,
    pages,
    doi: isDoi ? urlString : null,
    publisher: null,
    url: isDoi ? null : urlString,
    sourceType: 'Journal supplement',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo,
    articleNumber: null,
    isStandAlone: false,
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
 * Extracts metadata from APA 7 in-press journal articles
 * Example: Smith, J. (in press). The future of psychology research. Journal of Psychology.
 */
export function extractApaInPressJournalReference(reference: string): ReferenceMetadata[] | null {
  const apaInPressPattern = /^([^(]+)\s+\(in\s+press\)\.\s+([^.]+)\.\s+([^,.]+)\.$/

  const match = reference.match(apaInPressPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

  // Title is match[2]
  const title = match[2].trim()

  // Journal name is match[3]
  const journal = match[3].trim()

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year: null,
    month: null,
    day: null,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
    inPress: true, // Dieses Journal ist "in press"
    approximateDate: false,
    season: null,
  }

  const titleInfo: TitleInfo = {
    title,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: journal,
    volume: null,
    issue: null,
    pages: null,
    doi: null,
    publisher: null,
    url: null,
    sourceType: 'Journal article',
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
    isStandAlone: false,
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
 * Extracts metadata from APA 7 journal articles with article numbers instead of page ranges
 * Example: Johnson, A. B. (2020). Statistical methods in modern research. PLoS ONE, 15(6), Article e0234123. https://doi.org/10.1371/journal.pone.0234123
 */
export function extractApaJournalArticleNumberReference(reference: string): ReferenceMetadata[] | null {
  const apaArticleNumberPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+Article\s+([^.]+)\.\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?))$/

  const match = reference.match(apaArticleNumberPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

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

  // Journal name is match[8]
  const journal = match[8].trim()

  // Volume is match[9]
  const volume = match[9].trim()

  // Issue is match[10]
  const issue = match[10].trim()

  // Article number is match[11] (e.g., "e0234123")
  const articleNumber = match[11].trim()

  // URL/DOI is match[12]
  const url = match[12].trim()
  const isDoi = url.startsWith('https://doi.org/')

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
    containerTitle: journal,
    volume,
    issue,
    pages: null,
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Journal article',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: null,
    articleNumber,
    isStandAlone: false,
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
 * Extracts metadata from APA 7 journal articles with season in date
 * Example: Williams, T. (2019, Winter). Seasonal trends in publishing. Journal of Publishing Studies, 12(2), 45-67.
 */
export function extractApaJournalWithSeasonReference(reference: string): ReferenceMetadata[] | null {
  const apaJournalWithSeasonPattern = /^([^(]+)\s+\((\d{4}),\s+(Spring|Summer|Fall|Winter|Autumn)\)\.\s+([^.]+)\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+(\d+(?:–|-)\d+)\.(?:\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)))?$/

  const match = reference.match(apaJournalWithSeasonPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const season = match[3].trim()

  // Title is match[4]
  const title = match[4].trim()

  // Journal name is match[5]
  const journal = match[5].trim()

  // Volume is match[6]
  const volume = match[6].trim()

  // Issue is match[7]
  const issue = match[7].trim()

  // Pages is match[8]
  const pages = match[8].trim()

  // URL/DOI is optional match[9]
  const url = match[9] ? match[9].trim() : null
  const isDoi = url?.startsWith('https://doi.org/') ?? false

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month: null,
    day: null,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
    inPress: false,
    approximateDate: false,
    season,
  }

  const titleInfo: TitleInfo = {
    title,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: journal,
    volume,
    issue,
    pages,
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Journal article',
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
    isStandAlone: false,
  }

  return [{
    originalEntry: reference,
    author,
    date: dateInfo,
    title: titleInfo,
    source: sourceInfo,
  }]
}

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

// Neue Extraktor-Funktionen nach den bestehenden einfügen

/**
 * Extracts metadata from APA 7 journal article references with missing information
 * Example: Koehler, M. J., & Mishra, P. (2009). What is technological pedagogical content knowledge? Contemporary Issues in Technology and Teacher Education, 9, 60-70.
 * Example: Licht, M. H. (n.d.). Multiple regression and correlation. Journal of Research Methods.
 */
export function extractApaJournalWithMissingInfoReference(reference: string): ReferenceMetadata[] | null {
  // Muster, das optional fehlende Volume, Issue oder Seitenzahlen erlaubt
  const apaJournalMissingInfoPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.[\]]+)(?:\s+\[([^[\]]+)\])?\.\s+([^,.]+)(?:,\s+(\d+)(?:\((\d+)\))?(?:,\s+(\d+(?:–|-)\d+))?)?\.(?:\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)))?$/

  const match = reference.match(apaJournalMissingInfoPattern)

  if (!match) {
    return null
  }

  // Extract authors
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

  // Title is match[7]
  const title = match[7].trim()

  // Optional description in brackets is match[8]
  const description = match[8] ? match[8].trim() : null

  // Complete title with optional description
  const fullTitle = description ? `${title} [${description}]` : title

  // Journal name is match[9]
  const journal = match[9].trim()

  // Optional volume is match[10]
  const volume = match[10] ? match[10].trim() : null

  // Optional issue is match[11]
  const issue = match[11] ? match[11].trim() : null

  // Optional pages is match[12]
  const pages = match[12] ? match[12].trim() : null

  // Optional URL/DOI is match[13]
  const url = match[13] ? match[13].trim() : null
  const isDoi = url?.startsWith('https://doi.org/') ?? false

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
    title: fullTitle,
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

/**
 * Extracts metadata from APA 7 retracted journal articles
 * Example: Joly, J. F., Stapel, D. A., & Lindenberg, S. M. (2008). Silence and table manners: When environments activate norms. Personality and Social Psychology Bulletin, 34(8), 1047–1056. https://doi.org/10.1177/0146167208318401 (Retraction published 2012, Personality and Social Psychology Bulletin, 38[10], 1378)
 */
export function extractApaRetractedArticleReference(reference: string): ReferenceMetadata[] | null {
  const apaRetractedPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+(\d+(?:–|-)\d+)\.\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?))\s+\(Retraction\s+published\s+(\d{4}),\s+([^,]+),\s+(\d+)(?:\[(\d+)\])?,\s+(\d+(?:–|-)\d+)?\)$/

  const match = reference.match(apaRetractedPattern)

  if (!match) {
    return null
  }

  // Extract authors
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

  // Title is match[7]
  const title = match[7].trim()

  // Journal name is match[8]
  const journal = match[8].trim()

  // Volume is match[9]
  const volume = match[9].trim()

  // Issue is match[10]
  const issue = match[10].trim()

  // Pages is match[11]
  const pages = match[11].trim()

  // URL/DOI is match[12]
  const url = match[12].trim()
  const isDoi = url.startsWith('https://doi.org/')

  // Retraction information
  const retractionYear = match[13].trim()
  const retractionJournal = match[14].trim()
  const retractionVolume = match[15].trim()
  const retractionIssue = match[16] ? match[16].trim() : null
  const retractionPages = match[17] ? match[17].trim() : null

  // Erstelle ein zusätzliches supplementInfo-Feld für die Retraktionsinformation
  const retractionInfo = `Retraction published ${retractionYear}, ${retractionJournal}, ${retractionVolume}${retractionIssue ? `[${retractionIssue}]` : ''}${retractionPages ? `, ${retractionPages}` : ''}`

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
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Journal article (retracted)',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: retractionInfo,
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
 * Extracts metadata from APA 7 retraction notices
 * Example: de la Fuente, R., Bernad, A., Garcia-Castro, J., Martin, M. C., & Cigudosa, J. C. (2010). Retraction: Spontaneous human adult stem cell transformation [Retraction of article]. Cancer Research, 70(16), 6682. https://doi.org/10.1158/0008-5472.CAN-10-2451
 */
export function extractApaRetractionNoticeReference(reference: string): ReferenceMetadata[] | null {
  const apaRetractionPattern = /^([^(]+)\s+\((\d{4})(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?\)\.\s+Retraction:\s+([^[]+)\s+\[Retraction\s+of\s+article\]\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+(\d+(?:–|-)\d+)?\.(?:\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)))?$/

  const match = reference.match(apaRetractionPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

  // Extract date components
  const year = Number.parseInt(match[2], 10)
  const month = match[3] ? match[3].trim() : null
  const day = match[4] ? Number.parseInt(match[4], 10) : null

  // Retracted article title is match[5]
  const retractedTitle = match[5].trim()

  // Journal name is match[6]
  const journal = match[6].trim()

  // Volume is match[7]
  const volume = match[7].trim()

  // Issue is match[8]
  const issue = match[8].trim()

  // Pages is optional match[9]
  const pages = match[9] ? match[9].trim() : null

  // URL/DOI is optional match[10]
  const url = match[10] ? match[10].trim() : null
  const isDoi = url?.startsWith('https://doi.org/') ?? false

  // Der Titel für eine Retraktionsmitteilung sollte den retraktierten Titel enthalten
  const title = `Retraction: ${retractedTitle}`

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month,
    day,
    dateRange: false,
    yearEnd: null,
    yearSuffix: null,
    noDate: false,
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
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Retraction notice',
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
 * Extracts metadata from APA 7 abstract references
 * Example: Hare, L. R., & O'Neill, K. (2000). Effectiveness and efficiency in small academic peer groups (Abstract from Small Group Research, 2000, 31, 24–53). Dissertation Abstracts International: Section A. Humanities and Social Sciences, 60(8), 3004.
 */
export function extractApaAbstractReference(reference: string): ReferenceMetadata[] | null {
  const apaAbstractPattern = /^([^(]+)\s+\((\d{4})[a-z]?\)\.\s+([^(]+)\s+\(Abstract\s+from\s+([^,]+),\s+(\d{4}),\s+(\d+),\s+(\d+(?:–|-)\d+)\)\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+(\d+(?:–|-)\d+)\.$/

  const match = reference.match(apaAbstractPattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

  // Extract year
  const year = Number.parseInt(match[2], 10)

  // Title is match[3]
  const title = match[3].trim()

  // Source journal name is match[4]
  const sourceJournal = match[4].trim()

  // Source year is match[5]
  const sourceYear = match[5].trim()

  // Source volume is match[6]
  const sourceVolume = match[6].trim()

  // Source pages is match[7]
  const sourcePages = match[7].trim()

  // Abstract database name is match[8]
  const abstractDatabase = match[8].trim()

  // Abstract volume is match[9]
  const volume = match[9].trim()

  // Abstract issue is match[10]
  const issue = match[10].trim()

  // Abstract page is match[11]
  const pages = match[11].trim()

  // Erstelle ein Beschreibungsfeld für den Abstract
  const abstractDescription = `Abstract from ${sourceJournal}, ${sourceYear}, ${sourceVolume}, ${sourcePages}`

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
    season: null,
  }

  const titleInfo: TitleInfo = {
    title: `${title} [${abstractDescription}]`,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: abstractDatabase,
    volume,
    issue,
    pages,
    doi: null,
    publisher: null,
    url: null,
    sourceType: 'Abstract',
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
 * Extracts metadata from APA 7 monograph references
 * Example: Ganster, D. C., Schaubroeck, J., Sime, W. E., & Mayes, B. T. (1991). The nomological validity of the Type A personality among employed adults [Monograph]. Journal of Applied Psychology, 76(1), 143–168. http://doi.org/10.1037/0021-9010.76.1.143
 */
export function extractApaMonographReference(reference: string): ReferenceMetadata[] | null {
  const apaMonographPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^[.]+)\s+\[Monograph\]\.\s+([^,]+),\s+(\d+)\((\d+)\),\s+(\d+(?:–|-)\d+)\.(?:\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)))?$/

  const match = reference.match(apaMonographPattern)

  if (!match) {
    return null
  }

  // Extract authors
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

  // Title is match[7]
  const title = match[7].trim()

  // Journal name is match[8]
  const journal = match[8].trim()

  // Volume is match[9]
  const volume = match[9].trim()

  // Issue is match[10]
  const issue = match[10].trim()

  // Pages is match[11]
  const pages = match[11].trim()

  // URL/DOI is optional match[12]
  const url = match[12] ? match[12].trim() : null
  const isDoi = url?.startsWith('https://doi.org/') ?? false

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
    title: `${title} [Monograph]`,
  }

  const sourceInfo: SourceInfo = {
    containerTitle: journal,
    volume,
    issue,
    pages,
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Monograph',
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
 * Extracts metadata from APA 7 advance online publication references
 * Example: Tran, B. X., Harijanto, C., Vu, G. T., & Ho, R. C. M. (2020). Global mapping of interventions to improve quality of life of patients with depression during 1990–2018. Quality of Life Research. Advance online publication. https://doi.org/10.1007/s11136-020-02500-x
 */
export function extractApaAdvanceOnlineReference(reference: string): ReferenceMetadata[] | null {
  const apaAdvanceOnlinePattern = /^([^(]+)\s+\((\d{4})([a-z]?)\)\.\s+([^.]+)\.\s+([^.]+)\.\s+Advance\s+online\s+publication\.(?:\s+(https:\/\/(?:doi\.org\/[\w./]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/\S+)?)))?$/

  const match = reference.match(apaAdvanceOnlinePattern)

  if (!match) {
    return null
  }

  // Extract authors
  const authorString = match[1].trim()
  const author = parseAuthors(authorString)

  // Extract year and suffix
  const year = Number.parseInt(match[2], 10)
  const yearSuffix = match[3] ? match[3].trim() : null

  // Title is match[4]
  const title = match[4].trim()

  // Journal name is match[5]
  const journal = match[5].trim()

  // URL/DOI is optional match[6]
  const url = match[6] ? match[6].trim() : null
  const isDoi = url?.startsWith('https://doi.org/') ?? false

  // Erstelle die strukturierten Objekte für das neue Interface
  const dateInfo: DateInfo = {
    year,
    month: null,
    day: null,
    dateRange: false,
    yearEnd: null,
    yearSuffix,
    noDate: false,
    inPress: false, // Nicht "in press", aber "advance online publication"
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
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Journal article (advance online publication)',
    location: null,
    retrievalDate: null,
    edition: null,
    contributors: null,
    pageType: null,
    paragraphNumber: null,
    volumePrefix: null,
    issuePrefix: null,
    supplementInfo: 'Advance online publication',
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
 * Extracts metadata from APA 7 online journal articles without page numbers
 * Example: Butler, J. (2017). Where access meets multimodality: The case of ASL music videos. Kairos: A Journal of Rhetoric, Technology, and Pedagogy, 21(1). http://technorhetoric.net/21.1/topoi/butler/index.html
 */
export function extractApaOnlineJournalWithoutPagesReference(reference: string): ReferenceMetadata[] | null {
  const apaOnlineJournalPattern = /^([^(]+)\s+\((?:(\d{4})([a-z]?)(?:–(\d{4}))?(?:,\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{1,2}))?)?|n\.d\.)\)\.\s+([^.]+)\.\s+([^,]+),\s+(\d+)(?:\((\d+)\))?\.\s+(https:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)$/

  const match = reference.match(apaOnlineJournalPattern)

  if (!match) {
    return null
  }

  // Extract authors
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

  // Title is match[7]
  const title = match[7].trim()

  // Journal name is match[8]
  const journal = match[8].trim()

  // Volume is match[9]
  const volume = match[9].trim()

  // Issue is optional match[10]
  const issue = match[10] ? match[10].trim() : null

  // URL is match[11]
  const url = match[11].trim()
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
    pages: null, // Keine Seitenangaben in diesem Format
    doi: isDoi ? url : null,
    publisher: null,
    url: isDoi ? null : url,
    sourceType: 'Online journal article',
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

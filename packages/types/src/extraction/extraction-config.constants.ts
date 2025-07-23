import type { ExtractionConfig } from './extraction-config.types'

/**
 * Default field extraction configuration
 * Enables commonly needed fields while keeping the extraction focused
 */
export const ESSENTIAL_EXTRACTION_CONFIG: ExtractionConfig = {
  // Core bibliographic fields - Always needed
  title: true,
  authors: true,
  date: {
    year: true,
  },
  identifiers: {
    doi: true,
  },
  source: {
    containerTitle: true,
    volume: true,
    issue: true,
    pages: true,
    url: true,
  },
}

// export const CORE_FIELDS: (keyof ExtractionFields)[] = [
//   'title',
//   'authors',
//   'year',
// ]

// export const IDENTIFIER_FIELDS: (keyof ExtractionFields)[] = [
//   'doi',
//   'isbn',
//   'issn',
//   'pmid',
//   'pmcid',
//   'arxivId',
// ]

// export const DATE_FIELDS: (keyof ExtractionFields)[] = [
//   'month',
//   'day',
//   'yearSuffix',
//   'dateRange',
//   'yearEnd',
//   'noDate',
//   'inPress',
//   'approximateDate',
//   'season',
// ]

// export const PUBLICATION_FIELDS: (keyof ExtractionFields)[] = [
//   'containerTitle',
//   'subtitle',
//   'volume',
//   'issue',
//   'pages',
//   'publisher',
//   'publicationPlace',
//   'url',
//   'sourceType',
//   'location',
//   'retrievalDate',
//   'edition',
//   'medium',
//   'originalTitle',
//   'originalLanguage',
//   'chapterTitle',
//   'contributors',
// ]

// export const ACADEMIC_FIELDS: (keyof ExtractionFields)[] = [
//   'conference',
//   'institution',
//   'series',
//   'seriesNumber',
//   'degree',
//   'advisor',
//   'department',
// ]

// export const TECHNICAL_FIELDS: (keyof ExtractionFields)[] = [
//   'pageType',
//   'paragraphNumber',
//   'volumePrefix',
//   'issuePrefix',
//   'supplementInfo',
//   'articleNumber',
//   'isStandAlone',
// ]

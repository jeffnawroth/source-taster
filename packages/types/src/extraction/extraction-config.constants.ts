import type { ExtractionConfig } from './extraction-config.types'

export const ESSENTIAL_EXTRACTION_CONFIG: ExtractionConfig = [
  'title',
  'authors',
  'year',
  'doi',
  'containerTitle',
  'volume',
  'issue',
  'pages',
  'url',
]

export const CORE_FIELDS: ExtractionConfig = [
  'title',
  'authors',
  'year',
]

export const IDENTIFIER_FIELDS: ExtractionConfig = [
  'doi',
  'isbn',
  'issn',
  'pmid',
  'pmcid',
  'arxivId',
]

export const DATE_FIELDS: ExtractionConfig = [
  'month',
  'day',
  'yearSuffix',
  'dateRange',
  'yearEnd',
  'noDate',
  'inPress',
  'approximateDate',
  'season',
]

export const PUBLICATION_FIELDS: ExtractionConfig = [
  'containerTitle',
  'subtitle',
  'volume',
  'issue',
  'pages',
  'publisher',
  'publicationPlace',
  'url',
  'sourceType',
  'location',
  'retrievalDate',
  'edition',
  'medium',
  'originalTitle',
  'originalLanguage',
  'chapterTitle',
  'contributors',
]

export const ACADEMIC_FIELDS: ExtractionConfig = [
  'conference',
  'institution',
  'series',
  'seriesNumber',
  'degree',
  'advisor',
  'department',
]

export const TECHNICAL_FIELDS: ExtractionConfig = [
  'pageType',
  'paragraphNumber',
  'volumePrefix',
  'issuePrefix',
  'supplementInfo',
  'articleNumber',
  'isStandAlone',
]

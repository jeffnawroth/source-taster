/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */

/**
 * Configuration for which metadata fields to extract
 * Includes ALL fields from ReferenceMetadata structure
 */
export interface ExtractionFields {
  // Core bibliographic fields
  /** Extract title information */
  title: boolean
  /** Extract author information */
  authors: boolean
  /** Extract publication year */
  year: boolean
  /** Extract publication month */
  month: boolean
  /** Extract publication day */
  day: boolean
  /** Extract year suffix (e.g., "a", "b" in "2020a") */
  yearSuffix: boolean

  // External identifiers
  /** Extract DOI when available */
  doi: boolean
  /** Extract ISBN for books */
  isbn: boolean
  /** Extract ISSN for journals */
  issn: boolean
  /** Extract PubMed IDs */
  pmid: boolean
  /** Extract PMC IDs */
  pmcid: boolean
  /** Extract arXiv IDs */
  arxivId: boolean

  // Source information
  /** Extract journal/book titles (container title) */
  containerTitle: boolean
  /** Extract subtitles */
  subtitle: boolean
  /** Extract volume numbers */
  volume: boolean
  /** Extract issue numbers */
  issue: boolean
  /** Extract page ranges */
  pages: boolean
  /** Extract publisher information */
  publisher: boolean
  /** Extract publication place */
  publicationPlace: boolean
  /** Extract URLs */
  url: boolean
  /** Extract source type (journal, book, etc.) */
  sourceType: boolean
  /** Extract physical location information */
  location: boolean
  /** Extract retrieval date for online sources */
  retrievalDate: boolean
  /** Extract edition information */
  edition: boolean
  /** Extract page type (e.g., "p." or "pp.") */
  pageType: boolean
  /** Extract paragraph numbers */
  paragraphNumber: boolean
  /** Extract volume prefix (e.g., "Vol.", "Vols.") */
  volumePrefix: boolean
  /** Extract issue prefix (e.g., "No.") */
  issuePrefix: boolean
  /** Extract supplement information */
  supplementInfo: boolean
  /** Extract article numbers */
  articleNumber: boolean
  /** Extract conference names */
  conference: boolean
  /** Extract institution names */
  institution: boolean
  /** Extract series name */
  series: boolean
  /** Extract series number */
  seriesNumber: boolean
  /** Extract chapter title */
  chapterTitle: boolean
  /** Extract medium of publication */
  medium: boolean
  /** Extract original title for translations */
  originalTitle: boolean
  /** Extract original language */
  originalLanguage: boolean
  /** Extract academic degree for theses */
  degree: boolean
  /** Extract thesis advisor/supervisor */
  advisor: boolean
  /** Extract academic department */
  department: boolean

  // Additional source fields
  /** Extract contributors (beyond main authors) */
  contributors: boolean
  /** Detect standalone works */
  isStandAlone: boolean

  // Special date fields
  /** Detect date ranges (e.g., "2019–2020") */
  dateRange: boolean
  /** Extract end year for date ranges */
  yearEnd: boolean
  /** Mark references with no date (n.d.) */
  noDate: boolean
  /** Mark references as "in press" */
  inPress: boolean
  /** Detect approximate dates (ca., circa, etc.) */
  approximateDate: boolean
  /** Extract season information */
  season: boolean
}

/**
 * Default field extraction configuration
 * Enables commonly needed fields while keeping the extraction focused
 */
export const ESSENTIAL_EXTRACTION_FIELDS: ExtractionFields = {
  // Core bibliographic fields - Always needed
  title: true,
  authors: true,
  year: true,
  month: false,
  day: false,
  yearSuffix: false,

  // External identifiers - DOI is most important
  doi: true,
  isbn: false,
  issn: false,
  pmid: false,
  pmcid: false,
  arxivId: false,

  // Source information - Essential for citations
  containerTitle: true,
  subtitle: false,
  volume: true,
  issue: true,
  pages: true,
  publisher: false,
  publicationPlace: false,
  url: true,
  sourceType: false,
  location: false,
  retrievalDate: false,
  edition: false,
  pageType: false,
  paragraphNumber: false,
  volumePrefix: false,
  issuePrefix: false,
  supplementInfo: false,
  articleNumber: false,
  conference: false,
  institution: false,
  series: false,
  seriesNumber: false,
  chapterTitle: false,
  medium: false,
  originalTitle: false,
  originalLanguage: false,
  degree: false,
  advisor: false,
  department: false,

  // Additional source fields - Usually not needed by default
  contributors: false,
  isStandAlone: false,

  // Special date fields - Edge cases
  dateRange: false,
  yearEnd: false,
  noDate: false,
  inPress: false,
  approximateDate: false,
  season: false,
}

export const CORE_FIELDS: (keyof ExtractionFields)[] = [
  'title',
  'authors',
  'year',
]

export const IDENTIFIER_FIELDS: (keyof ExtractionFields)[] = [
  'doi',
  'isbn',
  'issn',
  'pmid',
  'pmcid',
  'arxivId',
]

export const DATE_FIELDS: (keyof ExtractionFields)[] = [
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

export const PUBLICATION_FIELDS: (keyof ExtractionFields)[] = [
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

export const ACADEMIC_FIELDS: (keyof ExtractionFields)[] = [
  'conference',
  'institution',
  'series',
  'seriesNumber',
  'degree',
  'advisor',
  'department',
]

export const TECHNICAL_FIELDS: (keyof ExtractionFields)[] = [
  'pageType',
  'paragraphNumber',
  'volumePrefix',
  'issuePrefix',
  'supplementInfo',
  'articleNumber',
  'isStandAlone',
]

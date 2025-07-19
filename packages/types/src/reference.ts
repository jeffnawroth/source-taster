/**
 * Core reference and metadata types
 */

/**
 * Types of modifications that can be applied during extraction
 */
export enum ModificationType {
  TYPO_CORRECTION = 'typo-correction',
  CAPITALIZATION = 'capitalization',
  ABBREVIATION_EXPANSION = 'abbreviation-expansion',
  PUNCTUATION_STANDARDIZATION = 'punctuation-standardization',
  FORMAT_STANDARDIZATION = 'format-standardization',
  DERIVATION = 'derivation',
  INTERPRETATION = 'interpretation',
  AUTHOR_NAME_FORMATTING = 'author-name-formatting',
  DATE_FORMATTING = 'date-formatting',
  IDENTIFIER_STANDARDIZATION = 'identifier-standardization',
  UNICODE_FIXING = 'unicode-fixing',
  OCR_ERROR_CORRECTION = 'ocr-error-correction',
  TITLE_CASE_CONVERSION = 'title-case-conversion',
  DUPLICATE_REMOVAL = 'duplicate-removal',
  FIELD_DERIVATION = 'field-derivation',
  INFORMATION_RECONSTRUCTION = 'information-reconstruction',
  FORMATTING_CORRECTION = 'formatting-correction',
}

/**
 * Information about changes made during extraction
 */
export interface FieldModification {
  /** The field path that was modified (e.g., "metadata.title", "metadata.source.containerTitle") */
  fieldPath: string
  /** The original value before extraction */
  originalValue: string
  /** The extracted/corrected value */
  extractedValue: string
  /** Type of modification applied */
  modificationType: ModificationType
}

/**
 * Represents a single bibliographic reference
 */
export interface Reference {
  /** Unique identifier for this reference */
  id: string
  /** The raw reference text as it appeared in the source document */
  originalText: string
  /** Parsed/extracted bibliographic information */
  metadata: ReferenceMetadata
  /** Information about modifications made during extraction */
  modifications?: FieldModification[]
}

/**
 * Bibliographic metadata for a reference
 *
 * This interface includes fields that are:
 * 1. Supported by at least one external database (for verification/matching)
 * 2. Required for complete citation style rendering (APA, Harvard, MLA, German)
 * 3. Commonly found in real-world bibliographic references
 *
 * Some fields may not be supported by all databases but are retained for
 * citation style completeness and future database expansion.
 */
export interface ReferenceMetadata {
  /** Authors of the work (can be strings or Author objects) */
  authors?: (Author | string)[]
  /** Date information */
  date: DateInfo
  /** Title information */
  title?: string
  /** Source information */
  source: SourceInfo
  /** External database identifiers */
  identifiers?: ExternalIdentifiers
}

/**
 * Author information
 */
export interface Author {
  /** First name(s) of the author (e.g., "John", "Mary Jane") */
  firstName?: string
  /** Last name/surname of the author (e.g., "Smith") */
  lastName: string
  /** Optional role of the author (e.g., "editor", "translator") */
  role?: 'author' | 'editor' | 'translator' | 'compiler' | 'director' | 'producer' | string
}

/**
 * External database identifiers
 */
export interface ExternalIdentifiers {
  /** Digital Object Identifier */
  doi?: string
  /** International Standard Book Number */
  isbn?: string
  /** International Standard Serial Number */
  issn?: string
  /** PubMed ID for medical literature */
  pmid?: string
  /** PubMed Central ID for medical literature */
  pmcid?: string
  /** arXiv identifier (e.g., "2301.12345") */
  arxivId?: string
}

/**
 * Date and temporal information
 */
export interface DateInfo {
  /** The publication year */
  year?: number
  /** The month of publication (e.g., "January", "February") */
  month?: string
  /** The day of publication */
  day?: number
  /** Indicates if the reference spans a date range (e.g., "2019–2020") */
  dateRange?: boolean
  /** If dateRange is true, specifies the end year */
  yearEnd?: number
  /** Letter suffix for the year (e.g., "a", "b" in "2020a") */
  yearSuffix?: string
  /** Indicates if the reference has no date (n.d.) */
  noDate?: boolean
  /** Indicates if the work is marked as "in press" */
  inPress?: boolean
  /** Indicates if the date is approximate (ca., circa, etc.) */
  approximateDate?: boolean
  /** Season information (e.g., "Spring", "Summer") if applicable */
  season?: string
}

/**
 * Source and publication information
 */
export interface SourceInfo {
  /** Title of the containing work (e.g., journal name, book title) */
  containerTitle?: string
  /** Subtitle of the work (important for German citation styles) */
  subtitle?: string
  /** Volume number (typically for journals) */
  volume?: string
  /** Issue number (typically for journals) */
  issue?: string
  /** Page range (e.g., "123-145") */
  pages?: string
  /** Publisher name */
  publisher?: string
  /** Place of publication (important for German citation styles) */
  publicationPlace?: string
  /** URL where the work can be accessed */
  url?: string
  /** Type of source (e.g., "Journal article", "Book", "Webpage") */
  sourceType?: string
  /** Physical location information (e.g., museum location) */
  location?: string
  /** When the source was retrieved (for online sources) */
  retrievalDate?: string
  /** Edition information (e.g., "2nd ed.") */
  edition?: string
  /** Additional contributors beyond the main authors */
  contributors?: Author[]
  /** Type of page reference (e.g., "p." or "pp.") */
  pageType?: string
  /** Paragraph number for sources without page numbers */
  paragraphNumber?: string
  /** Prefix for volume (e.g., "Vol.", "Vols.") */
  volumePrefix?: string
  /** Prefix for issue (e.g., "No.") */
  issuePrefix?: string
  /** Supplement information (e.g., "Suppl. 2") */
  supplementInfo?: string
  /** Article number for electronic journals without page numbers */
  articleNumber?: string
  /** Indicates if the source is a standalone work */
  isStandAlone?: boolean
  /** Conference name (for conference papers) */
  conference?: string
  /** Institution (for theses, reports) */
  institution?: string
  /** Series name (important for German citation styles) */
  series?: string
  /** Series number within a series */
  seriesNumber?: string
  /** Chapter title (for book chapters) */
  chapterTitle?: string
  /** Medium of publication (print, web, CD-ROM, etc.) - important for MLA */
  medium?: string
  /** Original title (for translated works) - important for German citation styles */
  originalTitle?: string
  /** Original language of the work (for translations) */
  originalLanguage?: string
  /** Academic degree (for theses/dissertations) */
  degree?: string
  /** Thesis advisor/supervisor */
  advisor?: string
  /** Academic department */
  department?: string
}

/**
 * AI extraction-related types
 */
import type { Reference } from './reference'

/**
 * Request to extract references from text using AI
 */
export interface ExtractionRequest {
  /** The text to extract references from */
  text: string
  /** User-configurable extraction settings */
  extractionSettings?: ExtractionSettings
}

/**
 * Response containing extracted references
 */
export interface ExtractionResponse {
  /** List of extracted references */
  references: Reference[]
}

/**
 * Extraction mode types for AI processing
 */
export enum ExtractionMode {
  /** Strict mode: 1:1 extraction without any corrections or interpretations */
  STRICT = 'strict',
  /** Balanced mode: Fix formatting/typos but maintain content accuracy */
  BALANCED = 'balanced',
  /** Tolerant mode: Extract even from incomplete/erroneous sources with intelligent inference */
  TOLERANT = 'tolerant',
  /** Custom mode: User-defined extraction rules and preferences */
  CUSTOM = 'custom',
}

/**
 * Default extraction mode
 */
export const DEFAULT_EXTRACTION_MODE: ExtractionMode = ExtractionMode.BALANCED

/**
 * Custom extraction configuration for user-defined extraction rules
 * Allows users to build their own extraction behavior by selecting specific options
 */
export interface CustomExtractionSettings {
  /** Enable typo correction (e.g., "Jouranl" → "Journal") */
  correctTypos: boolean
  /** Normalize capitalization for standards */
  normalizeCapitalization: boolean
  /** Standardize common abbreviations (e.g., "J." → "Journal") */
  standardizeAbbreviations: boolean
  /** Clean up and standardize punctuation */
  standardizePunctuation: boolean
  /** Format author names consistently */
  formatAuthorNames: boolean
  /** Remove duplicate authors */
  removeDuplicateAuthors: boolean
  /** Standardize date formatting */
  standardizeDateFormatting: boolean
  /** Validate and standardize identifier formats (DOI/ISSN/etc.) */
  standardizeIdentifiers: boolean
  /** Add missing, clearly derivable fields */
  addDerivableFields: boolean
  /** Interpret incomplete or abbreviated information */
  interpretIncompleteInfo: boolean
  /** Recognize and standardize source types */
  recognizeSourceTypes: boolean
  /** Convert titles to appropriate Title Case */
  convertToTitleCase: boolean
  /** Fix Unicode and encoding issues */
  fixUnicodeIssues: boolean
  /** Handle OCR errors and copy-paste artifacts */
  handleOcrErrors: boolean
  /** Reconstruct information separated by line breaks */
  reconstructSeparatedInfo: boolean
  /** Complete obviously incomplete data */
  completeIncompleteData: boolean
  /** Fix common formatting problems */
  fixFormattingProblems: boolean
}

/**
 * Default settings for strict extraction mode
 */
export const STRICT_EXTRACTION_SETTINGS: CustomExtractionSettings = {
  correctTypos: false,
  normalizeCapitalization: false,
  standardizeAbbreviations: false,
  standardizePunctuation: false,
  formatAuthorNames: false,
  removeDuplicateAuthors: false,
  standardizeDateFormatting: false,
  standardizeIdentifiers: false,
  addDerivableFields: false,
  interpretIncompleteInfo: false,
  recognizeSourceTypes: false,
  convertToTitleCase: false,
  fixUnicodeIssues: false,
  handleOcrErrors: false,
  reconstructSeparatedInfo: false,
  completeIncompleteData: false,
  fixFormattingProblems: false,
}

/**
 * Default settings for balanced extraction mode
 */
export const BALANCED_EXTRACTION_SETTINGS: CustomExtractionSettings = {
  correctTypos: true,
  normalizeCapitalization: true,
  standardizeAbbreviations: true,
  standardizePunctuation: true,
  formatAuthorNames: true,
  removeDuplicateAuthors: true,
  standardizeDateFormatting: true,
  standardizeIdentifiers: true,
  addDerivableFields: false,
  interpretIncompleteInfo: false,
  recognizeSourceTypes: true,
  convertToTitleCase: true,
  fixUnicodeIssues: true,
  handleOcrErrors: false,
  reconstructSeparatedInfo: false,
  completeIncompleteData: false,
  fixFormattingProblems: true,
}

/**
 * Default settings for tolerant extraction mode
 */
export const TOLERANT_EXTRACTION_SETTINGS: CustomExtractionSettings = {
  correctTypos: true,
  normalizeCapitalization: true,
  standardizeAbbreviations: true,
  standardizePunctuation: true,
  formatAuthorNames: true,
  removeDuplicateAuthors: true,
  standardizeDateFormatting: true,
  standardizeIdentifiers: true,
  addDerivableFields: true,
  interpretIncompleteInfo: true,
  recognizeSourceTypes: true,
  convertToTitleCase: true,
  fixUnicodeIssues: true,
  handleOcrErrors: true,
  reconstructSeparatedInfo: true,
  completeIncompleteData: true,
  fixFormattingProblems: true,
}

/**
 * Default settings for custom extraction mode (user's starting point)
 */
export const DEFAULT_CUSTOM_EXTRACTION_SETTINGS: CustomExtractionSettings = {
  ...STRICT_EXTRACTION_SETTINGS, // Strict als Startpunkt für Custom
}

/**
 * Mapping of extraction modes to their default settings
 */
export const EXTRACTION_MODE_DEFAULTS: Record<ExtractionMode, CustomExtractionSettings> = {
  [ExtractionMode.STRICT]: STRICT_EXTRACTION_SETTINGS,
  [ExtractionMode.BALANCED]: BALANCED_EXTRACTION_SETTINGS,
  [ExtractionMode.TOLERANT]: TOLERANT_EXTRACTION_SETTINGS,
  [ExtractionMode.CUSTOM]: DEFAULT_CUSTOM_EXTRACTION_SETTINGS,
}

/**
 * User-configurable extraction settings
 * Controls which metadata fields should be extracted by the AI
 * Includes ALL fields from ReferenceMetadata structure
 */
export interface ExtractionSettings {
  /** Extraction mode controlling AI behavior and accuracy vs tolerance */
  extractionMode: ExtractionMode

  /** Custom extraction configuration (only used when extractionMode is CUSTOM) */
  customSettings?: CustomExtractionSettings

  /** Which metadata fields to extract */
  enabledFields: ExtractionFields
}

interface ExtractionFields {
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
/** Extract title information */

export const DEFAULT_EXTRACTION_FIELDS: ExtractionFields = {
  // Core bibliographic fields
  title: true,
  authors: true,
  year: true,
  month: false,
  day: false,
  yearSuffix: false,

  // External identifiers
  doi: true,
  isbn: false,
  issn: false,
  pmid: false,
  pmcid: false,
  arxivId: false,

  // Source information
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

  // Additional source fields
  contributors: false,
  isStandAlone: false,

  // Special date fields
  dateRange: false,
  yearEnd: false,
  noDate: false,
  inPress: false,
  approximateDate: false,
  season: false,
}

export const DEFAULT_EXTRACTION_SETTINGS: ExtractionSettings = {
  extractionMode: DEFAULT_EXTRACTION_MODE,
  customSettings: undefined,
  enabledFields: DEFAULT_EXTRACTION_FIELDS,
}

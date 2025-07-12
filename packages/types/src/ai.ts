/**
 * AI service interfaces and configuration types
 */

import type { FieldMatchDetail } from './match'
import type { ReferenceMetadata } from './reference'

/**
 * Response from AI verification service
 * Contains field-level match scores for each reference
 */
export interface AIVerificationResponse {
  /** Array of field match details */
  fieldDetails: FieldMatchDetail[]
}

/**
 * Represents a reference as extracted by AI (without ID)
 * This matches the structure returned by the AI service before we add the unique ID
 */
export interface AIExtractedReference {
  /** The raw reference text as it appeared in the source document */
  originalText: string
  /** Parsed/extracted bibliographic information */
  metadata: ReferenceMetadata
}

/**
 * Response from AI service containing extracted references (without IDs)
 * This is converted to the public ExtractionResponse before sending to frontend
 */
export interface AIExtractionResponse {
  references: AIExtractedReference[]
}

/**
 * Interface for AI service implementations
 * Defines the contract that all AI services must implement
 */
export interface AIService {
  extractReferences: (text: string, extractionSettings?: ExtractionSettings) => Promise<AIExtractionResponse>
  verifyMatch: (prompt: string) => Promise<AIVerificationResponse>
}

/**
 * Configuration interface for OpenAI service
 * Defines all required and optional configuration parameters
 */
export interface OpenAIConfig {
  apiKey: string
  model: string
  maxRetries: number
  timeout: number
  temperature: number
}

/**
 * User-configurable extraction settings
 * Controls which metadata fields should be extracted by the AI
 * Includes ALL fields from ReferenceMetadata structure
 */
export interface ExtractionSettings {
  /** Which metadata fields to extract */
  enabledFields: {
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
}

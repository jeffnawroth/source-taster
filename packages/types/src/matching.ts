import type {
  Reference,
  ReferenceMetadata,
} from './reference'
import type { ArchivedVersion, WebsiteMetadata } from './website'

/**
 * Matching mode types for controlling verification strictness
 */
export enum MatchingMode {
  /** Strict mode: Exact matches only - every character, capitalization, and format must match precisely */
  STRICT = 'strict',
  /** Balanced mode: Case-insensitive with minor format differences allowed */
  BALANCED = 'balanced',
  /** Tolerant mode: Semantic matching with significant format/style variations allowed */
  TOLERANT = 'tolerant',
  /** Custom mode: User-defined matching rules and tolerance levels */
  CUSTOM = 'custom',
}

/**
 * Match quality classes for visual representation
 */
export enum MatchQuality {
  /** Excellent match (95-100%) - Green */
  EXACT = 'exact',
  /** Good match (70-94%) - Orange */
  HIGH = 'high',
  /** Poor or no match (0-69%) - Red */
  NONE = 'none',
}

/**
 * Thresholds for match quality classification
 */
export interface MatchQualityThresholds {
  /** Minimum score for exact match (default: 95) */
  exactMatchThreshold: number
  /** Minimum score for high quality match (default: 70) */
  highMatchThreshold: number
  /** Scores below this are considered no match (implicit: 0) */
}

export interface MatchQualitySettings {
  /** Thresholds for match quality classification */
  thresholds: MatchQualityThresholds
}

/**
 * Default match quality thresholds
 */
export const DEFAULT_MATCH_QUALITY_THRESHOLDS: MatchQualityThresholds = {
  exactMatchThreshold: 95,
  highMatchThreshold: 70,
}

/**
 * Default match quality settings
 */
export const DEFAULT_MATCH_QUALITY_SETTINGS: MatchQualitySettings = {
  thresholds: DEFAULT_MATCH_QUALITY_THRESHOLDS,
}

/**
 * Custom matching settings for fine-grained control
 */
export interface CustomMatchingSettings {
  /** Allow case-insensitive matching */
  ignoreCaseForText: boolean
  /** Allow minor punctuation differences (commas, periods, etc.) */
  ignorePunctuation: boolean
  /** Allow author name format variations (First Last vs Last, First) */
  allowAuthorFormatVariations: boolean
  /** Allow journal name abbreviations vs full names */
  allowJournalAbbreviations: boolean
  /** Allow page format variations (123-145 vs 123-45 vs pp. 123-145) */
  allowPageFormatVariations: boolean
  /** Allow minor date format differences */
  allowDateFormatVariations: boolean
  /** Treat whitespace differences as insignificant */
  ignoreWhitespace: boolean
  /** Allow character normalization (umlauts, accents, etc.) */
  normalizeCharacters: boolean
}

/**
 * Matching settings combining mode and custom configuration
 */
export interface MatchingSettings {
  /** Matching mode controlling overall behavior */
  matchingMode: MatchingMode
  /** Custom matching configuration (only used when matchingMode is CUSTOM) */
  customSettings?: CustomMatchingSettings
  /** Field weights for scoring */
  fieldWeights: FieldWeights
}

/**
 * Response containing multiple matching results
 */
export interface MatchingResponse {
  /** Individual matching results */
  results: MatchingResult[]
}

/**
 * Request to match references against databases
 * Backend-only type - the frontend sends MatchingRequest
 */
export interface MatchingRequest {
  /** References to match */
  references: Reference[]
  /** Matching settings including mode and field weights */
  matchingSettings: MatchingSettings
}

/**
 * Result of website matching
 */
export interface WebsiteMatchingResult {
  /** Reference ID being matched */
  referenceId: string
  /** Original URL being checked */
  url: string
  /** Whether the URL is currently accessible */
  isAccessible: boolean
  /** HTTP status code */
  statusCode?: number
  /** Extracted website metadata (if accessible or archived) */
  websiteMetadata?: WebsiteMetadata
  /** Detailed matching information */
  matchDetails: MatchDetails
  /** Information about archived version if used */
  archivedVersion?: ArchivedVersion
  /** Error message if matching failed */
  error?: string
}

/**
 * Represents a reference found in an external database
 */
export interface ExternalSource {
  /** Unique identifier in the external database */
  id: string
  /** Which database this source comes from */
  source: 'openalex' | 'crossref' | 'europepmc' | 'semanticscholar' | 'arxiv' | 'website'
  /** Bibliographic metadata from the database */
  metadata: ReferenceMetadata
  /** Canonical URL to access this source in the database */
  url?: string
}

// Forward declarations for types that depend on each other
export interface MatchingResult {
  /** ID of the reference that was matched */
  referenceId: string
  /** The best matching source (if found) */
  matchedSource?: ExternalSource
  /** Detailed matching information */
  matchingDetails?: MatchingDetails
}

export interface MatchingDetails {
  /** All sources found in databases */
  sourcesFound: ExternalSource[]
  /** Match details for the best source */
  matchDetails?: MatchDetails
  /** Evaluation results for all sources */
  allSourceEvaluations?: SourceEvaluation[]
}

export interface SourceEvaluation {
  /** The external source being evaluated */
  source: ExternalSource
  /** Detailed match scoring */
  matchDetails: MatchDetails
}

/**
 * Single field match detail
 *
 */
export interface FieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: keyof FieldWeights
  /** Match score for this specific field (0-100) */
  match_score: number
}

/**
 * Overall match details including final score and field-specific details
 */
export interface MatchDetails {
  /** Final weighted score: Σ(match_score * weight) / Σ(weights) */
  overallScore: number
  /** Detailed scoring per field */
  fieldDetails?: FieldMatchDetail[]
}

/**
 * Weights for different fields in match score calculation
 */
export interface FieldWeights {
  // Core bibliographic fields (primary matching)
  /** Weight for title matching (typically highest) */
  title: number
  /** Weight for author matching (typically high) */
  authors: number
  /** Weight for publication year matching */
  year: number

  // External identifiers (exact matches, very high confidence)
  /** Weight for DOI matching (exact match, when available) */
  doi?: number
  /** Weight for ISBN matching (exact match) */
  isbn?: number
  /** Weight for ISSN matching */
  issn?: number
  /** Weight for PMID matching (exact match) */
  pmid?: number
  /** Weight for PMC ID matching (exact match) */
  pmcid?: number
  /** Weight for arXiv ID matching (exact match) */
  arxivId?: number

  // Source information weights
  /** Weight for container title matching (journal name, book title) */
  containerTitle?: number
  /** Weight for volume number matching */
  volume?: number
  /** Weight for issue number matching */
  issue?: number
  /** Weight for page range matching */
  pages?: number
  /** Weight for publisher matching */
  publisher?: number
  /** Weight for URL matching */
  url?: number

  // Additional source fields (lower weights, boost confidence)
  /** Weight for source type matching */
  sourceType?: number
  /** Weight for conference name matching */
  conference?: number
  /** Weight for institution matching */
  institution?: number
  /** Weight for edition matching */
  edition?: number
  /** Weight for article number matching */
  articleNumber?: number
  /** Weight for subtitle matching (important for German citation styles) */
  subtitle?: number
}

// Preset configurations with explicit settings
export const STRICT_MATCHING_SETTINGS: CustomMatchingSettings = {
  ignoreCaseForText: false,
  ignorePunctuation: false,
  allowAuthorFormatVariations: false,
  allowJournalAbbreviations: false,
  allowPageFormatVariations: false,
  allowDateFormatVariations: false,
  ignoreWhitespace: false,
  normalizeCharacters: false,
}

export const BALANCED_MATCHING_SETTINGS: CustomMatchingSettings = {
  ignoreCaseForText: true,
  ignorePunctuation: true,
  allowAuthorFormatVariations: true,
  allowJournalAbbreviations: true,
  allowPageFormatVariations: true,
  allowDateFormatVariations: true,
  ignoreWhitespace: true,
  normalizeCharacters: true,
}

export const TOLERANT_MATCHING_SETTINGS: CustomMatchingSettings = {
  ignoreCaseForText: true,
  ignorePunctuation: true,
  allowAuthorFormatVariations: true,
  allowJournalAbbreviations: true,
  allowPageFormatVariations: true,
  allowDateFormatVariations: true,
  ignoreWhitespace: true,
  normalizeCharacters: true,
}

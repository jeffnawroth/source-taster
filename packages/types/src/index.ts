// API Types
/**
 * Standard API response wrapper for all endpoints
 * @template T - The type of the response data
 */
export interface ApiResponse<T = any> {
  /** Indicates if the API call was successful */
  success: boolean
  /** The actual response data (type varies by endpoint) */
  data?: T
  /** Error message if the request failed */
  error?: string
  /** Additional human-readable message */
  message?: string
}

// Reference Types
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
}

/**
 * Bibliographic metadata for a reference
 */
export interface ReferenceMetadata {
  /** Title of the publication */
  title?: string
  /** List of author names */
  authors?: string[]
  /** Name of the journal/publication venue */
  journal?: string
  /** Publication year */
  year?: number
  /** Digital Object Identifier (e.g., "10.1038/nature12373") */
  doi?: string
  /** URL mentioned in the original reference (if any) */
  url?: string
  /** Journal volume number */
  volume?: string
  /** Journal issue number */
  issue?: string
  /** Page range (e.g., "123-145" or "e1234") */
  pages?: string
}

/**
 * Reference with verification status and results
 */
export interface ProcessedReference extends Reference {
  /** Current verification status */
  status: 'pending' | 'verified' | 'not-verified' | 'error'
  /** Detailed verification results (if completed) */
  verificationResult?: VerificationResult
  /** Error message if verification failed */
  error?: string
}

// Extraction Types
/**
 * Request to extract references from text using AI
 */
export interface ExtractionRequest {
  /** The text to extract references from */
  text: string
  /** AI service to use for extraction */
  aiService: 'openai' | 'gemini'
  /** Specific model to use (optional) */
  model?: string
}

/**
 * Response containing extracted references
 */
export interface ExtractionResponse {
  /** List of extracted references */
  references: Reference[]
}

// Verification Types
/**
 * Request to verify references against databases
 */
export interface VerificationRequest {
  /** References to verify */
  references: Reference[]
  /** AI service to use for verification (optional) */
  aiService?: 'openai' | 'gemini'
}

/**
 * Result of verifying a single reference
 */
export interface VerificationResult {
  /** ID of the reference that was verified */
  referenceId: string
  /** Whether the reference was successfully verified */
  isVerified: boolean
  /** The best matching source (if found) */
  matchedSource?: ExternalSource
  /** Detailed verification information */
  verificationDetails?: VerificationDetails
}

/**
 * Detailed verification information
 */
export interface VerificationDetails {
  /** All sources found in databases */
  sourcesFound: ExternalSource[]
  /** Match details for the best source */
  matchDetails?: MatchDetails
  /** Evaluation results for all sources */
  allSourceEvaluations?: SourceEvaluation[]
}

/**
 * Evaluation of how well a source matches a reference
 */
export interface SourceEvaluation {
  /** The external source being evaluated */
  source: ExternalSource
  /** Detailed match scoring */
  matchDetails: MatchDetails
  /** Whether this source is considered a match */
  isMatch: boolean
}

// Detailed field match information
/**
 * Detailed scoring information for a specific field comparison
 */
export interface FieldMatchDetail {
  /** Name of the field being compared (e.g., 'title', 'authors') */
  field: string
  /** Value from the original reference */
  reference_value: string | number | string[] | null
  /** Value from the external source */
  source_value: string | number | string[] | null
  /** Match score for this specific field (0-100) */
  match_score: number
  /** Weight used for this field in overall calculation */
  weight: number
}

/**
 * Complete match analysis between a reference and source
 */
export interface MatchDetails {
  /** Final weighted score: Σ(match_score * weight) / Σ(weights) */
  overallScore: number
  /** Which fields were actually compared */
  fieldsEvaluated?: string[]
  /** Detailed scoring per field */
  fieldDetails?: FieldMatchDetail[]
}

/**
 * Response containing multiple verification results
 */
export interface VerificationResponse {
  /** Individual verification results */
  results: VerificationResult[]
  /** Number of successfully verified references */
  totalVerified: number
  /** Number of references that failed verification */
  totalFailed: number
}

// External Source Types
/**
 * Represents a reference found in an external database
 */
export interface ExternalSource {
  /** Unique identifier in the external database */
  id: string
  /** Which database this source comes from */
  source: 'openalex' | 'crossref' | 'europepmc' | 'semanticscholar' | 'arxiv'
  /** Bibliographic metadata from the database */
  metadata: ReferenceMetadata
  /** Canonical URL to access this source in the database */
  url?: string
}

// AI Service Types
/**
 * Configuration for AI services (OpenAI, Gemini)
 */
export interface AIServiceConfig {
  /** API key for the service */
  apiKey: string
  /** Model name to use (e.g., 'gpt-4o', 'gemini-2.5-flash') */
  model: string
  /** Temperature for response randomness (0.0-1.0) */
  temperature?: number
  /** Maximum tokens in the response */
  maxTokens?: number
}

// Field weights for score calculation
/**
 * Weights for different fields in match score calculation
 * All weights should sum to 100 for percentage-based scoring
 */
export interface FieldWeights {
  /** Weight for title matching (typically highest) */
  title: number
  /** Weight for author matching (typically high) */
  authors: number
  /** Weight for publication year matching */
  year: number
  /** Weight for DOI matching (exact match) */
  doi: number
  /** Weight for journal name matching */
  journal: number
  /** Weight for volume number matching */
  volume: number
  /** Weight for issue number matching */
  issue: number
  /** Weight for page range matching */
  pages: number
}

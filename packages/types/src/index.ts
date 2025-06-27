// API Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Reference Types
export interface Reference {
  id: string
  originalText: string
  metadata: ReferenceMetadata
}

export interface ReferenceMetadata {
  title?: string
  authors?: string[]
  journal?: string
  year?: number
  doi?: string
  url?: string
  volume?: string
  issue?: string
  pages?: string
}

export interface ProcessedReference extends Reference {
  status: 'pending' | 'verified' | 'not-verified' | 'error'
  verificationResult?: VerificationResult
  error?: string
}

// Extraction Types
export interface ExtractionRequest {
  text: string
  aiService: 'openai' | 'gemini'
  model?: string
}

export interface ExtractionResponse {
  references: Reference[]
}

// Verification Types
export interface VerificationRequest {
  references: Reference[]
  aiService?: 'openai' | 'gemini'
}

export interface VerificationResult {
  referenceId: string
  isVerified: boolean
  matchedSource?: ExternalSource
  verificationDetails?: VerificationDetails
}

export interface VerificationDetails {
  sourcesFound: ExternalSource[]
  matchDetails?: MatchDetails
  allSourceEvaluations?: SourceEvaluation[]
}

export interface SourceEvaluation {
  source: ExternalSource
  matchDetails: MatchDetails
  isMatch: boolean
}

// Detailed field match information
export interface FieldMatchDetail {
  field: string
  reference_value: string | number | string[] | null
  source_value: string | number | string[] | null
  match_score: number // 0-100 score for this specific field
  weight: number // Weight used for this field
}

export interface MatchDetails {
  overallScore: number // Final weighted score: Σ(match_score * weight) / Σ(weights)
  fieldsEvaluated?: string[] // Which fields were actually compared
  fieldDetails?: FieldMatchDetail[] // Detailed scoring per field
}

export interface VerificationResponse {
  results: VerificationResult[]
  totalVerified: number
  totalFailed: number
}

// External Source Types
export interface ExternalSource {
  id: string
  source: 'openalex' | 'crossref' | 'europepmc' | 'semanticscholar' | 'arxiv'
  metadata: ReferenceMetadata
  url?: string
}

// AI Service Types
export interface AIServiceConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

// Database Types
export interface DatabaseConfig {
  name: string
  baseUrl: string
  apiKey?: string
  rateLimit?: {
    requestsPerSecond: number
    burstLimit: number
  }
}

// Field weights for score calculation
export interface FieldWeights {
  title: number
  authors: number
  year: number
  doi: number
  journal: number
  volume: number
  issue: number
  pages: number
}

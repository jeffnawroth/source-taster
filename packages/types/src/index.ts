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
  issn?: string
  isbn?: string
  url?: string
  volume?: string
  issue?: string
  pages?: string
  publisher?: string
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
  totalFound: number
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
}

export interface VerificationResponse {
  results: VerificationResult[]
  totalVerified: number
  totalFailed: number
}

// External Source Types
export interface ExternalSource {
  id: string
  source: 'openalex' | 'crossref' | 'europepmc'
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

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
  type: 'academic' | 'website' | 'book' | 'unknown'
  metadata: ReferenceMetadata
  extractedAt: Date
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
  abstract?: string
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
  databases?: ('openalex' | 'crossref' | 'semanticscholar' | 'europepmc')[]
  verificationMethod: 'ai' | 'exact' | 'fuzzy'
  aiService?: 'openai' | 'gemini'
}

export interface VerificationResult {
  referenceId: string
  isVerified: boolean
  confidence: number
  matchedSource?: ExternalSource
  discrepancies?: string[]
  verificationMethod: string
  checkedDatabases: string[]
}

export interface VerificationResponse {
  results: VerificationResult[]
  totalVerified: number
  totalFailed: number
}

// External Source Types
export interface ExternalSource {
  id: string
  source: string // 'openalex', 'crossref', etc.
  metadata: ReferenceMetadata
  url?: string
  confidence: number
}

// Website Verification Types
export interface WebsiteVerificationRequest {
  references: Reference[]
  aiService?: 'openai' | 'gemini'
}

export interface WebsiteVerificationResult {
  referenceId: string
  url: string
  isAccessible: boolean
  statusCode?: number
  extractedMetadata?: ReferenceMetadata
  contentMatch?: {
    titleMatch: number
    authorMatch: number
    overallMatch: number
  }
  issues?: string[]
}

export interface WebsiteVerificationResponse {
  results: WebsiteVerificationResult[]
  totalChecked: number
  totalAccessible: number
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

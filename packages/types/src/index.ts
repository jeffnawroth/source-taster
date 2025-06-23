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
  options?: {
    language?: string
    includeContext?: boolean
  }
}

export interface ExtractionResponse {
  references: Reference[]
  totalFound: number
  processingTime: number
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
  processingTime: number
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
  options?: {
    timeout?: number
    followRedirects?: boolean
    extractFullContent?: boolean
  }
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
  processingTime: number
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

// Processing Status Types
export interface ProcessingJob {
  id: string
  type: 'extraction' | 'verification' | 'website-verification'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt: Date
  completedAt?: Date
  result?: any
  error?: string
}

// Bulk Processing Types
export interface BulkProcessingRequest {
  texts: string[]
  options: {
    extractReferences: boolean
    verifyReferences: boolean
    checkWebsites: boolean
    aiService: 'openai' | 'gemini'
    databases?: string[]
  }
}

export interface BulkProcessingResponse {
  jobId: string
  status: 'queued' | 'processing'
  estimatedTime: number
  itemCount: number
}

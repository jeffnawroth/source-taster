import type { Journal, Work } from './clients/crossref-client'
import type { SearchRequest } from './clients/europe-pmc'
import type { FullPaper } from './clients/semanticscholar-client'

export interface AIModel {
  title: string
  value: string
  description: string
  service: AIService
}

export type AIService = 'gemini' | 'openai'

export interface ReferenceMetadata {
  originalEntry: string
  authors?: string[]
  year?: number
  title?: string
  journal?: string | null
  volume?: string | null
  issue?: string | null
  pages?: string | null
  doi?: string | null
  publisher?: string | null
  url?: string | null
}

export interface PublicationMetadata {
  id: string
  title?: string
  authors?: string[]
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  url?: string
  publicationYear?: number
}

export interface VerificationResult {
  match: boolean
  reason?: string
}

export interface VerifiedReference {
  metadata: ReferenceMetadata
  verification: VerificationResult
  crossrefData?: Journal | Work
  semanticScholarData?: FullPaper
  websiteUrl?: string | null
}

export interface EuropePmcPublication {
  authorString: string
  doi: string
  title: string
  id: number
  issue: string
  journalTitle: string
  journalVolume: string
  pageInfo: string
  pubYear: number
}

export interface EuropePmcPublicationsResponse {
  hitCount: number
  nextCursorMark: string
  nextPageUrl: string
  request: SearchRequest
  resultList: {
    result: EuropePmcPublication[]
  }
  version: string
}

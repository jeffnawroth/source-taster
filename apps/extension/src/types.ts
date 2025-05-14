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
  firstPublicationDate: string
  id: number
  issue: number
  journalTitle: string
  journalVolume: string
  pageInfo: string
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

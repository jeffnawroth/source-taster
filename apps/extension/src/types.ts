import type { SearchRequest } from './clients/europe-pmc'

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
  title?: string
  authors?: string[]
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  url?: string
  year?: number
}

export interface WebsiteMetadata {
  url: string
  title?: string | null
  authors?: string[] | null
  year?: number | null
}
export interface WebsiteVerificationResult {
  match: boolean
  reason?: string
  confidence?: number
}

export interface VerificationResult {
  match: boolean
  reason?: string
  publicationMetadata?: PublicationMetadata | null
}

export interface VerifiedReference {
  referenceMetadata: ReferenceMetadata
  verification: VerificationResult | null
  websiteUrl?: string | null
}

// Europe PMC

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

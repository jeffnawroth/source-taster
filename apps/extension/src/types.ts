import type { Journal, Work } from './crossref-client'

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
  websiteUrl?: string | null
}

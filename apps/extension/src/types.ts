import type { Journal, Work } from '@jamesgopsill/crossref-client'

export interface AIModel {
  title: string
  value: string
  description: string
  service: AIService
}

export type AIService = 'gemini' | 'openai'

export interface IdentifierResult {
  value: string
  type: 'DOI' | 'ISSN' | 'METADATA'
  registered: boolean
  crossrefData?: Journal | Work
  reason?: string
}

export interface ExtractedMetadata {
  title: string
  authors?: string[]
  journal?: string
  year?: string
  snippet: string
}

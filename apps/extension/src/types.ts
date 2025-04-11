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
  type: 'DOI' | 'ISSN'
  registered: boolean
  crossrefData?: Journal | Work
}

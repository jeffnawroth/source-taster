export interface AIModel {
  title: string
  value: string
  description: string
  service: AIService
}

export type AIService = 'gemini' | 'openai'

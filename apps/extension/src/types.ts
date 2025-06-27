/**
 * AI model specification for the extension
 */
export interface AIModel {
  /** AI service to use */
  service: 'openai' | 'gemini'
  /** Specific model to use */
  model: string
  /** Display title */
  title: string
  /** Description for UI */
  description: string
}

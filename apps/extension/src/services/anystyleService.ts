/**
 * Service for interacting with the AnyStyle API endpoints
 */
import {
  ApiAnystyleConvertRequestSchema,
  type ApiAnystyleConvertResponse,
  ApiAnystyleParseRequestSchema,
  type ApiAnystyleParseResponse,
  type ApiAnystyleTokenSequence,
  ApiAnystyleTrainRequestSchema,
  type ApiAnystyleTrainResponse,
} from '@source-taster/types'

const API_BASE_URL = 'http://localhost:8000/api/anystyle'

export class AnystyleService {
  /**
   * Parse references using AnyStyle and return tokens with labels
   * @param references - Array of reference strings to parse
   * @returns Parsed tokens for each reference
   */
  static async parseReferences(references: string[]): Promise<ApiAnystyleParseResponse> {
    const req = ApiAnystyleParseRequestSchema.parse({ input: references })

    const response = await fetch(`${API_BASE_URL}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    const result = await response.json() as ApiAnystyleParseResponse

    if (!response.ok || !result.success) {
      throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }

  /**
   * Convert token arrays to CSL (Citation Style Language) format
   * @param tokens - Array of token sequences to convert
   * @returns CSL formatted references
   */
  static async convertToCSL(tokens: ApiAnystyleTokenSequence[]): Promise<ApiAnystyleConvertResponse> {
    const req = ApiAnystyleConvertRequestSchema.parse({ tokens })

    const response = await fetch(`${API_BASE_URL}/convert-to-csl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    const result = await response.json() as ApiAnystyleConvertResponse

    if (!response.ok || !result.success) {
      throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }

  /**
   * Train a custom AnyStyle model with provided training data
   * @param tokens - Training data as token sequences
   * @returns Training result information
   */
  static async trainModel(tokens: ApiAnystyleTokenSequence[]): Promise<ApiAnystyleTrainResponse> {
    const req = ApiAnystyleTrainRequestSchema.parse({ tokens })

    const response = await fetch(`${API_BASE_URL}/train-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })

    const result = await response.json() as ApiAnystyleTrainResponse
    if (!response.ok || !result.success) {
      throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }

  /**
   * Utility function to split input text into individual references
   * @param inputText - Multi-line text with one reference per line
   * @returns Array of cleaned reference strings
   */
  static parseInputText(inputText: string): string[] {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }
}

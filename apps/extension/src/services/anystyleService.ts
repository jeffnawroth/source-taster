import {
  type ApiAnystyleConvertData,
  // Convert
  ApiAnystyleConvertRequestSchema,

  type ApiAnystyleParseData,
  // Parse
  ApiAnystyleParseRequestSchema,

  // Gemeinsame Typen
  type ApiAnystyleTokenSequence,
  type ApiAnystyleTrainData,

  // Train
  ApiAnystyleTrainRequestSchema,
  type ApiResult,
} from '@source-taster/types'

import { API_CONFIG } from '../env'
import { apiCall } from './http'

const BASE = API_CONFIG.baseUrl
const PATHS = API_CONFIG.endpoints.anystyle

export class AnystyleService {
  /**
   * Parse references using AnyStyle and return tokens with labels
   * @param references - Array of reference strings to parse
   * @returns ApiResult mit { modelUsed, tokens }
   */
  static async parseReferences(references: string[]): Promise<ApiResult<ApiAnystyleParseData>> {
    const req = ApiAnystyleParseRequestSchema.parse({ input: references })
    return apiCall<ApiAnystyleParseData>(`${BASE}${PATHS.parse}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
  }

  /**
   * Convert token arrays to CSL (Citation Style Language) format
   * @param tokens - Array of token sequences to convert
   * @returns ApiResult mit { csl }
   */
  static async convertToCSL(tokens: ApiAnystyleTokenSequence[]): Promise<ApiResult<ApiAnystyleConvertData>> {
    const req = ApiAnystyleConvertRequestSchema.parse({ tokens })
    return apiCall<ApiAnystyleConvertData>(`${BASE}${PATHS.convertToCSL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
  }

  /**
   * Train a custom AnyStyle model with provided training data
   * @param tokens - Training data as token sequences
   * @returns ApiResult mit Trainingsmetadaten
   */
  static async trainModel(tokens: ApiAnystyleTokenSequence[]): Promise<ApiResult<ApiAnystyleTrainData>> {
    const req = ApiAnystyleTrainRequestSchema.parse({ tokens })
    return apiCall<ApiAnystyleTrainData>(`${BASE}${PATHS.train}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
  }

  /**
   * Utility: split multiline input into individual references
   */
  static parseInputText(inputText: string): string[] {
    return inputText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  }
}

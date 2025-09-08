import type { ApiAnystyleConvertResponse, ApiAnystyleParseResponse, ApiAnystyleTrainResponse, ApiResponse } from '@source-taster/types'
import type { Context } from 'hono'

const ANYSTYLE_SERVER_URL = 'http://localhost:4567'

export class AnystyleController {
  // Parse references using AnyStyle
  static async parse(c: Context): Promise<Response> {
    try {
      const body = await c.req.json()

      // Forward request to AnyStyle server
      const response = await fetch(`${ANYSTYLE_SERVER_URL}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AnyStyle server error: ${response.status} - ${error}`)
      }

      const anystyleResult = await response.json() as any

      // Transform to unified ApiResponse format
      const apiResponse: ApiAnystyleParseResponse = {
        success: true,
        data: {
          modelUsed: anystyleResult.model_used || 'unknown',
          tokens: anystyleResult.tokens || [],
        },
        message: 'References parsed successfully',
      }

      return c.json(apiResponse)
    }
    catch (error) {
      console.error('Parse error:', error)
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to parse references',
        message: error instanceof Error ? error.message : String(error),
      }
      return c.json(errorResponse, 500)
    }
  }

  // Convert tokens to CSL format
  static async convertToCSL(c: Context): Promise<Response> {
    try {
      const body = await c.req.json()

      // Forward request to AnyStyle server
      const response = await fetch(`${ANYSTYLE_SERVER_URL}/convert-to-csl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AnyStyle server error: ${response.status} - ${error}`)
      }

      const anystyleResult = await response.json() as any

      // Transform to unified ApiResponse format
      const apiResponse: ApiAnystyleConvertResponse = {
        success: true,
        data: {
          csl: anystyleResult.csl || [],
        },
        message: 'Tokens converted to CSL successfully',
      }

      return c.json(apiResponse)
    }
    catch (error) {
      console.error('Convert to CSL error:', error)
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to convert to CSL',
        message: error instanceof Error ? error.message : String(error),
      }
      return c.json(errorResponse, 500)
    }
  }

  // Train custom model
  static async trainModel(c: Context): Promise<Response> {
    try {
      const body = await c.req.json()

      // Forward request to AnyStyle server
      const response = await fetch(`${ANYSTYLE_SERVER_URL}/train-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`AnyStyle server error: ${response.status} - ${error}`)
      }

      const anystyleResult = await response.json() as any

      // Transform to unified ApiResponse format
      const apiResponse: ApiAnystyleTrainResponse = {
        success: true,
        data: {
          modelPath: anystyleResult.model_path || '',
          modelSizeBytes: anystyleResult.model_size_bytes || 0,
          trainingSequences: anystyleResult.training_sequences || 0,
          trainingTokens: anystyleResult.training_tokens || 0,
          trainingMethod: anystyleResult.training_method || '',
          message: anystyleResult.message || 'Model trained successfully',
          timestamp: anystyleResult.timestamp || new Date().toISOString(),
        },
        message: 'Model trained successfully',
      }

      return c.json(apiResponse)
    }
    catch (error) {
      console.error('Train model error:', error)
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to train model',
        message: error instanceof Error ? error.message : String(error),
      }
      return c.json(errorResponse, 500)
    }
  }
}

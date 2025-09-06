import type { Context } from 'hono'

const ANYSTYLE_SERVER_URL = 'http://localhost:4567'

export class AnystyleController {
  // Parse references using AnyStyle
  static async parse(c: Context) {
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

      const result = await response.json() as Record<string, unknown>
      return c.json(result)
    }
    catch (error) {
      console.error('Parse error:', error)
      return c.json(
        {
          error: 'Failed to parse references',
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      )
    }
  }

  // Convert tokens to CSL format
  static async convertToCSL(c: Context) {
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

      const result = await response.json() as Record<string, unknown>
      return c.json(result)
    }
    catch (error) {
      console.error('Convert to CSL error:', error)
      return c.json(
        {
          error: 'Failed to convert to CSL',
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      )
    }
  }

  // Train custom model
  static async trainModel(c: Context) {
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

      const result = await response.json() as Record<string, unknown>
      return c.json(result)
    }
    catch (error) {
      console.error('Train model error:', error)
      return c.json(
        {
          error: 'Failed to train model',
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      )
    }
  }
}

import type { ApiResponse } from '@source-taster/types'
import type { Context, Next } from 'hono'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()
  }
  catch (error) {
    console.error('API Error:', error)

    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }

    // Return appropriate status codes based on error type
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return c.json(errorResponse, 404)
      }
      if (error.message.includes('validation') || error.message.includes('required')) {
        return c.json(errorResponse, 400)
      }
      if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
        return c.json(errorResponse, 401)
      }
      if (error.message.includes('rate limit')) {
        return c.json(errorResponse, 429)
      }
    }

    return c.json(errorResponse, 500)
  }
}

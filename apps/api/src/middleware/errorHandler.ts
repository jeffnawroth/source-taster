// src/middleware/errorHandler.ts
import type { Context, Next } from 'hono'
import { isAppError } from '../errors/AppError'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()
  }
  catch (err: unknown) {
    console.error('❌ Unhandled error:', err)

    if (isAppError(err)) {
      return c.json(
        {
          success: false,
          error: err.code ?? 'app_error',
          message: err.message,
        },
        err.status as any,
      )
    }

    // Fallback für unerwartete Fehler
    return c.json(
      {
        success: false,
        error: 'internal_error',
        message: 'Unexpected server error',
      },
      500,
    )
  }
}

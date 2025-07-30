/**
 * Middleware for decrypting API keys from extension requests
 */
import type { Context, Next } from 'hono'
import { decryptApiKey } from '../utils/crypto'

/**
 * Middleware to decrypt API keys from extension headers
 */
export async function decryptApiKeyMiddleware(c: Context, next: Next) {
  try {
    const extensionId = c.req.header('X-Extension-ID')
    const encryptedApiKey = c.req.header('X-API-Key')

    // If no encryption headers, skip decryption
    if (!extensionId || !encryptedApiKey) {
      await next()
      return
    }

    // Decrypt API key
    const decryptedApiKey = decryptApiKey(encryptedApiKey, extensionId)

    // Get request body and inject decrypted AI settings
    const body = await c.req.json()

    body.aiSettings = {
      ...body.aiSettings,
      apiKey: decryptedApiKey,
    }

    // Store modified body for controllers
    c.set('decryptedBody', body)

    await next()
  }
  catch (error) {
    console.error('Failed to decrypt API key:', error)
    return c.json({
      success: false,
      error: 'Invalid API key encryption',
    }, 400)
  }
}

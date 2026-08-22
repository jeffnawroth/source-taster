import type { Context, Next } from 'hono'
import process from 'node:process'

/**
 * Get allowed origins for production mode based on environment variables
 */
function getProductionAllowedOrigins(): string[] {
  const extensionIds = process.env.ALLOWED_EXTENSION_IDS
  const webOrigins = process.env.ALLOWED_WEB_ORIGINS

  const allowedExtensions = extensionIds
    ? extensionIds
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
        .flatMap(id => [
          `chrome-extension://${id}`,
          `moz-extension://${id}`, // Firefox support
        ])
    : [`chrome-extension://*`, `moz-extension://*`]

  const allowedWeb = webOrigins
    ? webOrigins
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)
    : []

  if (!extensionIds) {
    // Fallback: Allow all extensions if no specific IDs configured
  }

  return [...allowedExtensions, ...allowedWeb]
}

/**
 * Custom CORS middleware with proper security blocking
 *
 * Development: Allows all origins (browser, tools, extensions)
 * Production: Only allows specific extension IDs
 */
export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('origin')

  // DEVELOPMENT: Allow ALL origins
  if (process.env.NODE_ENV === 'development') {
    // Set CORS headers for development
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID, X-Client-Id')

    // Handle preflight
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204)
    }

    return next()
  }

  // PRODUCTION: Only allow specific extension IDs
  const allowedOrigins = getProductionAllowedOrigins()

  // B2B server clients authenticate with X-API-Key (a bearer secret like
  // Authorization); CORS is a browser mechanism, so skip origin validation
  // for key callers — keyAuth validates the key right after.
  if (c.req.header('X-API-Key')) {
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204)
    }
    return next()
  }

  const fetchSite = c.req.header('sec-fetch-site')
  const fetchMode = c.req.header('sec-fetch-mode')
  const clientIdHeader = c.req.header('X-Client-Id')

  // Block requests without origin header in production unless they can be
  // identified as trusted extension calls (Chrome options page no longer sends
  // an origin header but keeps the Sec-Fetch metadata and client ID).
  if (!origin) {
    const isTrustedExtensionRequest = Boolean(
      clientIdHeader
      && fetchSite === 'none'
      && fetchMode === 'cors',
    )

    if (!isTrustedExtensionRequest) {
      return c.json({ error: 'Origin header required' }, 403)
    }

    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID, X-Client-Id')

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204)
    }

    return next()
  }

  let isAllowed = false

  // Check exact match
  if (allowedOrigins.includes(origin)) {
    isAllowed = true
  }

  // Check wildcard patterns (chrome-extension://*)
  if (!isAllowed && allowedOrigins.some((allowed) => {
    if (allowed.endsWith('*')) {
      const pattern = allowed.slice(0, -1)
      return origin.startsWith(pattern)
    }
    return false
  })) {
    isAllowed = true
  }

  // Block if not allowed
  if (!isAllowed) {
    return c.json({ error: 'Origin not allowed' }, 403)
  }

  // Set CORS headers for allowed origins
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID, X-Client-Id')

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204)
  }

  return next()
}

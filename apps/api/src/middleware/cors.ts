import type { Context, Next } from 'hono'
import process from 'node:process'

/**
 * Get allowed origins for production mode based on environment variables
 */
function getProductionAllowedOrigins(): string[] {
  const extensionIds = process.env.ALLOWED_EXTENSION_IDS

  if (extensionIds) {
    // Split comma-separated extension IDs and create full origins
    const allowedExtensions = extensionIds
      .split(',')
      .map(id => id.trim())
      .filter(Boolean)
      .flatMap(id => [
        `chrome-extension://${id}`,
        `moz-extension://${id}`, // Firefox support
      ])

    return allowedExtensions
  }

  // Fallback: Allow all extensions if no specific IDs configured
  console.warn('⚠️  No ALLOWED_EXTENSION_IDS configured, allowing all extensions')
  return ['chrome-extension://*', 'moz-extension://*']
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
    console.warn(`🔧 DEV: Allowing origin: ${origin || 'null (API tool)'}`)

    // Set CORS headers for development
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID, X-Client-Id')

    // Handle preflight
    if (c.req.method === 'OPTIONS') {
      return new Response('', { status: 204 })
    }

    return next()
  }

  // PRODUCTION: Only allow specific extension IDs
  const allowedOrigins = getProductionAllowedOrigins()

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
      console.warn('❌ PROD: Blocked request without origin header')
      return c.json({ error: 'Origin header required' }, 403)
    }

    console.warn('✅ PROD: Allowing trusted extension request without origin header')

    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID, X-Client-Id')

    if (c.req.method === 'OPTIONS') {
      return new Response('', { status: 204 })
    }

    return next()
  }

  let isAllowed = false

  // Check exact match
  if (allowedOrigins.includes(origin)) {
    console.warn(`✅ PROD: Allowed extension origin: ${origin}`)
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
    console.warn(`✅ PROD: Allowed extension origin (wildcard): ${origin}`)
    isAllowed = true
  }

  // Block if not allowed
  if (!isAllowed) {
    console.warn(`❌ PROD: Blocked request from origin: ${origin}`)
    return c.json({ error: 'Origin not allowed' }, 403)
  }

  // Set CORS headers for allowed origins
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID, X-Client-Id')

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return new Response('', { status: 204 })
  }

  return next()
}

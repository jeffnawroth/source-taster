import type { Context, Next } from 'hono'

export async function corsMiddleware(c: Context, next: Next) {
  // Add CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200)
  }

  await next()
}

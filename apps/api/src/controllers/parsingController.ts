import type { Reference } from '@source-taster/types'
import type { Context } from 'hono'

interface ParseResponse {
  csl?: Reference[]
  tokens?: Array<{
    tokens: string[]
    labels: string[]
    original_text: string
  }>
}

/**
 * Parses references using AnyStyle
 * POST /api/parse
 */
export async function parseReferences(c: Context) {
  try {
    const { references, includeTokens = false } = await c.req.json()

    if (!references || (Array.isArray(references) && references.length === 0)) {
      return c.json({ error: 'No references provided' }, 400)
    }

    const response = await fetch('http://localhost:4567/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        references,
        include_tokens: includeTokens,
      }),
    })

    if (!response.ok) {
      throw new Error(`AnyStyle server error: ${response.statusText}`)
    }

    const result = await response.json() as ParseResponse

    if (includeTokens) {
      return c.json({
        references: result.csl || [],
        tokens: result.tokens || [],
      })
    }

    // Backward compatibility - return only CSL references
    return c.json({ references: result as Reference[] })
  }
  catch (error) {
    console.error('Error parsing references:', error)
    return c.json({ error: 'Failed to parse references' }, 500)
  }
}

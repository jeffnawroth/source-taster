import type { CSLItem, ExtractionResponse } from '@source-taster/types'
import type { Context } from 'hono'

/**
 * Evaluates provided candidates against a reference
 * POST /api/parse
 */
export async function parseReferences(c: Context) {
  const rawBody = await c.req.json()
  const { references } = rawBody

  if (!references)
    return c.json({ error: 'No references provided' }, 400)

  try {
    const response = await fetch('http://localhost:4567/parse', {
      method: 'POST',
      body: JSON.stringify({ references }),
    })

    const result = await response.json() as CSLItem[]

    const parsedReferences: ExtractionResponse = {
      references: result.map((cslItem, index) => {
        // Ensure the CSL item has an ID (required by our schema)
        if (!cslItem.id) {
          cslItem.id = `anystyle-${Date.now()}-${index}`
        }

        return {
          id: `parsed-${index + 1}`,
          originalText: references[index] || references[0], // Use corresponding input or fallback to first
          metadata: cslItem,
        }
      }),
    }

    return c.json({
      success: true,
      data: {
        references: parsedReferences.references,
      },
    })
  }
  catch (error) {
    return c.json({
      error: 'AnyStyle service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 503)
  }
}

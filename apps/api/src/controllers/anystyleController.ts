import type {
  ApiAnystyleConvertData,
  ApiAnystyleConvertResponse,
  ApiAnystyleParseResponse,
} from '@source-taster/types'
import type { Context } from 'hono'
import {
  ApiAnystyleConvertRequestSchema,
  ApiAnystyleParseRequestSchema,
} from '@source-taster/types'
import { anystyleDurationSeconds, anystyleRequestsTotal } from '../middleware/metrics.js'
import { anystyleProvider } from '../services/anystyleProvider.js'

export async function parse(c: Context): Promise<Response> {
  const start = Date.now()
  const req = ApiAnystyleParseRequestSchema.parse(await c.req.json())

  try {
    const data = await anystyleProvider.parseReferences(req.input)

    anystyleRequestsTotal.inc({ operation: 'parse', status: 'success' })
    anystyleDurationSeconds.observe({ operation: 'parse' }, (Date.now() - start) / 1000)

    const payload: ApiAnystyleParseResponse = {
      success: true,
      data,
      message: 'References parsed successfully',
    }
    return c.json(payload)
  }
  catch (e) {
    anystyleRequestsTotal.inc({ operation: 'parse', status: 'error' })
    throw e
  }
}

/** POST /api/anystyle/convert-to-csl */
export async function convertToCSL(c: Context): Promise<Response> {
  const start = Date.now()
  const req = ApiAnystyleConvertRequestSchema.parse(await c.req.json())

  try {
    const data: ApiAnystyleConvertData = await anystyleProvider.convertToCSL(req.references)

    anystyleRequestsTotal.inc({ operation: 'convert', status: 'success' })
    anystyleDurationSeconds.observe({ operation: 'convert' }, (Date.now() - start) / 1000)

    const payload: ApiAnystyleConvertResponse = {
      success: true,
      data,
      message: 'Tokens converted to CSL successfully',
    }
    return c.json(payload)
  }
  catch (e) {
    anystyleRequestsTotal.inc({ operation: 'convert', status: 'error' })
    throw e
  }
}

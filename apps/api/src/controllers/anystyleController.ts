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
import { anystyleProvider } from '../services/anystyleProvider'

export async function parse(c: Context): Promise<Response> {
  const req = ApiAnystyleParseRequestSchema.parse(await c.req.json())

  const data = await anystyleProvider.parseReferences(req.input)

  const payload: ApiAnystyleParseResponse = {
    success: true,
    data,
    message: 'References parsed successfully',
  }
  return c.json(payload)
}

/** POST /api/anystyle/convert-to-csl */
export async function convertToCSL(c: Context): Promise<Response> {
  const req = ApiAnystyleConvertRequestSchema.parse(await c.req.json())

  const data: ApiAnystyleConvertData = await anystyleProvider.convertToCSL(req.references)

  const payload: ApiAnystyleConvertResponse = {
    success: true,
    data,
    message: 'Tokens converted to CSL successfully',
  }
  return c.json(payload)
}

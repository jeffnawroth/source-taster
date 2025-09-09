import type {
  ApiAnystyleConvertData,
  ApiAnystyleConvertResponse,
  ApiAnystyleParseData,
  ApiAnystyleParseResponse,
  ApiAnystyleTrainData,
  ApiAnystyleTrainResponse,
} from '@source-taster/types'
import type { Context } from 'hono'
import process from 'node:process'
import {
  ApiAnystyleConvertRequestSchema,
  ApiAnystyleParseRequestSchema,
  ApiAnystyleTrainRequestSchema,
} from '@source-taster/types'
import { httpBadRequest, httpUpstream } from '../errors/http'

const ANYSTYLE_SERVER_URL = process.env.ANYSTYLE_SERVER_URL ?? 'http://localhost:4567'

// ---- helpers ---------------------------------------------------------------

async function postJson<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const url = `${ANYSTYLE_SERVER_URL}${path}`

  let res: Response | undefined
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  }
  catch (e) {
    // httpUpstream wirft → Funktion terminiert mit never
    return httpUpstream('AnyStyle unreachable', 502, e) as never
  }

  if (!res) {
    return httpUpstream('No response from AnyStyle', 502) as never
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    if (res.status >= 400 && res.status < 500) {
      return httpBadRequest(`AnyStyle error ${res.status}: ${text || 'client error'}`) as never
    }
    const status = (res.status === 503 || res.status === 504) ? (res.status as 503 | 504) : 502
    return httpUpstream(`AnyStyle error ${res.status}: ${text || 'server error'}`, status) as never
  }

  try {
    return await res.json() as TRes
  }
  catch (e) {
    return httpUpstream('AnyStyle returned non-JSON payload', 502, e) as never
  }
}

// ---- controller ------------------------------------------------------------

export class AnystyleController {
  /** POST /api/anystyle/parse */
  static async parse(c: Context): Promise<Response> {
    // Zod-Validation; ZodError wird zentral von registerOnError() gehandhabt
    const req = ApiAnystyleParseRequestSchema.parse(await c.req.json())

    const upstream = await postJson<typeof req, ApiAnystyleParseData>('/parse', req)

    const payload: ApiAnystyleParseResponse = {
      success: true,
      data: upstream,
      message: 'References parsed successfully',
    }
    return c.json(payload)
  }

  /** POST /api/anystyle/convert-to-csl */
  static async convertToCSL(c: Context): Promise<Response> {
    const req = ApiAnystyleConvertRequestSchema.parse(await c.req.json())

    const upstream = await postJson<typeof req, ApiAnystyleConvertData>('/convert-to-csl', req)

    const payload: ApiAnystyleConvertResponse = {
      success: true,
      data: upstream,
      message: 'Tokens converted to CSL successfully',
    }
    return c.json(payload)
  }

  /** POST /api/anystyle/train-model */
  static async trainModel(c: Context): Promise<Response> {
    const req = ApiAnystyleTrainRequestSchema.parse(await c.req.json())

    const upstream = await postJson<typeof req, ApiAnystyleTrainData>('/train-model', req)

    const payload: ApiAnystyleTrainResponse = {
      success: true,
      data: upstream,
      message: 'Model trained successfully',
    }
    return c.json(payload)
  }
}

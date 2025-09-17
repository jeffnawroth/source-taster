import type { ApiSearchRequest, ApiSearchResult } from '@source-taster/types'
import type { Context } from 'hono'
import {
  ApiSearchRequestSchema,
  ApiSearchResponseSchema,
} from '@source-taster/types'
import { httpBadRequest } from '../errors/http.js'
import searchCoordinator from '../services/search/searchCoordinator.js'

/**
 * POST /api/search/:database
 * Search for references in a single database
 */
export async function searchSingleDatabase(c: Context) {
  const database = c.req.param('database')
  if (!database)
    httpBadRequest('Missing :database param')

  const req = await parseAndValidateRequest(c)
  const results = await searchCoordinator.searchSingleDatabase(req.references, database!)
  return createSuccessResponse(c, results)
}

/** --- Helpers --- */

async function parseAndValidateRequest(c: Context): Promise<ApiSearchRequest> {
  const raw = await c.req.json()
  return ApiSearchRequestSchema.parse(raw)
}

function createSuccessResponse(c: Context, results: ApiSearchResult[]) {
  const payload = ApiSearchResponseSchema.parse({
    success: true,
    data: { results },
  })
  return c.json(payload)
}

import type { ApiSearchRequest, ApiSearchResult } from '@source-taster/types'
import type { Context } from 'hono'
import {
  ApiSearchRequestSchema,
  ApiSearchResponseSchema,
} from '@source-taster/types'
import { httpBadRequest } from '../errors/http'
import searchCoordinator from '../services/search/searchCoordinator'

/**
 * POST /api/search
 * Sucht in allen Datenbanken
 */
export async function searchAllDatabases(c: Context) {
  const req = await parseAndValidateRequest(c)
  const results = await searchCoordinator.searchAllDatabases(req.references)
  return createSuccessResponse(c, results)
}

/**
 * POST /api/search/:database
 * Sucht nur in einer konkreten Datenbank
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

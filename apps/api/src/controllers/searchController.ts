import type { Context } from 'hono'
import {
  type ApiSearchRequest,
  ApiSearchRequestSchema,
  ApiSearchResponseSchema,
  type ApiSearchResult,
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
 * GET /api/search/databases
 * Liste verfügbarer Datenbanken
 */
export async function getDatabases(c: Context) {
  const databases = await searchCoordinator.getDatabases()
  return c.json({ success: true, data: databases })
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

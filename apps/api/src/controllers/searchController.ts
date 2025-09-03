import type {
  ApiResponse,
  SearchRequest,
  SearchResponse,
  SearchResult,
} from '@source-taster/types'
import type { Context } from 'hono'
import { SearchRequestSchema } from '@source-taster/types'
import { DatabaseSearchService } from '../services/databaseSearchService'

export class SearchController {
  private searchService: DatabaseSearchService

  constructor() {
    this.searchService = new DatabaseSearchService()
  }

  /**
   * Search for references in external databases without matching
   * POST /api/search
   */
  async searchDatabases(c: Context) {
    try {
      const request = await this.validateRequest(c)
      const results = await this.performSearch(request)
      return this.createSuccessResponse(c, results)
    }
    catch (error) {
      return this.handleError(c, error)
    }
  }

  /**
   * Validate and parse the incoming request
   */
  private async validateRequest(c: Context) {
    const rawBody = await c.req.json()
    const parseResult = SearchRequestSchema.safeParse(rawBody)

    if (!parseResult.success) {
      console.warn('SearchController: Validation failed:', parseResult.error)
      throw new ValidationError('Request validation failed', parseResult.error)
    }

    console.warn(`SearchController: Processing search request for ${parseResult.data.references.length} references`)
    return parseResult.data
  }

  /**
   * Perform the actual search for all references
   */
  private async performSearch(request: SearchRequest): Promise<SearchResult[]> {
    const results: SearchResult[] = []

    for (const reference of request.references) {
      console.warn(`SearchController: Searching for reference ${reference.id}`)
      const candidates = await this.searchService.searchAllDatabases(reference)

      results.push({
        referenceId: reference.id,
        candidates,
      })
    }

    console.warn(`SearchController: Search completed, returning ${results.length} results`)
    return results
  }

  /**
   * Create a successful API response
   */
  private createSuccessResponse(c: Context, results: SearchResult[]) {
    const response: ApiResponse<SearchResponse> = {
      success: true,
      data: {
        results,
      },
    }
    return c.json(response)
  }

  /**
   * Handle errors and create appropriate error responses
   */
  private handleError(c: Context, error: unknown) {
    console.error('SearchController: Error during search:', error)

    if (error instanceof ValidationError) {
      return c.json({
        success: false,
        error: error.validationError,
      }, 400)
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorResponse: ApiResponse = {
      success: false,
      error: errorMessage,
    }
    return c.json(errorResponse, 500)
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message: string, public validationError: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

import type {
  ApiResponse,
  MatchingRequest,
  MatchingResponse,
  SourceEvaluation,
  WebsiteMatchingResult,
} from '@source-taster/types'
import type { Context } from 'hono'
import { DatabaseMatchingService } from '../services/databaseMatchingService'
import { WebsiteMatchingService } from '../services/websiteMatchingService'

export class MatchingController {
  private matchingService: DatabaseMatchingService
  private websiteMatchingService: WebsiteMatchingService

  constructor() {
    this.matchingService = new DatabaseMatchingService()
    this.websiteMatchingService = new WebsiteMatchingService()
  }

  /**
   * Validate common request fields and field weights
   */
  private validateRequest(request: any): { isValid: boolean, errorResponse?: ApiResponse } {
    if (!request.matchingSettings) {
      return {
        isValid: false,
        errorResponse: {
          success: false,
          error: 'Matching settings are required',
        },
      }
    }

    // Validate field weights sum to 100%
    const totalWeight = Object.values(request.matchingSettings.fieldWeights).reduce((sum: number, weight: any) => sum + (weight || 0), 0)
    if (totalWeight !== 100) {
      return {
        isValid: false,
        errorResponse: {
          success: false,
          error: `Invalid field weights: ${totalWeight}% (expected 100%)`,
        },
      }
    }

    return { isValid: true }
  }

  /**
   * Intelligently match references - automatically chooses database or website matching based on source type
   * POST /api/match
   */
  async matchReferences(c: Context) {
    try {
      const request = await c.req.json() as MatchingRequest

      // Validation
      if (!request.references || !Array.isArray(request.references)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'References array is required',
        }
        return c.json(errorResponse, 400)
      }

      const validation = this.validateRequest(request)
      if (!validation.isValid) {
        return c.json(validation.errorResponse, 400)
      }

      // Intelligent routing: detect references with URLs and process them accordingly
      const results = []

      for (const reference of request.references) {
        if (this.hasWebURL(reference)) {
          // Use website matching for references with URLs
          try {
            const websiteResult = await this.websiteMatchingService.matchWebsiteReference(
              reference,
              reference.metadata.source.url!,
              request.matchingSettings,
            )

            // Convert website matching result to standard matching result format
            const websiteSourceEvaluation = this.createWebsiteSourceEvaluation(websiteResult)

            results.push({
              referenceId: reference.id,
              matchingDetails: {
                sourcesFound: [], // Website matching doesn't use database sources
                matchDetails: websiteResult.matchDetails,
                allSourceEvaluations: [websiteSourceEvaluation],
              },
            })
          }
          catch (error) {
            // If website matching fails, fall back to database matching
            console.warn(`Website matching failed for reference ${reference.id}, falling back to database:`, error)
            const dbResult = await this.matchingService.matchReference(reference, request.matchingSettings)
            results.push(dbResult)
          }
        }
        else {
          // Use database matching for academic references
          const dbResult = await this.matchingService.matchReference(reference, request.matchingSettings)
          results.push(dbResult)
        }
      }

      const response: ApiResponse<MatchingResponse> = {
        success: true,
        data: {
          results,
        },
      }

      return c.json(response)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorResponse: ApiResponse = {
        success: false,
        error: errorMessage,
      }
      return c.json(errorResponse, 500)
    }
  }

  /**
   * Helper method to determine if a reference has a web URL that should be matched via website matching
   * This excludes academic database URLs (DOI, PubMed, arXiv, etc.) which should use database matching
   */
  private hasWebURL(reference: any): boolean {
    // Check if the reference has a URL in its source information
    if (reference.metadata?.source?.url) {
      const url = reference.metadata.source.url

      // Basic URL validation
      try {
        const urlObj = new URL(url)

        // Only consider http/https URLs
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
          return false
        }

        // Exclude academic database URLs - these should use database matching
        const academicHosts = [
          'doi.org',
          'dx.doi.org',
          'www.doi.org',
          'pubmed.ncbi.nlm.nih.gov',
          'www.ncbi.nlm.nih.gov',
          'arxiv.org',
          'www.arxiv.org',
          'europepmc.org',
          'www.europepmc.org',
          'semanticscholar.org',
          'www.semanticscholar.org',
          'openalex.org',
          'www.openalex.org',
        ]

        const hostname = urlObj.hostname.toLowerCase()
        if (academicHosts.some(host => hostname === host || hostname.endsWith(`.${host}`))) {
          return false
        }

        // If reference has a DOI identifier, prefer database matching over website matching
        if (reference.metadata?.identifiers?.doi) {
          return false
        }

        return true
      }
      catch {
        return false
      }
    }

    return false
  }

  /**
   * Convert a WebsiteMatchingResult to a SourceEvaluation
   */
  private createWebsiteSourceEvaluation(websiteResult: WebsiteMatchingResult): SourceEvaluation {
    return {
      source: {
        id: websiteResult.url,
        source: 'website' as const,
        metadata: {
          title: websiteResult.websiteMetadata?.title,
          authors: websiteResult.websiteMetadata?.authors?.map((author: string) => ({ lastName: author })),
          date: websiteResult.websiteMetadata?.publishedDate
            ? {
                year: new Date(websiteResult.websiteMetadata.publishedDate).getFullYear(),
              }
            : { year: undefined },
          source: {
            containerTitle: websiteResult.websiteMetadata?.siteName,
            url: websiteResult.url,
            sourceType: websiteResult.websiteMetadata?.articleType || 'webpage',
          },
          identifiers: {},
        },
        url: websiteResult.url,
      },
      matchDetails: websiteResult.matchDetails,
    }
  }

  /**
   * Match a reference against a website URL
   * POST /api/match/website
   */
  async matchWebsiteReference(c: Context) {
    try {
      const request = await c.req.json() as {
        reference: any
        url: string
        fieldWeights: any
        options?: any
      }

      // Validation
      if (!request.reference) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Reference is required',
        }
        return c.json(errorResponse, 400)
      }

      if (!request.url) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'URL is required',
        }
        return c.json(errorResponse, 400)
      }

      const validation = this.validateRequest(request)
      if (!validation.isValid) {
        return c.json(validation.errorResponse, 400)
      }

      // Match website reference
      const result = await this.websiteMatchingService.matchWebsiteReference(
        request.reference,
        request.url,
        request.fieldWeights,
        request.options,
      )

      const response: ApiResponse<WebsiteMatchingResult> = {
        success: true,
        data: result,
      }

      return c.json(response)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorResponse: ApiResponse = {
        success: false,
        error: errorMessage,
      }
      return c.json(errorResponse, 500)
    }
  }
}

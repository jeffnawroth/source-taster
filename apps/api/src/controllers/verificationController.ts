import type {
  ApiResponse,
  SourceEvaluation,
  VerificationRequest,
  VerificationResponse,
  WebsiteVerificationResult,
} from '@source-taster/types'
import type { Context } from 'hono'
import { DatabaseVerificationService } from '../services/databaseVerificationService'
import { WebsiteVerificationService } from '../services/websiteVerificationService'

// Constants
const WEBSITE_VERIFICATION_THRESHOLD = 70

export class VerificationController {
  private verificationService: DatabaseVerificationService
  private websiteVerificationService: WebsiteVerificationService

  constructor() {
    this.verificationService = new DatabaseVerificationService()
    this.websiteVerificationService = new WebsiteVerificationService()
  }

  /**
   * Intelligently verify references - automatically chooses database or website verification based on source type
   * POST /api/verify
   */
  async verifyReferences(c: Context) {
    try {
      const request = await c.req.json() as VerificationRequest

      // Validation
      if (!request.references || !Array.isArray(request.references)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'References array is required',
        }
        return c.json(errorResponse, 400)
      }

      // Intelligent routing: detect references with URLs and process them accordingly
      const results = []

      for (const reference of request.references) {
        if (this.hasWebURL(reference)) {
          // Use website verification for references with URLs
          try {
            const websiteResult = await this.websiteVerificationService.verifyWebsiteReference(
              reference,
              reference.metadata.source.url!,
              request.aiService || 'openai',
            )

            // Convert website verification result to standard verification result format
            const websiteSourceEvaluation = this.createWebsiteSourceEvaluation(websiteResult)

            results.push({
              referenceId: reference.id,
              isVerified: websiteResult.isVerified,
              verificationDetails: {
                sourcesFound: [], // Website verification doesn't use database sources
                matchDetails: websiteResult.matchDetails,
                allSourceEvaluations: [websiteSourceEvaluation],
              },
            })
          }
          catch (error) {
            // If website verification fails, fall back to database verification
            console.warn(`Website verification failed for reference ${reference.id}, falling back to database:`, error)
            const dbResults = await this.verificationService.verifyReferences([reference], request.aiService)
            results.push(...dbResults)
          }
        }
        else {
          // Use database verification for academic references
          const dbResults = await this.verificationService.verifyReferences([reference], request.aiService)
          results.push(...dbResults)
        }
      }

      const response: ApiResponse<VerificationResponse> = {
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
   * Helper method to determine if a reference has a web URL that should be verified via website verification
   * This excludes academic database URLs (DOI, PubMed, arXiv, etc.) which should use database verification
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

        // Exclude academic database URLs - these should use database verification
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

        // If reference has a DOI identifier, prefer database verification over website verification
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
   * Convert a WebsiteVerificationResult to a SourceEvaluation
   */
  private createWebsiteSourceEvaluation(websiteResult: WebsiteVerificationResult): SourceEvaluation {
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
      isMatch: websiteResult.matchDetails.overallScore >= WEBSITE_VERIFICATION_THRESHOLD,
    }
  }

  /**
   * Verify a reference against a website URL
   * POST /api/verify/website
   */
  async verifyWebsiteReference(c: Context) {
    try {
      const request = await c.req.json() as {
        reference: any
        url: string
        aiService: 'openai' | 'gemini'
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

      if (!request.aiService) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'AI service is required',
        }
        return c.json(errorResponse, 400)
      }

      // Verify website reference
      const result = await this.websiteVerificationService.verifyWebsiteReference(
        request.reference,
        request.url,
        request.aiService,
        request.options,
      )

      const response: ApiResponse<WebsiteVerificationResult> = {
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

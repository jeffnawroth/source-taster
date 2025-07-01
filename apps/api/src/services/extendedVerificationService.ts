import type {
  Reference,
  VerificationResult,
  WebsiteVerificationResult,
} from '@source-taster/types'
import { DatabaseVerificationService } from './databaseVerificationService'
import { WebsiteVerificationService } from './websiteVerificationService'

/**
 * Extended verification service that supports both database and website verification
 * This service acts as a facade for the different verification strategies
 */
export class ExtendedVerificationService {
  private databaseService: DatabaseVerificationService
  private websiteService: WebsiteVerificationService

  constructor() {
    this.databaseService = new DatabaseVerificationService()
    this.websiteService = new WebsiteVerificationService()
  }

  /**
   * Verify references using both database and website strategies
   * First tries database verification, then falls back to website verification if URL is available
   */
  async verifyReferencesExtended(
    references: Reference[],
    aiService: 'openai' | 'gemini',
  ): Promise<Array<VerificationResult | WebsiteVerificationResult>> {
    const results: Array<VerificationResult | WebsiteVerificationResult> = []

    for (const reference of references) {
      let result: VerificationResult | WebsiteVerificationResult

      try {
        // First, try database verification
        const databaseResults = await this.databaseService.verifyReferences(
          [reference],
          aiService,
        )
        const databaseResult = databaseResults[0]

        // If database verification was successful (verified), use it
        if (databaseResult.isVerified) {
          result = databaseResult
        }
        // If database verification failed but reference has URL, try website verification
        else if (reference.metadata.url) {
          console.warn(`Database verification failed for ${reference.id}, trying website verification with URL: ${reference.metadata.url}`)

          const websiteResult = await this.websiteService.verifyWebsiteReference(
            reference,
            reference.metadata.url,
            aiService,
          )

          result = websiteResult
        }
        // If no URL available, return the database result (unverified)
        else {
          result = databaseResult
        }
      }
      catch (error) {
        console.error(`Error verifying reference ${reference.id}:`, error)

        // Return a failed verification result
        result = {
          referenceId: reference.id,
          isVerified: false,
          verificationDetails: {
            sourcesFound: [],
            matchDetails: {
              overallScore: 0,
            },
          },
        }
      }

      results.push(result)
    }

    return results
  }

  /**
   * Verify a single reference with fallback strategy
   */
  async verifySingleReference(
    reference: Reference,
    aiService: 'openai' | 'gemini',
  ): Promise<VerificationResult | WebsiteVerificationResult> {
    const results = await this.verifyReferencesExtended([reference], aiService)
    return results[0]
  }

  /**
   * Get database verification service (for direct access)
   */
  getDatabaseService(): DatabaseVerificationService {
    return this.databaseService
  }

  /**
   * Get website verification service (for direct access)
   */
  getWebsiteService(): WebsiteVerificationService {
    return this.websiteService
  }
}

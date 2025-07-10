import type {
  ExternalSource,
  Reference,
  SourceEvaluation,
  VerificationResult,
} from '@source-taster/types'
import process from 'node:process'
import { BaseVerificationService } from './baseVerificationService'
import { ArxivService } from './databases/arxivService'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'
import { SemanticScholarService } from './databases/semanticScholarService'

export class DatabaseVerificationService extends BaseVerificationService {
  private openAlex = new OpenAlexService()
  private crossref = new CrossrefService()
  private europePmc = new EuropePmcService()
  private semanticScholar = new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY)
  private arxiv = new ArxivService()

  constructor() {
    // Use default field weights for database verification
    super()
  }

  async verifyReference(
    reference: Reference,
  ): Promise<VerificationResult> {
    // Search in all databases in parallel for better performance
    const [openAlexResult, crossrefResult, europePmcResult, semanticScholarResult, arxivResult] = await Promise.allSettled([
      this.openAlex.search(reference.metadata),
      this.crossref.search(reference.metadata),
      this.europePmc.search(reference.metadata),
      this.semanticScholar.search(reference.metadata),
      this.arxiv.search(reference.metadata),
    ])

    // Extract successful results
    const sources: ExternalSource[] = []

    if (openAlexResult.status === 'fulfilled' && openAlexResult.value) {
      sources.push(openAlexResult.value)
    }

    if (crossrefResult.status === 'fulfilled' && crossrefResult.value) {
      sources.push(crossrefResult.value)
    }

    if (europePmcResult.status === 'fulfilled' && europePmcResult.value) {
      sources.push(europePmcResult.value)
    }

    if (semanticScholarResult.status === 'fulfilled' && semanticScholarResult.value) {
      sources.push(semanticScholarResult.value)
    }

    if (arxivResult.status === 'fulfilled' && arxivResult.value) {
      sources.push(arxivResult.value)
    }

    // If no sources found, return unverified
    if (sources.length === 0) {
      return {
        referenceId: reference.id,
        verificationDetails: {
          sourcesFound: [],
        },
      }
    }

    // Verify with AI using the best available sources
    // Evaluate all sources and find the best one based on AI scoring
    const sourceEvaluations: SourceEvaluation[] = []

    // Evaluate each source with AI
    for (const source of sources) {
      const matchResult = await this.verifyWithAI(reference, source)
      sourceEvaluations.push({
        source,
        matchDetails: matchResult.details,
      })
    }

    // Sort by overall score (highest first)
    sourceEvaluations.sort((a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore)

    // Get the best source (highest score)
    const bestEvaluation = sourceEvaluations[0]

    // Return result with best source - let frontend decide on verification based on score
    return {
      referenceId: reference.id,
      matchedSource: bestEvaluation.source,
      verificationDetails: {
        sourcesFound: sources,
        matchDetails: bestEvaluation.matchDetails,
        allSourceEvaluations: sourceEvaluations,
      },
    }
  }
}

import type {
  ExternalSource,
  MatchingResult,
  MatchingSettings,
  Reference,
  SourceEvaluation,
} from '@source-taster/types'
import process from 'node:process'
import { BaseMatchingService } from './baseMatchingService'
import { ArxivService } from './databases/arxivService'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'
import { SemanticScholarService } from './databases/semanticScholarService'

export class DatabaseMatchingService extends BaseMatchingService {
  private openAlex = new OpenAlexService()
  private crossref = new CrossrefService()
  private europePmc = new EuropePmcService()
  private semanticScholar = new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY)
  private arxiv = new ArxivService()

  constructor() {
    // Use default field weights for database matching
    super()
  }

  async matchReference(
    reference: Reference,
    matchingSettings: MatchingSettings,
  ): Promise<MatchingResult> {
    const { earlyTermination } = matchingSettings.matchingConfig
    const sourceEvaluations: SourceEvaluation[] = []

    if (earlyTermination.enabled) {
      // Early termination enabled: search databases one by one until threshold is met
      const databaseServices = [
        { name: 'OpenAlex', service: this.openAlex },
        { name: 'Crossref', service: this.crossref },
        { name: 'EuropePMC', service: this.europePmc },
        { name: 'Semantic Scholar', service: this.semanticScholar },
        { name: 'ArXiv', service: this.arxiv },
      ]

      for (const { service } of databaseServices) {
        try {
          const source = await service.search(reference.metadata)
          if (source) {
            // Immediately evaluate with AI
            const matchResult = await this.matchWithAI(reference, source, matchingSettings)
            sourceEvaluations.push({
              source,
              matchDetails: matchResult.details,
            })

            // Check if we've found a match above the threshold
            if (matchResult.details.overallScore >= earlyTermination.threshold) {
              // Early termination triggered - stop searching further databases
              break
            }
          }
        }
        catch {
          // Continue with next database if one fails
          continue
        }
      }
    }
    else {
      // Early termination disabled: search all databases in parallel for better performance
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

      // If no sources found, return unmatched
      if (sources.length === 0) {
        return {
          sourceEvaluations: [],
        }
      }

      // Evaluate all sources with AI in parallel
      const aiEvaluations = await Promise.allSettled(
        sources.map(async (source) => {
          const matchResult = await this.matchWithAI(reference, source, matchingSettings)
          return {
            source,
            matchDetails: matchResult.details,
          }
        }),
      )

      // Extract successful AI evaluations
      for (const result of aiEvaluations) {
        if (result.status === 'fulfilled') {
          sourceEvaluations.push(result.value)
        }
      }
    }

    // If no sources found, return unmatched
    if (sourceEvaluations.length === 0) {
      return {
        sourceEvaluations: [],
      }
    }

    // Sort by overall score (highest first)
    sourceEvaluations.sort((a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore)

    // Return result with evaluations sorted by score (best first)
    return {
      sourceEvaluations,
    }
  }
}

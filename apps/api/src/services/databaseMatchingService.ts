import type {
  APIMatchingSettings,
  ExternalSource,
  MatchingReference,
  MatchingResult,
  SourceEvaluation,
  UserAISettings,
} from '@source-taster/types'
import process from 'node:process'
import { BaseMatchingService } from './baseMatchingService'
import { ArxivService } from './databases/arxivService'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'
import { SemanticScholarService } from './databases/semanticScholarService'

export class DatabaseMatchingService extends BaseMatchingService {
  private readonly databaseServices = [
    { name: 'OpenAlex', service: new OpenAlexService() },
    { name: 'Crossref', service: new CrossrefService() },
    { name: 'EuropePMC', service: new EuropePmcService() },
    { name: 'Semantic Scholar', service: new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY) },
    { name: 'ArXiv', service: new ArxivService() },
  ]

  constructor() {
    super()
  }

  async matchReference(
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<MatchingResult> {
    const { earlyTermination } = matchingSettings.matchingConfig

    const sourceEvaluations = earlyTermination.enabled
      ? await this.matchWithEarlyTermination(reference, matchingSettings, aiSettings)
      : await this.matchAllSources(reference, matchingSettings, aiSettings)

    return this.buildMatchingResult(sourceEvaluations)
  }

  private async matchWithEarlyTermination(
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation[]> {
    const { threshold } = matchingSettings.matchingConfig.earlyTermination
    const sourceEvaluations: SourceEvaluation[] = []

    for (const { service } of this.databaseServices) {
      const evaluation = await this.tryEvaluateDatabase(reference, service, matchingSettings, aiSettings)

      if (!evaluation) {
        continue // Skip failed database
      }

      sourceEvaluations.push(evaluation)

      if (this.shouldTerminateEarly(evaluation, threshold)) {
        break
      }
    }

    return sourceEvaluations
  }

  private async tryEvaluateDatabase(
    reference: MatchingReference,
    service: any,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation | null> {
    try {
      return await this.evaluateDatabase(reference, service, matchingSettings, aiSettings)
    }
    catch {
      return null // Database failed, return null to continue with next
    }
  }

  private async evaluateDatabase(
    reference: MatchingReference,
    service: any,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation | null> {
    const source = await service.search(reference.metadata)

    if (!source) {
      return null
    }

    return await this.evaluateSource(reference, source, matchingSettings, aiSettings)
  }

  private shouldTerminateEarly(evaluation: SourceEvaluation, threshold: number): boolean {
    return evaluation.matchDetails.overallScore >= threshold
  }

  private async matchAllSources(
    reference: MatchingReference,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation[]> {
    const sources = await this.searchAllDatabases(reference)

    if (sources.length === 0) {
      return []
    }

    return await this.evaluateAllSources(reference, sources, matchingSettings, aiSettings)
  }

  private async searchAllDatabases(reference: MatchingReference): Promise<ExternalSource[]> {
    const searchPromises = this.databaseServices.map(({ service }) =>
      this.trySearchDatabase(service, reference.metadata),
    )

    const results = await Promise.allSettled(searchPromises)

    return this.extractSuccessfulSources(results)
  }

  private async trySearchDatabase(service: any, metadata: any): Promise<ExternalSource | null> {
    try {
      return await service.search(metadata)
    }
    catch {
      return null
    }
  }

  private extractSuccessfulSources(results: PromiseSettledResult<ExternalSource | null>[]): ExternalSource[] {
    return results
      .filter((result): result is PromiseFulfilledResult<ExternalSource> =>
        result.status === 'fulfilled' && !!result.value,
      )
      .map(result => result.value)
  }

  private async evaluateAllSources(
    reference: MatchingReference,
    sources: ExternalSource[],
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation[]> {
    const evaluationPromises = sources.map(source =>
      this.tryEvaluateSource(reference, source, matchingSettings, aiSettings),
    )

    const results = await Promise.allSettled(evaluationPromises)

    return this.extractSuccessfulEvaluations(results)
  }

  private async tryEvaluateSource(
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation | null> {
    try {
      return await this.evaluateSource(reference, source, matchingSettings, aiSettings)
    }
    catch {
      return null
    }
  }

  private extractSuccessfulEvaluations(results: PromiseSettledResult<SourceEvaluation | null>[]): SourceEvaluation[] {
    return results
      .filter((result): result is PromiseFulfilledResult<SourceEvaluation> =>
        result.status === 'fulfilled' && !!result.value,
      )
      .map(result => result.value)
  }

  private async evaluateSource(
    reference: MatchingReference,
    source: ExternalSource,
    matchingSettings: APIMatchingSettings,
    aiSettings: UserAISettings,
  ): Promise<SourceEvaluation> {
    const matchResult = await this.matchWithAI(reference, source, matchingSettings, aiSettings)
    return {
      source,
      matchDetails: matchResult.details,
    }
  }

  private buildMatchingResult(sourceEvaluations: SourceEvaluation[]): MatchingResult {
    if (sourceEvaluations.length === 0) {
      return { sourceEvaluations: [] }
    }

    // Sort by overall score (highest first)
    const sortedEvaluations = [...sourceEvaluations].sort(
      (a, b) => b.matchDetails.overallScore - a.matchDetails.overallScore,
    )

    return { sourceEvaluations: sortedEvaluations }
  }
}

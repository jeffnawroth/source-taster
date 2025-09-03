import type {
  ExternalSource,
  MatchingReference,
} from '@source-taster/types'
import process from 'node:process'
import { ArxivService } from './databases/arxivService'
import { CrossrefService } from './databases/crossrefService'
import { EuropePmcService } from './databases/europePmcService'
import { OpenAlexService } from './databases/openAlexService'
import { SemanticScholarService } from './databases/semanticScholarService'

/**
 * Service responsible for searching references in external databases
 * This service only handles the search phase, not the matching/evaluation
 */
export class DatabaseSearchService {
  private readonly databaseServices = [
    { name: 'OpenAlex', service: new OpenAlexService() },
    { name: 'Crossref', service: new CrossrefService() },
    { name: 'EuropePMC', service: new EuropePmcService() },
    { name: 'Semantic Scholar', service: new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY) },
    { name: 'ArXiv', service: new ArxivService() },
  ]

  constructor() {
    // Initialize service
  }

  /**
   * Search for a reference in all configured databases
   * @param reference The reference to search for
   * @returns Array of external sources found across all databases
   */
  async searchAllDatabases(reference: MatchingReference): Promise<ExternalSource[]> {
    const candidates: ExternalSource[] = []

    // Search in all databases in parallel for better performance
    const searchPromises = this.databaseServices.map(async ({ name, service }) => {
      try {
        console.warn(`DatabaseSearchService: Searching in ${name} for reference ${reference.id}`)
        const result = await service.search(reference.metadata)

        if (result) {
          console.warn(`DatabaseSearchService: Found result in ${name}:`, result.id)
          return result
        }
        else {
          console.warn(`DatabaseSearchService: No result found in ${name}`)
          return null
        }
      }
      catch (error) {
        console.error(`DatabaseSearchService: Error searching in ${name}:`, error)
        return null
      }
    })

    // Wait for all searches to complete
    const results = await Promise.all(searchPromises)

    // Filter out null results and add to candidates
    for (const result of results) {
      if (result) {
        candidates.push(result)
      }
    }

    console.warn(`DatabaseSearchService: Found ${candidates.length} total candidates for reference ${reference.id}`)
    return candidates
  }
}

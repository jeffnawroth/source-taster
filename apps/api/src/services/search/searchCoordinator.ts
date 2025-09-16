import type {
  ApiSearchReference,
  ApiSearchResult,
} from '@source-taster/types'
import process from 'node:process'
import { httpBadRequest, httpNotFound } from '../../errors/http'
import { ArxivProvider } from './providers/arxivProvider'
import { CrossrefProvider } from './providers/crossrefProvider'
import { EuropePmcProvider } from './providers/europePmcProvider'
import { OpenAlexProvider } from './providers/openAlexProvider'
import { SemanticScholarProvider } from './providers/semanticScholarProvider'

interface DatabaseInfo {
  name: string
  service: any
  priority: number
}

export class SearchCoordinator {
  private readonly databaseServices: DatabaseInfo[] = [
    { name: 'openalex', service: new OpenAlexProvider(), priority: 1 },
    { name: 'crossref', service: new CrossrefProvider(), priority: 2 },
    { name: 'semanticscholar', service: new SemanticScholarProvider(process.env.SEMANTIC_SCHOLAR_API_KEY), priority: 3 },
    { name: 'europepmc', service: new EuropePmcProvider(), priority: 4 },
    { name: 'arxiv', service: new ArxivProvider(), priority: 5 },
  ]

  public async searchSingleDatabase(
    references: ApiSearchReference[],
    databaseName: string,
  ): Promise<ApiSearchResult[]> {
    const databaseInfo = this.databaseServices.find(db => db.name.toLowerCase() === databaseName.toLowerCase())

    if (!databaseInfo) {
      const available = this.databaseServices.map(db => db.name).join(', ')
      httpNotFound(`Database '${databaseName}' not found. Available: ${available}`)
    }

    const results: ApiSearchResult[] = []
    for (const reference of references) {
      if (!reference?.metadata) {
        httpBadRequest(`Missing metadata for reference ${reference?.id ?? '<unknown>'}`)
      }

      const candidate = await this.searchSingleDatabaseForSingle(reference, databaseInfo!)
      results.push({ referenceId: reference.id, candidates: candidate ? [candidate] : [] })
    }

    return results
  }

  private async searchSingleDatabaseForSingle(
    reference: ApiSearchReference,
    databaseInfo: DatabaseInfo,
  ) {
    try {
      const result = await databaseInfo.service.search(reference.metadata)
      return result ?? null
    }
    catch {
      return null
    }
  }
}

export const searchCoordinator = new SearchCoordinator()
export default searchCoordinator

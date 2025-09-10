import type {
  ApiSearchCandidate,
  ApiSearchReference,
  ApiSearchResult,
} from '@source-taster/types'
import process from 'node:process'
import { httpBadRequest, httpNotFound } from '../../errors/http'
import { ArxivService } from './providers/arxivProvider'
import { CrossrefService } from './providers/crossrefProvider'
import { EuropePmcService } from './providers/europePmcProvider'
import { OpenAlexService } from './providers/openAlexProvider'
import { SemanticScholarService } from './providers/semanticScholarProvider'

interface DatabaseInfo {
  name: string
  service: any
  priority: number
}

export class SearchCoordinator {
  private readonly databaseServices: DatabaseInfo[] = [
    { name: 'openalex', service: new OpenAlexService(), priority: 1 },
    { name: 'crossref', service: new CrossrefService(), priority: 2 },
    { name: 'semanticscholar', service: new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY), priority: 3 },
    { name: 'europepmc', service: new EuropePmcService(), priority: 4 },
    { name: 'arxiv', service: new ArxivService(), priority: 5 },
  ]

  public async searchAllDatabases(references: ApiSearchReference[]): Promise<ApiSearchResult[]> {
    const results: ApiSearchResult[] = []

    for (const reference of references) {
      if (!reference?.metadata) {
        httpBadRequest(`Missing metadata for reference ${reference?.id ?? '<unknown>'}`)
      }

      const candidates = await this.searchAllDatabasesForSingle(reference)
      results.push({ referenceId: reference.id, candidates })
    }

    return results
  }

  public async searchSingleDatabase(
    references: ApiSearchReference[],
    databaseName: string,
  ): Promise<ApiSearchResult[]> {
    const databases = this.getDatabasesByPriority()
    const databaseInfo = databases.find(db => db.name.toLowerCase() === databaseName.toLowerCase())

    if (!databaseInfo) {
      const available = databases.map(db => db.name).join(', ')
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

  public async getDatabases() {
    const databases = this.getDatabasesByPriority()
    const databaseList = databases.map(db => ({
      name: db.name,
      priority: db.priority,
      endpoint: `/api/search/${db.name}`,
    }))

    return { databases: databaseList, total: databaseList.length }
  }

  private getDatabasesByPriority(): DatabaseInfo[] {
    return [...this.databaseServices].sort((a, b) => a.priority - b.priority)
  }

  private async searchAllDatabasesForSingle(reference: ApiSearchReference): Promise<ApiSearchCandidate[]> {
    const searchPromises = this.databaseServices.map(async ({ service }) => {
      try {
        const result = await service.search(reference.metadata)
        return result ?? null
      }
      catch {
        return null
      }
    })

    const results = await Promise.all(searchPromises)
    return results.filter((r): r is ApiSearchCandidate => !!r)
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

import type { Span } from '@opentelemetry/api'
import type {
  ApiSearchReference,
  ApiSearchResult,
} from '@source-taster/types'
import process from 'node:process'
import { trace } from '@opentelemetry/api'
import { httpBadRequest, httpNotFound } from '../../errors/http.js'
import { searchDurationSeconds, searchesTotal } from '../../middleware/metrics.js'
import { ArxivProvider } from './providers/arxivProvider.js'
import { CrossrefProvider } from './providers/crossrefProvider.js'
import { EuropePmcProvider } from './providers/europePmcProvider.js'
import { OpenAlexProvider } from './providers/openAlexProvider.js'
import { SemanticScholarProvider } from './providers/semanticScholarProvider.js'

const tracer = trace.getTracer('source-taster-api', '2.1.3')

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
    return tracer.startActiveSpan(
      `search.${databaseInfo.name}`,
      { attributes: { 'db.system': databaseInfo.name } },
      async (span: Span) => {
        const start = Date.now()
        let status = 'error'
        try {
          const result = await databaseInfo.service.search(reference.metadata)
          span.setAttribute('search.result', result ? 'found' : 'not_found')
          status = result ? 'success' : 'not_found'
          return result ?? null
        }
        catch (e) {
          span.recordException(e as Error)
          return null
        }
        finally {
          const duration = (Date.now() - start) / 1000
          span.setAttribute('search.duration_seconds', duration)
          searchesTotal.inc({ provider: databaseInfo.name, status })
          searchDurationSeconds.observe({ provider: databaseInfo.name }, duration)
          span.end()
        }
      },
    )
  }
}

export const searchCoordinator = new SearchCoordinator()
export default searchCoordinator

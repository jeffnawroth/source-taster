import type {
  ApiSearchResult,
  MatchingReference,
} from '@source-taster/types'
import { DatabaseSearchService } from './databaseSearchService'

// Service instance
const databaseSearchService = new DatabaseSearchService()

/**
 * Search multiple references in all databases
 */
export async function searchAllDatabases(references: MatchingReference[]): Promise<ApiSearchResult[]> {
  const results: ApiSearchResult[] = []

  for (const reference of references) {
    console.warn(`SearchService: Searching for reference ${reference.id}`)
    const candidates = await databaseSearchService.searchAllDatabases(reference)

    results.push({
      referenceId: reference.id,
      candidates,
    })
  }

  console.warn(`SearchService: Search completed, returning ${results.length} results`)
  return results
}

/**
 * Search multiple references in a specific database
 */
export async function searchSingleDatabase(
  references: MatchingReference[],
  databaseName: string,
): Promise<ApiSearchResult[]> {
  const databases = databaseSearchService.getDatabasesByPriority()
  const databaseInfo = databases.find(db =>
    db.name.toLowerCase() === databaseName.toLowerCase(),
  )

  if (!databaseInfo) {
    throw new Error(`Database '${databaseName}' not found. Available databases: ${databases.map(db => db.name).join(', ')}`)
  }

  const results: ApiSearchResult[] = []

  for (const reference of references) {
    console.warn(`SearchService: Searching for reference ${reference.id} in ${databaseInfo.name}`)
    const candidate = await databaseSearchService.searchSingleDatabase(reference, databaseInfo)

    results.push({
      referenceId: reference.id,
      candidates: candidate ? [candidate] : [],
    })
  }

  console.warn(`SearchService: Single database search completed for ${results.length} references in ${databaseInfo.name}`)
  return results
}

/**
 * Get list of available databases
 */
export async function getDatabases() {
  const databases = databaseSearchService.getDatabasesByPriority()
  const databaseList = databases.map(db => ({
    name: db.name,
    priority: db.priority,
    endpoint: `/api/search/${db.name}`,
  }))

  return {
    databases: databaseList,
    total: databaseList.length,
  }
}

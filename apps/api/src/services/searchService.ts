import type {
  MatchingReference,
  SearchResult,
} from '@source-taster/types'
import { DatabaseSearchService } from './databaseSearchService'

// Service instance
const databaseSearchService = new DatabaseSearchService()

/**
 * Search a single reference in all databases
 */
export async function searchAllDatabases(reference: MatchingReference): Promise<SearchResult> {
  const candidates = await databaseSearchService.searchAllDatabases(reference)

  return {
    referenceId: reference.id,
    candidates,
  }
}

/**
 * Search a single reference in a specific database
 */
export async function searchSingleDatabase(
  reference: MatchingReference,
  databaseName: string,
): Promise<SearchResult> {
  const databases = databaseSearchService.getDatabasesByPriority()
  const databaseInfo = databases.find(db =>
    db.name.toLowerCase() === databaseName.toLowerCase(),
  )

  if (!databaseInfo) {
    throw new Error(`Database '${databaseName}' not found. Available databases: ${databases.map(db => db.name).join(', ')}`)
  }

  console.warn(`SearchService: Searching for reference ${reference.id} in ${databaseInfo.name}`)
  const candidate = await databaseSearchService.searchSingleDatabase(reference, databaseInfo)

  return {
    referenceId: reference.id,
    candidates: candidate ? [candidate] : [],
  }
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

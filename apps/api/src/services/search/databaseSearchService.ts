// import type {
//   ApiMatchReference,
//   ApiSearchCandidate,
// } from '@source-taster/types'
// import process from 'node:process'
// import { ArxivService } from './providers/arxivProvider'
// import { CrossrefService } from './providers/crossrefProvider'
// import { EuropePmcService } from './providers/europePmcProvider'
// import { OpenAlexService } from './providers/openAlexProvider'
// import { SemanticScholarService } from './providers/semanticScholarProvider'

// interface DatabaseInfo {
//   name: string
//   service: any
//   priority: number
// }

// /**
//  * Service responsible for searching references in external databases
//  * This service only handles the search phase, not the matching/evaluation
//  */
// export class DatabaseSearchService {
//   private readonly databaseServices: DatabaseInfo[] = [
//     { name: 'openalex', service: new OpenAlexService(), priority: 1 },
//     { name: 'crossref', service: new CrossrefService(), priority: 2 },
//     { name: 'semanticscholar', service: new SemanticScholarService(process.env.SEMANTIC_SCHOLAR_API_KEY), priority: 3 },
//     { name: 'europepmc', service: new EuropePmcService(), priority: 4 },
//     { name: 'arxiv', service: new ArxivService(), priority: 5 },
//   ]

//   constructor() {
//     // Initialize service
//   }

//   /**
//    * Search for a reference in all configured databases
//    * @param reference The reference to search for
//    * @returns Array of external sources found across all databases
//    */
//   async searchAllDatabases(reference: ApiMatchReference): Promise<ApiSearchCandidate[]> {
//     const candidates: ApiSearchCandidate[] = []

//     // Search in all databases in parallel for better performance
//     const searchPromises = this.databaseServices.map(async ({ name, service }) => {
//       try {
//         console.warn(`DatabaseSearchService: Searching in ${name} for reference ${reference.id}`)
//         const result = await service.search(reference.metadata)

//         if (result) {
//           console.warn(`DatabaseSearchService: Found result in ${name}:`, result.id)
//           return result
//         }
//         else {
//           console.warn(`DatabaseSearchService: No result found in ${name}`)
//           return null
//         }
//       }
//       catch (error) {
//         console.error(`DatabaseSearchService: Error searching in ${name}:`, error)
//         return null
//       }
//     })

//     // Wait for all searches to complete
//     const results = await Promise.all(searchPromises)

//     // Filter out null results and add to candidates
//     for (const result of results) {
//       if (result) {
//         candidates.push(result)
//       }
//     }

//     console.warn(`DatabaseSearchService: Found ${candidates.length} total candidates for reference ${reference.id}`)
//     return candidates
//   }

//   /**
//    * Get databases in priority order for custom search logic
//    * @returns Array of database services sorted by priority
//    */
//   getDatabasesByPriority() {
//     return [...this.databaseServices].sort((a, b) => a.priority - b.priority)
//   }

//   /**
//    * Search for a reference in a single specific database
//    * @param reference The reference to search for (can be Reference or MatchingReference)
//    * @param databaseInfo The database info object (name, displayName, service, priority)
//    * @returns External source if found, null otherwise
//    */
//   async searchSingleDatabase(
//     reference: ApiMatchReference,
//     databaseInfo: DatabaseInfo,
//   ): Promise<ApiSearchCandidate | null> {
//     const { name, service } = databaseInfo

//     try {
//       console.warn(`DatabaseSearchService: Searching in ${name} for reference ${reference.id}`)
//       const result = await service.search(reference.metadata)

//       if (result) {
//         console.warn(`DatabaseSearchService: Found result in ${name}:`, result.id)
//         return result
//       }
//       else {
//         console.warn(`DatabaseSearchService: No result found in ${name}`)
//         return null
//       }
//     }
//     catch (error) {
//       console.error(`DatabaseSearchService: Error searching in ${name}:`, error)
//       return null
//     }
//   }
// }

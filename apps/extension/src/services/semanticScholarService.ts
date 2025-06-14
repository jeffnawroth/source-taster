// import type { FullPaper } from '../api/semantic-scholar'
// import type { ReferenceMetadata } from '../types'
// import fetchRetry from 'fetch-retry'
// import PQueue from 'p-queue'
// import { Configuration, PaperDataApi } from '../api/semantic-scholar'

// // Fetch mit Retry-Mechanismus
// const fetchWithRetry = fetchRetry(fetch, {
//   retries: 3,
//   retryDelay: attempt => 2 ** attempt * 1000 + Math.random() * 1000,
//   retryOn: [429, 500, 503],
// })

// const config = new Configuration({
//   basePath: 'https://api.semanticscholar.org/graph/v1',
//   fetchApi: fetchWithRetry,
// })

// const client = new PaperDataApi(config)

// // Request-Queue (Concurrency 1, 1 Sekunde Abstand)
// const queue = new PQueue({
//   concurrency: 1,
//   interval: 1000,
//   intervalCap: 1,
//   autoStart: true,
// })

// export async function searchSemanticScholarPapers(query: string, fields: string, limit: number): Promise<FullPaper[]> {
//   return queue.add(async () => {
//     try {
//       const response = await client.getGraphPaperRelevanceSearch({
//         query,
//         fields,
//         limit,
//       })
//       return response.data || []
//     }
//     catch (error) {
//       console.error('Semantic Scholar API Error:', error)
//       return []
//     }
//   }) as Promise<FullPaper[]>
// }

// export async function searchSemanticScholarWork(meta: ReferenceMetadata): Promise<FullPaper | null> {
//   const query = meta.title || ''
//   if (!query.trim())
//     return null

//   const fields = 'title,authors,year,publicationDate,journal,url'
//   const limit = 1

//   const papers = await searchSemanticScholarPapers(query, fields, limit)
//   return papers.length > 0 ? papers[0] : null
// }

// import type { FullPaper } from '../api/semantic-scholar'
// import type { ReferenceMetadata } from '../types'
// import { useMemoize } from '@vueuse/core'
// import PQueue from 'p-queue'
// import { acceptHMRUpdate, defineStore } from 'pinia'
// import { searchSemanticScholarPapers, searchSemanticScholarWork } from '../services/semanticScholarService'

// const queue = new PQueue({
//   concurrency: 1,
//   interval: 1000,
//   intervalCap: 1,
//   autoStart: true,
// })

// export const useSemanticScholarStore = defineStore('semantic-scholar', () => {
//   const memoizedSearchPapers = useMemoize(
//     async (query: string, fields: string, limit: number): Promise<FullPaper[]> => {
//       return await searchSemanticScholarPapers(query, fields, limit)
//     },
//   )

//   const memoizedSearchWork = useMemoize(
//     async (meta: ReferenceMetadata): Promise<FullPaper | null> => {
//       try {
//         return await searchSemanticScholarWork(meta)
//       }
//       catch (error) {
//         console.error('Semantic Scholar Store Error:', error)
//         return null
//       }
//     },
//     {
//       getKey: (meta: ReferenceMetadata) => meta.title || '',
//     },
//   )

//   function getQueueStatus() {
//     return {
//       size: queue.size,
//       pending: queue.pending,
//       isPaused: queue.isPaused,
//     }
//   }

//   function clearCache() {
//     memoizedSearchPapers.cache.clear()
//     memoizedSearchWork.cache.clear()
//   }

//   return {
//     searchSemanticScholarWork: memoizedSearchWork,
//     searchSemanticScholarPapers: memoizedSearchPapers,
//     getQueueStatus,
//     clearCache,
//   }
// })

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useSemanticScholarStore, import.meta.hot))
// }

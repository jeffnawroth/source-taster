import type { Work, WorksGetRequest } from '@/extension/clients/crossref-client'
import type { ReferenceMetadata } from '../types'
import { Configuration, WorksApi } from '@/extension/clients/crossref-client'
import { useMemoize } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

const config = new Configuration({
  basePath: 'https://api.crossref.org',
  headers: {
    'User-Agent': import.meta.env.VITE_USER_AGENT,
    'mailto': import.meta.env.VITE_MAILTO,
  },
})

export const useCrossrefStore = defineStore('crossref', () => {
  const api = new WorksApi(config)
  const isLoading = ref(false)

  // Memoized works function to avoid duplicate API calls
  const memoizedGetWorks = useMemoize(
    async (query: string, filter?: string, select?: string, rows?: number, sort?: string) => {
      isLoading.value = true
      try {
        const response = await api.worksGet({
          query,
          filter,
          select,
          rows,
          sort,
        })

        if (response.status !== 'ok') {
          return Promise.reject(response)
        }

        return response.message.items || []
      }
      catch (error) {
        console.error('Crossref API Error:', error)
        return []
      }
      finally {
        isLoading.value = false
      }
    },
  )

  async function getWorks(query?: WorksGetRequest): Promise<Work[]> {
    // If we have complex query parameters, delegate to the non-memoized version
    if (typeof query !== 'object' || Object.keys(query).length === 0) {
      return []
    }

    // Extract and normalize parameters for memoization key generation
    const { query: queryParam, filter, select, rows, sort } = query
    return memoizedGetWorks(queryParam || '', filter, select, rows, sort)
  }

  // Memoize DOI lookups
  const memoizedGetWorkByDOI = useMemoize(
    async (doi: string): Promise<Work | null> => {
      isLoading.value = true
      try {
        const response = await api.worksDoiGet({
          doi,
        })

        if (response.status !== 'ok') {
          return Promise.reject(response)
        }

        return response.message
      }
      catch (error) {
        console.error('Crossref DOI API Error:', error)
        return null
      }
      finally {
        isLoading.value = false
      }
    },
  )

  async function getWorkByDOI(doi: string): Promise<Work | null> {
    return memoizedGetWorkByDOI(doi)
  }

  // Memoize reference metadata searches
  const searchCrossrefWork = useMemoize(
    async (meta: ReferenceMetadata): Promise<Work | null> => {
      const params = [meta.title, ...(meta.authors ?? []), meta.journal, meta.year]
      const queryBibliographic = params.filter(Boolean).join(' ')
      const query = params ? `query.bibliographic=${queryBibliographic}` : undefined

      // The filter is constructed by checking if the year is present in the metadata.
      const filterParams = [
        meta.year ? `from-pub-date:${meta.year}-01-01,until-pub-date:${meta.year}-12-31` : undefined,
      ]
      const filter = filterParams.filter(Boolean).join(',')

      const select = [
        'title',
        'author',
        'issued',
        'published',
        'published-print',
        'published-online',
        'DOI',
        'container-title',
        'volume',
        'issue',
        'page',
        'URL',
      ].join(',')

      const rows = 1

      const sort = 'score'

      const works = await getWorks({ query, filter, select, rows, sort })

      return works[0] || null
    },
    {
      // Use title as the cache key
      getKey: (meta: ReferenceMetadata) => meta.title || '',
    },
  )

  return {
    getWorks,
    getWorkByDOI,
    searchCrossrefWork,
    isLoading,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCrossrefStore, import.meta.hot))
}

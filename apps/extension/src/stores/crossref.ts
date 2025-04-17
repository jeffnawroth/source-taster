import type { Work, WorksGetRequest } from '@/extension/crossref-client'
import { Configuration, WorksApi } from '@/extension/crossref-client'
import { acceptHMRUpdate, defineStore } from 'pinia'

const config = new Configuration({
  basePath: 'https://api.crossref.org',
})

const DEFAULT_QUERY_PARAMS = {
  mailto: import.meta.env.VITE_CROSSREF_MAILTO,
}

export const useCrossrefStore = defineStore('crossref', () => {
  const api = new WorksApi(config)

  async function getWorks(query?: WorksGetRequest): Promise<Work[]> {
    try {
      const response = await api.worksGet({
        ...DEFAULT_QUERY_PARAMS,
        ...query,
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
  }
  return { getWorks }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCrossrefStore, import.meta.hot))
}

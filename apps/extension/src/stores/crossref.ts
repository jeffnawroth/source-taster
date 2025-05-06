import type { Work, WorksGetRequest } from '@/extension/clients/crossref-client'
import type { ReferenceMetadata } from '../types'
import { Configuration, WorksApi } from '@/extension/clients/crossref-client'
import { acceptHMRUpdate, defineStore } from 'pinia'

const config = new Configuration({
  basePath: 'https://api.crossref.org',
  headers: {
    'User-Agent': import.meta.env.VITE_CROSSREF_USER_AGENT,
    'mailto': import.meta.env.VITE_CROSSREF_MAILTO,
  },
})

export const useCrossrefStore = defineStore('crossref', () => {
  const api = new WorksApi(config)

  async function getWorks(query?: WorksGetRequest): Promise<Work[]> {
    try {
      const response = await api.worksGet({
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

  async function getWorkByDOI(doi: string): Promise<Work | null> {
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
      console.error('', error)
      return null
    }
  }

  async function searchCrossrefWork(meta: ReferenceMetadata): Promise<Work | null> {
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
  }
  return { getWorks, getWorkByDOI, searchCrossrefWork }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCrossrefStore, import.meta.hot))
}

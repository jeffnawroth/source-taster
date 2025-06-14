import type { PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { Configuration, WorksApi } from '@/extension/api/crossref'
import { mapCrossrefToPublication } from '../utils/metadataMapper'

const config = new Configuration({
  basePath: 'https://api.crossref.org',
  headers: {
    'User-Agent': import.meta.env.VITE_USER_AGENT,
    'mailto': import.meta.env.VITE_MAILTO,
  },
})

const api = new WorksApi(config)

/**
 * Searches for a publication in Crossref based on the provided reference metadata.
 * @param {ReferenceMetadata} referenceMetadata - The metadata of the reference to search for.
 * @returns {Promise<PublicationMetadata | null>} - The publication metadata if found, otherwise null.
 */
export const searchCrossrefPublication = useMemoize(
  async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
    try {
      const params = [referenceMetadata.title, ...(referenceMetadata.authors ?? []), referenceMetadata.journal, referenceMetadata.year]
      const queryBibliographic = params.filter(Boolean).join(' ')
      const query = params ? `query.bibliographic=${queryBibliographic}` : undefined

      const filterParams = [
        referenceMetadata.year ? `from-pub-date:${referenceMetadata.year}-01-01,until-pub-date:${referenceMetadata.year}-12-31` : undefined,
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

      const works = await api.worksGet({ query, filter, select, rows, sort })

      if (works.status !== 'ok') {
        throw new Error(`HTTP error! status: ${works.status}`)
      }

      return mapCrossrefToPublication(works.message.items[0]) || null
    }
    catch (error) {
      console.error('Error searching Crossref publication:', error)
      return null
    }
  },
)

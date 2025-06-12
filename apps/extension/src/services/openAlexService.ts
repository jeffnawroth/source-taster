import type { PublicationMetadata, ReferenceMetadata } from '../types'
import { OpenAlexApi } from '../api/open-alex'
import { mapOpenAlexToPublication } from '../utils/metadataMapper'

const client = new OpenAlexApi()

/**
 * Searches for a publication in OpenAlex based on the provided reference metadata.
 * @param {ReferenceMetadata} referenceMetadata - The metadata of the reference to search for.
 * @returns {Promise<PublicationMetadata | null>} - The publication metadata if found, otherwise null.
 */
export async function searchPublication(referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> {
  if (!referenceMetadata.title) {
    return null
  }

  const search = referenceMetadata.title
  const filter = referenceMetadata.year ? `publication_year:${referenceMetadata.year}` : undefined
  const page = 1
  const perPage = 1
  const select = 'biblio,title,doi,publication_year,id,authorships,primary_location'

  const works = await client.getWorks({
    search,
    filter,
    perPage,
    page,
    mailto: import.meta.env.VITE_MAILTO,
    userAgent: import.meta.env.VITE_USER_AGENT,
    select,
  })

  if (!works.results?.length) {
    return null
  }

  return mapOpenAlexToPublication(works.results[0])
}

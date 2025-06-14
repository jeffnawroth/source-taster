// src/services/europePmcService.ts

import type { EuropePmcPublicationsResponse, PublicationMetadata, ReferenceMetadata } from '../types'
import { useMemoize } from '@vueuse/core'
import { Configuration, EuropePMCArticlesRESTfulAPIApi } from '../api/europe-pmc'
import { mapEuropePMCToPublication } from '../utils/metadataMapper'

const config = new Configuration({
  basePath: 'https://www.ebi.ac.uk/europepmc/webservices/rest',
})

const client = new EuropePMCArticlesRESTfulAPIApi(config)

/**
 * Searches for a publication in the Europe PMC API using the provided reference metadata.
 * @param {ReferenceMetadata} referenceMetadata - The metadata of the reference to search for.
 * @returns {Promise<PublicationMetadata | null>} - The publication metadata if found, otherwise null.
 */
export const searchEuropePmcPublication = useMemoize(async (referenceMetadata: ReferenceMetadata): Promise<PublicationMetadata | null> => {
  if (!referenceMetadata.title) {
    return null
  }

  try {
    const response = await client.search({
      query: referenceMetadata.title,
      pageSize: 1,
      format: 'json',
      email: import.meta.env.VITE_MAILTO,
    }) as EuropePmcPublicationsResponse

    if (!response.resultList?.result?.length) {
      return null
    }

    return mapEuropePMCToPublication(response.resultList.result[0])
  }
  catch (error) {
    console.error('Error searching Europe PMC:', error)
    return null
  }
})

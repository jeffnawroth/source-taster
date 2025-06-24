import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class OpenAlexService {
  private baseUrl = 'https://api.openalex.org'

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Build search query
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      const response = await fetch(url)
      const data = await response.json() as any

      if (data.results && data.results.length > 0) {
        const work = data.results[0] // Only take the first (and only) result
        return {
          id: work.id,
          source: 'openalex',
          metadata: this.parseOpenAlexWork(work),
          url: work.id,
        }
      }
    }
    catch (error) {
      console.error('OpenAlex search error:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    if (metadata.title) {
      params.append('search', metadata.title)
    }

    // if (metadata.doi) {
    //   params.append('filter', `doi:${metadata.doi}`)
    // }

    if (metadata.year) {
      params.append('filter', `publication_year:${metadata.year}`)
    }

    // Only return the best match
    params.append('per-page', '1')
    params.append('page', '1')

    // Select only important properties to reduce response size
    params.append('select', 'id,title,authorships,primary_location,publication_year,doi,biblio')

    return params.toString()
  }

  /**
   * Parses the OpenAlex work object into a ReferenceMetadata object.
   * @param work The OpenAlex work object to parse.
   * @returns The parsed ReferenceMetadata object.
   */
  private parseOpenAlexWork(work: any): ReferenceMetadata {
    return {
      title: work.title,
      authors: work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean) || [],
      journal: work.primary_location?.source?.display_name,
      year: work.publication_year,
      doi: work.doi?.replace('https://doi.org/', ''),
      volume: work.biblio?.volume,
      issue: work.biblio?.issue,
      pages: work.biblio?.first_page && work.biblio?.last_page
        ? `${work.biblio.first_page}-${work.biblio.last_page}`
        : undefined,
    }
  }
}

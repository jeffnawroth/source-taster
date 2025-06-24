import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'
import process from 'node:process'

export class OpenAlexService {
  private baseUrl = 'https://api.openalex.org'
  private email = process.env.OPENALEX_EMAIL

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Build search query
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      // Warn if no email is configured for better performance
      if (!this.email || this.email === 'your-email@example.com') {
        console.warn('OpenAlex: No email configured - consider adding OPENALEX_EMAIL to .env for better API performance')
      }

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

    // Add email for better API performance (recommended by OpenAlex)
    if (this.email && this.email !== 'your-email@example.com') {
      params.append('mailto', this.email)
    }

    return params.toString()
  }

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

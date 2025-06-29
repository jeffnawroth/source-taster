import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'
import process from 'node:process'

export class OpenAlexService {
  private baseUrl = 'https://api.openalex.org'
  private mailto: string | undefined

  constructor(mailto?: string) {
    this.mailto = mailto || process.env.OPENALEX_MAILTO
  }

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.doi) {
        const directResult = await this.searchByDOI(metadata.doi)
        if (directResult)
          return directResult
      }

      // Fallback to query-based search
      return await this.searchByQuery(metadata)
    }
    catch (error) {
      console.error('OpenAlex search error:', error)
    }

    return null
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      // Clean DOI and construct direct URL
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      const fullDoi = cleanDoi.startsWith('https://doi.org/') ? cleanDoi : `https://doi.org/${cleanDoi}`

      // Build URL with polite pool if available
      const params = new URLSearchParams()
      if (this.mailto) {
        params.append('mailto', this.mailto)
      }

      const url = `${this.baseUrl}/works/${encodeURIComponent(fullDoi)}${params.toString() ? `?${params.toString()}` : ''}`

      console.warn(`OpenAlex: Searching by DOI: ${url}`)

      const response = await fetch(url)

      if (!response.ok) {
        return null // DOI not found, try query search
      }

      const work = await response.json() as any

      if (work && work.id) {
        return {
          id: work.id,
          source: 'openalex',
          metadata: this.parseOpenAlexWork(work),
          url: work.id,
        }
      }
    }
    catch (error) {
      console.error('OpenAlex DOI search error:', error)
    }

    return null
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      console.warn(`OpenAlex: Query search: ${url}`)

      const response = await fetch(url)
      const data = await response.json() as any

      // Always take the first result - trust OpenAlex ranking
      if (data.results && data.results.length > 0) {
        const work = data.results[0]
        return {
          id: work.id,
          source: 'openalex',
          metadata: this.parseOpenAlexWork(work),
          url: work.id,
        }
      }
    }
    catch (error) {
      console.error('OpenAlex query search error:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Use fielded search for more precise queries - following OpenAlex best practices
    const filters: string[] = []

    if (metadata.title) {
      // Use title.search filter for more precise title matching
      filters.push(`title.search:${metadata.title}`)
    }

    if (metadata.year) {
      // Exact year match
      filters.push(`publication_year:${metadata.year}`)
    }

    if (filters.length > 0) {
      params.append('filter', filters.join(','))
    }
    else {
      // Fallback if no filterable criteria available
      params.append('search', metadata.title || '*')
    }

    // Only get one result - trust OpenAlex ranking
    params.append('per-page', '1')
    params.append('page', '1')

    // Select only important properties to reduce response size and improve performance
    params.append('select', 'id,title,authorships,primary_location,publication_year,doi,biblio')

    // Add polite pool if available
    if (this.mailto) {
      params.append('mailto', this.mailto)
    }

    return params.toString()
  }

  /**
   * Parses the OpenAlex work object into a ReferenceMetadata object.
   * Only includes fields defined in the ReferenceMetadata interface.
   * @param work The OpenAlex work object to parse.
   * @returns The parsed ReferenceMetadata object.
   */
  private parseOpenAlexWork(work: any): ReferenceMetadata {
    const metadata: ReferenceMetadata = {}

    // Only include fields that exist in ReferenceMetadata interface
    if (work.title) {
      metadata.title = work.title
    }

    if (work.authorships?.length > 0) {
      const authors = work.authorships
        .map((a: any) => a.author?.display_name)
        .filter(Boolean)
      if (authors.length > 0) {
        metadata.authors = authors
      }
    }

    if (work.primary_location?.source?.display_name) {
      metadata.journal = work.primary_location.source.display_name
    }

    if (work.publication_year) {
      metadata.year = work.publication_year
    }

    if (work.doi) {
      // Clean DOI - remove https://doi.org/ prefix if present
      metadata.doi = work.doi.replace(/^https:\/\/doi\.org\//, '')
    }

    if (work.biblio?.volume) {
      metadata.volume = work.biblio.volume
    }

    if (work.biblio?.issue) {
      metadata.issue = work.biblio.issue
    }

    // Construct pages from first_page and last_page if available
    if (work.biblio?.first_page) {
      if (work.biblio.last_page && work.biblio.first_page !== work.biblio.last_page) {
        metadata.pages = `${work.biblio.first_page}-${work.biblio.last_page}`
      }
      else {
        metadata.pages = work.biblio.first_page
      }
    }

    return metadata
  }
}

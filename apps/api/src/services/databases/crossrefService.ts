import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class CrossrefService {
  private baseUrl = 'https://api.crossref.org'

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
      console.error('Crossref search error:', error)
    }

    return null
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      const url = `${this.baseUrl}/works/${encodeURIComponent(cleanDoi)}`

      console.warn(`Crossref: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return null // DOI not found, try query search
      }

      const data = await response.json() as any

      if (data.message) {
        const work = data.message
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.warn('Crossref DOI search failed:', error)
    }

    return null
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Build search query
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      console.warn(`Crossref: Query search: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Crossref API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any

      if (data.message?.items && data.message.items.length > 0) {
        const work = data.message.items[0] // Take the best match
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Simple title-based search - much more reliable than complex queries
    if (metadata.title) {
      // Search by title only - most papers have unique titles
      params.append('query', `query.title=${metadata.title}`)
    }
    else {
      // Fallback if no title available
      params.append('query', '*')
    }

    // Limit results and select fields
    params.append('rows', '1')
    params.append('sort', 'score')
    params.append('select', 'title,author,issued,published,DOI,container-title,volume,issue,page,URL')

    return params.toString()
  }

  private parseCrossrefWork(work: any): ReferenceMetadata {
    // Parse publication date
    let year: number | undefined
    const issued = work.issued || work.published || work['published-print'] || work['published-online']
    if (issued?.['date-parts']?.[0]?.[0]) {
      year = issued['date-parts'][0][0]
    }

    // Parse authors
    const authors = work.author?.map((author: any) => {
      if (author.given && author.family) {
        return `${author.given} ${author.family}`
      }
      return author.family || author.name || ''
    }).filter(Boolean) || []

    // Parse pages
    let pages: string | undefined
    if (work.page) {
      pages = work.page
    }

    return {
      title: Array.isArray(work.title) ? work.title[0] : work.title,
      authors,
      journal: Array.isArray(work['container-title']) ? work['container-title'][0] : work['container-title'],
      year,
      doi: work.DOI,
      volume: work.volume,
      issue: work.issue,
      pages,
      url: work.URL,
    }
  }
}

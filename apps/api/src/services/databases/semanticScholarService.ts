import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class SemanticScholarService {
  private baseUrl = 'https://api.semanticscholar.org/graph/v1'
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey
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
      console.error('Semantic Scholar search error:', error)
    }

    return null
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      // Add fields parameter to get all needed metadata
      const fields = 'paperId,title,authors,year,venue,citationCount,publicationDate,journal,url,openAccessPdf,externalIds'
      const url = `${this.baseUrl}/paper/DOI:${encodeURIComponent(cleanDoi)}?fields=${encodeURIComponent(fields)}`

      console.warn(`Semantic Scholar: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      })

      if (!response.ok) {
        return null // DOI not found, try query search
      }

      const work = await response.json() as any

      if (work && work.paperId) {
        return {
          id: work.paperId,
          source: 'semanticscholar',
          metadata: this.parseSemanticScholarWork(work),
          url: work.url || `https://www.semanticscholar.org/paper/${work.paperId}`,
        }
      }
    }
    catch (error) {
      console.warn('Semantic Scholar DOI search failed:', error)
    }

    return null
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/paper/search?${queryParams}`

      console.warn(`Semantic Scholar: Query search: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      })

      if (!response.ok) {
        throw new Error(`Semantic Scholar API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any

      if (data.data && data.data.length > 0) {
        const work = data.data[0] // Take the best match
        return {
          id: work.paperId,
          source: 'semanticscholar',
          metadata: this.parseSemanticScholarWork(work),
          url: work.url || `https://www.semanticscholar.org/paper/${work.paperId}`,
        }
      }
    }
    catch (error) {
      console.error('Semantic Scholar search error:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Simple title-based search - much more reliable than complex queries
    if (metadata.title) {
      params.append('query', metadata.title)
    }
    else {
      // Fallback if no title available
      params.append('query', '*')
    }

    // Get a few results for better matching
    params.append('limit', '5')
    params.append('offset', '0')

    // Select important fields to reduce response size and get needed data
    params.append('fields', 'paperId,title,authors,year,venue,citationCount,publicationDate,journal,url,openAccessPdf,externalIds')

    return params.toString()
  }

  private parseSemanticScholarWork(work: any): ReferenceMetadata {
    // Parse authors
    const authors = work.authors?.map((author: any) => author.name).filter(Boolean) || []

    // Parse year from multiple possible sources
    let year: number | undefined
    if (work.year) {
      year = work.year
    }
    else if (work.publicationDate) {
      const dateMatch = work.publicationDate.match(/(\d{4})/)
      if (dateMatch) {
        year = Number.parseInt(dateMatch[1])
      }
    }

    // Parse DOI from external IDs
    let doi: string | undefined
    if (work.externalIds?.DOI) {
      doi = work.externalIds.DOI
    }

    // Parse journal/venue
    const journal = work.journal?.name || work.venue

    // Parse volume and pages from journal object
    let volume: string | undefined
    let pages: string | undefined
    if (work.journal) {
      volume = work.journal.volume
      pages = work.journal.pages
    }

    // Parse URL (prefer PDF if available)
    let url: string | undefined
    if (work.openAccessPdf?.url) {
      url = work.openAccessPdf.url
    }
    else if (work.url) {
      url = work.url
    }
    else if (work.paperId) {
      url = `https://www.semanticscholar.org/paper/${work.paperId}`
    }

    return {
      title: work.title,
      authors,
      journal,
      year,
      doi,
      volume,
      issue: undefined, // Semantic Scholar doesn't typically provide issue in journal object
      pages,
      url,
    }
  }
}

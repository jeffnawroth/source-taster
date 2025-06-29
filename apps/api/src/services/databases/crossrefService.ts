import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'
import process from 'node:process'

export class CrossrefService {
  private baseUrl = 'https://api.crossref.org'
  private readonly mailto = process.env.CROSSREF_MAILTO || 'your-email@domain.com' // For the "polite pool" - better performance
  private readonly userAgent = `source-taster/1.0 (https://github.com/your-repo; mailto:${this.mailto})`

  constructor() {
    // Warn if no proper email is configured
    if (!process.env.CROSSREF_MAILTO || this.mailto === 'your-email@domain.com') {
      console.warn('⚠️  Crossref: No CROSSREF_MAILTO environment variable set. Consider setting it for better API performance.')
    }
  }

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
        if (directResult)
          return directResult
      }

      // Try bibliographic search first (most accurate for citation lookup)
      if (this.hasBibliographicData(metadata)) {
        const bibResult = await this.searchByBibliographic(metadata)
        if (bibResult)
          return bibResult
      }

      // Fallback to query-based search
      return await this.searchByQuery(metadata)
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return null
  }

  private hasBibliographicData(metadata: ReferenceMetadata): boolean {
    return !!(metadata.title && metadata.authors?.length && metadata.date.year)
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      const url = `${this.baseUrl}/works/${encodeURIComponent(cleanDoi)}`

      console.warn(`Crossref: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
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

  /**
   * Search using bibliographic query - most accurate for citation lookup
   * Uses query.bibliographic which includes titles, authors, ISSNs and publication years
   */
  private async searchByBibliographic(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const params = new URLSearchParams()

      // Build bibliographic query string
      const bibQuery = this.buildBibliographicQuery(metadata)
      params.append('query.bibliographic', bibQuery)

      // Add filters for better matching
      if (metadata.date.year) {
        params.append('filter', `from-pub-date:${metadata.date.year},until-pub-date:${metadata.date.year}`)
      }

      // Limit results and select relevant fields
      params.append('rows', '1') // Only need the best match
      params.append('sort', 'score')
      params.append('order', 'desc')
      params.append('select', 'title,author,issued,published,published-print,published-online,DOI,container-title,volume,issue,page,URL,type,publisher,abstract')
      params.append('mailto', this.mailto)

      const url = `${this.baseUrl}/works?${params.toString()}`
      console.warn(`Crossref: Bibliographic search: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw new Error(`Crossref API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any

      if (data.message?.items && data.message.items.length > 0) {
        // Take the first (best) result from Crossref's relevance ranking
        const work = data.message.items[0]
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.error('Crossref bibliographic search error:', error)
    }

    return null
  }

  private buildBibliographicQuery(metadata: ReferenceMetadata): string {
    const parts: string[] = []

    if (metadata.title) {
      // Clean title for better matching
      const cleanTitle = metadata.title.replace(/[^\w\s]/g, ' ').trim()
      parts.push(cleanTitle)
    }

    if (metadata.authors?.length) {
      // Add first author's surname for better matching
      const firstAuthor = metadata.authors[0]
      let surname: string | undefined
      if (typeof firstAuthor === 'string') {
        surname = (firstAuthor as string).split(' ').pop()
      }
      else {
        // Handle Author object structure
        surname = firstAuthor.lastName || firstAuthor.firstName
      }
      if (surname) {
        parts.push(surname)
      }
    }

    if (metadata.date.year) {
      parts.push(metadata.date.year.toString())
    }

    if (metadata.source.containerTitle) {
      parts.push(metadata.source.containerTitle)
    }

    return parts.join(' ')
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Build search query using field-specific queries for better accuracy
      const params = this.buildAdvancedSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${params}`

      console.warn(`Crossref: Advanced query search: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
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

  private buildAdvancedSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Use field-specific queries as recommended by Crossref API
    const fieldQueries: string[] = []

    if (metadata.title) {
      fieldQueries.push(`query.title=${encodeURIComponent(metadata.title)}`)
    }

    if (metadata.authors?.length) {
      // Use first author for query.author
      const firstAuthor = metadata.authors[0]
      const authorString = typeof firstAuthor === 'string'
        ? firstAuthor
        : `${firstAuthor.firstName || ''} ${firstAuthor.lastName || ''}`.trim()
      fieldQueries.push(`query.author=${encodeURIComponent(authorString)}`)
    }

    if (metadata.source.containerTitle) {
      fieldQueries.push(`query.container-title=${encodeURIComponent(metadata.source.containerTitle)}`)
    }

    // Combine field queries
    if (fieldQueries.length > 0) {
      params.append('query', fieldQueries.join('&'))
    }
    else {
      // Fallback for incomplete metadata
      params.append('query', '*')
    }

    // Add filters
    const filters: string[] = []
    if (metadata.date.year) {
      filters.push(`from-pub-date:${metadata.date.year}`)
      filters.push(`until-pub-date:${metadata.date.year}`)
    }

    if (filters.length > 0) {
      params.append('filter', filters.join(','))
    }

    // Optimize results
    params.append('rows', '1') // Only need the best match
    params.append('sort', 'relevance') // Use relevance scoring
    params.append('order', 'desc')
    params.append('select', 'title,author,issued,published,published-print,published-online,DOI,container-title,volume,issue,page,URL,type,publisher,abstract,is-referenced-by-count')
    params.append('mailto', this.mailto)

    return params.toString()
  }

  private parseCrossrefWork(work: any): ReferenceMetadata {
    // Parse publication date with priority order
    let year: number | undefined
    const dateFields = [
      work.issued,
      work.published,
      work['published-print'],
      work['published-online'],
      work['content-created'],
    ]

    for (const dateField of dateFields) {
      if (dateField?.['date-parts']?.[0]?.[0]) {
        year = dateField['date-parts'][0][0]
        break
      }
    }

    // Parse authors with better handling
    const authors = work.author?.map((author: any) => {
      const parts: string[] = []

      if (author.given)
        parts.push(author.given)
      if (author.family)
        parts.push(author.family)

      if (parts.length === 0) {
        return author.name || ''
      }

      return parts.join(' ')
    }).filter(Boolean) || []

    // Parse pages with better formatting
    let pages: string | undefined
    if (work.page) {
      pages = work.page
    }

    // Get the best available title
    const title = work.title?.[0] || work['short-title']?.[0] || work['original-title']?.[0]

    // Get the best available journal name
    const journal = work['container-title']?.[0] || work['short-container-title']?.[0]

    return {
      title,
      authors,
      date: {
        year,
      },
      source: {
        containerTitle: journal,
        volume: work.volume,
        issue: work.issue,
        pages,
      },
      identifiers: {
        doi: work.DOI,
      },
    }
  }
}

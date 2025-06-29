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

      // Try title match search (new, more accurate for exact titles)
      if (metadata.title) {
        const titleMatchResult = await this.searchByTitleMatch(metadata.title)
        if (titleMatchResult) {
          return titleMatchResult
        }
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
      // Only request fields we actually need (performance optimization per API tutorial)
      const fields = [
        'paperId',
        'title',
        'authors',
        'year',
        'venue',
        'journal',
        'publicationDate',
        'publicationVenue',
        'url',
        'externalIds',
      ].join(',')

      const url = `${this.baseUrl}/paper/DOI:${encodeURIComponent(cleanDoi)}?fields=${encodeURIComponent(fields)}`

      console.warn(`Semantic Scholar: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      })

      if (!response.ok) {
        return null // DOI not found, try other methods
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

  private async searchByTitleMatch(title: string): Promise<ExternalSource | null> {
    try {
      // Only request fields we actually need (performance optimization per API tutorial)
      const fields = [
        'paperId',
        'title',
        'authors',
        'year',
        'venue',
        'journal',
        'publicationDate',
        'publicationVenue',
        'url',
        'externalIds',
      ].join(',')

      const params = new URLSearchParams()
      params.append('query', title)
      params.append('fields', fields)

      const url = `${this.baseUrl}/paper/search/match?${params.toString()}`

      console.warn(`Semantic Scholar: Title match search: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      })

      if (response.ok) {
        const data = await response.json() as any
        // The match endpoint returns a single best match with a matchScore
        if (data && data.paperId) {
          return {
            id: data.paperId,
            source: 'semanticscholar',
            metadata: this.parseSemanticScholarWork(data),
            url: data.url || `https://www.semanticscholar.org/paper/${data.paperId}`,
          }
        }
      }
    }
    catch (error) {
      console.warn('Semantic Scholar title match search failed:', error)
    }

    return null
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Try multiple search strategies for better coverage
      const searchQueries = []

      // Strategy 1: Author + Year + Key terms for better precision (most specific)
      if (metadata.authors?.[0] && metadata.year && metadata.title) {
        const authorLastName = metadata.authors[0].split(' ').pop()
        const keyTerms = metadata.title.toLowerCase()
          .split(' ')
          .filter(word => word.length > 2 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'].includes(word))
          .slice(0, 3) // Take first 3 key terms
        searchQueries.push(`${authorLastName} ${metadata.year} ${keyTerms.join(' ')}`)
      }

      // Strategy 2: Exact title
      if (metadata.title) {
        searchQueries.push(metadata.title)
      }

      // Strategy 3: Key terms only
      if (metadata.title) {
        const keyTerms = metadata.title.toLowerCase()
          .split(' ')
          .filter(word => word.length > 2 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'].includes(word))
        if (keyTerms.length > 0) {
          searchQueries.push(keyTerms.join(' '))
        }
      }

      // Try each search strategy
      for (const query of searchQueries) {
        const result = await this.performRelevanceSearch(query, metadata)
        if (result) {
          return result
        }
      }
    }
    catch (error) {
      console.error('Semantic Scholar search error:', error)
    }

    return null
  }

  private async performRelevanceSearch(query: string, metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const params = new URLSearchParams()
      params.append('query', query)
      params.append('limit', '1') // Only need the best match
      params.append('offset', '0')

      // Only request fields we actually need (performance optimization per API tutorial)
      const fields = [
        'paperId',
        'title',
        'authors',
        'year',
        'venue',
        'journal',
        'publicationDate',
        'publicationVenue',
        'url',
        'externalIds',
      ].join(',')
      params.append('fields', fields)

      // Add filters if we have additional metadata
      if (metadata.year) {
        // Allow some flexibility in year (±2 years)
        const startYear = metadata.year - 2
        const endYear = metadata.year + 2
        params.append('year', `${startYear}-${endYear}`)
      }

      const url = `${this.baseUrl}/paper/search?${params.toString()}`

      console.warn(`Semantic Scholar: Query search: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      })

      if (response.ok) {
        const data = await response.json() as any
        if (data.data && data.data.length > 0) {
          // Take the first result - Semantic Scholar's relevance ranking is reliable
          const work = data.data[0]
          return {
            id: work.paperId,
            source: 'semanticscholar',
            metadata: this.parseSemanticScholarWork(work),
            url: work.url || `https://www.semanticscholar.org/paper/${work.paperId}`,
          }
        }
      }
    }
    catch (error) {
      console.warn('Semantic Scholar relevance search failed:', error)
    }

    return null
  }

  private parseSemanticScholarWork(work: any): ReferenceMetadata {
    // Parse authors with enhanced handling
    const authors = work.authors?.map((author: any) => author.name).filter(Boolean) || []

    // Parse year from multiple possible sources with priority
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
    else if (work.publicationVenue?.name) {
      // Sometimes year is embedded in venue information
      const venueYearMatch = work.publicationVenue.name.match(/(\d{4})/)
      if (venueYearMatch) {
        year = Number.parseInt(venueYearMatch[1])
      }
    }

    // Parse DOI from external IDs with multiple sources
    let doi: string | undefined
    if (work.externalIds?.DOI) {
      doi = work.externalIds.DOI
    }

    // Parse journal/venue with enhanced logic
    let journal: string | undefined
    if (work.journal?.name) {
      journal = work.journal.name
    }
    else if (work.venue) {
      journal = work.venue
    }
    else if (work.publicationVenue?.name) {
      journal = work.publicationVenue.name
    }

    // Parse volume and pages from journal object
    let volume: string | undefined
    let pages: string | undefined
    if (work.journal) {
      volume = work.journal.volume
      pages = work.journal.pages
    }

    // Parse URL with priority for open access
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

    // Parse additional metadata that might be useful
    const metadata: ReferenceMetadata = {
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

    return metadata
  }
}

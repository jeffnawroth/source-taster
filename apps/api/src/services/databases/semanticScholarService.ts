import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class SemanticScholarService {
  private baseUrl = 'https://api.semanticscholar.org/graph/v1'
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Priority order for search strategies based on Semantic Scholar API best practices:

      // 1. Direct identifier searches (most reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
        if (directResult)
          return directResult
      }

      // 2. ArXiv ID search for preprints (if available)
      if (metadata.identifiers?.arxivId) {
        const arxivResult = await this.searchByArxivId(metadata.identifiers.arxivId)
        if (arxivResult)
          return arxivResult
      }

      // 3. Title match search (new endpoint for exact title matching)
      if (metadata.title) {
        const titleMatchResult = await this.searchByTitleMatch(metadata.title)
        if (titleMatchResult) {
          return titleMatchResult
        }
      }

      // 4. Comprehensive query-based search with multiple strategies
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
        'openAccessPdf',
        'fieldsOfStudy',
        'isOpenAccess',
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

  private async searchByArxivId(arxivId: string): Promise<ExternalSource | null> {
    try {
      const cleanArxivId = arxivId.replace(/^arxiv:/i, '').replace(/^https?:\/\/arxiv\.org\/(abs|pdf)\//, '')
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
        'openAccessPdf',
        'fieldsOfStudy',
        'isOpenAccess',
      ].join(',')

      const url = `${this.baseUrl}/paper/ARXIV:${encodeURIComponent(cleanArxivId)}?fields=${encodeURIComponent(fields)}`

      console.warn(`Semantic Scholar: Searching by arXiv ID: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      })

      if (!response.ok) {
        return null // arXiv ID not found, try other methods
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
      console.warn('Semantic Scholar arXiv search failed:', error)
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
        'openAccessPdf',
        'fieldsOfStudy',
        'isOpenAccess',
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
      // Try multiple search strategies for better coverage with enhanced query construction
      const searchQueries = []

      // Strategy 1: Author + Year + Venue for better precision (most specific)
      if (metadata.authors?.[0] && metadata.date.year && metadata.title) {
        const firstAuthor = metadata.authors[0]
        let authorLastName: string | undefined
        if (typeof firstAuthor === 'string') {
          authorLastName = (firstAuthor as string).split(' ').pop()
        }
        else {
          authorLastName = firstAuthor.lastName || firstAuthor.firstName
        }
        if (authorLastName) {
          const keyTerms = metadata.title.toLowerCase()
            .split(' ')
            .filter(word => word.length > 2 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'].includes(word))
            .slice(0, 3) // Take first 3 key terms

          const queryParts = [authorLastName, metadata.date.year.toString(), ...keyTerms]

          // Add venue/journal if available
          if (metadata.source?.containerTitle) {
            queryParts.push(metadata.source.containerTitle)
          }

          searchQueries.push(queryParts.join(' '))
        }
      }

      // Strategy 2: Author + Title for cases without year
      if (metadata.authors?.[0] && metadata.title) {
        const firstAuthor = metadata.authors[0]
        let authorLastName: string | undefined
        if (typeof firstAuthor === 'string') {
          authorLastName = (firstAuthor as string).split(' ').pop()
        }
        else {
          authorLastName = firstAuthor.lastName || firstAuthor.firstName
        }
        if (authorLastName) {
          searchQueries.push(`${authorLastName} ${metadata.title}`)
        }
      }

      // Strategy 3: Exact title (quoted for phrase search)
      if (metadata.title) {
        searchQueries.push(`"${metadata.title}"`)
      }

      // Strategy 4: Title without quotes for flexible matching
      if (metadata.title) {
        searchQueries.push(metadata.title)
      }

      // Strategy 5: Key terms only with field-specific search
      if (metadata.title) {
        const keyTerms = metadata.title.toLowerCase()
          .split(' ')
          .filter(word => word.length > 2 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'].includes(word))
        if (keyTerms.length > 0) {
          searchQueries.push(keyTerms.slice(0, 5).join(' ')) // Use up to 5 key terms
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
      params.append('limit', '1') // Only need the first result since we take it anyway
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
        'openAccessPdf',
        'fieldsOfStudy',
        'isOpenAccess',
      ].join(',')
      params.append('fields', fields)

      // Add filters if we have additional metadata for more precise results
      if (metadata.date.year) {
        // Allow some flexibility in year (±2 years)
        const startYear = metadata.date.year - 2
        const endYear = metadata.date.year + 2
        params.append('year', `${startYear}-${endYear}`)
      }

      // Add publication type filters if available (journal articles are more reliable)
      params.append('publicationTypes', 'JournalArticle,ConferencePaper')

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
          // Take the first result - trust Semantic Scholar's relevance ranking
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
    // Parse authors with enhanced handling for both string and object formats
    const authors = work.authors?.map((author: any) => {
      if (typeof author === 'string') {
        return author
      }
      // Handle Semantic Scholar author object format
      return author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim()
    }).filter(Boolean) || []

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

    // Parse identifiers from external IDs with comprehensive mapping
    const identifiers: any = {}
    if (work.externalIds) {
      // DOI
      if (work.externalIds.DOI) {
        identifiers.doi = work.externalIds.DOI
      }

      // ArXiv ID
      if (work.externalIds.ArXiv) {
        identifiers.arxivId = work.externalIds.ArXiv
      }

      // PubMed ID
      if (work.externalIds.PubMed) {
        identifiers.pmid = work.externalIds.PubMed
      }

      // PMC ID
      if (work.externalIds.PubMedCentral) {
        identifiers.pmcid = work.externalIds.PubMedCentral
      }

      // ISSN
      if (work.externalIds.ISSN) {
        identifiers.issn = work.externalIds.ISSN
      }

      // ISBN
      if (work.externalIds.ISBN) {
        identifiers.isbn = work.externalIds.ISBN
      }
    }

    // Parse journal/venue with enhanced logic and priority
    let journal: string | undefined
    let issn: string | undefined

    // Priority: journal object > publicationVenue > venue
    if (work.journal?.name) {
      journal = work.journal.name
      if (work.journal.issn) {
        issn = work.journal.issn
      }
    }
    else if (work.publicationVenue?.name) {
      journal = work.publicationVenue.name
      if (work.publicationVenue.issn) {
        issn = work.publicationVenue.issn
      }
    }
    else if (work.venue) {
      journal = work.venue
    }

    // Update identifiers with ISSN if found and not already present
    if (issn && !identifiers.issn) {
      identifiers.issn = issn
    }

    // Parse volume, issue, and pages from journal object or publicationVenue
    let volume: string | undefined
    let issue: string | undefined
    let pages: string | undefined

    if (work.journal) {
      volume = work.journal.volume
      issue = work.journal.issue
      pages = work.journal.pages
    }
    else if (work.publicationVenue) {
      volume = work.publicationVenue.volume
      issue = work.publicationVenue.issue
      pages = work.publicationVenue.pages
    }

    // Parse publication type for enhanced metadata
    let sourceType: string | undefined
    if (work.publicationTypes && work.publicationTypes.length > 0) {
      sourceType = work.publicationTypes[0] // Take the first publication type
    }

    // Parse complete publication date if available
    let dateValue: any = { year }
    if (work.publicationDate) {
      try {
        const date = new Date(work.publicationDate)
        if (!Number.isNaN(date.getTime())) {
          dateValue = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
          }
        }
      }
      catch {
        // Fall back to year only
        dateValue = { year }
      }
    }

    // Create comprehensive metadata object
    const metadata: ReferenceMetadata = {
      title: work.title,
      authors,
      date: dateValue,
      source: {
        containerTitle: journal,
        volume,
        issue,
        pages,
        sourceType,
      },
      identifiers: Object.keys(identifiers).length > 0 ? identifiers : undefined,
    }

    // Remove undefined values to clean up the metadata
    Object.keys(metadata).forEach((key) => {
      if (metadata[key as keyof ReferenceMetadata] === undefined) {
        delete metadata[key as keyof ReferenceMetadata]
      }
    })

    if (metadata.source) {
      Object.keys(metadata.source).forEach((key) => {
        if (metadata.source![key as keyof typeof metadata.source] === undefined) {
          delete metadata.source![key as keyof typeof metadata.source]
        }
      })
    }

    return metadata
  }
}

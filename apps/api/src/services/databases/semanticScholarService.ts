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
      // Try multiple search strategies, starting with the simplest and most effective
      const searchQueries = []

      // Strategy 0: Simple title search (often most effective!)
      if (metadata.title) {
        searchQueries.push(metadata.title)
      }

      // Strategy 1: Most specific - Full title + first author + year (highest precision)
      if (metadata.title && metadata.authors?.[0] && metadata.date.year) {
        const authorLastName = this.extractAuthorLastName(metadata.authors[0])
        if (authorLastName) {
          searchQueries.push(`"${metadata.title}" ${authorLastName} ${metadata.date.year}`)
        }
      }

      // Strategy 2: Author + Year + Key title terms (high precision)
      if (metadata.authors?.[0] && metadata.date.year && metadata.title) {
        const authorLastName = this.extractAuthorLastName(metadata.authors[0])
        if (authorLastName) {
          const keyTerms = metadata.title.toLowerCase()
            .split(' ')
            .filter(word => word.length > 3 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an', 'and', 'or', 'from', 'using', 'text'].includes(word))
            .slice(0, 4) // Take first 4 distinctive terms

          const queryParts = [authorLastName, metadata.date.year.toString(), ...keyTerms]
          searchQueries.push(queryParts.join(' '))
        }
      }

      // Strategy 3: Exact title + year for unique identification
      if (metadata.title && metadata.date.year) {
        searchQueries.push(`"${metadata.title}" ${metadata.date.year}`)
      }

      // Strategy 4: Author + Title for cases without year
      if (metadata.authors?.[0] && metadata.title) {
        const authorLastName = this.extractAuthorLastName(metadata.authors[0])
        if (authorLastName) {
          searchQueries.push(`${authorLastName} "${metadata.title}"`)
        }
      }

      // Strategy 5: Exact title (quoted for phrase search)
      if (metadata.title) {
        searchQueries.push(`"${metadata.title}"`)
      }

      // Strategy 6: Title without quotes for flexible matching
      if (metadata.title) {
        searchQueries.push(metadata.title)
      }

      // Strategy 7: Key terms only with field-specific search
      if (metadata.title) {
        const keyTerms = metadata.title.toLowerCase()
          .split(' ')
          .filter(word => word.length > 2 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'].includes(word))
        if (keyTerms.length > 0) {
          searchQueries.push(keyTerms.slice(0, 5).join(' ')) // Use up to 5 key terms
        }
      }

      // Strategy 8: Author last names + key title words (handles format variations)
      if (metadata.authors && metadata.authors.length > 0 && metadata.title) {
        const authorLastNames = metadata.authors
          .map(author => this.extractAuthorLastName(author))
          .filter(Boolean)
          .slice(0, 2) // Use first 2 authors

        if (authorLastNames.length > 0) {
          const titleKeywords = this.extractTitleKeywords(metadata.title, 3)
          if (titleKeywords.length > 0) {
            searchQueries.push([...authorLastNames, ...titleKeywords].join(' '))
          }
        }
      }

      // Strategy 9: Split author name formats - handle "Lastname, F." -> "F. Lastname"
      if (metadata.authors && metadata.authors.length > 0 && metadata.title) {
        const normalizedAuthors = metadata.authors.map(author => this.normalizeAuthorName(author)).filter(Boolean)
        if (normalizedAuthors.length > 0) {
          searchQueries.push(`${normalizedAuthors[0]} ${metadata.title}`)
        }
      }

      // Try each search strategy
      console.warn(`Semantic Scholar: Trying ${searchQueries.length} search strategies for: "${metadata.title}"`)
      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i]
        console.warn(`Semantic Scholar: Strategy ${i + 1}: "${query}"`)
        const result = await this.performRelevanceSearch(query, metadata)
        if (result) {
          console.warn(`Semantic Scholar: Found result with strategy ${i + 1}: ${result.id}`)
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
      params.append('limit', '10') // Get multiple results to choose from
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
          // For the first strategy (simple title search), take the first result
          // Semantic Scholar already ranks by relevance
          const bestMatch = data.data[0]

          // Basic sanity check: if we have a year, make sure it's reasonably close
          if (metadata.date.year && bestMatch.year) {
            const yearDiff = Math.abs(bestMatch.year - metadata.date.year)
            if (yearDiff > 5) {
              // Try next result if year is way off
              for (let i = 1; i < Math.min(data.data.length, 3); i++) {
                const candidate = data.data[i]
                if (candidate.year && Math.abs(candidate.year - metadata.date.year) <= 2) {
                  return {
                    id: candidate.paperId,
                    source: 'semanticscholar',
                    metadata: this.parseSemanticScholarWork(candidate),
                    url: candidate.url || `https://www.semanticscholar.org/paper/${candidate.paperId}`,
                  }
                }
              }
            }
          }

          // Return the best match (first result)
          return {
            id: bestMatch.paperId,
            source: 'semanticscholar',
            metadata: this.parseSemanticScholarWork(bestMatch),
            url: bestMatch.url || `https://www.semanticscholar.org/paper/${bestMatch.paperId}`,
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

  /**
   * Enhanced author name extraction to handle various formats:
   * - "Akbik, A." -> "Akbik"
   * - "John Smith" -> "Smith"
   * - "Smith" -> "Smith"
   * - {firstName: "John", lastName: "Smith"} -> "Smith"
   */
  private extractAuthorLastName(author: string | { firstName?: string, lastName?: string }): string | undefined {
    if (typeof author === 'string') {
      const authorStr = author.trim()

      // Handle "LastName, FirstInitial" format (e.g., "Akbik, A.")
      if (authorStr.includes(',')) {
        const parts = authorStr.split(',')
        if (parts.length >= 2) {
          return parts[0].trim() // Return the part before the comma
        }
      }

      // Handle "FirstName LastName" format
      const nameParts = authorStr.split(/\s+/)
      if (nameParts.length >= 2) {
        return nameParts[nameParts.length - 1] // Return the last part
      }

      // Single name - could be either first or last name
      if (nameParts.length === 1) {
        // If it looks like an initial (single letter or letter with dot), skip it
        if (authorStr.match(/^[A-Z]\.?$/)) {
          return undefined
        }
        return authorStr
      }
    }
    else if (author && typeof author === 'object') {
      // Handle author object format
      return author.lastName || author.firstName
    }

    return undefined
  }

  /**
   * Normalize author names to handle different formats
   * "Akbik, A." -> "A. Akbik"
   * "John Smith" -> "John Smith"
   */
  private normalizeAuthorName(author: string | { firstName?: string, lastName?: string }): string | undefined {
    if (typeof author === 'string') {
      const authorStr = author.trim()

      // Handle "LastName, FirstInitial" format (e.g., "Akbik, A.")
      if (authorStr.includes(',')) {
        const parts = authorStr.split(',').map(p => p.trim())
        if (parts.length >= 2 && parts[1]) {
          return `${parts[1]} ${parts[0]}` // "A. Akbik"
        }
      }

      // Return as-is for other formats
      return authorStr
    }
    else if (author && typeof author === 'object') {
      // Handle author object format
      const firstName = author.firstName || ''
      const lastName = author.lastName || ''
      return `${firstName} ${lastName}`.trim()
    }

    return undefined
  }

  /**
   * Extract meaningful keywords from title for flexible search
   */
  private extractTitleKeywords(title: string, maxKeywords: number = 5): string[] {
    const stopWords = new Set(['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'from', 'using', 'based', 'via'])

    return title.toLowerCase()
      .split(/\s+/)
      .filter(word =>
        word.length > 2
        && !stopWords.has(word)
        && /^[a-z]/i.test(word), // Start with letter
      )
      .slice(0, maxKeywords)
  }
}

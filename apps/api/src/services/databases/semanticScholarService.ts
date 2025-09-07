import type { ApiSearchCandidate, CSLItem } from '@source-taster/types'
import type { components } from '../../types/semanticScholar'

type SemanticScholarPaper = components['schemas']['FullPaper']
type SemanticScholarSearchResponse = components['schemas']['PaperRelevanceSearchBatch']
type SemanticScholarTitleMatchResponse = components['schemas']['PaperMatch']

export class SemanticScholarService {
  private baseUrl = 'https://api.semanticscholar.org/graph/v1'
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  async search(metadata: CSLItem): Promise<ApiSearchCandidate | null> {
    try {
      // Priority order for search strategies based on Semantic Scholar API best practices:

      // 1. Direct identifier searches (most reliable)
      if (metadata.DOI) {
        const directResult = await this.searchByDOI(metadata.DOI)
        if (directResult)
          return directResult
      }

      if (metadata.arxivId) {
        const arxivResult = await this.searchByArxivId(metadata.arxivId)
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

  private async searchByDOI(doi: string): Promise<ApiSearchCandidate | null> {
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

      const work = await response.json() as SemanticScholarPaper

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

  private async searchByArxivId(arxivId: string): Promise<ApiSearchCandidate | null> {
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

      const work = await response.json() as SemanticScholarPaper

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

  private async searchByTitleMatch(title: string): Promise<ApiSearchCandidate | null> {
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
        const data = await response.json() as SemanticScholarTitleMatchResponse
        // The match endpoint returns a single best match with a matchScore
        if (data && data.data && data.data.length > 0) {
          const match = data.data[0]
          return {
            id: match.paperId!,
            source: 'semanticscholar',
            metadata: this.parseSemanticScholarWork(match),
            url: match.url || `https://www.semanticscholar.org/paper/${match.paperId}`,
          }
        }
      }
    }
    catch (error) {
      console.warn('Semantic Scholar title match search failed:', error)
    }

    return null
  }

  private async searchByQuery(metadata: CSLItem): Promise<ApiSearchCandidate | null> {
    try {
      // Try multiple search strategies, starting with the simplest and most effective
      const searchQueries = []

      // Strategy 0: Simple title search (often most effective!)
      if (metadata.title) {
        searchQueries.push(metadata.title)
      }

      // Strategy 1: Most specific - Full title + first author + year (highest precision)
      if (metadata.title && metadata.author?.[0] && metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0]) {
        const year = metadata.issued['date-parts'][0][0]
        const authorLastName = this.extractAuthorLastNameFromCSLAuthor(metadata.author[0])
        if (authorLastName) {
          searchQueries.push(`"${metadata.title}" ${authorLastName} ${year}`)
        }
      }

      // Strategy 2: Author + Year + Key title terms (high precision)
      if (metadata.author?.[0] && metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0] && metadata.title) {
        const year = metadata.issued['date-parts'][0][0]
        const authorLastName = this.extractAuthorLastNameFromCSLAuthor(metadata.author[0])
        if (authorLastName) {
          const keyTerms = metadata.title.toLowerCase()
            .split(' ')
            .filter((word: string) => word.length > 3 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an', 'and', 'or', 'from', 'using', 'text'].includes(word))
            .slice(0, 4) // Take first 4 distinctive terms

          const queryParts = [authorLastName, year.toString(), ...keyTerms]
          searchQueries.push(queryParts.join(' '))
        }
      }

      // Strategy 3: Exact title + year for unique identification
      if (metadata.title && metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0]) {
        const year = metadata.issued['date-parts'][0][0]
        searchQueries.push(`"${metadata.title}" ${year}`)
      }

      // Strategy 4: Author + Title for cases without year
      if (metadata.author?.[0] && metadata.title) {
        const authorLastName = this.extractAuthorLastNameFromCSLAuthor(metadata.author[0])
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
          .filter((word: string) => word.length > 2 && !['the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an'].includes(word))
        if (keyTerms.length > 0) {
          searchQueries.push(keyTerms.slice(0, 5).join(' ')) // Use up to 5 key terms
        }
      }

      // Strategy 8: Author last names + key title words (handles format variations)
      if (metadata.author && metadata.author.length > 0 && metadata.title) {
        const authorLastNames = metadata.author
          .map((author: any) => this.extractAuthorLastNameFromCSLAuthor(author))
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
      if (metadata.author && metadata.author.length > 0 && metadata.title) {
        const normalizedAuthors = metadata.author.map((author: any) => this.normalizeCSLAuthorName(author)).filter(Boolean)
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

  private async performRelevanceSearch(query: string, metadata: CSLItem): Promise<ApiSearchCandidate | null> {
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
        const data = await response.json() as SemanticScholarSearchResponse
        if (data.data && data.data.length > 0) {
          // For the first strategy (simple title search), take the first result
          // Semantic Scholar already ranks by relevance
          const bestMatch = data.data[0]

          // Basic sanity check: if we have a year, make sure it's reasonably close
          const year = metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0]
            ? Number(metadata.issued['date-parts'][0][0])
            : null

          if (year && bestMatch.year) {
            const yearDiff = Math.abs(bestMatch.year - year)
            if (yearDiff > 5) {
              // Try next result if year is way off
              for (let i = 1; i < Math.min(data.data.length, 3); i++) {
                const candidate = data.data[i]
                if (candidate.year && Math.abs(candidate.year - year) <= 2) {
                  return {
                    id: candidate.paperId!,
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
            id: bestMatch.paperId!,
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

  private parseSemanticScholarWork(work: SemanticScholarPaper): CSLItem {
    const metadata: CSLItem = {
      type: 'article-journal', // Default type, will be updated if needed
      id: work.paperId || `semanticscholar-${Date.now()}`,
    }

    // Title
    if (work.title) {
      metadata.title = work.title
    }

    // Parse authors with enhanced handling for both string and object formats
    const authors = work.authors?.map((author: any) => {
      if (typeof author === 'string') {
        // Parse string format like "John Doe" into given/family
        const nameParts = author.trim().split(/\s+/)
        if (nameParts.length > 1) {
          return {
            given: nameParts.slice(0, -1).join(' '),
            family: nameParts[nameParts.length - 1],
          }
        }
        else {
          return {
            family: author,
          }
        }
      }
      // Handle Semantic Scholar author object format
      const fullName = author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim()
      const nameParts = fullName.split(/\s+/)
      if (nameParts.length > 1) {
        return {
          given: nameParts.slice(0, -1).join(' '),
          family: nameParts[nameParts.length - 1],
        }
      }
      else {
        return {
          family: fullName,
        }
      }
    }).filter(Boolean) || []

    if (authors.length > 0) {
      metadata.author = authors
    }

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
    else if (work.publicationVenue && 'name' in work.publicationVenue) {
      // Sometimes year is embedded in venue information
      const venueName = (work.publicationVenue as any).name
      if (typeof venueName === 'string') {
        const venueYearMatch = venueName.match(/(\d{4})/)
        if (venueYearMatch) {
          year = Number.parseInt(venueYearMatch[1])
        }
      }
    }

    // Set publication date
    if (year) {
      metadata.issued = { 'date-parts': [[year]] }
    }

    // Parse complete publication date if available
    if (work.publicationDate) {
      try {
        const date = new Date(work.publicationDate)
        if (!Number.isNaN(date.getTime())) {
          const pubYear = date.getFullYear()
          const pubMonth = date.getMonth() + 1
          const pubDay = date.getDate()
          metadata.issued = { 'date-parts': [[pubYear, pubMonth, pubDay]] }
        }
      }
      catch {
        // Fall back to year only if we have it
        if (year) {
          metadata.issued = { 'date-parts': [[year]] }
        }
      }
    }

    // Parse identifiers from external IDs
    if (work.externalIds) {
      const extIds = work.externalIds as any

      if (extIds.DOI) {
        metadata.DOI = extIds.DOI
      }

      // ArXiv ID
      if (extIds.ArXiv) {
        metadata.arxivId = extIds.ArXiv
      }

      // PubMed ID
      if (extIds.PubMed) {
        metadata.PMID = extIds.PubMed
      }
      if (extIds.PubMedCentral) {
        metadata.PMCID = extIds.PubMedCentral
      }
      if (extIds.ISSN) {
        metadata.ISSN = extIds.ISSN
      }
      if (extIds.ISBN) {
        metadata.ISBN = extIds.ISBN
      }
    }

    // Parse journal/venue information
    let journal: string | undefined
    let issn: string | undefined

    if (work.journal && 'name' in work.journal) {
      const journalObj = work.journal as any
      journal = journalObj.name
      if (journalObj.issn) {
        issn = journalObj.issn
      }
    }
    else if (work.publicationVenue && 'name' in work.publicationVenue) {
      const venueObj = work.publicationVenue as any
      journal = venueObj.name
      if (venueObj.issn) {
        issn = venueObj.issn
      }
    }
    else if (work.venue) {
      journal = work.venue
    }

    if (journal) {
      metadata['container-title'] = journal
    }
    if (issn && !metadata.ISSN) {
      metadata.ISSN = issn
    }

    // Parse volume, issue, and pages
    if (work.journal) {
      const journalObj = work.journal as any
      if (journalObj.volume)
        metadata.volume = journalObj.volume
      if (journalObj.issue)
        metadata.issue = journalObj.issue
      if (journalObj.pages)
        metadata.page = journalObj.pages
    }
    else if (work.publicationVenue) {
      const venueObj = work.publicationVenue as any
      if (venueObj.volume)
        metadata.volume = venueObj.volume
      if (venueObj.issue)
        metadata.issue = venueObj.issue
      if (venueObj.pages)
        metadata.page = venueObj.pages
    }

    // Parse publication type for enhanced metadata
    if (work.publicationTypes && work.publicationTypes.length > 0) {
      const pubType = work.publicationTypes[0]
      // Map to CSL types
      const typeMapping: Record<string, CSLItem['type']> = {
        JournalArticle: 'article-journal',
        ConferencePaper: 'paper-conference',
        BookSection: 'chapter',
        Book: 'book',
        Report: 'report',
        Thesis: 'thesis',
        Patent: 'patent',
        Dataset: 'dataset',
        Review: 'review',
      }
      metadata.type = typeMapping[pubType] || 'article-journal'
    }

    return metadata
  }

  /**
   * Extract author last name from CSL author format
   */
  private extractAuthorLastNameFromCSLAuthor(author: any): string | undefined {
    if (author.family) {
      return author.family
    }
    if (author.literal) {
      // Try to extract last name from literal format
      const parts = author.literal.split(' ')
      return parts[parts.length - 1]
    }
    return undefined
  }

  /**
   * Normalize CSL author name format
   */
  private normalizeCSLAuthorName(author: any): string | undefined {
    if (author.family && author.given) {
      return `${author.given} ${author.family}`
    }
    if (author.family) {
      return author.family
    }
    if (author.literal) {
      return author.literal
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

import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'
import type { EuropePmcSearchResponse, EuropePmcWork } from '../../types/europePmc'
import process from 'node:process'

export class EuropePmcService {
  private baseUrl = 'https://www.ebi.ac.uk/europepmc/webservices/rest'
  private email: string | undefined

  constructor(email?: string) {
    this.email = email || process.env.EUROPEPMC_EMAIL
  }

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Priority order for search strategies:
      // 1. Direct identifier searches (most reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
        if (directResult)
          return directResult
      }

      if (metadata.identifiers?.pmid) {
        const pmidResult = await this.searchByPMID(metadata.identifiers.pmid)
        if (pmidResult)
          return pmidResult
      }

      if (metadata.identifiers?.pmcid) {
        const pmcidResult = await this.searchByPMCID(metadata.identifiers.pmcid)
        if (pmcidResult)
          return pmcidResult
      }

      // Also try PMCID search if the PMID looks like a PMCID
      if (metadata.identifiers?.pmid && metadata.identifiers.pmid.startsWith('PMC')) {
        const pmcidResult = await this.searchByPMCID(metadata.identifiers.pmid)
        if (pmcidResult)
          return pmcidResult
      }

      // 2. Comprehensive fielded search using available metadata
      return await this.searchByQuery(metadata)
    }
    catch (error) {
      console.error('Europe PMC search error:', error)
    }

    return null
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')

      // Build URL with email parameter if available
      const params = new URLSearchParams()
      params.append('query', `DOI:"${cleanDoi}"`)
      params.append('format', 'json')
      params.append('resultType', 'core')
      params.append('pageSize', '1')

      if (this.email) {
        params.append('email', this.email)
      }

      const url = `${this.baseUrl}/search?${params.toString()}`

      console.warn(`Europe PMC: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json() as EuropePmcSearchResponse

      if (data.resultList?.result && data.resultList.result.length > 0) {
        const work = data.resultList.result[0]
        return {
          id: work.pmid || work.pmcid || work.doi || `europepmc-${Date.now()}`,
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: this.buildWorkUrl(work),
        }
      }
    }
    catch (error) {
      console.warn('Europe PMC DOI search failed:', error)
    }

    return null
  }

  private async searchByPMID(pmid: string): Promise<ExternalSource | null> {
    try {
      // Clean PMID to ensure it's just the number
      const cleanPmid = pmid.replace(/^pmid:?/i, '').trim()

      const params = new URLSearchParams()
      params.append('query', `EXT_ID:${cleanPmid} AND SRC:MED`)
      params.append('format', 'json')
      params.append('resultType', 'core')
      params.append('pageSize', '1')

      if (this.email) {
        params.append('email', this.email)
      }

      const url = `${this.baseUrl}/search?${params.toString()}`

      console.warn(`Europe PMC: Searching by PMID: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json() as EuropePmcSearchResponse

      if (data.resultList?.result && data.resultList.result.length > 0) {
        const work = data.resultList.result[0]
        return {
          id: work.pmid || work.pmcid || work.doi || `europepmc-${Date.now()}`,
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: this.buildWorkUrl(work),
        }
      }
    }
    catch (error) {
      console.warn('Europe PMC PMID search failed:', error)
    }

    return null
  }

  private async searchByPMCID(pmcid: string): Promise<ExternalSource | null> {
    try {
      // Clean PMCID to ensure proper format
      const cleanPmcid = pmcid.replace(/^pmcid:?/i, '').trim()
      // Ensure it starts with PMC
      const normalizedPmcid = cleanPmcid.startsWith('PMC') ? cleanPmcid : `PMC${cleanPmcid}`

      const params = new URLSearchParams()
      params.append('query', `PMCID:${normalizedPmcid}`)
      params.append('format', 'json')
      params.append('resultType', 'core')
      params.append('pageSize', '1')

      if (this.email) {
        params.append('email', this.email)
      }

      const url = `${this.baseUrl}/search?${params.toString()}`

      console.warn(`Europe PMC: Searching by PMCID: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json() as EuropePmcSearchResponse

      if (data.resultList?.result && data.resultList.result.length > 0) {
        const work = data.resultList.result[0]
        return {
          id: work.pmid || work.pmcid || work.doi || `europepmc-${Date.now()}`,
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: this.buildWorkUrl(work),
        }
      }
    }
    catch (error) {
      console.warn('Europe PMC PMCID search failed:', error)
    }

    return null
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Build search query using fielded search
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/search?${queryParams}`

      console.warn(`Europe PMC: Query search: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Europe PMC API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as EuropePmcSearchResponse

      if (data.resultList?.result && data.resultList.result.length > 0) {
        // For query-based searches, take the first result which should be most relevant
        // Europe PMC's relevance ranking is generally good, especially with fielded searches
        const work = data.resultList.result[0]

        return {
          id: work.pmid || work.pmcid || work.doi || `europepmc-${Date.now()}`,
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: this.buildWorkUrl(work),
        }
      }

      // If no results with full query, try a fallback with just title and authors
      if (metadata.title && metadata.authors && metadata.authors.length > 0) {
        return await this.searchByTitleAndAuthor(metadata)
      }
    }
    catch (error) {
      console.error('Europe PMC search error:', error)
    }

    return null
  }

  /**
   * Fallback search using only title and author for better recall
   */
  private async searchByTitleAndAuthor(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const queryParts: string[] = []

      if (metadata.title) {
        queryParts.push(`TITLE:"${this.escapeSearchTerm(metadata.title)}"`)
      }

      if (metadata.authors && metadata.authors.length > 0) {
        const firstAuthor = metadata.authors[0]
        if (firstAuthor && typeof firstAuthor === 'object' && 'lastName' in firstAuthor) {
          const lastName = firstAuthor.lastName
          if (lastName) {
            queryParts.push(`AUTH:"${this.escapeSearchTerm(lastName)}"`)
          }
        }
      }

      if (queryParts.length === 0) {
        return null
      }

      const params = new URLSearchParams()
      params.append('query', queryParts.join(' AND '))
      params.append('format', 'json')
      params.append('resultType', 'core')
      params.append('pageSize', '3')

      if (this.email) {
        params.append('email', this.email)
      }

      const url = `${this.baseUrl}/search?${params.toString()}`

      console.warn(`Europe PMC: Fallback title+author search: ${url}`)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json() as EuropePmcSearchResponse

      if (data.resultList?.result && data.resultList.result.length > 0) {
        const work = data.resultList.result[0]
        return {
          id: work.pmid || work.pmcid || work.doi || `europepmc-${Date.now()}`,
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: this.buildWorkUrl(work),
        }
      }
    }
    catch (error) {
      console.warn('Europe PMC fallback search failed:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Build a comprehensive fielded search query using Europe PMC best practices
    const queryParts: string[] = []

    // 1. Title search (most important for matching)
    if (metadata.title) {
      // Use exact phrase matching for titles
      queryParts.push(`TITLE:"${this.escapeSearchTerm(metadata.title)}"`)
    }

    // 2. Author search - use AUTH field for precise author matching
    if (metadata.authors && metadata.authors.length > 0) {
      const authorQueries: string[] = []

      for (const author of metadata.authors.slice(0, 3)) { // Limit to first 3 authors to avoid overly restrictive searches
        if (author && typeof author === 'object' && 'lastName' in author) {
          // Author object - use last name and optionally first initial
          if (author.lastName) {
            if (author.firstName) {
              const firstInitial = author.firstName.charAt(0).toUpperCase()
              authorQueries.push(`AUTH:"${this.escapeSearchTerm(author.lastName)} ${firstInitial}"`)
            }
            else {
              authorQueries.push(`AUTH:"${this.escapeSearchTerm(author.lastName)}"`)
            }
          }
        }
      }

      if (authorQueries.length > 0) {
        // Use OR for authors since we want to match any of the authors
        queryParts.push(`(${authorQueries.join(' OR ')})`)
      }
    }

    // 3. Journal search - use JOURNAL field for precise journal matching
    if (metadata.source?.containerTitle) {
      queryParts.push(`JOURNAL:"${this.escapeSearchTerm(metadata.source.containerTitle)}"`)
    }

    // 4. Publication year - use PUB_YEAR field
    if (metadata.date?.year) {
      queryParts.push(`PUB_YEAR:${metadata.date.year}`)
    }

    // 5. Volume and issue for more precise matching
    if (metadata.source?.volume) {
      queryParts.push(`VOLUME:"${this.escapeSearchTerm(metadata.source.volume)}"`)
    }

    if (metadata.source?.issue) {
      queryParts.push(`ISSUE:"${this.escapeSearchTerm(metadata.source.issue)}"`)
    }

    // 6. ISSN for journal identification (if available)
    if (metadata.identifiers?.issn) {
      queryParts.push(`ISSN:"${metadata.identifiers.issn}"`)
    }

    // Combine query parts with AND for precise matching
    const finalQuery = queryParts.length > 0 ? queryParts.join(' AND ') : '*'

    params.append('query', finalQuery)
    params.append('format', 'json')
    params.append('resultType', 'core') // Get full metadata
    params.append('pageSize', '5') // Get a few results to improve matching chances
    params.append('sort', 'relevance') // Sort by relevance (default)

    // Add email if available for better API performance
    if (this.email) {
      params.append('email', this.email)
    }

    return params.toString()
  }

  /**
   * Escape special characters in search terms for Europe PMC queries
   */
  private escapeSearchTerm(term: string): string {
    // Escape quotes and backslashes, and trim whitespace
    return term.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()
  }

  /**
   * Build the best URL for a Europe PMC work (prefer DOI, then PMC, then PubMed)
   */
  private buildWorkUrl(work: EuropePmcWork): string | undefined {
    if (work.doi) {
      return `https://doi.org/${work.doi}`
    }
    if (work.pmcid) {
      return `https://www.ncbi.nlm.nih.gov/pmc/articles/${work.pmcid}/`
    }
    if (work.pmid) {
      return `https://pubmed.ncbi.nlm.nih.gov/${work.pmid}/`
    }
    return undefined
  }

  /**
   * Parses the Europe PMC work object into a ReferenceMetadata object.
   * Maps comprehensive metadata fields from Europe PMC API response.
   * @param work The Europe PMC work object to parse.
   * @returns The parsed ReferenceMetadata object.
   */
  private parseEuropePmcWork(work: EuropePmcWork): ReferenceMetadata {
    const metadata: ReferenceMetadata = {
      date: {},
      source: {},
    }

    // Title
    if (work.title) {
      metadata.title = work.title
    }

    // Authors - parse from authorString and authorList
    if (work.authorString) {
      const authors = work.authorString
        .split(',')
        .map((author: string) => {
          const cleanAuthor = author.trim().replace(/\.$/, '') // Remove trailing dot
          // Parse name into firstName/lastName
          const nameParts = cleanAuthor.split(/\s+/)
          if (nameParts.length > 1) {
            return {
              firstName: nameParts.slice(0, -1).join(' '),
              lastName: nameParts[nameParts.length - 1],
            }
          }
          else {
            return {
              lastName: cleanAuthor || 'Unknown',
            }
          }
        })
        .filter(Boolean)
      if (authors.length > 0) {
        metadata.authors = authors
      }
    }
    else if (work.authorList?.author && Array.isArray(work.authorList.author)) {
      // Use structured author data if available
      const authors = work.authorList.author.map((author: any) => {
        if (author.firstName && author.lastName) {
          return {
            firstName: author.firstName,
            lastName: author.lastName,
          }
        }
        else if (author.fullName) {
          // Parse fullName into firstName/lastName
          const nameParts = author.fullName.trim().split(/\s+/)
          if (nameParts.length > 1) {
            return {
              firstName: nameParts.slice(0, -1).join(' '),
              lastName: nameParts[nameParts.length - 1],
            }
          }
          else {
            return {
              lastName: author.fullName || 'Unknown',
            }
          }
        }
        else if (author.lastName) {
          return {
            lastName: author.lastName,
            firstName: author.initials || author.firstName,
          }
        }
        return {
          lastName: 'Unknown',
        }
      }).filter((author): author is { firstName?: string, lastName: string } => Boolean(author))

      if (authors.length > 0) {
        metadata.authors = authors
      }
    }

    // Source/Journal information
    if (work.journalTitle) {
      metadata.source!.containerTitle = work.journalTitle
    }

    // Publication dates
    if (work.pubYear) {
      const year = Number.parseInt(work.pubYear, 10)
      if (!Number.isNaN(year)) {
        metadata.date!.year = year
      }
    }

    // Try to extract month and day from various date fields
    if (work.firstPublicationDate || work.electronicPublicationDate || work.printPublicationDate) {
      const dateString = work.firstPublicationDate || work.electronicPublicationDate || work.printPublicationDate
      if (dateString) {
        const date = new Date(dateString)
        if (!Number.isNaN(date.getTime())) {
          if (!metadata.date!.year) {
            metadata.date!.year = date.getFullYear()
          }
          metadata.date!.month = date.toLocaleString('en-US', { month: 'long' })
          metadata.date!.day = date.getDate()
        }
      }
    }

    // Volume and issue
    if (work.journalVolume) {
      metadata.source!.volume = work.journalVolume
    }

    if (work.issue) {
      metadata.source!.issue = work.issue
    }

    // Page information
    if (work.pageInfo) {
      metadata.source!.pages = work.pageInfo
    }

    // External identifiers
    metadata.identifiers = {}

    if (work.doi) {
      // Clean DOI - remove https://doi.org/ prefix if present
      metadata.identifiers.doi = work.doi.replace(/^https:\/\/doi\.org\//, '')
    }

    if (work.pmid) {
      metadata.identifiers.pmid = work.pmid
    }

    if (work.pmcid) {
      metadata.identifiers.pmcid = work.pmcid
    }

    // ISSN - could be in several places
    if (work.journalInfo?.journal?.ISSN) {
      metadata.identifiers.issn = work.journalInfo.journal.ISSN
    }
    else if (work.journalIssn) {
      metadata.identifiers.issn = work.journalIssn
    }

    // Additional metadata fields specific to Europe PMC

    // Abstract (if available)
    if (work.abstractText) {
      // Store abstract in source type field for now (could be extended in future)
      metadata.source!.sourceType = 'Journal article'
    }

    // Publisher information
    if (work.journalInfo?.journal?.publisherName) {
      metadata.source!.publisher = work.journalInfo.journal.publisherName
    }

    // Additional identifiers from Europe PMC
    if (work.pmcid) {
      // PMCID is not in our current identifiers interface, but we could extend it
      // For now, we'll store it in a way that doesn't break the interface
      if (!metadata.identifiers.pmid && work.pmcid.startsWith('PMC')) {
        // Use PMCID as PMID fallback if no PMID available (they're related)
        metadata.identifiers.pmid = work.pmcid
      }
    }

    // arXiv ID (if this is a preprint from arXiv)
    if (work.source === 'PPR' && work.extId) {
      // Check if this might be an arXiv ID
      if (work.extId.match(/^\d{4}\.\d{4,5}$/)) {
        metadata.identifiers.arxivId = work.extId
      }
    }

    // Source type based on publication type
    if (work.pubTypeList?.pubType) {
      const pubTypes = Array.isArray(work.pubTypeList.pubType)
        ? work.pubTypeList.pubType
        : [work.pubTypeList.pubType]

      // Map Europe PMC publication types to our source types
      const typeMapping: Record<string, string> = {
        'research-article': 'Journal article',
        'review-article': 'Review article',
        'case-reports': 'Case report',
        'editorial': 'Editorial',
        'letter': 'Letter',
        'news': 'News article',
        'other': 'Other',
      }

      const primaryType = pubTypes[0]
      if (primaryType && typeMapping[primaryType]) {
        metadata.source!.sourceType = typeMapping[primaryType]
      }
      else if (primaryType) {
        metadata.source!.sourceType = primaryType
      }
    }

    // Handle preprints
    if (work.source === 'PPR') {
      metadata.source!.sourceType = 'Preprint'

      // For preprints, the journal info might actually be the preprint server
      if (work.journalTitle && !metadata.source!.containerTitle) {
        metadata.source!.containerTitle = work.journalTitle
      }
    }

    return metadata
  }
}

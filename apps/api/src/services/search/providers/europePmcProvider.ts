import type { ApiSearchCandidate, CSLItem } from '@source-taster/types'
import type { EuropePmcSearchResponse, EuropePmcWork } from '../../../types/europepmc.js'
import process from 'node:process'
import { generateUUID } from '../../../utils/generateUUID.js'

export class EuropePmcProvider {
  private baseUrl = 'https://www.ebi.ac.uk/europepmc/webservices/rest'
  private email: string | undefined

  constructor(email?: string) {
    this.email = email || process.env.EUROPEPMC_EMAIL
  }

  async search(metadata: CSLItem): Promise<ApiSearchCandidate | null> {
    try {
      // Priority order for search strategies:
      // 1. Direct identifier searches (most reliable)
      if (metadata.DOI) {
        const directResult = await this.searchByDOI(metadata.DOI)
        if (directResult)
          return directResult
      }

      if (metadata.PMID) {
        const pmidResult = await this.searchByPMID(metadata.PMID)
        if (pmidResult)
          return pmidResult
      }

      if (metadata.PMCID) {
        const pmcidResult = await this.searchByPMCID(metadata.PMCID)
        if (pmcidResult)
          return pmcidResult
      }

      // Also try PMCID search if the PMID looks like a PMCID
      if (metadata.PMID && metadata.PMID.startsWith('PMC')) {
        const pmcidResult = await this.searchByPMCID(metadata.PMID)
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

  private async searchByDOI(doi: string): Promise<ApiSearchCandidate | null> {
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
          id: generateUUID(),
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

  private async searchByPMID(pmid: string): Promise<ApiSearchCandidate | null> {
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
          id: generateUUID(),
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

  private async searchByPMCID(pmcid: string): Promise<ApiSearchCandidate | null> {
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
          id: generateUUID(),
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

  private async searchByQuery(metadata: CSLItem): Promise<ApiSearchCandidate | null> {
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
          id: generateUUID(),
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: this.buildWorkUrl(work),
        }
      }

      // If no results with full query, try a fallback with just title and authors
      if (metadata.title && metadata.author && metadata.author.length > 0) {
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
  private async searchByTitleAndAuthor(metadata: CSLItem): Promise<ApiSearchCandidate | null> {
    try {
      const queryParts: string[] = []

      if (metadata.title) {
        queryParts.push(`TITLE:"${this.escapeSearchTerm(metadata.title)}"`)
      }

      if (metadata.author && metadata.author.length > 0) {
        const firstAuthor = metadata.author[0]
        if (firstAuthor && typeof firstAuthor === 'object' && 'family' in firstAuthor) {
          const lastName = firstAuthor.family
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
          id: generateUUID(),
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

  private buildSearchQuery(metadata: CSLItem): string {
    const params = new URLSearchParams()

    // Build a comprehensive fielded search query using Europe PMC best practices
    const queryParts: string[] = []

    // 1. Title search (most important for matching)
    if (metadata.title) {
      // Use exact phrase matching for titles
      queryParts.push(`TITLE:"${this.escapeSearchTerm(metadata.title)}"`)
    }

    // 2. Author search - use AUTH field for precise author matching
    if (metadata.author && metadata.author.length > 0) {
      const authorQueries: string[] = []

      for (const author of metadata.author.slice(0, 3)) { // Limit to first 3 authors to avoid overly restrictive searches
        if (author && typeof author === 'object' && 'family' in author) {
          // Author object - use family name and optionally given name initial
          if (author.family) {
            if (author.given) {
              const firstInitial = author.given.charAt(0).toUpperCase()
              authorQueries.push(`AUTH:"${this.escapeSearchTerm(author.family)} ${firstInitial}"`)
            }
            else {
              authorQueries.push(`AUTH:"${this.escapeSearchTerm(author.family)}"`)
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
    if (metadata['container-title']) {
      queryParts.push(`JOURNAL:"${this.escapeSearchTerm(metadata['container-title'])}"`)
    }

    // 4. Publication year - use PUB_YEAR field
    if (metadata.issued && typeof metadata.issued === 'object' && metadata.issued['date-parts'] && metadata.issued['date-parts'][0] && metadata.issued['date-parts'][0][0]) {
      const year = metadata.issued['date-parts'][0][0]
      queryParts.push(`PUB_YEAR:${year}`)
    }

    // 5. Volume and issue for more precise matching
    if (metadata.volume) {
      queryParts.push(`VOLUME:"${this.escapeSearchTerm(String(metadata.volume))}"`)
    }

    if (metadata.issue) {
      queryParts.push(`ISSUE:"${this.escapeSearchTerm(String(metadata.issue))}"`)
    }

    // 6. ISSN for journal identification (if available)
    if (metadata.ISSN) {
      queryParts.push(`ISSN:"${metadata.ISSN}"`)
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
  private parseEuropePmcWork(work: EuropePmcWork): CSLItem {
    const metadata: CSLItem = {
      id: generateUUID(),
      type: 'article-journal', // Default type, will be updated if needed
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
          // Parse name into given/family
          const nameParts = cleanAuthor.split(/\s+/)
          if (nameParts.length > 1) {
            return {
              given: nameParts.slice(0, -1).join(' '),
              family: nameParts[nameParts.length - 1],
            }
          }
          else {
            return {
              family: cleanAuthor || 'Unknown',
            }
          }
        })
        .filter(Boolean)
      if (authors.length > 0) {
        metadata.author = authors
      }
    }
    else if (work.authorList?.author && Array.isArray(work.authorList.author)) {
      // Use structured author data if available
      const authors = work.authorList.author.map((author: any) => {
        if (author.firstName && author.lastName) {
          return {
            given: author.firstName,
            family: author.lastName,
          }
        }
        else if (author.fullName) {
          // Parse fullName into given/family
          const nameParts = author.fullName.trim().split(/\s+/)
          if (nameParts.length > 1) {
            return {
              given: nameParts.slice(0, -1).join(' '),
              family: nameParts[nameParts.length - 1],
            }
          }
          else {
            return {
              family: author.fullName || 'Unknown',
            }
          }
        }
        else if (author.lastName) {
          return {
            family: author.lastName,
            given: author.initials || author.firstName,
          }
        }
        return {
          family: 'Unknown',
        }
      }).filter((author): author is { given?: string, family: string } => Boolean(author))

      if (authors.length > 0) {
        metadata.author = authors
      }
    }

    // Source/Journal information
    if (work.journalTitle) {
      metadata['container-title'] = work.journalTitle
    }

    // Publication dates
    if (work.pubYear) {
      const year = Number.parseInt(work.pubYear, 10)
      if (!Number.isNaN(year)) {
        metadata.issued = { 'date-parts': [[year]] }
      }
    }

    // Try to extract month and day from various date fields
    if (work.firstPublicationDate || work.electronicPublicationDate || work.printPublicationDate) {
      const dateString = work.firstPublicationDate || work.electronicPublicationDate || work.printPublicationDate
      if (dateString) {
        const date = new Date(dateString)
        if (!Number.isNaN(date.getTime())) {
          const year = date.getFullYear()
          const month = date.getMonth() + 1 // getMonth() returns 0-11
          const day = date.getDate()
          metadata.issued = { 'date-parts': [[year, month, day]] }
        }
      }
    }

    // Volume and issue
    if (work.journalVolume) {
      metadata.volume = work.journalVolume
    }

    if (work.issue) {
      metadata.issue = work.issue
    }

    // Page information
    if (work.pageInfo) {
      metadata.page = work.pageInfo
    }

    // External identifiers
    if (work.doi) {
      // Clean DOI - remove https://doi.org/ prefix if present
      metadata.DOI = work.doi.replace(/^https:\/\/doi\.org\//, '')
    }

    if (work.pmid) {
      metadata.PMID = work.pmid
    }

    if (work.pmcid) {
      metadata.PMCID = work.pmcid
    }

    // ISSN - could be in several places
    if (work.journalInfo?.journal?.ISSN) {
      metadata.ISSN = work.journalInfo.journal.ISSN
    }
    else if (work.journalIssn) {
      metadata.ISSN = work.journalIssn
    }

    // Abstract (if available)
    if (work.abstractText) {
      metadata.abstract = work.abstractText
    }

    // Publisher information
    if (work.journalInfo?.journal?.publisherName) {
      metadata.publisher = work.journalInfo.journal.publisherName
    }

    // Source type based on publication type
    if (work.pubTypeList?.pubType) {
      const pubTypes = Array.isArray(work.pubTypeList.pubType)
        ? work.pubTypeList.pubType
        : [work.pubTypeList.pubType]

      // Map Europe PMC publication types to CSL types
      const typeMapping: Record<string, CSLItem['type']> = {
        'research-article': 'article-journal',
        'review-article': 'article-journal',
        'case-reports': 'article-journal',
        'editorial': 'article-journal',
        'letter': 'article-journal',
        'news': 'article-newspaper',
        'other': 'article',
      }

      const primaryType = pubTypes[0]
      if (primaryType && typeMapping[primaryType]) {
        metadata.type = typeMapping[primaryType]
      }
    }

    // Handle preprints
    if (work.source === 'PPR') {
      metadata.type = 'article' // CSL doesn't have a specific preprint type

      // For preprints, the journal info might actually be the preprint server
      if (work.journalTitle && !metadata['container-title']) {
        metadata['container-title'] = work.journalTitle
      }
    }

    return metadata
  }
}

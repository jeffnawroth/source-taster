import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'
import process from 'node:process'

export class EuropePmcService {
  private baseUrl = 'https://www.ebi.ac.uk/europepmc/webservices/rest'
  private email: string | undefined

  constructor(email?: string) {
    this.email = email || process.env.EUROPEPMC_EMAIL
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

      const data = await response.json() as any

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

      const data = await response.json() as any

      // Always take the first result - trust Europe PMC ranking
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
      console.error('Europe PMC search error:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Use fielded search for more precise queries - following Europe PMC best practices
    if (metadata.title) {
      // Use TITLE field for precise title matching
      params.append('query', `TITLE:"${metadata.title}"`)
    }
    else {
      // Fallback if no title available
      params.append('query', '*')
    }

    // Set response format and options
    params.append('format', 'json')
    params.append('resultType', 'core') // Get full metadata
    params.append('pageSize', '1') // Only get one result - trust Europe PMC ranking

    // Add email if available for better API performance
    if (this.email) {
      params.append('email', this.email)
    }

    return params.toString()
  }

  /**
   * Build the best URL for a Europe PMC work (prefer DOI, then PMC, then PubMed)
   */
  private buildWorkUrl(work: any): string | undefined {
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
   * Only includes fields defined in the ReferenceMetadata interface.
   * @param work The Europe PMC work object to parse.
   * @returns The parsed ReferenceMetadata object.
   */
  private parseEuropePmcWork(work: any): ReferenceMetadata {
    const metadata: ReferenceMetadata = {}

    // Only include fields that exist in ReferenceMetadata interface
    if (work.title) {
      metadata.title = work.title
    }

    // Parse authors from authorString (format: "Author1, Author2, Author3.")
    if (work.authorString) {
      const authors = work.authorString
        .split(',')
        .map((author: string) => author.trim().replace(/\.$/, '')) // Remove trailing dot
        .filter(Boolean)
      if (authors.length > 0) {
        metadata.authors = authors
      }
    }

    if (work.journalTitle) {
      metadata.journal = work.journalTitle
    }

    if (work.pubYear) {
      const year = Number.parseInt(work.pubYear, 10)
      if (!Number.isNaN(year)) {
        metadata.year = year
      }
    }

    if (work.doi) {
      // Clean DOI - remove https://doi.org/ prefix if present
      metadata.doi = work.doi.replace(/^https:\/\/doi\.org\//, '')
    }

    if (work.journalVolume) {
      metadata.volume = work.journalVolume
    }

    if (work.issue) {
      metadata.issue = work.issue
    }

    if (work.pageInfo) {
      metadata.pages = work.pageInfo
    }

    return metadata
  }
}

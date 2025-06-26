import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class EuropePmcService {
  private baseUrl = 'https://www.ebi.ac.uk/europepmc/webservices/rest'

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
      const query = encodeURIComponent(cleanDoi)
      const url = `${this.baseUrl}/search?query=${query}&format=json&result_type=core&page_size=1`

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
          url: work.doi
            ? `https://doi.org/${work.doi}`
            : work.pmcid
              ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${work.pmcid}/`
              : work.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${work.pmid}/` : undefined,
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
      // Build search query
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

      if (data.resultList?.result && data.resultList.result.length > 0) {
        const work = data.resultList.result[0] // Take the best match
        return {
          id: work.pmid || work.pmcid || work.doi || `europepmc-${Date.now()}`,
          source: 'europepmc',
          metadata: this.parseEuropePmcWork(work),
          url: work.doi
            ? `https://doi.org/${work.doi}`
            : work.pmcid
              ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${work.pmcid}/`
              : work.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${work.pmid}/` : undefined,
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

    // Simple title-based search - much more reliable than complex queries
    if (metadata.title) {
      // Search by title only - most papers have unique titles
      params.append('query', `TITLE:"${metadata.title}"`)
    }
    else {
      // Fallback if no title available
      params.append('query', '*')
    }

    // Set response format and limits - using correct Europe PMC parameter names!
    params.append('format', 'json')
    params.append('result_type', 'core')
    params.append('page_size', '5')

    return params.toString()
  }

  private parseEuropePmcWork(work: any): ReferenceMetadata {
    // Parse authors from authorString (format: "Author1, Author2, Author3.")
    let authors: string[] = []
    if (work.authorString) {
      // Split by comma and clean up
      authors = work.authorString
        .split(',')
        .map((author: string) => author.trim().replace(/\.$/, '')) // Remove trailing dot
        .filter(Boolean)
    }

    // Parse pages
    let pages: string | undefined
    if (work.pageInfo) {
      pages = work.pageInfo
    }

    // Determine best URL (prefer DOI, then PMC)
    let url: string | undefined
    if (work.doi) {
      url = `https://doi.org/${work.doi}`
    }
    else if (work.pmcid) {
      url = `https://www.ncbi.nlm.nih.gov/pmc/articles/${work.pmcid}/`
    }
    else if (work.pmid) {
      url = `https://pubmed.ncbi.nlm.nih.gov/${work.pmid}/`
    }

    return {
      title: work.title,
      authors,
      journal: work.journalTitle, // Correct field name
      year: work.pubYear ? Number.parseInt(work.pubYear) : undefined,
      doi: work.doi,
      volume: work.journalVolume, // Correct field name
      issue: work.issue, // Correct field name
      pages,
      url,
    }
  }
}

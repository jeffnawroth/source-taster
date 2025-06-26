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
      const url = `${this.baseUrl}/search?query=${query}&format=json&resultType=core&pageSize=1`

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
          url: work.fullTextUrlList?.fullTextUrl?.[0]?.url || `https://doi.org/${work.doi}`,
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
          url: work.fullTextUrlList?.fullTextUrl?.[0]?.url || `https://doi.org/${work.doi}`,
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

    // Build query from available metadata
    const queryParts = []

    if (metadata.title) {
      queryParts.push(`TITLE:"${metadata.title}"`)
    }

    if (metadata.authors?.length) {
      // Add first two authors
      metadata.authors.slice(0, 2).forEach((author) => {
        queryParts.push(`AUTH:"${author}"`)
      })
    }

    if (metadata.journal) {
      queryParts.push(`JOURNAL:"${metadata.journal}"`)
    }

    if (metadata.year) {
      queryParts.push(`PUB_YEAR:${metadata.year}`)
    }

    if (queryParts.length > 0) {
      params.append('query', queryParts.join(' AND '))
    }
    else {
      // Fallback query if no specific metadata available
      params.append('query', '*')
    }

    // Set response format and limits
    params.append('format', 'json')
    params.append('resultType', 'core')
    params.append('pageSize', '1')
    params.append('sort', 'relevance')

    return params.toString()
  }

  private parseEuropePmcWork(work: any): ReferenceMetadata {
    // Parse authors
    const authors = work.authorList?.author?.map((author: any) => {
      if (author.fullName) {
        return author.fullName
      }
      if (author.firstName && author.lastName) {
        return `${author.firstName} ${author.lastName}`
      }
      return author.lastName || author.firstName || ''
    }).filter(Boolean) || []

    // Parse pages
    let pages: string | undefined
    if (work.pageInfo) {
      pages = work.pageInfo
    }

    return {
      title: work.title,
      authors,
      journal: work.journalInfo?.journal?.title || work.bookOrReportDetails?.publisher,
      year: work.pubYear ? Number.parseInt(work.pubYear) : undefined,
      doi: work.doi,
      volume: work.journalInfo?.volume,
      issue: work.journalInfo?.issue,
      pages,
      url: work.fullTextUrlList?.fullTextUrl?.[0]?.url,
    }
  }
}

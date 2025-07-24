import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'
import type { components } from '../../types/openAlex'
import process from 'node:process'

// Type aliases for better readability
type Work = components['schemas']['workSchema']
type WorksResponse = components['schemas']['worksResponse']

export class OpenAlexService {
  private baseUrl = 'https://api.openalex.org'
  private mailto: string | undefined
  private userAgent = 'SourceTaster/1.0 (https://github.com/source-taster/source-taster)'

  constructor(mailto?: string) {
    this.mailto = mailto || process.env.OPENALEX_MAILTO
  }

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
        if (directResult)
          return directResult
      }

      // Fallback to query-based search
      return await this.searchByQuery(metadata)
    }
    catch (error) {
      console.error('OpenAlex search error:', error)
    }

    return null
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      // Clean DOI and construct direct URL
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      const fullDoi = cleanDoi.startsWith('https://doi.org/') ? cleanDoi : `https://doi.org/${cleanDoi}`

      const url = `${this.baseUrl}/works/${encodeURIComponent(fullDoi)}`

      console.warn(`OpenAlex: Searching by DOI: ${url}`)

      const headers: Record<string, string> = {
        'User-Agent': this.mailto
          ? `${this.userAgent} (mailto:${this.mailto})`
          : this.userAgent,
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        // Check rate limit headers
        this.checkRateLimit(response)
        return null // DOI not found, try query search
      }

      const work = await response.json() as Work

      if (work && work.id) {
        return {
          id: work.id,
          source: 'openalex',
          metadata: this.parseOpenAlexWork(work),
          url: this.extractBestUrl(work),
        }
      }
    }
    catch (error) {
      console.error('OpenAlex DOI search error:', error)
    }

    return null
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      console.warn(`OpenAlex: Query search: ${url}`)

      const headers: Record<string, string> = {
        'User-Agent': this.mailto
          ? `${this.userAgent} (mailto:${this.mailto})`
          : this.userAgent,
      }

      const response = await fetch(url, { headers })

      // Check rate limit headers
      this.checkRateLimit(response)

      const data = await response.json() as WorksResponse

      // Always take the first result - trust OpenAlex ranking
      if (data.results && data.results.length > 0) {
        const work = data.results[0]
        return {
          id: work.id,
          source: 'openalex',
          metadata: this.parseOpenAlexWork(work),
          url: this.extractBestUrl(work),
        }
      }
    }
    catch (error) {
      console.error('OpenAlex query search error:', error)
    }

    return null
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    // Strategy: Prioritize title matching over everything else for better precision
    // Use title.search filter for exact title matching combined with year
    const filters: string[] = []

    // Always use title.search filter if title is available - this is more precise than general search
    if (metadata.title) {
      filters.push(`title.search:${metadata.title}`)
    }

    // Year filter is very reliable and helps narrow down results significantly
    if (metadata.date?.year) {
      filters.push(`publication_year:${metadata.date.year}`)
    }

    // Apply filters as primary search method
    if (filters.length > 0) {
      params.append('filter', filters.join(','))
    }
    else {
      // Fallback: Use general search if no filters available
      const searchTerms: string[] = []
      if (metadata.title)
        searchTerms.push(metadata.title)
      if (metadata.source?.containerTitle)
        searchTerms.push(metadata.source.containerTitle)

      if (searchTerms.length > 0) {
        params.append('search', searchTerms.join(' '))
      }
      else {
        params.append('search', '*')
      }
    }

    // Only get one result - trust OpenAlex ranking
    params.append('per-page', '1')
    params.append('page', '1')

    // Select expanded properties to get more metadata for parsing
    params.append('select', 'id,title,authorships,primary_location,publication_year,publication_date,doi,biblio,ids,type,type_crossref')

    // Note: mailto is now included in User-Agent header instead of URL parameter
    // This follows OpenAlex polite pool recommendations

    return params.toString()
  }

  /**
   * Parses the OpenAlex work object into a ReferenceMetadata object.
   * Enhanced to support more fields from the Reference interface based on OpenAlex API.
   * @param work The OpenAlex work object to parse.
   * @returns The parsed ReferenceMetadata object.
   */
  private parseOpenAlexWork(work: Work): ReferenceMetadata {
    const metadata: ReferenceMetadata = {
      date: {},
      source: {},
    }

    // Title
    if (work.title) {
      metadata.title = work.title
    }
    else if (work.display_name) {
      metadata.title = work.display_name
    }

    // Authors - parse more detailed author information
    if (work.authorships && work.authorships.length > 0) {
      const parsedAuthors = work.authorships
        .map((authorship) => {
          const author = authorship.author
          if (!author?.display_name)
            return null

          // Try to parse first and last name from display_name
          const nameParts = author.display_name.split(' ')
          if (nameParts.length >= 2) {
            return {
              firstName: nameParts.slice(0, -1).join(' '),
              lastName: nameParts[nameParts.length - 1],
            }
          }
          else {
            // If only one name part, treat as lastName
            return {
              lastName: author.display_name,
            }
          }
        })
        .filter(Boolean) as Array<{ firstName?: string, lastName: string }>

      // Use parsed authors if we got any, otherwise fallback to simple strings
      if (parsedAuthors.length > 0) {
        metadata.authors = parsedAuthors
      }
      else {
        metadata.authors = work.authorships
          .map(a => a.author?.display_name)
          .filter(Boolean) as string[]
      }
    }

    // Source information
    if (work.primary_location?.source) {
      const source = work.primary_location.source
      if (source.display_name) {
        metadata.source!.containerTitle = source.display_name
      }

      // Source type mapping - prioritize document type over venue type
      if (work.type_crossref || work.type) {
        metadata.source!.sourceType = this.mapOpenAlexTypeToSourceType((work.type_crossref || work.type)!)
      }

      // ISSN from source
      if (source.issn_l || (source.issn && Array.isArray(source.issn) && source.issn.length > 0)) {
        metadata.identifiers = metadata.identifiers || {}
        metadata.identifiers.issn = source.issn_l || (source.issn as string[])[0]
      }
    }

    // Date information - more comprehensive parsing
    if (work.publication_year) {
      metadata.date!.year = work.publication_year
    }

    // Parse more detailed date if available
    if (work.publication_date) {
      try {
        const pubDate = new Date(work.publication_date)
        metadata.date!.year = pubDate.getFullYear()
        metadata.date!.month = pubDate.toLocaleString('en-US', { month: 'long' })
        metadata.date!.day = pubDate.getDate()
      }
      catch {
        // Ignore date parsing errors
      }
    }

    // External identifiers - comprehensive support
    metadata.identifiers = metadata.identifiers || {}

    if (work.doi) {
      // Clean DOI - remove https://doi.org/ prefix if present
      metadata.identifiers.doi = work.doi.replace(/^https:\/\/doi\.org\//, '')
    }

    if (work.ids) {
      if (work.ids.pmid) {
        metadata.identifiers.pmid = work.ids.pmid.toString()
      }
      if (work.ids.pmcid) {
        // PMC IDs should be stored as PMCID, not PMID
        metadata.identifiers.pmcid = work.ids.pmcid
      }
    }

    // Bibliographic information
    if (work.biblio) {
      if (work.biblio.volume) {
        metadata.source!.volume = work.biblio.volume
      }

      if (work.biblio.issue) {
        metadata.source!.issue = work.biblio.issue
      }

      // Construct pages from first_page and last_page
      if (work.biblio.first_page) {
        if (work.biblio.last_page && work.biblio.first_page !== work.biblio.last_page) {
          metadata.source!.pages = `${work.biblio.first_page}-${work.biblio.last_page}`
        }
        else {
          metadata.source!.pages = work.biblio.first_page
        }
      }
    }

    return metadata
  }

  /**
   * Check rate limit headers and log warnings if limits are low
   */
  private checkRateLimit(response: Response): void {
    const dailyLimit = response.headers.get('x-ratelimit-limit')
    const dailyRemaining = response.headers.get('x-ratelimit-remaining')
    const intervalLimit = response.headers.get('x-ratelimit-interval-limit')
    const intervalRemaining = response.headers.get('x-ratelimit-interval-remaining')

    if (dailyRemaining && Number(dailyRemaining) < 1000) {
      console.warn(`OpenAlex: Daily rate limit low: ${dailyRemaining}/${dailyLimit} remaining`)
    }

    if (intervalRemaining && Number(intervalRemaining) < 5) {
      console.warn(`OpenAlex: Interval rate limit low: ${intervalRemaining}/${intervalLimit} remaining`)
    }
  }

  /**
   * Extract the best URL from an OpenAlex work object.
   * Prioritizes actual landing page URLs over catalog URLs.
   *
   * Priority order:
   * 1. Best OA location landing page URL (for open access)
   * 2. Primary location landing page URL (official publisher link)
   * 3. OpenAlex catalog URL (as fallback)
   */
  private extractBestUrl(work: Work): string {
    // First priority: Best OA location (open access version)
    if (work.best_oa_location?.landing_page_url) {
      return work.best_oa_location.landing_page_url
    }

    // Second priority: Primary location (official publisher)
    if (work.primary_location?.landing_page_url) {
      return work.primary_location.landing_page_url
    }

    // Fallback: OpenAlex catalog URL
    return work.id || ''
  }

  /**
   * Map OpenAlex/Crossref types to human-readable source types.
   * This prioritizes document type over venue type for more accurate classification.
   */
  private mapOpenAlexTypeToSourceType(type: string): string {
    const typeMap: Record<string, string> = {
      // Crossref types (more specific, preferred)
      'journal-article': 'Journal article',
      'proceedings-article': 'Conference paper',
      'book-chapter': 'Book chapter',
      'book': 'Book',
      'monograph': 'Book',
      'edited-book': 'Book',
      'reference-book': 'Book',
      'report': 'Report',
      'dataset': 'Dataset',
      'dissertation': 'Thesis',
      'posted-content': 'Preprint',
      'preprint': 'Preprint',
      'component': 'Other',
      'peer-review': 'Peer review',
      'standard': 'Standard',
      'grant': 'Grant',

      // OpenAlex types (fallback)
      'article': 'Article',
      'paratext': 'Article',
      'other': 'Other',
      'erratum': 'Erratum',
      'letter': 'Letter',
      'editorial': 'Editorial',
      'review': 'Review',
      'retraction': 'Retraction',
    }

    return typeMap[type?.toLowerCase()] || 'Article'
  }
}

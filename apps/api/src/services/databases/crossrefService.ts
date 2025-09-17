import type { Author, DateInfo, ExternalIdentifiers, ExternalSource, ReferenceMetadata, SourceInfo } from '@source-taster/types'
import type { components } from '../../types/crossref'
import process from 'node:process'

// Type aliases for better readability
type CrossrefWork = components['schemas']['Work']
type CrossrefWorksMessage = components['schemas']['WorksMessage']

export class CrossrefService {
  private baseUrl = 'https://api.crossref.org'
  private readonly mailto = process.env.CROSSREF_MAILTO || 'your-email@domain.com' // For the "polite pool" - better performance
  private readonly userAgent = `source-taster/1.0 (https://github.com/your-repo/source-taster; mailto:${this.mailto}) CrossrefService/1.0`

  constructor() {
    // Warn if no proper email is configured for Crossref "polite pool"
    if (!process.env.CROSSREF_MAILTO || this.mailto === 'your-email@domain.com') {
      console.warn('⚠️  Crossref: No CROSSREF_MAILTO environment variable set. Consider setting it for better API performance and access to the "polite pool".')
    }
  }

  async search(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // If DOI is available, search directly by DOI (most reliable)
      if (metadata.identifiers?.doi) {
        const directResult = await this.searchByDOI(metadata.identifiers.doi)
        if (directResult)
          return directResult
      }

      // Try bibliographic search first (most accurate for citation lookup)
      if (this.hasBibliographicData(metadata)) {
        const bibResult = await this.searchByBibliographic(metadata)
        if (bibResult)
          return bibResult
      }

      // Fallback to query-based search
      return await this.searchByQuery(metadata)
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return null
  }

  private hasBibliographicData(metadata: ReferenceMetadata): boolean {
    return !!(metadata.title && metadata.authors?.length && metadata.date?.year)
  }

  private async searchByDOI(doi: string): Promise<ExternalSource | null> {
    try {
      const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:/, '')
      const url = `${this.baseUrl}/works/${encodeURIComponent(cleanDoi)}`

      console.warn(`Crossref: Searching by DOI: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      // Check for rate limiting as recommended by Crossref
      if (response.headers.get('X-Rate-Limit-Limit')) {
        const rateLimit = response.headers.get('X-Rate-Limit-Limit')
        const rateLimitInterval = response.headers.get('X-Rate-Limit-Interval')
        // Only log if rate limit is low to avoid spam
        if (Number.parseInt(rateLimit || '0') < 10) {
          console.warn(`Crossref rate limit low: ${rateLimit}/${rateLimitInterval}`)
        }
      }

      if (!response.ok) {
        return null // DOI not found, try query search
      }

      const data = await response.json() as { message: CrossrefWork }

      if (data.message) {
        const work = data.message
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.warn('Crossref DOI search failed:', error)
    }

    return null
  }

  /**
   * Search using bibliographic query - most accurate for citation lookup
   * Uses query.bibliographic which includes titles, authors, ISSNs and publication years
   */
  private async searchByBibliographic(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      const params = new URLSearchParams()

      // Build bibliographic query string
      const bibQuery = this.buildBibliographicQuery(metadata)
      params.append('query.bibliographic', bibQuery)

      // Add filters for better matching
      if (metadata.date?.year) {
        params.append('filter', `from-pub-date:${metadata.date.year},until-pub-date:${metadata.date.year}`)
      }

      // Limit results and select relevant fields
      params.append('rows', '1') // Only need the best match
      params.append('sort', 'score')
      params.append('order', 'desc')
      params.append('select', 'title,author,issued,published,published-print,published-online,DOI,container-title,volume,issue,page,URL,type,publisher,abstract')
      params.append('mailto', this.mailto)

      const url = `${this.baseUrl}/works?${params.toString()}`
      console.warn(`Crossref: Bibliographic search: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw new Error(`Crossref API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as CrossrefWorksMessage

      if (data.message?.items && data.message.items.length > 0) {
        // Take the first (best) result from Crossref's relevance ranking
        const work = data.message.items[0]
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.error('Crossref bibliographic search error:', error)
    }

    return null
  }

  private buildBibliographicQuery(metadata: ReferenceMetadata): string {
    const parts: string[] = []

    if (metadata.title) {
      parts.push(metadata.title)
    }

    if (metadata.authors?.length) {
      // Add first author's surname for better matching
      const firstAuthor = metadata.authors[0]
      let surname: string | undefined

      // authors array should contain Author objects according to schema
      if (firstAuthor && typeof firstAuthor === 'object' && 'lastName' in firstAuthor) {
        surname = firstAuthor.lastName
      }

      if (surname && surname.length > 1) { // Avoid single letters
        parts.push(surname)
      }

      // Add additional authors for better matching if available
      if (metadata.authors.length > 1) {
        const secondAuthor = metadata.authors[1]
        let secondSurname: string | undefined

        if (secondAuthor && typeof secondAuthor === 'object' && 'lastName' in secondAuthor) {
          secondSurname = secondAuthor.lastName
        }

        if (secondSurname && secondSurname.length > 1) {
          parts.push(secondSurname)
        }
      }
    }

    if (metadata.date?.year) {
      parts.push(metadata.date.year.toString())
    }

    if (metadata.source?.containerTitle) {
      parts.push(metadata.source.containerTitle)
    }

    // Add volume if available for better matching
    if (metadata.source?.volume) {
      parts.push(`vol ${metadata.source.volume}`)
    }

    // Add DOI if available (highest confidence)
    if (metadata.identifiers?.doi) {
      parts.push(metadata.identifiers.doi)
    }

    // Add ISBN for books
    if (metadata.identifiers?.isbn) {
      parts.push(metadata.identifiers.isbn)
    }

    // Add publisher for books and reports
    if (metadata.source?.publisher && ['Book', 'Report', 'Thesis'].includes(metadata.source?.sourceType || '')) {
      parts.push(metadata.source.publisher)
    }

    return parts.join(' ')
  }

  private async searchByQuery(metadata: ReferenceMetadata): Promise<ExternalSource | null> {
    try {
      // Build search query using field-specific queries for better accuracy
      const params = this.buildAdvancedSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${params}`

      console.warn(`Crossref: Advanced query search: ${url}`)
      console.warn(`Crossref: Query params debug:`, params)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw new Error(`Crossref API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as CrossrefWorksMessage

      if (data.message?.items && data.message.items.length > 0) {
        // Take the first (best) result from Crossref's relevance ranking
        const work = data.message.items[0]
        return {
          id: work.DOI || work.URL || `crossref-${Date.now()}`,
          source: 'crossref',
          metadata: this.parseCrossrefWork(work),
          url: work.URL || `https://doi.org/${work.DOI}`,
        }
      }
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return null
  }

  private buildAdvancedSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    console.warn('Crossref: Building query for metadata:', JSON.stringify(metadata, null, 2))

    // Use simple query approach - much more reliable
    const queryParts: string[] = []

    if (metadata.title) {
      queryParts.push(metadata.title)
    }

    if (metadata.authors?.length) {
      const firstAuthor = metadata.authors[0]
      if (typeof firstAuthor === 'string') {
        queryParts.push(firstAuthor)
      }
      else {
        if (firstAuthor.lastName) {
          queryParts.push(firstAuthor.lastName)
        }
      }
    }

    if (metadata.source?.containerTitle) {
      queryParts.push(metadata.source.containerTitle)
    }

    const queryString = queryParts.join(' ')
    console.warn('Crossref: Simple query string:', queryString)

    if (queryString.trim()) {
      params.append('query', queryString)
    }
    else {
      params.append('query', '*')
    }

    // Keep minimal, reliable parameters only
    params.append('rows', '3') // Get a few results to find the best match
    params.append('sort', 'relevance')
    params.append('order', 'desc')
    params.append('mailto', this.mailto)

    const result = params.toString()
    console.warn('Crossref: Final query string:', result)
    return result
  }

  private parseCrossrefWork(work: CrossrefWork): ReferenceMetadata {
    // Parse publication date with comprehensive handling
    const dateInfo = this.parseCrossrefDate(work)

    // Parse authors with enhanced handling for complex author structures
    const authors = this.parseCrossrefAuthors(work.author || [])

    // Parse additional contributors (editors, translators, etc.)
    const contributors = this.parseCrossrefContributors(work.editor || [], work.translator || [])

    // Get raw title and subtitle from Crossref
    const title = work.title?.[0] || work['short-title']?.[0] || work['original-title']?.[0]
    const subtitle = work.subtitle?.[0] || work.title?.[1] // Sometimes subtitle is in title[1]

    // Get raw journal/container name from Crossref
    const containerTitle = work['container-title']?.[0] || work['short-container-title']?.[0]

    // Get raw publisher information from Crossref
    const publisher = work.publisher
    const publicationPlace = work['publisher-location']

    // Use raw work type instead of mapping to standardized sourceType
    const sourceType = work.type

    // Extract comprehensive identifiers
    const identifiers = this.extractCrossrefIdentifiers(work)

    // Handle URL with preference for official DOI URL
    let url: string | undefined
    if (work.DOI) {
      url = `https://doi.org/${work.DOI}`
    }
    else if (work.URL) {
      url = work.URL
    }

    // Parse pages - return raw value
    const pages = this.parseCrossrefPages(work.page)

    // Get raw source information from Crossref
    const sourceInfo = this.buildSourceInfo(work, {
      containerTitle,
      subtitle,
      publisher,
      publicationPlace,
      url,
      sourceType,
      pages,
      contributors,
    })

    return {
      title,
      authors,
      date: dateInfo!,
      source: sourceInfo!,
      identifiers,
    }
  }

  /**
   * Parse date information from Crossref work with comprehensive handling
   */
  /**
   * Parse date information from Crossref work - return raw values
   */
  private parseCrossrefDate(work: CrossrefWork): DateInfo {
    let year: number | undefined
    let month: string | undefined
    let day: number | undefined

    const dateFields = [
      work.issued,
      work.published,
      work['published-print'],
      work['published-online'],
      work['content-created'],
    ]

    // Find the most complete date information
    for (const dateField of dateFields) {
      // The date-parts field exists in the API but the generated types are too restrictive
      // We need to work with the actual structure returned by the API
      if (dateField && typeof dateField === 'object') {
        const dateFieldWithParts = dateField as Record<string, unknown>
        const dateParts = (dateFieldWithParts?.['date-parts'] as number[][] | undefined)?.[0]
        if (dateParts && Array.isArray(dateParts)) {
          if (typeof dateParts[0] === 'number' && dateParts[0] > 0)
            year = dateParts[0]
          if (typeof dateParts[1] === 'number' && dateParts[1] > 0) {
            // Keep month as number, don't convert to string
            month = dateParts[1].toString()
          }
          if (typeof dateParts[2] === 'number' && dateParts[2] > 0)
            day = dateParts[2]
          break
        }
      }
    }

    const dateInfo: DateInfo = {
      year,
      month,
      day,
    }

    // Check for "in press" status - raw value from Crossref
    const workWithStatus = work as Record<string, unknown>
    if (workWithStatus.status === 'aheadofprint' || workWithStatus.status === 'in-press') {
      dateInfo.inPress = true
    }

    return dateInfo
  }

  /**
   * Parse authors from Crossref work - return raw structure
   */
  private parseCrossrefAuthors(authorArray: components['schemas']['Author'][]): Author[] {
    return authorArray.map((author) => {
      if (author.given && author.family) {
        // Return as Author object with raw values
        return {
          firstName: author.given,
          lastName: author.family,
        }
      }

      // Handle cases where only family name is available
      if (author.family && !author.given) {
        return {
          lastName: author.family,
        }
      }

      // Fallback for incomplete data - create Author object with parsed name
      const parts: string[] = []
      if (author.given)
        parts.push(author.given)
      if (author.family)
        parts.push(author.family)

      if (parts.length === 0) {
        // Use author.name if available, otherwise unknown
        const fullName = author.name || 'Unknown Author'
        const nameParts = fullName.trim().split(/\s+/)
        return {
          firstName: nameParts.slice(0, -1).join(' ') || undefined,
          lastName: nameParts[nameParts.length - 1] || 'Unknown',
        }
      }

      // Parse the joined parts into firstName/lastName
      const fullName = parts.join(' ')
      const nameParts = fullName.trim().split(/\s+/)
      return {
        firstName: nameParts.slice(0, -1).join(' ') || undefined,
        lastName: nameParts[nameParts.length - 1] || 'Unknown',
      }
    }).filter(Boolean)
  }

  /**
   * Parse contributors (editors, translators, etc.) from Crossref work
   */
  private parseCrossrefContributors(
    editors: components['schemas']['Author'][],
    translators: components['schemas']['Author'][],
  ): Author[] {
    const contributors: Author[] = []

    // Add editors
    editors.forEach((editor) => {
      if (editor.given && editor.family) {
        contributors.push({
          firstName: editor.given,
          lastName: editor.family,
          role: 'editor',
        })
      }
    })

    // Add translators
    translators.forEach((translator) => {
      if (translator.given && translator.family) {
        contributors.push({
          firstName: translator.given,
          lastName: translator.family,
          role: 'translator',
        })
      }
    })

    return contributors
  }

  /**
   * Extract identifiers from Crossref work - return raw values
   */
  private extractCrossrefIdentifiers(work: CrossrefWork): ExternalIdentifiers {
    const identifiers: ExternalIdentifiers = {}

    // DOI - raw value
    if (work.DOI) {
      identifiers.doi = work.DOI
    }

    // ISSN - raw values from Crossref
    if (work.ISSN && work.ISSN.length > 0) {
      // Take first ISSN without preference logic
      identifiers.issn = work.ISSN[0]
    }

    // ISBN - raw value
    if (work.ISBN && work.ISBN.length > 0) {
      identifiers.isbn = work.ISBN[0]
    }

    // PubMed ID from Crossref links - raw extraction
    if (work.link) {
      const pubmedLink = work.link.find(link =>
        link['intended-application'] === 'text-mining'
        && link.URL?.includes('pubmed'),
      )
      if (pubmedLink) {
        const pmidMatch = pubmedLink.URL.match(/\/(\d+)$/)
        if (pmidMatch) {
          identifiers.pmid = pmidMatch[1]
        }
      }
    }

    return identifiers
  }

  /**
   * Parse page information - return raw value from Crossref
   */
  private parseCrossrefPages(pageString?: string): string | undefined {
    return pageString
  }

  /**
   * Build source information - return raw values from Crossref
   */
  private buildSourceInfo(
    work: CrossrefWork,
    baseInfo: {
      containerTitle?: string
      subtitle?: string
      publisher?: string
      publicationPlace?: string
      url?: string
      sourceType: string
      pages?: string
      contributors: Author[]
    },
  ): SourceInfo {
    const sourceInfo: SourceInfo = {
      containerTitle: baseInfo.containerTitle,
      subtitle: baseInfo.subtitle,
      volume: work.volume,
      issue: work.issue,
      pages: baseInfo.pages,
      publisher: baseInfo.publisher,
      publicationPlace: baseInfo.publicationPlace,
      url: baseInfo.url,
      sourceType: baseInfo.sourceType,
      contributors: baseInfo.contributors.length > 0 ? baseInfo.contributors : undefined,
    }

    // Add raw values directly from Crossref
    if (work['article-number']) {
      sourceInfo.articleNumber = work['article-number']
    }

    const workWithExtras = work as Record<string, unknown>
    if (typeof workWithExtras.series === 'string') {
      sourceInfo.series = workWithExtras.series
    }

    if (typeof workWithExtras.edition === 'string') {
      sourceInfo.edition = workWithExtras.edition
    }

    if (work['original-title']?.[0] && work['original-title'][0] !== work.title?.[0]) {
      sourceInfo.originalTitle = work['original-title'][0]
    }

    return sourceInfo
  }
}

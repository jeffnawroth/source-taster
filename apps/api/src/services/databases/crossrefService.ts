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
    return !!(metadata.title && metadata.authors?.length && metadata.date.year)
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
      if (metadata.date.year) {
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
      // Clean title for better matching
      const cleanTitle = metadata.title.replace(/[^\w\s]/g, ' ').trim()
      parts.push(cleanTitle)
    }

    if (metadata.authors?.length) {
      // Add first author's surname for better matching
      const firstAuthor = metadata.authors[0]
      let surname: string | undefined

      if (typeof firstAuthor === 'string') {
        // Parse string format to extract surname
        const nameParts = (firstAuthor as string).split(/[,\s]+/).filter(Boolean)
        // Try to get last word as surname, or first word if comma-separated
        if (firstAuthor.includes(',')) {
          surname = nameParts[0] // "Smith, John" -> "Smith"
        }
        else {
          surname = nameParts[nameParts.length - 1] // "John Smith" -> "Smith"
        }
      }
      else {
        // Handle Author object structure
        surname = firstAuthor.lastName
      }

      if (surname && surname.length > 1) { // Avoid single letters
        parts.push(surname)
      }

      // Add additional authors for better matching if available
      if (metadata.authors.length > 1) {
        const secondAuthor = metadata.authors[1]
        let secondSurname: string | undefined

        if (typeof secondAuthor === 'string') {
          const nameParts = (secondAuthor as string).split(/[,\s]+/).filter(Boolean)
          if (secondAuthor.includes(',')) {
            secondSurname = nameParts[0]
          }
          else {
            secondSurname = nameParts[nameParts.length - 1]
          }
        }
        else {
          secondSurname = secondAuthor.lastName
        }

        if (secondSurname && secondSurname.length > 1) {
          parts.push(secondSurname)
        }
      }
    }

    if (metadata.date.year) {
      parts.push(metadata.date.year.toString())
    }

    if (metadata.source.containerTitle) {
      // Clean journal name for better matching
      const cleanJournal = metadata.source.containerTitle.replace(/[^\w\s]/g, ' ').trim()
      parts.push(cleanJournal)
    }

    // Add volume if available for better matching
    if (metadata.source.volume) {
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
    if (metadata.source.publisher && ['Book', 'Report', 'Thesis'].includes(metadata.source.sourceType || '')) {
      const cleanPublisher = metadata.source.publisher.replace(/[^\w\s]/g, ' ').trim()
      parts.push(cleanPublisher)
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

    if (metadata.source.containerTitle) {
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

    // Get the best available title and subtitle
    const title = work.title?.[0] || work['short-title']?.[0] || work['original-title']?.[0]
    const subtitle = work.subtitle?.[0] || work.title?.[1] // Sometimes subtitle is in title[1]

    // Get the best available journal/container name
    const containerTitle = work['container-title']?.[0] || work['short-container-title']?.[0]

    // Extract publisher information with enhanced details
    const publisher = work.publisher
    const publicationPlace = work['publisher-location']

    // Map work type to our sourceType
    const sourceType = this.mapCrossrefType(work.type)

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

    // Parse pages with enhanced formatting
    const pages = this.parseCrossrefPages(work.page)

    // Extract enhanced source information
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
      date: dateInfo,
      source: sourceInfo,
      identifiers,
    }
  }

  /**
   * Parse date information from Crossref work with comprehensive handling
   */
  /**
   * Parse date information from Crossref work with comprehensive handling
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
        const dateFieldAny = dateField as any
        const dateParts = dateFieldAny?.['date-parts']?.[0] as number[] | undefined
        if (dateParts && Array.isArray(dateParts)) {
          if (typeof dateParts[0] === 'number' && dateParts[0] > 0)
            year = dateParts[0]
          if (typeof dateParts[1] === 'number' && dateParts[1] > 0) {
            // Convert month number to month name
            const monthNames = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ]
            month = monthNames[dateParts[1] - 1]
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

    // Check for "in press" status - the status field isn't in the generated types
    // but can be present in the API response
    const workWithStatus = work as any
    if (workWithStatus.status === 'aheadofprint' || workWithStatus.status === 'in-press') {
      dateInfo.inPress = true
    }

    return dateInfo
  }

  /**
   * Parse authors from Crossref work with enhanced structure support
   */
  private parseCrossrefAuthors(authorArray: components['schemas']['Author'][]): (Author | string)[] {
    return authorArray.map((author) => {
      if (author.given && author.family) {
        // Return as Author object for better structure
        const authorObj: Author = {
          firstName: author.given,
          lastName: author.family,
        }

        // Add role if specified and not default "author"
        if (author.sequence && author.sequence !== 'first') {
          // Crossref uses sequence to indicate author order, not role
          // We could map this if needed, but typically not necessary
        }

        return authorObj
      }

      // Handle cases where only family name is available
      if (author.family && !author.given) {
        return {
          lastName: author.family,
        }
      }

      // Fallback to string format for incomplete data
      const parts: string[] = []
      if (author.given)
        parts.push(author.given)
      if (author.family)
        parts.push(author.family)

      if (parts.length === 0) {
        return author.name || ''
      }

      return parts.join(' ')
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
   * Extract comprehensive identifiers from Crossref work
   */
  private extractCrossrefIdentifiers(work: CrossrefWork): ExternalIdentifiers {
    const identifiers: ExternalIdentifiers = {}

    // DOI
    if (work.DOI) {
      identifiers.doi = work.DOI
    }

    // ISSN - prefer electronic ISSN, fall back to print ISSN
    if (work.ISSN && work.ISSN.length > 0) {
      // Crossref may provide multiple ISSNs, prioritize electronic
      const electronicISSN = work.ISSN.find((issn: string) =>
        work['issn-type']?.find(type => type.value === issn && type.type === 'electronic'),
      )
      identifiers.issn = electronicISSN || work.ISSN[0]
    }

    // ISBN
    if (work.ISBN && work.ISBN.length > 0) {
      identifiers.isbn = work.ISBN[0]
    }

    // PubMed ID from Crossref links
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
   * Parse page information with enhanced formatting
   */
  private parseCrossrefPages(pageString?: string): string | undefined {
    if (!pageString)
      return undefined

    // Clean up common page formatting issues
    let pages = pageString.trim()

    // Handle different page separators
    pages = pages.replace(/[\u2013\u2014]/, '-') // en-dash, em-dash to hyphen
    pages = pages.replace(/\s*-\s*/, '-') // normalize spacing around hyphens

    return pages
  }

  /**
   * Build comprehensive source information
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

    // Add article number for electronic journals
    if (work['article-number']) {
      sourceInfo.articleNumber = work['article-number']
    }

    // Add series information if available (using type assertion for optional properties)
    const workAny = work as any
    if (workAny.series) {
      sourceInfo.series = workAny.series
    }

    // Add edition information
    if (workAny.edition) {
      sourceInfo.edition = workAny.edition
    }

    // Add medium information based on work type and availability
    if (work.type === 'journal-article') {
      // Check if it's an online-only journal
      if (work.ISSN?.length === 1 && work['issn-type']?.some(type => type.type === 'electronic')) {
        sourceInfo.medium = 'web'
      }
      else {
        sourceInfo.medium = 'print'
      }
    }
    else if (work.type === 'posted-content') {
      sourceInfo.medium = 'web'
    }
    else if (work.type === 'book' && work.URL && !work.ISBN) {
      sourceInfo.medium = 'web'
    }

    // Handle special publication types with enhanced information
    if (work.type === 'proceedings-article') {
      sourceInfo.conference = baseInfo.containerTitle
      sourceInfo.sourceType = 'Conference paper'
    }
    else if (work.type === 'dissertation' || work.type === 'thesis') {
      sourceInfo.institution = baseInfo.publisher
      sourceInfo.sourceType = 'Thesis'
    }

    // Add original title for translated works
    if (work['original-title']?.[0] && work['original-title'][0] !== work.title?.[0]) {
      sourceInfo.originalTitle = work['original-title'][0]
    }

    // Extract chapter information for book chapters
    if (work.type === 'book-chapter' && (work as any)['chapter-number']) {
      sourceInfo.chapterTitle = work.title?.[0]
    }

    return sourceInfo
  }

  /**
   * Map Crossref work types to our standardized source types
   */
  private mapCrossrefType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'journal-article': 'Journal article',
      'book': 'Book',
      'book-chapter': 'Book chapter',
      'proceedings-article': 'Conference paper',
      'thesis': 'Thesis',
      'dissertation': 'Thesis',
      'report': 'Report',
      'dataset': 'Dataset',
      'posted-content': 'Preprint',
      'peer-review': 'Peer review',
      'book-series': 'Book series',
      'book-set': 'Book set',
      'book-track': 'Book',
      'edited-book': 'Book',
      'reference-book': 'Reference book',
      'monograph': 'Monograph',
      'component': 'Webpage',
      'standard': 'Standard',
      'report-series': 'Report',
      'proceedings': 'Conference proceedings',
      'other': 'Other',
    }

    return typeMap[type] || 'Other'
  }
}

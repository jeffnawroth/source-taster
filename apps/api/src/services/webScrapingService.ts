import type { ReferenceMetadata } from '@source-taster/types'

interface ScrapedData {
  isAccessible: boolean
  statusCode?: number
  metadata: ReferenceMetadata
}

export class WebScrapingService {
  async scrapeMetadata(url: string): Promise<ScrapedData> {
    try {
      const timeout = 10000

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SourceTaster/1.0; +https://sourcetaster.com/bot)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeout),
      })

      if (!response.ok) {
        return {
          isAccessible: false,
          statusCode: response.status,
          metadata: {},
        }
      }

      const html = await response.text()
      const metadata = this.extractMetadataFromHTML(html)

      return {
        isAccessible: true,
        statusCode: response.status,
        metadata,
      }
    }
    catch (error) {
      return {
        isAccessible: false,
        metadata: {},
        statusCode: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      }
    }
  }

  private extractMetadataFromHTML(html: string): ReferenceMetadata {
    const metadata: ReferenceMetadata = {}

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      metadata.title = this.cleanText(titleMatch[1])
    }

    // Extract meta tags
    const metaTags = html.match(/<meta[^>]+>/gi) || []

    for (const tag of metaTags) {
      const nameMatch = tag.match(/name=["']([^"']+)["']/i)
      const propertyMatch = tag.match(/property=["']([^"']+)["']/i)
      const contentMatch = tag.match(/content=["']([^"']+)["']/i)

      if (!contentMatch)
        continue

      const content = this.cleanText(contentMatch[1])
      const key = nameMatch?.[1] || propertyMatch?.[1]

      if (!key)
        continue

      switch (key.toLowerCase()) {
        case 'title':
        case 'og:title':
        case 'twitter:title':
          if (!metadata.title)
            metadata.title = content
          break
        case 'author':
        case 'authors':
        case 'og:author':
          if (!metadata.authors) {
            metadata.authors = content.split(/[,;]/).map(a => a.trim()).filter(Boolean)
          }
          break
        case 'description':
        case 'og:description':
        case 'twitter:description':
          if (!metadata.abstract)
            metadata.abstract = content
          break
        case 'publication_date':
        case 'published_time':
        case 'og:published_time':
          if (!metadata.year) {
            const yearMatch = content.match(/(\d{4})/)
            if (yearMatch)
              metadata.year = Number.parseInt(yearMatch[1])
          }
          break
        case 'doi':
          if (!metadata.doi)
            metadata.doi = content
          break
        case 'issn':
          if (!metadata.issn)
            metadata.issn = content
          break
        case 'journal':
        case 'publication':
          if (!metadata.journal)
            metadata.journal = content
          break
        case 'publisher':
          if (!metadata.publisher)
            metadata.publisher = content
          break
      }
    }

    // Extract structured data (JSON-LD)
    const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi)
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonMatch = match.match(/>([^<]+)</)?.[1]
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch)
            this.extractFromStructuredData(data, metadata)
          }
        }
        catch {
          // Ignore JSON parsing errors
        }
      }
    }

    // Extract from Dublin Core meta tags
    const dcTags = html.match(/<meta[^>]+name=["']DC\.[^"']+["'][^>]*>/gi) || []
    for (const tag of dcTags) {
      const nameMatch = tag.match(/name=["']DC\.([^"']+)["']/i)
      const contentMatch = tag.match(/content=["']([^"']+)["']/i)

      if (nameMatch && contentMatch) {
        const dcField = nameMatch[1].toLowerCase()
        const content = this.cleanText(contentMatch[1])

        switch (dcField) {
          case 'title':
            if (!metadata.title)
              metadata.title = content
            break
          case 'creator':
          case 'contributor':
            if (!metadata.authors) {
              metadata.authors = [content]
            }
            else {
              metadata.authors.push(content)
            }
            break
          case 'date':
            if (!metadata.year) {
              const yearMatch = content.match(/(\d{4})/)
              if (yearMatch)
                metadata.year = Number.parseInt(yearMatch[1])
            }
            break
          case 'description':
            if (!metadata.abstract)
              metadata.abstract = content
            break
          case 'publisher':
            if (!metadata.publisher)
              metadata.publisher = content
            break
          case 'source':
            if (!metadata.journal)
              metadata.journal = content
            break
        }
      }
    }

    return metadata
  }

  private extractFromStructuredData(data: any, metadata: ReferenceMetadata) {
    if (Array.isArray(data)) {
      for (const item of data) {
        this.extractFromStructuredData(item, metadata)
      }
      return
    }

    if (typeof data !== 'object' || !data)
      return

    // Handle different schema types
    const type = data['@type'] || data.type

    if (type === 'Article' || type === 'ScholarlyArticle' || type === 'NewsArticle') {
      if (data.headline && !metadata.title) {
        metadata.title = this.cleanText(data.headline)
      }

      if (data.author && !metadata.authors) {
        metadata.authors = this.extractAuthors(data.author)
      }

      if (data.datePublished && !metadata.year) {
        const yearMatch = data.datePublished.match(/(\d{4})/)
        if (yearMatch)
          metadata.year = Number.parseInt(yearMatch[1])
      }

      if (data.description && !metadata.abstract) {
        metadata.abstract = this.cleanText(data.description)
      }

      if (data.publisher && !metadata.publisher) {
        const publisherName = typeof data.publisher === 'string'
          ? data.publisher
          : data.publisher.name
        if (publisherName)
          metadata.publisher = this.cleanText(publisherName)
      }
    }
  }

  private extractAuthors(authorData: any): string[] {
    if (typeof authorData === 'string') {
      return [this.cleanText(authorData)]
    }

    if (Array.isArray(authorData)) {
      return authorData.map((author) => {
        if (typeof author === 'string')
          return this.cleanText(author)
        if (author.name)
          return this.cleanText(author.name)
        if (author.givenName && author.familyName) {
          return this.cleanText(`${author.givenName} ${author.familyName}`)
        }
        return ''
      }).filter(Boolean)
    }

    if (authorData.name) {
      return [this.cleanText(authorData.name)]
    }

    return []
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'')
      .trim()
  }
}

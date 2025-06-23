import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class CrossrefService {
  private baseUrl = 'https://api.crossref.org'

  async search(metadata: ReferenceMetadata): Promise<ExternalSource[]> {
    const results: ExternalSource[] = []

    try {
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      const response = await fetch(url)
      const data = await response.json() as any

      if (data.message?.items) {
        for (const work of data.message.items) {
          results.push({
            id: work.DOI,
            source: 'crossref',
            metadata: this.parseCrossrefWork(work),
            url: work.URL,
            confidence: this.calculateConfidence(metadata, work),
          })
        }
      }
    }
    catch (error) {
      console.error('Crossref search error:', error)
    }

    return results
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    if (metadata.title) {
      params.append('query.title', metadata.title)
    }

    if (metadata.authors && metadata.authors.length > 0) {
      params.append('query.author', metadata.authors[0])
    }

    if (metadata.doi) {
      params.append('query', metadata.doi)
    }

    params.append('rows', '10')

    return params.toString()
  }

  private parseCrossrefWork(work: any): ReferenceMetadata {
    return {
      title: work.title?.[0],
      authors: work.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
      journal: work['container-title']?.[0],
      year: work.published?.['date-parts']?.[0]?.[0],
      doi: work.DOI,
      issn: work.ISSN?.[0],
      volume: work.volume,
      issue: work.issue,
      pages: work.page,
      publisher: work.publisher,
      abstract: work.abstract,
    }
  }

  private calculateConfidence(original: ReferenceMetadata, work: any): number {
    let score = 0
    let factors = 0

    // DOI match is very strong
    if (original.doi && work.DOI) {
      score += original.doi === work.DOI ? 1 : 0
      factors++
    }

    // Title similarity
    if (original.title && work.title?.[0]) {
      const similarity = this.calculateStringSimilarity(original.title, work.title[0])
      score += similarity
      factors++
    }

    return factors > 0 ? score / factors : 0
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0)
      return 1

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array.from({ length: str2.length + 1 }, () =>
      Array.from({ length: str1.length + 1 }, () => 0))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost,
        )
      }
    }

    return matrix[str2.length][str1.length]
  }
}

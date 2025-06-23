import type { ExternalSource, ReferenceMetadata } from '@source-taster/types'

export class OpenAlexService {
  private baseUrl = 'https://api.openalex.org'

  async search(metadata: ReferenceMetadata): Promise<ExternalSource[]> {
    const results: ExternalSource[] = []

    try {
      // Build search query
      const queryParams = this.buildSearchQuery(metadata)
      const url = `${this.baseUrl}/works?${queryParams}`

      const response = await fetch(url)
      const data = await response.json() as any

      if (data.results) {
        for (const work of data.results) {
          results.push({
            id: work.id,
            source: 'openalex',
            metadata: this.parseOpenAlexWork(work),
            url: work.id,
            confidence: this.calculateConfidence(metadata, work),
          })
        }
      }
    }
    catch (error) {
      console.error('OpenAlex search error:', error)
    }

    return results
  }

  private buildSearchQuery(metadata: ReferenceMetadata): string {
    const params = new URLSearchParams()

    if (metadata.title) {
      params.append('search', metadata.title)
    }

    if (metadata.doi) {
      params.append('filter', `doi:${metadata.doi}`)
    }

    if (metadata.year) {
      params.append('filter', `publication_year:${metadata.year}`)
    }

    params.append('per-page', '10')

    return params.toString()
  }

  private parseOpenAlexWork(work: any): ReferenceMetadata {
    return {
      title: work.title,
      authors: work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean) || [],
      journal: work.primary_location?.source?.display_name,
      year: work.publication_year,
      doi: work.doi?.replace('https://doi.org/', ''),
      volume: work.biblio?.volume,
      issue: work.biblio?.issue,
      pages: work.biblio?.first_page && work.biblio?.last_page
        ? `${work.biblio.first_page}-${work.biblio.last_page}`
        : undefined,
      abstract: work.abstract_inverted_index ? this.reconstructAbstract(work.abstract_inverted_index) : undefined,
    }
  }

  private reconstructAbstract(invertedIndex: Record<string, number[]>): string {
    const words: string[] = []

    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        words[pos] = word
      }
    }

    return words.join(' ')
  }

  private calculateConfidence(original: ReferenceMetadata, work: any): number {
    let score = 0
    let factors = 0

    // DOI match is very strong
    if (original.doi && work.doi) {
      score += original.doi === work.doi?.replace('https://doi.org/', '') ? 1 : 0
      factors++
    }

    // Title similarity
    if (original.title && work.title) {
      const similarity = this.calculateStringSimilarity(original.title, work.title)
      score += similarity
      factors++
    }

    // Year match
    if (original.year && work.publication_year) {
      score += original.year === work.publication_year ? 1 : 0
      factors++
    }

    return factors > 0 ? score / factors : 0
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

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

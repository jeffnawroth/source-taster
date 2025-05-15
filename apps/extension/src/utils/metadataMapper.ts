import type { WorkSchema } from '../clients/open-alex'
import type { EuropePmcPublication, PublicationMetadata } from '../types'

export function mapEuropePMCToPublication(result: EuropePmcPublication): PublicationMetadata {
  return {
    id: result.id.toString(),
    title: result.title,
    authors: result.authorString.split(',').map(author => author.trim()),
    year: result.pubYear,
    journal: result.journalTitle,
    volume: result.journalVolume,
    issue: result.issue,
    pages: result.pageInfo,
    doi: result.doi,
  }
}

export function mapOpenAlexToPublication(result: WorkSchema): PublicationMetadata {
  return {
    id: result.id,
    title: result.title,
    authors: result.authorships?.map(author => author.author.display_name),
    year: result.publication_year,
    volume: result.biblio?.volume,
    issue: result.biblio?.issue,
    pages: result.biblio?.first_page && result.biblio?.last_page
      ? `${result.biblio.first_page}-${result.biblio.last_page}`
      : result.biblio?.first_page || result.biblio?.last_page,
    doi: result.doi,
    url: result.primary_location?.landing_page_url,
    journal: result.primary_location?.source?.display_name,
  }
}

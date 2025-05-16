import type { Work } from '../clients/crossref-client/models/Work'
import type { WorkSchema } from '../clients/open-alex'
import type { EuropePmcPublication, PublicationMetadata } from '../types'

export function mapEuropePMCToPublication(result: EuropePmcPublication): PublicationMetadata {
  return {
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

export function mapCrossrefToPublication(result: Work): PublicationMetadata {
  return {
    title: result.title?.[0],
    authors: result.author?.map(author => `${author.given} ${author.family}`),
    year: result.published?.dateParts[0][0],
    volume: result.volume,
    issue: result.issue,
    pages: result.page,
    doi: result.dOI,
    journal: result.containerTitle?.[0],
    url: result.uRL,

  }
}

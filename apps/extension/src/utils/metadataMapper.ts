import type { Work } from '../api/crossref/models/Work'
import type { WorkSchema } from '../clients/open-alex'
import type { EuropePmcPublication, PublicationMetadata, ReferenceMetadata } from '../types'

/**
 * Maps a Europe PMC publication to a standard publication metadata format.
 * @param result The Europe PMC publication to map.
 * @returns The mapped publication metadata.
 */
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

/**
 * Maps an OpenAlex work to a standard publication metadata format.
 * @param result The OpenAlex work to map.
 * @returns The mapped publication metadata.
 */
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

/**
 * Maps a Crossref work to a standard publication metadata format.
 * @param result The Crossref work to map.
 * @returns The mapped publication metadata.
 */
export function mapCrossrefToPublication(result: Work): PublicationMetadata {
  return {
    title: result.title?.[0],
    authors: result.author?.map(author => `${author.given} ${author.family}`),
    year: result.publishedPrint?.dateParts[0][0],
    volume: result.volume,
    issue: result.issue,
    pages: result.page,
    doi: result.dOI,
    journal: result.containerTitle?.[0],
    url: result.uRL,

  }
}

/**
 * Maps a reference metadata object to a standard publication metadata format.
 * @param ref The reference metadata to map.
 * @returns The mapped publication metadata.
 */
export function mapReferenceToPublication(
  ref: ReferenceMetadata,
): PublicationMetadata {
  return {
    title: ref.title ?? undefined,
    authors: ref.authors ?? undefined,
    year: ref.year ?? undefined,
    journal: ref.journal ?? undefined,
    volume: ref.volume ?? undefined,
    issue: ref.issue ?? undefined,
    pages: ref.pages ?? undefined,
    doi: ref.doi ?? undefined,
    url: ref.url ?? undefined,
  }
}

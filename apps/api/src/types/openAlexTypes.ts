/**
 * Minimal OpenAlex Types for our Service
 * Extracted from the OpenAPI-generated client
 * Only includes types we actually use in OpenAlexService
 */

// ========================================
// Author related types
// ========================================

export interface AuthorshipsInnerAuthor {
  displayName: string
  id: string
  orcid?: string
}

export interface AuthorshipsInnerInstitutionsInner {
  countryCode?: string
  displayName?: string
  id?: string
  lineage?: Array<string>
  ror?: string
  type?: string
}

export interface AuthorshipsInner {
  author: AuthorshipsInnerAuthor
  authorPosition: string
  countries: Array<string>
  institutions: Array<AuthorshipsInnerInstitutionsInner>
  isCorresponding: boolean
  rawAffiliationString?: string
  rawAffiliationStrings: Array<string>
  rawAuthorName: string
}

export interface Authorships extends Array<AuthorshipsInner> {}

// ========================================
// Location and Source types
// ========================================

export interface LocationSource {
  displayName?: string
  hostOrganization?: string
  hostOrganizationLineage?: Array<string>
  hostOrganizationLineageNames?: Array<string>
  hostOrganizationName?: string
  id?: string
  isInDoaj?: boolean
  isOa?: boolean
  issn?: Array<string>
  issnL?: string
  type?: string
}

export interface Location {
  isOa?: boolean
  landingPageUrl?: string
  license?: string
  pdfUrl?: string
  source?: LocationSource
  version?: string
}

// ========================================
// Bibliographic types
// ========================================

export interface WorkBiblio {
  firstPage?: string
  issue?: string
  lastPage?: string
  volume?: string
}

export interface Ids {
  doi?: string
  mag?: string
  openalex?: string
  pmcid?: string
  pmid?: string
}

// ========================================
// Work types (main interface)
// ========================================

export interface Work {
  authorships?: Authorships
  bestOaLocation?: Location
  biblio?: WorkBiblio
  citedByCount?: number
  displayName: string
  doi?: string
  id: string
  ids?: Ids
  primaryLocation?: Location
  publicationDate?: string
  publicationYear?: number
  title?: string
  type?: string
  typeCrossref?: string
  updatedDate?: string
}

// ========================================
// Response types
// ========================================

export interface Meta {
  count: number
  dbResponseTimeMs?: number
  page?: number
  perPage?: number
}

export interface WorksArray extends Array<Work> {}

export interface WorksResponse {
  meta: Meta
  results: WorksArray
}

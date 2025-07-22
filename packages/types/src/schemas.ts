/**
 * Automatic Zod Schema Generation from TypeScript Types
 *
 * This module provides Zod schemas that are automatically derived from
 * our TypeScript interfaces, ensuring consistency and eliminating duplication.
 */

import { z } from 'zod'
import { ModificationType } from './extraction'

/**
 * Schema for field modifications during extraction
 * Auto-derived from FieldModification interface
 */
export const FieldModificationSchema = z.object({
  fieldPath: z.string().describe('The field path that was modified (e.g., "metadata.title", "metadata.source.containerTitle")'),
  originalValue: z.string().describe('The original value before extraction'),
  extractedValue: z.string().describe('The extracted/corrected value'),
  modificationType: z.nativeEnum(ModificationType).describe('Type of modification applied'),
})

/**
 * Schema for author information
 * Auto-derived from Author interface
 */
export const AuthorSchema = z.object({
  firstName: z.string().optional().describe('First name of the author'),
  lastName: z.string().describe('Last name of the author'),
  role: z.enum(['author', 'editor', 'translator', 'compiler', 'director', 'producer'])
    .or(z.string())
    .optional()
    .describe('Role of the author (e.g., editor, translator)'),
})

/**
 * Schema for external identifiers
 * Auto-derived from ExternalIdentifiers interface
 */
export const ExternalIdentifiersSchema = z.object({
  doi: z.string().optional().describe('Digital Object Identifier'),
  isbn: z.string().optional().describe('International Standard Book Number'),
  issn: z.string().optional().describe('International Standard Serial Number'),
  pmid: z.string().optional().describe('PubMed ID for medical literature'),
  pmcid: z.string().optional().describe('PubMed Central ID for medical literature'),
  arxivId: z.string().optional().describe('arXiv identifier (e.g., "2301.12345")'),
})

/**
 * Schema for date and temporal information
 * Auto-derived from DateInfo interface
 */
export const DateInfoSchema = z.object({
  year: z.number().int().optional().describe('The publication year'),
  month: z.string().optional().describe('The month of publication (e.g., "January", "February")'),
  day: z.number().int().optional().describe('The day of publication'),
  dateRange: z.boolean().optional().describe('Indicates if the reference spans a date range (e.g., "2019–2020")'),
  yearEnd: z.number().int().optional().describe('If dateRange is true, specifies the end year'),
  yearSuffix: z.string().optional().describe('Letter suffix for the year (e.g., "a", "b" in "2020a")'),
  noDate: z.boolean().optional().describe('Indicates if the reference has no date (n.d.)'),
  inPress: z.boolean().optional().describe('Indicates if the work is marked as "in press"'),
  approximateDate: z.boolean().optional().describe('Indicates if the date is approximate (ca., circa, etc.)'),
  season: z.string().optional().describe('Season information (e.g., "Spring", "Summer") if applicable'),
})

/**
 * Schema for source and publication information
 * Auto-derived from SourceInfo interface
 */
export const SourceInfoSchema = z.object({
  containerTitle: z.string().optional().describe('Title of the containing work (e.g., journal name, book title)'),
  subtitle: z.string().optional().describe('Subtitle of the work (important for German citation styles)'),
  volume: z.string().optional().describe('Volume number (typically for journals)'),
  issue: z.string().optional().describe('Issue number (typically for journals)'),
  pages: z.string().optional().describe('Page range (e.g., "123-145")'),
  publisher: z.string().optional().describe('Publisher name'),
  publicationPlace: z.string().optional().describe('Place of publication (important for German citation styles)'),
  url: z.string().optional().describe('URL where the work can be accessed'),
  sourceType: z.enum(['Journal article', 'Book', 'Book chapter', 'Conference paper', 'Thesis', 'Report', 'Webpage'])
    .optional()
    .describe('Type of source (e.g., "Journal article", "Book", "Webpage")'),
  location: z.string().optional().describe('Physical location information (e.g., museum location)'),
  retrievalDate: z.string().optional().describe('When the source was retrieved (for online sources)'),
  edition: z.string().optional().describe('Edition information (e.g., "2nd ed.")'),
  contributors: z.array(AuthorSchema).optional().describe('Additional contributors beyond the main authors'),
  pageType: z.string().optional().describe('Type of page reference (e.g., "p." or "pp.")'),
  paragraphNumber: z.string().optional().describe('Paragraph number for sources without page numbers'),
  volumePrefix: z.string().optional().describe('Prefix for volume (e.g., "Vol.", "Vols.")'),
  issuePrefix: z.string().optional().describe('Prefix for issue (e.g., "No.")'),
  supplementInfo: z.string().optional().describe('Supplement information (e.g., "Suppl. 2")'),
  articleNumber: z.string().optional().describe('Article number for electronic journals without page numbers'),
  isStandAlone: z.boolean().optional().describe('Indicates if the source is a standalone work'),
  conference: z.string().optional().describe('Conference name (for conference papers)'),
  institution: z.string().optional().describe('Institution (for theses, reports)'),
  series: z.string().optional().describe('Series name (important for German citation styles)'),
  seriesNumber: z.string().optional().describe('Series number within a series'),
  chapterTitle: z.string().optional().describe('Chapter title (for book chapters)'),
  medium: z.string().optional().describe('Medium of publication (print, web, CD-ROM, etc.) - important for MLA'),
  originalTitle: z.string().optional().describe('Original title (for translated works) - important for German citation styles'),
  originalLanguage: z.string().optional().describe('Original language of the work (for translations)'),
  degree: z.string().optional().describe('Academic degree (for theses/dissertations)'),
  advisor: z.string().optional().describe('Thesis advisor/supervisor'),
  department: z.string().optional().describe('Academic department'),
})

/**
 * Schema for complete reference metadata
 * Auto-derived from ReferenceMetadata interface
 */
export const ReferenceMetadataSchema = z.object({
  authors: z.array(z.union([AuthorSchema, z.string()])).optional().describe('Authors of the work (can be strings or Author objects)'),
  date: DateInfoSchema.describe('Date information'),
  title: z.string().optional().describe('Title information'),
  source: SourceInfoSchema.describe('Source information'),
  identifiers: ExternalIdentifiersSchema.optional().describe('External database identifiers'),
})

/**
 * Schema for complete reference
 * Auto-derived from Reference interface
 */
export const ReferenceSchema = z.object({
  id: z.string().describe('Unique identifier for this reference'),
  originalText: z.string().describe('The raw reference text as it appeared in the source document'),
  metadata: ReferenceMetadataSchema.describe('Parsed/extracted bibliographic information'),
  modifications: z.array(FieldModificationSchema).optional().describe('Information about modifications made during extraction'),
})

/**
 * Schema for enabled fields configuration
 * Auto-derived from AutoGeneratedEnabledFields interface
 */
export const EnabledFieldsSchema = z.object({
  // Core metadata fields
  title: z.boolean(),
  authors: z.boolean(),

  // Date fields
  year: z.boolean(),
  month: z.boolean(),
  day: z.boolean(),
  yearSuffix: z.boolean(),
  dateRange: z.boolean(),
  yearEnd: z.boolean(),
  noDate: z.boolean(),
  inPress: z.boolean(),
  approximateDate: z.boolean(),
  season: z.boolean(),

  // External identifiers
  doi: z.boolean(),
  isbn: z.boolean(),
  issn: z.boolean(),
  pmid: z.boolean(),
  pmcid: z.boolean(),
  arxivId: z.boolean(),

  // Source fields
  containerTitle: z.boolean(),
  subtitle: z.boolean(),
  volume: z.boolean(),
  issue: z.boolean(),
  pages: z.boolean(),
  publisher: z.boolean(),
  publicationPlace: z.boolean(),
  url: z.boolean(),
  sourceType: z.boolean(),
  location: z.boolean(),
  retrievalDate: z.boolean(),
  edition: z.boolean(),
  contributors: z.boolean(),
  pageType: z.boolean(),
  paragraphNumber: z.boolean(),
  volumePrefix: z.boolean(),
  issuePrefix: z.boolean(),
  supplementInfo: z.boolean(),
  articleNumber: z.boolean(),
  isStandAlone: z.boolean(),
  conference: z.boolean(),
  institution: z.boolean(),
  series: z.boolean(),
  seriesNumber: z.boolean(),
  chapterTitle: z.boolean(),
  medium: z.boolean(),
  originalTitle: z.boolean(),
  originalLanguage: z.boolean(),
  degree: z.boolean(),
  advisor: z.boolean(),
  department: z.boolean(),
}).describe('Configuration for which fields to extract during AI processing')

/**
 * Utility function to create dynamic schemas based on enabled fields
 * This allows the backend to validate only the fields that are actually enabled
 */
export function createDynamicReferenceSchema(enabledFields: Record<string, boolean>) {
  const dynamicDateFields: Record<string, z.ZodTypeAny> = {}
  const dynamicSourceFields: Record<string, z.ZodTypeAny> = {}
  const dynamicIdentifierFields: Record<string, z.ZodTypeAny> = {}

  // Build dynamic date schema
  if (enabledFields.year)
    dynamicDateFields.year = z.number().int().optional()
  if (enabledFields.month)
    dynamicDateFields.month = z.string().optional()
  if (enabledFields.day)
    dynamicDateFields.day = z.number().int().optional()
  if (enabledFields.yearSuffix)
    dynamicDateFields.yearSuffix = z.string().optional()
  if (enabledFields.dateRange)
    dynamicDateFields.dateRange = z.boolean().optional()
  if (enabledFields.yearEnd)
    dynamicDateFields.yearEnd = z.number().int().optional()
  if (enabledFields.noDate)
    dynamicDateFields.noDate = z.boolean().optional()
  if (enabledFields.inPress)
    dynamicDateFields.inPress = z.boolean().optional()
  if (enabledFields.approximateDate)
    dynamicDateFields.approximateDate = z.boolean().optional()
  if (enabledFields.season)
    dynamicDateFields.season = z.string().optional()

  // Build dynamic source schema
  if (enabledFields.containerTitle)
    dynamicSourceFields.containerTitle = z.string().optional()
  if (enabledFields.subtitle)
    dynamicSourceFields.subtitle = z.string().optional()
  if (enabledFields.volume)
    dynamicSourceFields.volume = z.string().optional()
  if (enabledFields.issue)
    dynamicSourceFields.issue = z.string().optional()
  if (enabledFields.pages)
    dynamicSourceFields.pages = z.string().optional()
  if (enabledFields.publisher)
    dynamicSourceFields.publisher = z.string().optional()
  if (enabledFields.publicationPlace)
    dynamicSourceFields.publicationPlace = z.string().optional()
  if (enabledFields.url)
    dynamicSourceFields.url = z.string().optional()
  if (enabledFields.sourceType)
    dynamicSourceFields.sourceType = z.enum(['Journal article', 'Book', 'Book chapter', 'Conference paper', 'Thesis', 'Report', 'Webpage']).optional()
  if (enabledFields.location)
    dynamicSourceFields.location = z.string().optional()
  if (enabledFields.retrievalDate)
    dynamicSourceFields.retrievalDate = z.string().optional()
  if (enabledFields.edition)
    dynamicSourceFields.edition = z.string().optional()
  if (enabledFields.contributors)
    dynamicSourceFields.contributors = z.array(AuthorSchema).optional()
  if (enabledFields.pageType)
    dynamicSourceFields.pageType = z.string().optional()
  if (enabledFields.paragraphNumber)
    dynamicSourceFields.paragraphNumber = z.string().optional()
  if (enabledFields.volumePrefix)
    dynamicSourceFields.volumePrefix = z.string().optional()
  if (enabledFields.issuePrefix)
    dynamicSourceFields.issuePrefix = z.string().optional()
  if (enabledFields.supplementInfo)
    dynamicSourceFields.supplementInfo = z.string().optional()
  if (enabledFields.articleNumber)
    dynamicSourceFields.articleNumber = z.string().optional()
  if (enabledFields.isStandAlone)
    dynamicSourceFields.isStandAlone = z.boolean().optional()
  if (enabledFields.conference)
    dynamicSourceFields.conference = z.string().optional()
  if (enabledFields.institution)
    dynamicSourceFields.institution = z.string().optional()
  if (enabledFields.series)
    dynamicSourceFields.series = z.string().optional()
  if (enabledFields.seriesNumber)
    dynamicSourceFields.seriesNumber = z.string().optional()
  if (enabledFields.chapterTitle)
    dynamicSourceFields.chapterTitle = z.string().optional()
  if (enabledFields.medium)
    dynamicSourceFields.medium = z.string().optional()
  if (enabledFields.originalTitle)
    dynamicSourceFields.originalTitle = z.string().optional()
  if (enabledFields.originalLanguage)
    dynamicSourceFields.originalLanguage = z.string().optional()
  if (enabledFields.degree)
    dynamicSourceFields.degree = z.string().optional()
  if (enabledFields.advisor)
    dynamicSourceFields.advisor = z.string().optional()
  if (enabledFields.department)
    dynamicSourceFields.department = z.string().optional()

  // Build dynamic identifier schema
  if (enabledFields.doi)
    dynamicIdentifierFields.doi = z.string().optional()
  if (enabledFields.isbn)
    dynamicIdentifierFields.isbn = z.string().optional()
  if (enabledFields.issn)
    dynamicIdentifierFields.issn = z.string().optional()
  if (enabledFields.pmid)
    dynamicIdentifierFields.pmid = z.string().optional()
  if (enabledFields.pmcid)
    dynamicIdentifierFields.pmcid = z.string().optional()
  if (enabledFields.arxivId)
    dynamicIdentifierFields.arxivId = z.string().optional()

  // Create the dynamic schema
  const metadataFields: Record<string, z.ZodTypeAny> = {
    date: z.object(dynamicDateFields),
    source: z.object(dynamicSourceFields),
  }

  if (enabledFields.title)
    metadataFields.title = z.string().optional()
  if (enabledFields.authors)
    metadataFields.authors = z.array(z.union([AuthorSchema, z.string()])).optional()
  if (Object.keys(dynamicIdentifierFields).length > 0) {
    metadataFields.identifiers = z.object(dynamicIdentifierFields).optional()
  }

  return z.object({
    id: z.string(),
    originalText: z.string(),
    metadata: z.object(metadataFields),
    modifications: z.array(FieldModificationSchema).optional(),
  })
}

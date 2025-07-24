/**
 * Core reference and metadata types
 */

import type { AIExtractedReference } from './ai'
import z from 'zod'

/**
 * Represents a single bibliographic reference
 */
export interface Reference extends AIExtractedReference {
  /** Unique identifier for this reference */
  id: string
}

/**
 * Bibliographic metadata for a reference
 *
 * This interface includes fields that are:
 * 1. Supported by at least one external database (for verification/matching)
 * 2. Required for complete citation style rendering (APA, Harvard, MLA, German)
 * 3. Commonly found in real-world bibliographic references
 *
 * Some fields may not be supported by all databases but are retained for
 * citation style completeness and future database expansion.
 */

export const AuthorSchema = z.object({
  firstName: z.string().optional().describe('First name(s) of the author (e.g., "John", "Mary Jane")'),
  lastName: z.string().describe('Last name/surname of the author (e.g., "Smith")'),
  role: z.string().optional().describe('Optional role of the author (e.g., "editor", "translator")'),
})

export type Author = z.infer<typeof AuthorSchema>

export const ExternalIdentifiersSchema = z.object({
  doi: z.string().optional().describe('Digital Object Identifier'),
  isbn: z.string().optional().describe('International Standard Book Number'),
  issn: z.string().optional().describe('International Standard Serial Number'),
  pmid: z.string().optional().describe('PubMed ID for medical literature'),
  pmcid: z.string().optional().describe('PubMed Central ID for medical literature'),
  arxivId: z.string().optional().describe('arXiv identifier (e.g., "2301.12345")'),
})

export type ExternalIdentifiers = z.infer<typeof ExternalIdentifiersSchema>

export const DateInfoSchema = z.object({
  year: z.number().int().optional().describe('Publication year'),
  month: z.string().optional().describe('Publication month'),
  day: z.number().int().optional().describe('Publication day'),
  dateRange: z.boolean().optional().describe('Indicates if this is a date range'),
  yearEnd: z.number().int().optional().describe('End year for date ranges'),
  yearSuffix: z.string().optional().describe('Year suffix like "a" or "b"'),
  noDate: z.boolean().optional().describe('Indicates if no date is available'),
  inPress: z.boolean().optional().describe('Indicates if work is in press'),
  approximateDate: z.boolean().optional().describe('Indicates if date is approximate'),
  season: z.string().optional().describe('Season of publication'),
})

export type DateInfo = z.infer<typeof DateInfoSchema>

export const SourceInfoSchema = z.object({
  containerTitle: z.string().optional().describe('Journal or book title'),
  subtitle: z.string().optional().describe('Subtitle of the work'),
  volume: z.string().optional().describe('Volume number'),
  issue: z.string().optional().describe('Issue number'),
  pages: z.string().optional().describe('Page range'),
  publisher: z.string().optional().describe('Publisher name'),
  publicationPlace: z.string().optional().describe('Place of publication'),
  url: z.string().optional().describe('URL of the source'),
  sourceType: z.string().optional().describe('Type of source'),
  location: z.string().optional().describe('Physical location'),
  retrievalDate: z.string().optional().describe('Date the source was retrieved'),
  edition: z.string().optional().describe('Edition information'),
  contributors: z.array(AuthorSchema).optional().describe('Additional contributors beyond the main authors'),
  pageType: z.string().optional().describe('Type of page reference (e.g., "p.", "pp.")'),
  paragraphNumber: z.string().optional().describe('Paragraph number for sources without page numbers'),
  volumePrefix: z.string().optional().describe('Prefix for volume (e.g., "Vol.", "Vols.")'),
  issuePrefix: z.string().optional().describe('Prefix for issue (e.g., "No.")'),
  supplementInfo: z.string().optional().describe('Supplement information (e.g., "Suppl. 2")'),
  articleNumber: z.string().optional().describe('Article number for electronic journals without page numbers'),
  isStandAlone: z.boolean().optional().describe('Indicates if the source is a standalone work'),
  conference: z.string().optional().describe('Conference name'),
  institution: z.string().optional().describe('Institution name'),
  series: z.string().optional().describe('Series name'),
  seriesNumber: z.string().optional().describe('Series number'),
  chapterTitle: z.string().optional().describe('Chapter title'),
  medium: z.string().optional().describe('Medium of publication'),
  originalTitle: z.string().optional().describe('Original title'),
  originalLanguage: z.string().optional().describe('Original language'),
  degree: z.string().optional().describe('Academic degree'),
  advisor: z.string().optional().describe('Thesis advisor/supervisor'),
  department: z.string().optional().describe('Academic department'),
})

export type SourceInfo = z.infer<typeof SourceInfoSchema>

export const ReferenceMetadataSchema = z.object({
  title: z.string().optional().describe('Title of the work'),
  authors: z.array(z.union([z.string(), AuthorSchema])).optional().describe('List of author names or author objects'),
  date: DateInfoSchema.optional().describe('Date information'),
  source: SourceInfoSchema.optional().describe('Source information'),
  identifiers: ExternalIdentifiersSchema.optional().describe('External database identifiers'),
})

export type ReferenceMetadata = z.infer<typeof ReferenceMetadataSchema>

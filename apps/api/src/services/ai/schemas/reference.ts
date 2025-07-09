import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Zod schemas for reference extraction
export const AuthorSchema = z.object({
  firstName: z.string().optional().describe('First name of the author'),
  lastName: z.string().describe('Last name of the author'),
  role: z.string().optional().describe('Role of the author (e.g., editor, translator)'),
})

export const DateInfoSchema = z.object({
  year: z.number().int().optional().describe('Publication year'),
  month: z.string().optional().describe('Publication month'),
  day: z.number().int().optional().describe('Publication day'),
  yearSuffix: z.string().optional().describe('Year suffix like "a" or "b"'),
  noDate: z.boolean().optional().describe('Indicates if no date is available'),
  inPress: z.boolean().optional().describe('Indicates if work is in press'),
  approximateDate: z.boolean().optional().describe('Indicates if date is approximate'),
  season: z.string().optional().describe('Season of publication'),
  dateRange: z.boolean().optional().describe('Indicates if this is a date range'),
  yearEnd: z.number().int().optional().describe('End year for date ranges'),
})

export const SourceInfoSchema = z.object({
  containerTitle: z.string().optional().describe('Journal or book title'),
  subtitle: z.string().optional().describe('Subtitle of the work'),
  volume: z.string().optional().describe('Volume number'),
  issue: z.string().optional().describe('Issue number'),
  pages: z.string().optional().describe('Page range'),
  publisher: z.string().optional().describe('Publisher name'),
  publicationPlace: z.string().optional().describe('Place of publication'),
  location: z.string().optional().describe('Physical location'),
  url: z.string().optional().describe('URL of the source'),
  sourceType: z.enum(['Journal article', 'Book', 'Book chapter', 'Conference paper', 'Thesis', 'Report', 'Webpage']).optional().describe('Type of source'),
  retrievalDate: z.string().optional().describe('Date the source was retrieved'),
  edition: z.string().optional().describe('Edition information'),
  pageType: z.string().optional().describe('Type of page reference'),
  paragraphNumber: z.string().optional().describe('Paragraph number'),
  volumePrefix: z.string().optional().describe('Volume prefix'),
  issuePrefix: z.string().optional().describe('Issue prefix'),
  supplementInfo: z.string().optional().describe('Supplement information'),
  articleNumber: z.string().optional().describe('Article number'),
  isStandAlone: z.boolean().optional().describe('Whether this is a standalone work'),
  conference: z.string().optional().describe('Conference name'),
  institution: z.string().optional().describe('Institution name'),
  series: z.string().optional().describe('Series name'),
  seriesNumber: z.string().optional().describe('Series number'),
  chapterTitle: z.string().optional().describe('Chapter title'),
  medium: z.string().optional().describe('Medium of publication'),
  originalTitle: z.string().optional().describe('Original title for translations'),
  originalLanguage: z.string().optional().describe('Original language'),
  degree: z.string().optional().describe('Academic degree'),
  advisor: z.string().optional().describe('Thesis advisor'),
  department: z.string().optional().describe('Academic department'),
  contributors: z.array(AuthorSchema).optional().describe('Additional contributors beyond the main authors'),
})

export const ExternalIdentifiersSchema = z.object({
  doi: z.string().optional().describe('Digital Object Identifier'),
  pmid: z.string().optional().describe('PubMed ID'),
  pmcid: z.string().optional().describe('PMC ID'),
  isbn: z.string().optional().describe('International Standard Book Number'),
  issn: z.string().optional().describe('International Standard Serial Number'),
  arxivId: z.string().optional().describe('arXiv identifier'),
})

export const ReferenceMetadataSchema = z.object({
  title: z.string().optional().describe('Title of the work'),
  authors: z.array(z.union([z.string(), AuthorSchema])).optional().describe('List of author names or author objects'),
  date: DateInfoSchema.describe('Date information'),
  source: SourceInfoSchema.describe('Source information'),
  identifiers: ExternalIdentifiersSchema.optional().describe('External database identifiers'),
})

export const ReferenceSchema = z.object({
  originalText: z.string().describe('Complete reference as it appears in the text'),
  metadata: ReferenceMetadataSchema.describe('Parsed bibliographic information'),
})

export const ExtractionResponseSchema = z.object({
  references: z.array(ReferenceSchema).describe('Array of extracted references'),
})

// Generate JSON Schema from Zod
export const extractionJsonSchema = {
  name: 'reference_extraction',
  schema: zodToJsonSchema(ExtractionResponseSchema, {
    $refStrategy: 'none', // Inline all schemas for OpenAI compatibility
  }),
}

// Export Zod types for external use
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>
export type ZodReference = z.infer<typeof ReferenceSchema>
export type ZodReferenceMetadata = z.infer<typeof ReferenceMetadataSchema>
export type ZodAuthor = z.infer<typeof AuthorSchema>

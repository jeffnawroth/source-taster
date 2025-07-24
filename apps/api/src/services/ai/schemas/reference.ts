import { AuthorSchema, type ExtractionSettings, FieldProcessingResultSchema } from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Create dynamic schema based on extraction settings
export function createDynamicExtractionSchema(extractionSettings: ExtractionSettings) {
  const enabledFields = extractionSettings.extractionConfig

  // Create dynamic ExternalIdentifiersSchema based on enabled fields
  const dynamicIdentifiersFields: Record<string, z.ZodOptional<z.ZodString>> = {}
  if (enabledFields.includes('doi'))
    dynamicIdentifiersFields.doi = z.string().optional().describe('Digital Object Identifier')
  if (enabledFields.includes('pmid'))
    dynamicIdentifiersFields.pmid = z.string().optional().describe('PubMed ID')
  if (enabledFields.includes('pmcid'))
    dynamicIdentifiersFields.pmcid = z.string().optional().describe('PMC ID')
  if (enabledFields.includes('isbn'))
    dynamicIdentifiersFields.isbn = z.string().optional().describe('International Standard Book Number')
  if (enabledFields.includes('issn'))
    dynamicIdentifiersFields.issn = z.string().optional().describe('International Standard Serial Number')
  if (enabledFields.includes('arxivId'))
    dynamicIdentifiersFields.arxivId = z.string().optional().describe('arXiv identifier')

  const DynamicExternalIdentifiersSchema = z.object(dynamicIdentifiersFields)

  // Create dynamic SourceInfoSchema based on enabled fields
  const dynamicSourceFields: Record<string, any> = {}
  if (enabledFields.includes('containerTitle'))
    dynamicSourceFields.containerTitle = z.string().optional().describe('Journal or book title')
  if (enabledFields.includes('subtitle'))
    dynamicSourceFields.subtitle = z.string().optional().describe('Subtitle of the work')
  if (enabledFields.includes('volume'))
    dynamicSourceFields.volume = z.string().optional().describe('Volume number')
  if (enabledFields.includes('issue'))
    dynamicSourceFields.issue = z.string().optional().describe('Issue number')
  if (enabledFields.includes('pages'))
    dynamicSourceFields.pages = z.string().optional().describe('Page range')
  if (enabledFields.includes('publisher'))
    dynamicSourceFields.publisher = z.string().optional().describe('Publisher name')
  if (enabledFields.includes('publicationPlace'))
    dynamicSourceFields.publicationPlace = z.string().optional().describe('Place of publication')
  if (enabledFields.includes('location'))
    dynamicSourceFields.location = z.string().optional().describe('Physical location')
  if (enabledFields.includes('url'))
    dynamicSourceFields.url = z.string().optional().describe('URL of the source')
  if (enabledFields.includes('sourceType'))
    dynamicSourceFields.sourceType = z.string().optional().describe('Type of source')
  if (enabledFields.includes('retrievalDate'))
    dynamicSourceFields.retrievalDate = z.string().optional().describe('Date the source was retrieved')
  if (enabledFields.includes('edition'))
    dynamicSourceFields.edition = z.string().optional().describe('Edition information')
  if (enabledFields.includes('pageType'))
    dynamicSourceFields.pageType = z.string().optional().describe('Type of page reference')
  if (enabledFields.includes('paragraphNumber'))
    dynamicSourceFields.paragraphNumber = z.string().optional().describe('Paragraph number')
  if (enabledFields.includes('volumePrefix'))
    dynamicSourceFields.volumePrefix = z.string().optional().describe('Volume prefix')
  if (enabledFields.includes('issuePrefix'))
    dynamicSourceFields.issuePrefix = z.string().optional().describe('Issue prefix')
  if (enabledFields.includes('supplementInfo'))
    dynamicSourceFields.supplementInfo = z.string().optional().describe('Supplement information')
  if (enabledFields.includes('articleNumber'))
    dynamicSourceFields.articleNumber = z.string().optional().describe('Article number')
  if (enabledFields.includes('conference'))
    dynamicSourceFields.conference = z.string().optional().describe('Conference name')
  if (enabledFields.includes('institution'))
    dynamicSourceFields.institution = z.string().optional().describe('Institution name')
  if (enabledFields.includes('series'))
    dynamicSourceFields.series = z.string().optional().describe('Series name')
  if (enabledFields.includes('seriesNumber'))
    dynamicSourceFields.seriesNumber = z.string().optional().describe('Series number')
  if (enabledFields.includes('chapterTitle'))
    dynamicSourceFields.chapterTitle = z.string().optional().describe('Chapter title')
  if (enabledFields.includes('medium'))
    dynamicSourceFields.medium = z.string().optional().describe('Medium of publication')
  if (enabledFields.includes('originalTitle'))
    dynamicSourceFields.originalTitle = z.string().optional().describe('Original title for translations')
  if (enabledFields.includes('originalLanguage'))
    dynamicSourceFields.originalLanguage = z.string().optional().describe('Original language')
  if (enabledFields.includes('degree'))
    dynamicSourceFields.degree = z.string().optional().describe('Academic degree')
  if (enabledFields.includes('advisor'))
    dynamicSourceFields.advisor = z.string().optional().describe('Thesis advisor')
  if (enabledFields.includes('department'))
    dynamicSourceFields.department = z.string().optional().describe('Academic department')
  if (enabledFields.includes('contributors'))
    dynamicSourceFields.contributors = z.array(AuthorSchema).optional().describe('Additional contributors beyond the main authors')
  if (enabledFields.includes('isStandAlone'))
    dynamicSourceFields.isStandAlone = z.boolean().optional().describe('Whether this is a standalone work')

  const DynamicSourceInfoSchema = z.object(dynamicSourceFields)

  // Create dynamic DateInfoSchema based on enabled fields
  const dynamicDateFields: Record<string, any> = {}
  if (enabledFields.includes('year'))
    dynamicDateFields.year = z.number().int().optional().describe('Publication year')
  if (enabledFields.includes('month'))
    dynamicDateFields.month = z.string().optional().describe('Publication month')
  if (enabledFields.includes('day'))
    dynamicDateFields.day = z.number().int().optional().describe('Publication day')
  if (enabledFields.includes('yearSuffix'))
    dynamicDateFields.yearSuffix = z.string().optional().describe('Year suffix like "a" or "b"')
  if (enabledFields.includes('noDate'))
    dynamicDateFields.noDate = z.boolean().optional().describe('Indicates if no date is available')
  if (enabledFields.includes('inPress'))
    dynamicDateFields.inPress = z.boolean().optional().describe('Indicates if work is in press')
  if (enabledFields.includes('approximateDate'))
    dynamicDateFields.approximateDate = z.boolean().optional().describe('Indicates if date is approximate')
  if (enabledFields.includes('season'))
    dynamicDateFields.season = z.string().optional().describe('Season of publication')
  if (enabledFields.includes('dateRange'))
    dynamicDateFields.dateRange = z.boolean().optional().describe('Indicates if this is a date range')
  if (enabledFields.includes('yearEnd'))
    dynamicDateFields.yearEnd = z.number().int().optional().describe('End year for date ranges')

  const DynamicDateInfoSchema = z.object(dynamicDateFields)

  // Create dynamic ReferenceMetadataSchema
  const dynamicMetadataFields: Record<string, any> = {}
  if (enabledFields.includes('title'))
    dynamicMetadataFields.title = z.string().optional().describe('Title of the work')
  if (enabledFields.includes('authors'))
    dynamicMetadataFields.authors = z.array(z.union([z.string(), AuthorSchema])).optional().describe('List of author names or author objects')

  // Only include date if any date fields are enabled
  if (Object.keys(dynamicDateFields).length > 0) {
    dynamicMetadataFields.date = DynamicDateInfoSchema.describe('Date information')
  }

  // Only include source if any source fields are enabled
  if (Object.keys(dynamicSourceFields).length > 0) {
    dynamicMetadataFields.source = DynamicSourceInfoSchema.describe('Source information')
  }

  // Only include identifiers if any identifier fields are enabled
  if (Object.keys(dynamicIdentifiersFields).length > 0) {
    dynamicMetadataFields.identifiers = DynamicExternalIdentifiersSchema.optional().describe('External database identifiers')
  }

  const DynamicReferenceMetadataSchema = z.object(dynamicMetadataFields)

  const DynamicReferenceSchema = z.object({
    originalText: z.string().describe('Complete reference as it appears in the text'),
    metadata: DynamicReferenceMetadataSchema.describe('Parsed bibliographic information'),
    processingResults: z.array(FieldProcessingResultSchema).optional().describe('Results of field processing, if available'),
  })

  const DynamicExtractionResponseSchema = z.object({
    references: z.array(DynamicReferenceSchema).describe('Array of extracted references'),
  })

  return {
    name: 'reference_extraction',
    schema: zodToJsonSchema(DynamicExtractionResponseSchema, {
      $refStrategy: 'none',
    }),
  }
}

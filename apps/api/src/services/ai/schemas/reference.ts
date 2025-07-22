import type { ExtractionSettings } from '@source-taster/types'
import { DEFAULT_MODIFICATION_SETTINGS } from '@source-taster/types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { getExtractionInstructions } from '../extractionInstructions'

// Zod schemas for reference extraction
export const FieldModificationSchema = z.object({
  fieldPath: z.string().describe('The field path that was modified (e.g., "metadata.title", "metadata.source.containerTitle")'),
  originalValue: z.string().describe('The original value before extraction'),
  extractedValue: z.string().describe('The extracted/corrected value'),
  modificationType: z.enum([
    'typo-correction',
    'capitalization',
    'abbreviation-expansion',
    'punctuation-standardization',
    'format-standardization',
    'derivation',
    'interpretation',
    'author-name-formatting',
    'date-formatting',
    'identifier-standardization',
    'unicode-fixing',
    'ocr-error-correction',
    'title-case-conversion',
    'duplicate-removal',
    'field-derivation',
    'information-reconstruction',
    'formatting-correction',
  ]).describe('Type of modification applied'),
})

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
  modifications: z.array(FieldModificationSchema).optional().describe('Array of modifications made during extraction'),
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

// Create dynamic schema based on extraction settings
export function createDynamicExtractionSchema(extractionSettings?: ExtractionSettings) {
  if (!extractionSettings) {
    // Return default schema with balanced mode instructions for fallback
    const defaultSchema = { ...extractionJsonSchema }
    const instructions = getExtractionInstructions(DEFAULT_MODIFICATION_SETTINGS)
    if (defaultSchema.schema && typeof defaultSchema.schema === 'object' && 'description' in defaultSchema.schema) {
      defaultSchema.schema.description = `${instructions}\n\n${defaultSchema.schema.description || ''}`
    }
    else if (defaultSchema.schema && typeof defaultSchema.schema === 'object') {
      (defaultSchema.schema as any).description = instructions
    }
    return defaultSchema
  }

  const enabledFields = extractionSettings.enabledFields

  // Create dynamic ExternalIdentifiersSchema based on enabled fields
  const dynamicIdentifiersFields: Record<string, z.ZodOptional<z.ZodString>> = {}
  if (enabledFields.doi)
    dynamicIdentifiersFields.doi = z.string().optional().describe('Digital Object Identifier')
  if (enabledFields.pmid)
    dynamicIdentifiersFields.pmid = z.string().optional().describe('PubMed ID')
  if (enabledFields.pmcid)
    dynamicIdentifiersFields.pmcid = z.string().optional().describe('PMC ID')
  if (enabledFields.isbn)
    dynamicIdentifiersFields.isbn = z.string().optional().describe('International Standard Book Number')
  if (enabledFields.issn)
    dynamicIdentifiersFields.issn = z.string().optional().describe('International Standard Serial Number')
  if (enabledFields.arxivId)
    dynamicIdentifiersFields.arxivId = z.string().optional().describe('arXiv identifier')

  const DynamicExternalIdentifiersSchema = z.object(dynamicIdentifiersFields)

  // Create dynamic SourceInfoSchema based on enabled fields
  const dynamicSourceFields: Record<string, any> = {}
  if (enabledFields.containerTitle)
    dynamicSourceFields.containerTitle = z.string().optional().describe('Journal or book title')
  if (enabledFields.subtitle)
    dynamicSourceFields.subtitle = z.string().optional().describe('Subtitle of the work')
  if (enabledFields.volume)
    dynamicSourceFields.volume = z.string().optional().describe('Volume number')
  if (enabledFields.issue)
    dynamicSourceFields.issue = z.string().optional().describe('Issue number')
  if (enabledFields.pages)
    dynamicSourceFields.pages = z.string().optional().describe('Page range')
  if (enabledFields.publisher)
    dynamicSourceFields.publisher = z.string().optional().describe('Publisher name')
  if (enabledFields.publicationPlace)
    dynamicSourceFields.publicationPlace = z.string().optional().describe('Place of publication')
  if (enabledFields.location)
    dynamicSourceFields.location = z.string().optional().describe('Physical location')
  if (enabledFields.url)
    dynamicSourceFields.url = z.string().optional().describe('URL of the source')
  if (enabledFields.sourceType)
    dynamicSourceFields.sourceType = z.enum(['Journal article', 'Book', 'Book chapter', 'Conference paper', 'Thesis', 'Report', 'Webpage']).optional().describe('Type of source')
  if (enabledFields.retrievalDate)
    dynamicSourceFields.retrievalDate = z.string().optional().describe('Date the source was retrieved')
  if (enabledFields.edition)
    dynamicSourceFields.edition = z.string().optional().describe('Edition information')
  if (enabledFields.pageType)
    dynamicSourceFields.pageType = z.string().optional().describe('Type of page reference')
  if (enabledFields.paragraphNumber)
    dynamicSourceFields.paragraphNumber = z.string().optional().describe('Paragraph number')
  if (enabledFields.volumePrefix)
    dynamicSourceFields.volumePrefix = z.string().optional().describe('Volume prefix')
  if (enabledFields.issuePrefix)
    dynamicSourceFields.issuePrefix = z.string().optional().describe('Issue prefix')
  if (enabledFields.supplementInfo)
    dynamicSourceFields.supplementInfo = z.string().optional().describe('Supplement information')
  if (enabledFields.articleNumber)
    dynamicSourceFields.articleNumber = z.string().optional().describe('Article number')
  if (enabledFields.conference)
    dynamicSourceFields.conference = z.string().optional().describe('Conference name')
  if (enabledFields.institution)
    dynamicSourceFields.institution = z.string().optional().describe('Institution name')
  if (enabledFields.series)
    dynamicSourceFields.series = z.string().optional().describe('Series name')
  if (enabledFields.seriesNumber)
    dynamicSourceFields.seriesNumber = z.string().optional().describe('Series number')
  if (enabledFields.chapterTitle)
    dynamicSourceFields.chapterTitle = z.string().optional().describe('Chapter title')
  if (enabledFields.medium)
    dynamicSourceFields.medium = z.string().optional().describe('Medium of publication')
  if (enabledFields.originalTitle)
    dynamicSourceFields.originalTitle = z.string().optional().describe('Original title for translations')
  if (enabledFields.originalLanguage)
    dynamicSourceFields.originalLanguage = z.string().optional().describe('Original language')
  if (enabledFields.degree)
    dynamicSourceFields.degree = z.string().optional().describe('Academic degree')
  if (enabledFields.advisor)
    dynamicSourceFields.advisor = z.string().optional().describe('Thesis advisor')
  if (enabledFields.department)
    dynamicSourceFields.department = z.string().optional().describe('Academic department')
  // Add missing fields
  if (enabledFields.contributors)
    dynamicSourceFields.contributors = z.array(AuthorSchema).optional().describe('Additional contributors beyond the main authors')
  if (enabledFields.isStandAlone)
    dynamicSourceFields.isStandAlone = z.boolean().optional().describe('Whether this is a standalone work')

  const DynamicSourceInfoSchema = z.object(dynamicSourceFields)

  // Create dynamic DateInfoSchema based on enabled fields
  const dynamicDateFields: Record<string, any> = {}
  if (enabledFields.year)
    dynamicDateFields.year = z.number().int().optional().describe('Publication year')
  if (enabledFields.month)
    dynamicDateFields.month = z.string().optional().describe('Publication month')
  if (enabledFields.day)
    dynamicDateFields.day = z.number().int().optional().describe('Publication day')
  if (enabledFields.yearSuffix)
    dynamicDateFields.yearSuffix = z.string().optional().describe('Year suffix like "a" or "b"')
  if (enabledFields.noDate)
    dynamicDateFields.noDate = z.boolean().optional().describe('Indicates if no date is available')
  if (enabledFields.inPress)
    dynamicDateFields.inPress = z.boolean().optional().describe('Indicates if work is in press')
  if (enabledFields.approximateDate)
    dynamicDateFields.approximateDate = z.boolean().optional().describe('Indicates if date is approximate')
  if (enabledFields.season)
    dynamicDateFields.season = z.string().optional().describe('Season of publication')
  if (enabledFields.dateRange)
    dynamicDateFields.dateRange = z.boolean().optional().describe('Indicates if this is a date range')
  // Add missing yearEnd field
  if (enabledFields.yearEnd)
    dynamicDateFields.yearEnd = z.number().int().optional().describe('End year for date ranges')

  const DynamicDateInfoSchema = z.object(dynamicDateFields)

  // Create dynamic ReferenceMetadataSchema
  const dynamicMetadataFields: Record<string, any> = {}
  if (enabledFields.title)
    dynamicMetadataFields.title = z.string().optional().describe('Title of the work')
  if (enabledFields.authors)
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
  })

  const DynamicExtractionResponseSchema = z.object({
    references: z.array(DynamicReferenceSchema).describe('Array of extracted references'),
  })

  return {
    name: 'reference_extraction',
    schema: zodToJsonSchema(DynamicExtractionResponseSchema, {
      $refStrategy: 'none', // Inline all schemas for OpenAI compatibility
    }),
  }
}

// Create dynamic validation schema that matches the dynamic extraction schema
export function createDynamicValidationSchema(extractionSettings?: ExtractionSettings) {
  if (!extractionSettings) {
    return ExtractionResponseSchema
  }

  const enabledFields = extractionSettings.enabledFields

  // Create dynamic ExternalIdentifiersSchema based on enabled fields
  const dynamicIdentifiersFields: Record<string, z.ZodOptional<z.ZodString>> = {}
  if (enabledFields.doi)
    dynamicIdentifiersFields.doi = z.string().optional().describe('Digital Object Identifier')
  if (enabledFields.pmid)
    dynamicIdentifiersFields.pmid = z.string().optional().describe('PubMed ID')
  if (enabledFields.pmcid)
    dynamicIdentifiersFields.pmcid = z.string().optional().describe('PMC ID')
  if (enabledFields.isbn)
    dynamicIdentifiersFields.isbn = z.string().optional().describe('International Standard Book Number')
  if (enabledFields.issn)
    dynamicIdentifiersFields.issn = z.string().optional().describe('International Standard Serial Number')
  if (enabledFields.arxivId)
    dynamicIdentifiersFields.arxivId = z.string().optional().describe('arXiv identifier')

  const DynamicExternalIdentifiersSchema = z.object(dynamicIdentifiersFields)

  // Create dynamic SourceInfoSchema based on enabled fields
  const dynamicSourceFields: Record<string, any> = {}
  if (enabledFields.containerTitle)
    dynamicSourceFields.containerTitle = z.string().optional().describe('Journal or book title')
  if (enabledFields.subtitle)
    dynamicSourceFields.subtitle = z.string().optional().describe('Subtitle of the work')
  if (enabledFields.volume)
    dynamicSourceFields.volume = z.string().optional().describe('Volume number')
  if (enabledFields.issue)
    dynamicSourceFields.issue = z.string().optional().describe('Issue number')
  if (enabledFields.pages)
    dynamicSourceFields.pages = z.string().optional().describe('Page range')
  if (enabledFields.publisher)
    dynamicSourceFields.publisher = z.string().optional().describe('Publisher name')
  if (enabledFields.publicationPlace)
    dynamicSourceFields.publicationPlace = z.string().optional().describe('Place of publication')
  if (enabledFields.location)
    dynamicSourceFields.location = z.string().optional().describe('Physical location')
  if (enabledFields.url)
    dynamicSourceFields.url = z.string().optional().describe('URL of the source')
  if (enabledFields.sourceType)
    dynamicSourceFields.sourceType = z.enum(['Journal article', 'Book', 'Book chapter', 'Conference paper', 'Thesis', 'Report', 'Webpage']).optional().describe('Type of source')
  if (enabledFields.retrievalDate)
    dynamicSourceFields.retrievalDate = z.string().optional().describe('Date the source was retrieved')
  if (enabledFields.edition)
    dynamicSourceFields.edition = z.string().optional().describe('Edition information')
  if (enabledFields.pageType)
    dynamicSourceFields.pageType = z.string().optional().describe('Type of page reference')
  if (enabledFields.paragraphNumber)
    dynamicSourceFields.paragraphNumber = z.string().optional().describe('Paragraph number')
  if (enabledFields.volumePrefix)
    dynamicSourceFields.volumePrefix = z.string().optional().describe('Volume prefix')
  if (enabledFields.issuePrefix)
    dynamicSourceFields.issuePrefix = z.string().optional().describe('Issue prefix')
  if (enabledFields.supplementInfo)
    dynamicSourceFields.supplementInfo = z.string().optional().describe('Supplement information')
  if (enabledFields.articleNumber)
    dynamicSourceFields.articleNumber = z.string().optional().describe('Article number')
  if (enabledFields.conference)
    dynamicSourceFields.conference = z.string().optional().describe('Conference name')
  if (enabledFields.institution)
    dynamicSourceFields.institution = z.string().optional().describe('Institution name')
  if (enabledFields.series)
    dynamicSourceFields.series = z.string().optional().describe('Series name')
  if (enabledFields.seriesNumber)
    dynamicSourceFields.seriesNumber = z.string().optional().describe('Series number')
  if (enabledFields.chapterTitle)
    dynamicSourceFields.chapterTitle = z.string().optional().describe('Chapter title')
  if (enabledFields.medium)
    dynamicSourceFields.medium = z.string().optional().describe('Medium of publication')
  if (enabledFields.originalTitle)
    dynamicSourceFields.originalTitle = z.string().optional().describe('Original title for translations')
  if (enabledFields.originalLanguage)
    dynamicSourceFields.originalLanguage = z.string().optional().describe('Original language')
  if (enabledFields.degree)
    dynamicSourceFields.degree = z.string().optional().describe('Academic degree')
  if (enabledFields.advisor)
    dynamicSourceFields.advisor = z.string().optional().describe('Thesis advisor')
  if (enabledFields.department)
    dynamicSourceFields.department = z.string().optional().describe('Academic department')
  // Add missing fields
  if (enabledFields.contributors)
    dynamicSourceFields.contributors = z.array(AuthorSchema).optional().describe('Additional contributors beyond the main authors')
  if (enabledFields.isStandAlone)
    dynamicSourceFields.isStandAlone = z.boolean().optional().describe('Whether this is a standalone work')

  const DynamicSourceInfoSchema = z.object(dynamicSourceFields)

  // Create dynamic DateInfoSchema based on enabled fields
  const dynamicDateFields: Record<string, any> = {}
  if (enabledFields.year)
    dynamicDateFields.year = z.number().int().optional().describe('Publication year')
  if (enabledFields.month)
    dynamicDateFields.month = z.string().optional().describe('Publication month')
  if (enabledFields.day)
    dynamicDateFields.day = z.number().int().optional().describe('Publication day')
  if (enabledFields.yearSuffix)
    dynamicDateFields.yearSuffix = z.string().optional().describe('Year suffix like "a" or "b"')
  if (enabledFields.noDate)
    dynamicDateFields.noDate = z.boolean().optional().describe('Indicates if no date is available')
  if (enabledFields.inPress)
    dynamicDateFields.inPress = z.boolean().optional().describe('Indicates if work is in press')
  if (enabledFields.approximateDate)
    dynamicDateFields.approximateDate = z.boolean().optional().describe('Indicates if date is approximate')
  if (enabledFields.season)
    dynamicDateFields.season = z.string().optional().describe('Season of publication')
  if (enabledFields.dateRange)
    dynamicDateFields.dateRange = z.boolean().optional().describe('Indicates if this is a date range')
  // Add missing yearEnd field
  if (enabledFields.yearEnd)
    dynamicDateFields.yearEnd = z.number().int().optional().describe('End year for date ranges')

  const DynamicDateInfoSchema = z.object(dynamicDateFields)

  // Create dynamic ReferenceMetadataSchema
  const dynamicMetadataFields: Record<string, any> = {}
  if (enabledFields.title)
    dynamicMetadataFields.title = z.string().optional().describe('Title of the work')
  if (enabledFields.authors)
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
  })

  const DynamicExtractionResponseSchema = z.object({
    references: z.array(DynamicReferenceSchema).describe('Array of extracted references'),
  })

  // Generate final JSON schema with extraction mode instructions
  const jsonSchema = zodToJsonSchema(DynamicExtractionResponseSchema, {
    name: 'ExtractionResponse',
    $refStrategy: 'none',
  })

  // Add extraction mode instructions to schema description
  const extractionInstructions = getExtractionInstructions(extractionSettings.modificationSettings)
  if (jsonSchema && typeof jsonSchema === 'object' && 'description' in jsonSchema) {
    jsonSchema.description = `${extractionInstructions}\n\n${jsonSchema.description || ''}`
  }
  else if (jsonSchema && typeof jsonSchema === 'object') {
    (jsonSchema as any).description = extractionInstructions
  }

  return {
    name: 'reference_extraction',
    schema: jsonSchema,
  }
}

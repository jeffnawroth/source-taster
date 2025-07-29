import type { ExtractionConfig, ReferenceMetadataFields } from '@source-taster/types'
import { FieldCategory } from '../types/fieldCategories'

const FIELD_CATEGORY_ASSIGNMENTS: Record<ReferenceMetadataFields, readonly FieldCategory[]> = {
  // Core bibliographic information
  title: [FieldCategory.ESSENTIAL, FieldCategory.CORE],
  authors: [FieldCategory.ESSENTIAL, FieldCategory.CORE],
  year: [FieldCategory.ESSENTIAL, FieldCategory.CORE],

  // Publication details
  containerTitle: [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  subtitle: [FieldCategory.PUBLICATION],
  volume: [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  issue: [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  pages: [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  publisher: [FieldCategory.PUBLICATION],
  publicationPlace: [FieldCategory.PUBLICATION],
  url: [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  sourceType: [FieldCategory.PUBLICATION],
  location: [FieldCategory.PUBLICATION],
  retrievalDate: [FieldCategory.PUBLICATION],
  edition: [FieldCategory.PUBLICATION],
  medium: [FieldCategory.PUBLICATION],
  originalTitle: [FieldCategory.PUBLICATION],
  originalLanguage: [FieldCategory.PUBLICATION],
  chapterTitle: [FieldCategory.PUBLICATION],
  contributors: [FieldCategory.PUBLICATION],

  // Identifiers
  doi: [FieldCategory.ESSENTIAL, FieldCategory.IDENTIFIER],
  isbn: [FieldCategory.IDENTIFIER],
  issn: [FieldCategory.IDENTIFIER],
  pmid: [FieldCategory.IDENTIFIER],
  pmcid: [FieldCategory.IDENTIFIER],
  arxivId: [FieldCategory.IDENTIFIER],

  // Date information
  month: [FieldCategory.DATE],
  day: [FieldCategory.DATE],
  yearSuffix: [FieldCategory.DATE],
  dateRange: [FieldCategory.DATE],
  yearEnd: [FieldCategory.DATE],
  noDate: [FieldCategory.DATE],
  inPress: [FieldCategory.DATE],
  approximateDate: [FieldCategory.DATE],
  season: [FieldCategory.DATE],

  // Academic context
  conference: [FieldCategory.ACADEMIC],
  institution: [FieldCategory.ACADEMIC],
  series: [FieldCategory.ACADEMIC],
  seriesNumber: [FieldCategory.ACADEMIC],
  degree: [FieldCategory.ACADEMIC],
  advisor: [FieldCategory.ACADEMIC],
  department: [FieldCategory.ACADEMIC],

  // Technical metadata
  pageType: [FieldCategory.TECHNICAL],
  paragraphNumber: [FieldCategory.TECHNICAL],
  volumePrefix: [FieldCategory.TECHNICAL],
  issuePrefix: [FieldCategory.TECHNICAL],
  supplementInfo: [FieldCategory.TECHNICAL],
  articleNumber: [FieldCategory.TECHNICAL],
  isStandAlone: [FieldCategory.TECHNICAL],
} as const

export const CORE_FIELDS = getFieldsByCategory(FieldCategory.CORE)
export const ACADEMIC_FIELDS = getFieldsByCategory(FieldCategory.ACADEMIC)
export const TECHNICAL_FIELDS = getFieldsByCategory(FieldCategory.TECHNICAL)
export const DATE_FIELDS = getFieldsByCategory(FieldCategory.DATE)
export const IDENTIFIER_FIELDS = getFieldsByCategory(FieldCategory.IDENTIFIER)
export const PUBLICATION_FIELDS = getFieldsByCategory(FieldCategory.PUBLICATION)
export const ESSENTIAL_FIELDS = getFieldsByCategory(FieldCategory.ESSENTIAL)

export const ESSENTIAL_EXTRACTION_CONFIG: ExtractionConfig = {
  fields: getFieldsByCategory(FieldCategory.ESSENTIAL),
}

export function getFieldsByCategory(category: FieldCategory): ReferenceMetadataFields[] {
  return (Object.entries(FIELD_CATEGORY_ASSIGNMENTS) as [ReferenceMetadataFields, readonly FieldCategory[]][])
    .filter(([, categories]) => categories.includes(category))
    .map(([field]) => field)
}

export function getCategoriesForField(field: ReferenceMetadataFields): readonly FieldCategory[] {
  return FIELD_CATEGORY_ASSIGNMENTS[field] || []
}

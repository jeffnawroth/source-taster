import { type ExtractableField, type ExtractionConfig, FieldCategory } from './extraction-config.types'

const FIELD_CATEGORY_ASSIGNMENTS: Record<ExtractableField, readonly FieldCategory[]> = {
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

export const CORE_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.CORE)
export const ACADEMIC_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.ACADEMIC)
export const TECHNICAL_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.TECHNICAL)
export const DATE_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.DATE)
export const IDENTIFIER_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.IDENTIFIER)
export const PUBLICATION_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.PUBLICATION)
export const ESSENTIAL_FIELDS: ExtractableField[] = getFieldsByCategory(FieldCategory.ESSENTIAL)

export const ESSENTIAL_EXTRACTION_CONFIG: ExtractionConfig = {
  fields: getFieldsByCategory(FieldCategory.ESSENTIAL),
}

export function getFieldsByCategory(category: FieldCategory): ExtractableField[] {
  return (Object.entries(FIELD_CATEGORY_ASSIGNMENTS) as [ExtractableField, readonly FieldCategory[]][])
    .filter(([, categories]) => categories.includes(category))
    .map(([field]) => field)
}

export function getCategoriesForField(field: ExtractableField): readonly FieldCategory[] {
  return FIELD_CATEGORY_ASSIGNMENTS[field] || []
}

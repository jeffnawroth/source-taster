import type { CSLVariable, ExtractionConfig } from '@source-taster/types'
import { FieldCategory } from '../types/fieldCategories'

const FIELD_CATEGORY_ASSIGNMENTS: Record<CSLVariable, readonly FieldCategory[]> = {
  // Required fields
  'type': [FieldCategory.ESSENTIAL],
  'id': [FieldCategory.ESSENTIAL],

  // Core bibliographic information
  'title': [FieldCategory.ESSENTIAL, FieldCategory.CORE],
  'author': [FieldCategory.ESSENTIAL, FieldCategory.CORE],
  'issued': [FieldCategory.ESSENTIAL, FieldCategory.CORE],

  // Publication details
  'container-title': [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  'volume': [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  'issue': [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  'page': [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  'publisher': [FieldCategory.PUBLICATION],
  'publisher-place': [FieldCategory.PUBLICATION],
  'URL': [FieldCategory.ESSENTIAL, FieldCategory.PUBLICATION],
  'edition': [FieldCategory.PUBLICATION],
  'medium': [FieldCategory.PUBLICATION],
  'original-title': [FieldCategory.PUBLICATION],
  'collection-title': [FieldCategory.PUBLICATION],
  'container-title-short': [FieldCategory.PUBLICATION],
  'title-short': [FieldCategory.PUBLICATION],
  'journalAbbreviation': [FieldCategory.PUBLICATION],
  'shortTitle': [FieldCategory.PUBLICATION],

  // Identifiers
  'DOI': [FieldCategory.ESSENTIAL, FieldCategory.IDENTIFIER],
  'ISBN': [FieldCategory.IDENTIFIER],
  'ISSN': [FieldCategory.IDENTIFIER],
  'PMID': [FieldCategory.IDENTIFIER],
  'PMCID': [FieldCategory.IDENTIFIER],
  'arxivId': [FieldCategory.IDENTIFIER],
  'citation-key': [FieldCategory.IDENTIFIER],
  'call-number': [FieldCategory.IDENTIFIER],

  // Date information
  'accessed': [FieldCategory.DATE],
  'available-date': [FieldCategory.DATE],
  'event-date': [FieldCategory.DATE],
  'original-date': [FieldCategory.DATE],
  'submitted': [FieldCategory.DATE],
  'year-suffix': [FieldCategory.DATE],

  // Contributors (names)
  'chair': [FieldCategory.CORE],
  'collection-editor': [FieldCategory.CORE],
  'compiler': [FieldCategory.CORE],
  'composer': [FieldCategory.CORE],
  'container-author': [FieldCategory.CORE],
  'contributor': [FieldCategory.CORE],
  'curator': [FieldCategory.CORE],
  'director': [FieldCategory.CORE],
  'editor': [FieldCategory.CORE],
  'editorial-director': [FieldCategory.CORE],
  'executive-producer': [FieldCategory.CORE],
  'guest': [FieldCategory.CORE],
  'host': [FieldCategory.CORE],
  'interviewer': [FieldCategory.CORE],
  'illustrator': [FieldCategory.CORE],
  'narrator': [FieldCategory.CORE],
  'organizer': [FieldCategory.CORE],
  'original-author': [FieldCategory.CORE],
  'performer': [FieldCategory.CORE],
  'producer': [FieldCategory.CORE],
  'recipient': [FieldCategory.CORE],
  'reviewed-author': [FieldCategory.CORE],
  'script-writer': [FieldCategory.CORE],
  'series-creator': [FieldCategory.CORE],
  'translator': [FieldCategory.CORE],

  // Academic context
  'event': [FieldCategory.ACADEMIC],
  'event-title': [FieldCategory.ACADEMIC],
  'event-place': [FieldCategory.ACADEMIC],
  'genre': [FieldCategory.ACADEMIC],
  'part-title': [FieldCategory.ACADEMIC],
  'reviewed-genre': [FieldCategory.ACADEMIC],
  'reviewed-title': [FieldCategory.ACADEMIC],

  // Technical metadata
  'abstract': [FieldCategory.TECHNICAL],
  'annote': [FieldCategory.TECHNICAL],
  'archive': [FieldCategory.TECHNICAL],
  'archive_collection': [FieldCategory.TECHNICAL],
  'archive_location': [FieldCategory.TECHNICAL],
  'archive-place': [FieldCategory.TECHNICAL],
  'authority': [FieldCategory.TECHNICAL],
  'chapter-number': [FieldCategory.TECHNICAL],
  'citation-number': [FieldCategory.TECHNICAL],
  'citation-label': [FieldCategory.TECHNICAL],
  'collection-number': [FieldCategory.TECHNICAL],
  'dimensions': [FieldCategory.TECHNICAL],
  'division': [FieldCategory.TECHNICAL],
  'first-reference-note-number': [FieldCategory.TECHNICAL],
  'jurisdiction': [FieldCategory.TECHNICAL],
  'keyword': [FieldCategory.TECHNICAL],
  'locator': [FieldCategory.TECHNICAL],
  'note': [FieldCategory.TECHNICAL],
  'number': [FieldCategory.TECHNICAL],
  'number-of-pages': [FieldCategory.TECHNICAL],
  'number-of-volumes': [FieldCategory.TECHNICAL],
  'original-publisher': [FieldCategory.TECHNICAL],
  'original-publisher-place': [FieldCategory.TECHNICAL],
  'page-first': [FieldCategory.TECHNICAL],
  'part': [FieldCategory.TECHNICAL],
  'printing': [FieldCategory.TECHNICAL],
  'references': [FieldCategory.TECHNICAL],
  'scale': [FieldCategory.TECHNICAL],
  'section': [FieldCategory.TECHNICAL],
  'source': [FieldCategory.TECHNICAL],
  'status': [FieldCategory.TECHNICAL],
  'supplement': [FieldCategory.TECHNICAL],
  'version': [FieldCategory.TECHNICAL],
  'volume-title': [FieldCategory.TECHNICAL],
  'volume-title-short': [FieldCategory.TECHNICAL],

  // Special/meta fields
  'categories': [FieldCategory.TECHNICAL],
  'language': [FieldCategory.TECHNICAL],
  'custom': [FieldCategory.TECHNICAL],
} satisfies Record<CSLVariable, readonly FieldCategory[]>

export const CORE_FIELDS = getFieldsByCategory(FieldCategory.CORE)
export const ACADEMIC_FIELDS = getFieldsByCategory(FieldCategory.ACADEMIC)
export const TECHNICAL_FIELDS = getFieldsByCategory(FieldCategory.TECHNICAL)
export const DATE_FIELDS = getFieldsByCategory(FieldCategory.DATE)
export const IDENTIFIER_FIELDS = getFieldsByCategory(FieldCategory.IDENTIFIER)
export const PUBLICATION_FIELDS = getFieldsByCategory(FieldCategory.PUBLICATION)
export const ESSENTIAL_FIELDS = getFieldsByCategory(FieldCategory.ESSENTIAL)

export const ESSENTIAL_EXTRACTION_CONFIG: ExtractionConfig = {
  variables: getFieldsByCategory(FieldCategory.ESSENTIAL),
}

export function getFieldsByCategory(category: FieldCategory): CSLVariable[] {
  return (Object.entries(FIELD_CATEGORY_ASSIGNMENTS) as [CSLVariable, readonly FieldCategory[]][])
    .filter(([, categories]) => categories.includes(category))
    .map(([field]) => field)
}

export function getCategoriesForField(field: CSLVariable): readonly FieldCategory[] {
  return FIELD_CATEGORY_ASSIGNMENTS[field] || []
}

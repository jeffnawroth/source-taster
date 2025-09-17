<script setup lang="ts">
import type { ExternalSource, FieldExtractionResult, Reference } from '@source-taster/types'
import { mdiAccountGroup, mdiAccountTie, mdiBookmark, mdiBookOpenBlankVariantOutline, mdiCalendarClock, mdiCalendarOutline, mdiCalendarRange, mdiChevronDown, mdiChevronUp, mdiDomain, mdiEarth, mdiFileDocumentOutline, mdiGavel, mdiIdentifier, mdiInformation, mdiLibrary, mdiLink, mdiMapMarker, mdiMedicalBag, mdiMicrophone, mdiNewspaper, mdiNotebookOutline, mdiNoteText, mdiNumeric, mdiOfficeBuilding, mdiRuler, mdiTag, mdiTelevision, mdiText, mdiTranslate } from '@mdi/js'

const props = defineProps<{
  reference: Reference | ExternalSource
  subheader?: string
}>()

const { t } = useI18n()

// Helper function to get all modifications for a specific field
function getModificationsForField(fieldPath: string): FieldExtractionResult[] {
  if (!('extractionResults' in props.reference) || !props.reference.extractionResults) {
    return []
  }

  // Find modifications that match the exact fieldPath or are sub-fields of it
  return props.reference.extractionResults.filter((mod) => {
    // Exact match
    if (mod.fieldPath === fieldPath) {
      return true
    }

    // For arrays like authors, also match individual indices
    if (fieldPath === 'metadata.authors' && mod.fieldPath.startsWith('metadata.authors[')) {
      return true
    }

    // For date fields, match any sub-field of date
    if (fieldPath === 'metadata.date' && mod.fieldPath.startsWith('metadata.date.')) {
      return true
    }

    return false
  })
}

// State for collapsible sections
const showAdditionalFields = ref(false)
const showAllCSLFields = ref(false)

// Computed property for formatted date display
const formattedDate = computed(() => {
  const issued = props.reference.metadata.issued

  if (!issued)
    return null

  // Handle string dates (EDTF format)
  if (typeof issued === 'string') {
    return issued
  }

  // Handle CSL date structure
  if (issued['date-parts'] && issued['date-parts'][0]) {
    const dateParts = issued['date-parts'][0]
    const year = dateParts[0]
    const month = dateParts[1]
    const day = dateParts[2]

    const parts: string[] = []

    // Add day if available
    if (day) {
      parts.push(day.toString())
    }

    // Add month if available (convert number to name if needed)
    if (month) {
      if (typeof month === 'number') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        parts.push(monthNames[month - 1] || month.toString())
      }
      else {
        parts.push(month.toString())
      }
    }

    // Add year if available
    if (year) {
      parts.push(year.toString())
    }

    return parts.join(' ') || null
  }

  // Handle literal dates
  if (issued.literal) {
    return issued.literal
  }

  // Handle season
  if (issued.season) {
    return issued.season.toString()
  }

  return null
})

// Main metadata fields configuration
const mainFields = computed(() => [
  {
    id: 'original-text',
    condition: () => 'originalText' in props.reference && props.reference.originalText,
    icon: mdiText,
    title: t('original-text'),
    text: () => 'originalText' in props.reference ? props.reference.originalText : '',
    fieldPath: null,
  },
  {
    id: 'title',
    condition: () => props.reference.metadata.title,
    icon: mdiFileDocumentOutline,
    title: t('title'),
    text: () => props.reference.metadata.title,
    fieldPath: 'metadata.title',
  },
  {
    id: 'authors',
    condition: () => props.reference.metadata.author?.length,
    icon: mdiAccountGroup,
    title: t('authors'),
    text: () => props.reference.metadata.author?.map((author) => {
      if (typeof author === 'string')
        return author
      const name = `${author.given || ''} ${author.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.author',
  },
  {
    id: 'container-title',
    condition: () => props.reference.metadata['container-title'],
    icon: mdiEarth,
    title: t('containerTitle'),
    text: () => props.reference.metadata['container-title'] || '',
    fieldPath: 'metadata.container-title',
  },
  {
    id: 'publication-date',
    condition: () => formattedDate.value,
    icon: mdiCalendarOutline,
    title: t('publication-date'),
    text: () => formattedDate.value || '',
    fieldPath: 'metadata.issued',
  },
  {
    id: 'volume',
    condition: () => props.reference.metadata.volume,
    icon: mdiBookOpenBlankVariantOutline,
    title: t('volume'),
    text: () => props.reference.metadata.volume || '',
    fieldPath: 'metadata.volume',
  },
  {
    id: 'issue',
    condition: () => props.reference.metadata.issue,
    icon: mdiCalendarRange,
    title: t('issue'),
    text: () => props.reference.metadata.issue || '',
    fieldPath: 'metadata.issue',
  },
  {
    id: 'pages',
    condition: () => props.reference.metadata.page,
    icon: mdiNotebookOutline,
    title: t('pages'),
    text: () => props.reference.metadata.page || '',
    fieldPath: 'metadata.page',
  },
  {
    id: 'publisher',
    condition: () => props.reference.metadata.publisher,
    icon: mdiDomain,
    title: t('publisher'),
    text: () => props.reference.metadata.publisher || '',
    fieldPath: 'metadata.publisher',
  },
  {
    id: 'publication-place',
    condition: () => props.reference.metadata['publisher-place'],
    icon: mdiMapMarker,
    title: t('publication-place'),
    text: () => props.reference.metadata['publisher-place'] || '',
    fieldPath: 'metadata.publisher-place',
  },
  {
    id: 'edition',
    condition: () => props.reference.metadata.edition,
    icon: mdiBookmark,
    title: t('edition'),
    text: () => props.reference.metadata.edition || '',
    fieldPath: 'metadata.edition',
  },
  {
    id: 'type',
    condition: () => props.reference.metadata.type,
    icon: mdiTag,
    title: t('type'),
    text: () => props.reference.metadata.type || '',
    fieldPath: 'metadata.type',
  },
].filter(field => field.condition()))

// Identifier fields configuration
const identifierFields = computed(() => [
  {
    id: 'doi',
    condition: () => props.reference.metadata.DOI,
    icon: mdiIdentifier,
    title: 'DOI',
    text: () => props.reference.metadata.DOI,
    fieldPath: 'metadata.DOI',
    link: true,
  },
  {
    id: 'arxiv',
    condition: () => props.reference.metadata.arxivId,
    icon: mdiNewspaper,
    title: 'arXiv ID',
    text: () => props.reference.metadata.arxivId,
    fieldPath: 'metadata.arxivId',
    link: true,
  },
  {
    id: 'pmid',
    condition: () => props.reference.metadata.PMID,
    icon: mdiMedicalBag,
    title: 'PMID',
    text: () => props.reference.metadata.PMID,
    fieldPath: 'metadata.PMID',
    link: true,
  },
  {
    id: 'pmcid',
    condition: () => props.reference.metadata.PMCID,
    icon: mdiMedicalBag,
    title: 'PMCID',
    text: () => props.reference.metadata.PMCID,
    fieldPath: 'metadata.PMCID',
    link: true,
  },
  {
    id: 'isbn',
    condition: () => props.reference.metadata.ISBN,
    icon: mdiLibrary,
    title: 'ISBN',
    text: () => props.reference.metadata.ISBN,
    fieldPath: 'metadata.ISBN',
    link: true,
  },
  {
    id: 'issn',
    condition: () => props.reference.metadata.ISSN,
    icon: mdiNewspaper,
    title: 'ISSN',
    text: () => props.reference.metadata.ISSN,
    fieldPath: 'metadata.ISSN',
    link: true,
  },
].filter(field => field.condition()))

// URL fields configuration
const urlFields = computed(() => [
  {
    id: 'external-url',
    condition: () => 'url' in props.reference && props.reference.url,
    icon: mdiLink,
    title: 'URL',
    text: () => 'url' in props.reference ? props.reference.url || '' : '',
    fieldPath: 'url',
    link: true,
  },
  {
    id: 'source-url',
    condition: () => props.reference.metadata.URL,
    icon: mdiLink,
    title: t('source-url'),
    text: () => props.reference.metadata.URL || '',
    fieldPath: 'metadata.URL',
    link: true,
  },
].filter(field => field.condition()))

// Additional fields configuration - CSL Variables only
const additionalFields = computed(() => [
  {
    id: 'title-short',
    condition: () => props.reference.metadata['title-short'],
    icon: mdiFileDocumentOutline,
    title: t('title-short'),
    text: () => props.reference.metadata['title-short'] || '',
    fieldPath: 'metadata.title-short',
  },
  {
    id: 'medium',
    condition: () => props.reference.metadata.medium,
    icon: mdiTelevision,
    title: t('medium'),
    text: () => props.reference.metadata.medium || '',
    fieldPath: 'metadata.medium',
  },
  {
    id: 'original-title',
    condition: () => props.reference.metadata['original-title'],
    icon: mdiTranslate,
    title: t('original-title'),
    text: () => props.reference.metadata['original-title'] || '',
    fieldPath: 'metadata.original-title',
  },
  {
    id: 'genre',
    condition: () => props.reference.metadata.genre,
    icon: mdiTag,
    title: t('genre'),
    text: () => props.reference.metadata.genre || '',
    fieldPath: 'metadata.genre',
  },
  {
    id: 'abstract',
    condition: () => props.reference.metadata.abstract,
    icon: mdiText,
    title: t('abstract'),
    text: () => props.reference.metadata.abstract || '',
    fieldPath: 'metadata.abstract',
  },
  {
    id: 'language',
    condition: () => props.reference.metadata.language,
    icon: mdiTranslate,
    title: t('language'),
    text: () => props.reference.metadata.language || '',
    fieldPath: 'metadata.language',
  },
  {
    id: 'note',
    condition: () => props.reference.metadata.note,
    icon: mdiNotebookOutline,
    title: t('note'),
    text: () => props.reference.metadata.note || '',
    fieldPath: 'metadata.note',
  },
  {
    id: 'number',
    condition: () => props.reference.metadata.number,
    icon: mdiNumeric,
    title: t('number'),
    text: () => props.reference.metadata.number || '',
    fieldPath: 'metadata.number',
  },
  {
    id: 'number-of-pages',
    condition: () => props.reference.metadata['number-of-pages'],
    icon: mdiNotebookOutline,
    title: t('number-of-pages'),
    text: () => props.reference.metadata['number-of-pages'] || '',
    fieldPath: 'metadata.number-of-pages',
  },
  {
    id: 'event',
    condition: () => props.reference.metadata.event,
    icon: mdiMicrophone,
    title: t('event'),
    text: () => props.reference.metadata.event || '',
    fieldPath: 'metadata.event',
  },
  {
    id: 'event-title',
    condition: () => props.reference.metadata['event-title'],
    icon: mdiMicrophone,
    title: t('event-title'),
    text: () => props.reference.metadata['event-title'] || '',
    fieldPath: 'metadata.event-title',
  },
  {
    id: 'event-place',
    condition: () => props.reference.metadata['event-place'],
    icon: mdiMapMarker,
    title: t('event-place'),
    text: () => props.reference.metadata['event-place'] || '',
    fieldPath: 'metadata.event-place',
  },
].filter(field => field.condition()))

// All CSL Fields configuration - comprehensive coverage
const allCSLFields = computed(() => [
  // Contributors (Name fields)
  {
    id: 'editor',
    condition: () => props.reference.metadata.editor?.length,
    icon: mdiAccountTie,
    title: t('editor'),
    text: () => props.reference.metadata.editor?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.editor',
    category: 'contributors',
  },
  {
    id: 'translator',
    condition: () => props.reference.metadata.translator?.length,
    icon: mdiTranslate,
    title: t('translator'),
    text: () => props.reference.metadata.translator?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.translator',
    category: 'contributors',
  },
  {
    id: 'director',
    condition: () => props.reference.metadata.director?.length,
    icon: mdiAccountTie,
    title: t('director'),
    text: () => props.reference.metadata.director?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.director',
    category: 'contributors',
  },
  {
    id: 'chair',
    condition: () => props.reference.metadata.chair?.length,
    icon: mdiAccountTie,
    title: t('chair'),
    text: () => props.reference.metadata.chair?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.chair',
    category: 'contributors',
  },
  {
    id: 'collection-editor',
    condition: () => props.reference.metadata['collection-editor']?.length,
    icon: mdiAccountTie,
    title: t('collection-editor'),
    text: () => props.reference.metadata['collection-editor']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.collection-editor',
    category: 'contributors',
  },
  {
    id: 'compiler',
    condition: () => props.reference.metadata.compiler?.length,
    icon: mdiAccountTie,
    title: t('compiler'),
    text: () => props.reference.metadata.compiler?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.compiler',
    category: 'contributors',
  },
  {
    id: 'composer',
    condition: () => props.reference.metadata.composer?.length,
    icon: mdiMicrophone,
    title: t('composer'),
    text: () => props.reference.metadata.composer?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.composer',
    category: 'contributors',
  },
  {
    id: 'container-author',
    condition: () => props.reference.metadata['container-author']?.length,
    icon: mdiAccountGroup,
    title: t('container-author'),
    text: () => props.reference.metadata['container-author']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.container-author',
    category: 'contributors',
  },
  {
    id: 'contributor',
    condition: () => props.reference.metadata.contributor?.length,
    icon: mdiAccountTie,
    title: t('contributor'),
    text: () => props.reference.metadata.contributor?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.contributor',
    category: 'contributors',
  },
  {
    id: 'curator',
    condition: () => props.reference.metadata.curator?.length,
    icon: mdiLibrary,
    title: t('curator'),
    text: () => props.reference.metadata.curator?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.curator',
    category: 'contributors',
  },
  {
    id: 'editorial-director',
    condition: () => props.reference.metadata['editorial-director']?.length,
    icon: mdiAccountTie,
    title: t('editorial-director'),
    text: () => props.reference.metadata['editorial-director']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.editorial-director',
    category: 'contributors',
  },
  {
    id: 'executive-producer',
    condition: () => props.reference.metadata['executive-producer']?.length,
    icon: mdiTelevision,
    title: t('executive-producer'),
    text: () => props.reference.metadata['executive-producer']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.executive-producer',
    category: 'contributors',
  },
  {
    id: 'guest',
    condition: () => props.reference.metadata.guest?.length,
    icon: mdiAccountGroup,
    title: t('guest'),
    text: () => props.reference.metadata.guest?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.guest',
    category: 'contributors',
  },
  {
    id: 'host',
    condition: () => props.reference.metadata.host?.length,
    icon: mdiMicrophone,
    title: t('host'),
    text: () => props.reference.metadata.host?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.host',
    category: 'contributors',
  },
  {
    id: 'interviewer',
    condition: () => props.reference.metadata.interviewer?.length,
    icon: mdiMicrophone,
    title: t('interviewer'),
    text: () => props.reference.metadata.interviewer?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.interviewer',
    category: 'contributors',
  },
  {
    id: 'illustrator',
    condition: () => props.reference.metadata.illustrator?.length,
    icon: mdiFileDocumentOutline,
    title: t('illustrator'),
    text: () => props.reference.metadata.illustrator?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.illustrator',
    category: 'contributors',
  },
  {
    id: 'narrator',
    condition: () => props.reference.metadata.narrator?.length,
    icon: mdiMicrophone,
    title: t('narrator'),
    text: () => props.reference.metadata.narrator?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.narrator',
    category: 'contributors',
  },
  {
    id: 'organizer',
    condition: () => props.reference.metadata.organizer?.length,
    icon: mdiAccountTie,
    title: t('organizer'),
    text: () => props.reference.metadata.organizer?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.organizer',
    category: 'contributors',
  },
  {
    id: 'original-author',
    condition: () => props.reference.metadata['original-author']?.length,
    icon: mdiAccountGroup,
    title: t('original-author'),
    text: () => props.reference.metadata['original-author']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.original-author',
    category: 'contributors',
  },
  {
    id: 'performer',
    condition: () => props.reference.metadata.performer?.length,
    icon: mdiMicrophone,
    title: t('performer'),
    text: () => props.reference.metadata.performer?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.performer',
    category: 'contributors',
  },
  {
    id: 'producer',
    condition: () => props.reference.metadata.producer?.length,
    icon: mdiTelevision,
    title: t('producer'),
    text: () => props.reference.metadata.producer?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.producer',
    category: 'contributors',
  },
  {
    id: 'recipient',
    condition: () => props.reference.metadata.recipient?.length,
    icon: mdiAccountGroup,
    title: t('recipient'),
    text: () => props.reference.metadata.recipient?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.recipient',
    category: 'contributors',
  },
  {
    id: 'reviewed-author',
    condition: () => props.reference.metadata['reviewed-author']?.length,
    icon: mdiAccountGroup,
    title: t('reviewed-author'),
    text: () => props.reference.metadata['reviewed-author']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.reviewed-author',
    category: 'contributors',
  },
  {
    id: 'script-writer',
    condition: () => props.reference.metadata['script-writer']?.length,
    icon: mdiFileDocumentOutline,
    title: t('script-writer'),
    text: () => props.reference.metadata['script-writer']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.script-writer',
    category: 'contributors',
  },
  {
    id: 'series-creator',
    condition: () => props.reference.metadata['series-creator']?.length,
    icon: mdiTelevision,
    title: t('series-creator'),
    text: () => props.reference.metadata['series-creator']?.map((person) => {
      if (typeof person === 'string')
        return person
      const name = `${person.given || ''} ${person.family || ''}`.trim()
      return name
    }).join(', ') || '',
    fieldPath: 'metadata.series-creator',
    category: 'contributors',
  },
  // Dates
  {
    id: 'accessed',
    condition: () => props.reference.metadata.accessed,
    icon: mdiCalendarClock,
    title: t('accessed'),
    text: () => {
      const accessed = props.reference.metadata.accessed
      if (typeof accessed === 'string')
        return accessed
      // Handle CSL date structure similar to issued
      if (accessed?.['date-parts']?.[0]) {
        const dateParts = accessed['date-parts'][0]
        return dateParts.join('-')
      }
      return accessed?.literal || ''
    },
    fieldPath: 'metadata.accessed',
    category: 'dates',
  },
  {
    id: 'submitted',
    condition: () => props.reference.metadata.submitted,
    icon: mdiCalendarClock,
    title: t('submitted'),
    text: () => {
      const submitted = props.reference.metadata.submitted
      if (typeof submitted === 'string')
        return submitted
      if (submitted?.['date-parts']?.[0]) {
        const dateParts = submitted['date-parts'][0]
        return dateParts.join('-')
      }
      return submitted?.literal || ''
    },
    fieldPath: 'metadata.submitted',
    category: 'dates',
  },
  {
    id: 'available-date',
    condition: () => props.reference.metadata['available-date'],
    icon: mdiCalendarClock,
    title: t('available-date'),
    text: () => {
      const date = props.reference.metadata['available-date']
      if (typeof date === 'string')
        return date
      if (date?.['date-parts']?.[0]) {
        const dateParts = date['date-parts'][0]
        return dateParts.join('-')
      }
      return date?.literal || date?.raw || ''
    },
    fieldPath: 'metadata.available-date',
    category: 'dates',
  },
  {
    id: 'event-date',
    condition: () => props.reference.metadata['event-date'],
    icon: mdiCalendarClock,
    title: t('event-date'),
    text: () => {
      const date = props.reference.metadata['event-date']
      if (typeof date === 'string')
        return date
      if (date?.['date-parts']?.[0]) {
        const dateParts = date['date-parts'][0]
        return dateParts.join('-')
      }
      return date?.literal || date?.raw || ''
    },
    fieldPath: 'metadata.event-date',
    category: 'dates',
  },
  {
    id: 'original-date',
    condition: () => props.reference.metadata['original-date'],
    icon: mdiCalendarClock,
    title: t('original-date'),
    text: () => {
      const date = props.reference.metadata['original-date']
      if (typeof date === 'string')
        return date
      if (date?.['date-parts']?.[0]) {
        const dateParts = date['date-parts'][0]
        return dateParts.join('-')
      }
      return date?.literal || date?.raw || ''
    },
    fieldPath: 'metadata.original-date',
    category: 'dates',
  },
  // Bibliographic
  {
    id: 'collection-title',
    condition: () => props.reference.metadata['collection-title'],
    icon: mdiBookmark,
    title: t('collection-title'),
    text: () => props.reference.metadata['collection-title'] || '',
    fieldPath: 'metadata.collection-title',
    category: 'bibliographic',
  },
  {
    id: 'container-title-short',
    condition: () => props.reference.metadata['container-title-short'],
    icon: mdiEarth,
    title: t('container-title-short'),
    text: () => props.reference.metadata['container-title-short'] || '',
    fieldPath: 'metadata.container-title-short',
    category: 'bibliographic',
  },
  {
    id: 'part-title',
    condition: () => props.reference.metadata['part-title'],
    icon: mdiFileDocumentOutline,
    title: t('part-title'),
    text: () => props.reference.metadata['part-title'] || '',
    fieldPath: 'metadata.part-title',
    category: 'bibliographic',
  },
  {
    id: 'title-short',
    condition: () => props.reference.metadata['title-short'],
    icon: mdiFileDocumentOutline,
    title: t('title-short'),
    text: () => props.reference.metadata['title-short'] || '',
    fieldPath: 'metadata.title-short',
    category: 'bibliographic',
  },
  {
    id: 'original-title',
    condition: () => props.reference.metadata['original-title'],
    icon: mdiFileDocumentOutline,
    title: t('original-title'),
    text: () => props.reference.metadata['original-title'] || '',
    fieldPath: 'metadata.original-title',
    category: 'bibliographic',
  },
  {
    id: 'reviewed-title',
    condition: () => props.reference.metadata['reviewed-title'],
    icon: mdiFileDocumentOutline,
    title: t('reviewed-title'),
    text: () => props.reference.metadata['reviewed-title'] || '',
    fieldPath: 'metadata.reviewed-title',
    category: 'bibliographic',
  },
  {
    id: 'collection-number',
    condition: () => props.reference.metadata['collection-number'],
    icon: mdiNumeric,
    title: t('collection-number'),
    text: () => props.reference.metadata['collection-number'] || '',
    fieldPath: 'metadata.collection-number',
    category: 'bibliographic',
  },
  {
    id: 'chapter-number',
    condition: () => props.reference.metadata['chapter-number'],
    icon: mdiNumeric,
    title: t('chapter-number'),
    text: () => props.reference.metadata['chapter-number'] || '',
    fieldPath: 'metadata.chapter-number',
    category: 'bibliographic',
  },
  {
    id: 'citation-number',
    condition: () => props.reference.metadata['citation-number'],
    icon: mdiNumeric,
    title: t('citation-number'),
    text: () => props.reference.metadata['citation-number'] || '',
    fieldPath: 'metadata.citation-number',
    category: 'bibliographic',
  },
  {
    id: 'citation-label',
    condition: () => props.reference.metadata['citation-label'],
    icon: mdiFileDocumentOutline,
    title: t('citation-label'),
    text: () => props.reference.metadata['citation-label'] || '',
    fieldPath: 'metadata.citation-label',
    category: 'bibliographic',
  },
  {
    id: 'first-reference-note-number',
    condition: () => props.reference.metadata['first-reference-note-number'],
    icon: mdiNumeric,
    title: t('first-reference-note-number'),
    text: () => props.reference.metadata['first-reference-note-number'] || '',
    fieldPath: 'metadata.first-reference-note-number',
    category: 'bibliographic',
  },
  {
    id: 'genre',
    condition: () => props.reference.metadata.genre,
    icon: mdiTag,
    title: t('genre'),
    text: () => props.reference.metadata.genre || '',
    fieldPath: 'metadata.genre',
    category: 'bibliographic',
  },
  {
    id: 'issue',
    condition: () => props.reference.metadata.issue,
    icon: mdiNumeric,
    title: t('issue'),
    text: () => props.reference.metadata.issue || '',
    fieldPath: 'metadata.issue',
    category: 'bibliographic',
  },
  {
    id: 'jurisdiction',
    condition: () => props.reference.metadata.jurisdiction,
    icon: mdiMapMarker,
    title: t('jurisdiction'),
    text: () => props.reference.metadata.jurisdiction || '',
    fieldPath: 'metadata.jurisdiction',
    category: 'bibliographic',
  },
  {
    id: 'keyword',
    condition: () => props.reference.metadata.keyword,
    icon: mdiTag,
    title: t('keyword'),
    text: () => props.reference.metadata.keyword || '',
    fieldPath: 'metadata.keyword',
    category: 'bibliographic',
  },
  {
    id: 'locator',
    condition: () => props.reference.metadata.locator,
    icon: mdiMapMarker,
    title: t('locator'),
    text: () => props.reference.metadata.locator || '',
    fieldPath: 'metadata.locator',
    category: 'bibliographic',
  },
  {
    id: 'medium',
    condition: () => props.reference.metadata.medium,
    icon: mdiFileDocumentOutline,
    title: t('medium'),
    text: () => props.reference.metadata.medium || '',
    fieldPath: 'metadata.medium',
    category: 'bibliographic',
  },
  {
    id: 'note',
    condition: () => props.reference.metadata.note,
    icon: mdiNoteText,
    title: t('note'),
    text: () => props.reference.metadata.note || '',
    fieldPath: 'metadata.note',
    category: 'bibliographic',
  },
  {
    id: 'number',
    condition: () => props.reference.metadata.number,
    icon: mdiNumeric,
    title: t('number'),
    text: () => props.reference.metadata.number || '',
    fieldPath: 'metadata.number',
    category: 'bibliographic',
  },
  {
    id: 'number-of-pages',
    condition: () => props.reference.metadata['number-of-pages'],
    icon: mdiNumeric,
    title: t('number-of-pages'),
    text: () => props.reference.metadata['number-of-pages'] || '',
    fieldPath: 'metadata.number-of-pages',
    category: 'bibliographic',
  },
  {
    id: 'number-of-volumes',
    condition: () => props.reference.metadata['number-of-volumes'],
    icon: mdiNumeric,
    title: t('number-of-volumes'),
    text: () => props.reference.metadata['number-of-volumes'] || '',
    fieldPath: 'metadata.number-of-volumes',
    category: 'bibliographic',
  },
  {
    id: 'original-publisher',
    condition: () => props.reference.metadata['original-publisher'],
    icon: mdiOfficeBuilding,
    title: t('original-publisher'),
    text: () => props.reference.metadata['original-publisher'] || '',
    fieldPath: 'metadata.original-publisher',
    category: 'bibliographic',
  },
  {
    id: 'original-publisher-place',
    condition: () => props.reference.metadata['original-publisher-place'],
    icon: mdiMapMarker,
    title: t('original-publisher-place'),
    text: () => props.reference.metadata['original-publisher-place'] || '',
    fieldPath: 'metadata.original-publisher-place',
    category: 'bibliographic',
  },
  {
    id: 'page',
    condition: () => props.reference.metadata.page,
    icon: mdiNumeric,
    title: t('page'),
    text: () => props.reference.metadata.page || '',
    fieldPath: 'metadata.page',
    category: 'bibliographic',
  },
  {
    id: 'page-first',
    condition: () => props.reference.metadata['page-first'],
    icon: mdiNumeric,
    title: t('page-first'),
    text: () => props.reference.metadata['page-first'] || '',
    fieldPath: 'metadata.page-first',
    category: 'bibliographic',
  },
  {
    id: 'references',
    condition: () => props.reference.metadata.references,
    icon: mdiBookmark,
    title: t('references'),
    text: () => props.reference.metadata.references || '',
    fieldPath: 'metadata.references',
    category: 'bibliographic',
  },
  {
    id: 'section',
    condition: () => props.reference.metadata.section,
    icon: mdiFileDocumentOutline,
    title: t('section'),
    text: () => props.reference.metadata.section || '',
    fieldPath: 'metadata.section',
    category: 'bibliographic',
  },
  {
    id: 'source',
    condition: () => props.reference.metadata.source,
    icon: mdiFileDocumentOutline,
    title: t('source'),
    text: () => props.reference.metadata.source || '',
    fieldPath: 'metadata.source',
    category: 'bibliographic',
  },
  {
    id: 'status',
    condition: () => props.reference.metadata.status,
    icon: mdiInformation,
    title: t('status'),
    text: () => props.reference.metadata.status || '',
    fieldPath: 'metadata.status',
    category: 'bibliographic',
  },
  {
    id: 'supplement',
    condition: () => props.reference.metadata.supplement,
    icon: mdiFileDocumentOutline,
    title: t('supplement'),
    text: () => props.reference.metadata.supplement || '',
    fieldPath: 'metadata.supplement',
    category: 'bibliographic',
  },
  {
    id: 'version',
    condition: () => props.reference.metadata.version,
    icon: mdiNumeric,
    title: t('version'),
    text: () => props.reference.metadata.version || '',
    fieldPath: 'metadata.version',
    category: 'bibliographic',
  },
  {
    id: 'volume',
    condition: () => props.reference.metadata.volume,
    icon: mdiNumeric,
    title: t('volume'),
    text: () => props.reference.metadata.volume || '',
    fieldPath: 'metadata.volume',
    category: 'bibliographic',
  },
  {
    id: 'volume-title',
    condition: () => props.reference.metadata['volume-title'],
    icon: mdiFileDocumentOutline,
    title: t('volume-title'),
    text: () => props.reference.metadata['volume-title'] || '',
    fieldPath: 'metadata.volume-title',
    category: 'bibliographic',
  },
  {
    id: 'volume-title-short',
    condition: () => props.reference.metadata['volume-title-short'],
    icon: mdiFileDocumentOutline,
    title: t('volume-title-short'),
    text: () => props.reference.metadata['volume-title-short'] || '',
    fieldPath: 'metadata.volume-title-short',
    category: 'bibliographic',
  },
  {
    id: 'year-suffix',
    condition: () => props.reference.metadata['year-suffix'],
    icon: mdiCalendarClock,
    title: t('year-suffix'),
    text: () => props.reference.metadata['year-suffix'] || '',
    fieldPath: 'metadata.year-suffix',
    category: 'bibliographic',
  },
  // Technical/Archive
  {
    id: 'archive',
    condition: () => props.reference.metadata.archive,
    icon: mdiLibrary,
    title: t('archive'),
    text: () => props.reference.metadata.archive || '',
    fieldPath: 'metadata.archive',
    category: 'technical',
  },
  {
    id: 'call-number',
    condition: () => props.reference.metadata['call-number'],
    icon: mdiNumeric,
    title: t('call-number'),
    text: () => props.reference.metadata['call-number'] || '',
    fieldPath: 'metadata.call-number',
    category: 'technical',
  },
  {
    id: 'archive-collection',
    condition: () => props.reference.metadata.archive_collection,
    icon: mdiLibrary,
    title: t('archive-collection'),
    text: () => props.reference.metadata.archive_collection || '',
    fieldPath: 'metadata.archive_collection',
    category: 'technical',
  },
  {
    id: 'archive-location',
    condition: () => props.reference.metadata.archive_location,
    icon: mdiMapMarker,
    title: t('archive-location'),
    text: () => props.reference.metadata.archive_location || '',
    fieldPath: 'metadata.archive_location',
    category: 'technical',
  },
  {
    id: 'archive-place',
    condition: () => props.reference.metadata['archive-place'],
    icon: mdiMapMarker,
    title: t('archive-place'),
    text: () => props.reference.metadata['archive-place'] || '',
    fieldPath: 'metadata.archive-place',
    category: 'technical',
  },
  {
    id: 'authority',
    condition: () => props.reference.metadata.authority,
    icon: mdiGavel,
    title: t('authority'),
    text: () => props.reference.metadata.authority || '',
    fieldPath: 'metadata.authority',
    category: 'technical',
  },
  {
    id: 'event',
    condition: () => props.reference.metadata.event,
    icon: mdiCalendarRange,
    title: t('event'),
    text: () => props.reference.metadata.event || '',
    fieldPath: 'metadata.event',
    category: 'technical',
  },
  {
    id: 'event-place',
    condition: () => props.reference.metadata['event-place'],
    icon: mdiMapMarker,
    title: t('event-place'),
    text: () => props.reference.metadata['event-place'] || '',
    fieldPath: 'metadata.event-place',
    category: 'technical',
  },
  {
    id: 'event-title',
    condition: () => props.reference.metadata['event-title'],
    icon: mdiCalendarRange,
    title: t('event-title'),
    text: () => props.reference.metadata['event-title'] || '',
    fieldPath: 'metadata.event-title',
    category: 'technical',
  },
  {
    id: 'language',
    condition: () => props.reference.metadata.language,
    icon: mdiTranslate,
    title: t('language'),
    text: () => props.reference.metadata.language || '',
    fieldPath: 'metadata.language',
    category: 'technical',
  },
  {
    id: 'annote',
    condition: () => props.reference.metadata.annote,
    icon: mdiNoteText,
    title: t('annote'),
    text: () => props.reference.metadata.annote || '',
    fieldPath: 'metadata.annote',
    category: 'technical',
  },
  {
    id: 'abstract',
    condition: () => props.reference.metadata.abstract,
    icon: mdiText,
    title: t('abstract'),
    text: () => props.reference.metadata.abstract || '',
    fieldPath: 'metadata.abstract',
    category: 'technical',
  },
  {
    id: 'dimensions',
    condition: () => props.reference.metadata.dimensions,
    icon: mdiRuler,
    title: t('dimensions'),
    text: () => props.reference.metadata.dimensions || '',
    fieldPath: 'metadata.dimensions',
    category: 'technical',
  },
  {
    id: 'division',
    condition: () => props.reference.metadata.division,
    icon: mdiFileDocumentOutline,
    title: t('division'),
    text: () => props.reference.metadata.division || '',
    fieldPath: 'metadata.division',
    category: 'bibliographic',
  },
  {
    id: 'part',
    condition: () => props.reference.metadata.part,
    icon: mdiNumeric,
    title: t('part'),
    text: () => props.reference.metadata.part || '',
    fieldPath: 'metadata.part',
    category: 'bibliographic',
  },
  {
    id: 'printing',
    condition: () => props.reference.metadata.printing,
    icon: mdiNumeric,
    title: t('printing'),
    text: () => props.reference.metadata.printing || '',
    fieldPath: 'metadata.printing',
    category: 'bibliographic',
  },
  {
    id: 'reviewed-genre',
    condition: () => props.reference.metadata['reviewed-genre'],
    icon: mdiTag,
    title: t('reviewed-genre'),
    text: () => props.reference.metadata['reviewed-genre'] || '',
    fieldPath: 'metadata.reviewed-genre',
    category: 'bibliographic',
  },
  {
    id: 'scale',
    condition: () => props.reference.metadata.scale,
    icon: mdiRuler,
    title: t('scale'),
    text: () => props.reference.metadata.scale || '',
    fieldPath: 'metadata.scale',
    category: 'technical',
  },
  {
    id: 'categories',
    condition: () => props.reference.metadata.categories?.length,
    icon: mdiTag,
    title: t('categories'),
    text: () => props.reference.metadata.categories?.join(', ') || '',
    fieldPath: 'metadata.categories',
    category: 'technical',
  },
  {
    id: 'citation-key',
    condition: () => props.reference.metadata['citation-key'],
    icon: mdiFileDocumentOutline,
    title: t('citation-key'),
    text: () => props.reference.metadata['citation-key'] || '',
    fieldPath: 'metadata.citation-key',
    category: 'technical',
  },
  {
    id: 'journalAbbreviation',
    condition: () => props.reference.metadata.journalAbbreviation,
    icon: mdiNewspaper,
    title: t('journalAbbreviation'),
    text: () => props.reference.metadata.journalAbbreviation || '',
    fieldPath: 'metadata.journalAbbreviation',
    category: 'technical',
  },
  {
    id: 'shortTitle',
    condition: () => props.reference.metadata.shortTitle,
    icon: mdiFileDocumentOutline,
    title: t('shortTitle'),
    text: () => props.reference.metadata.shortTitle || '',
    fieldPath: 'metadata.shortTitle',
    category: 'technical',
  },
  {
    id: 'custom',
    condition: () => props.reference.metadata.custom && Object.keys(props.reference.metadata.custom).length > 0,
    icon: mdiTag,
    title: t('custom'),
    text: () => JSON.stringify(props.reference.metadata.custom) || '',
    fieldPath: 'metadata.custom',
    category: 'technical',
  },
].filter(field => field.condition()))

// Computed properties to check if additional fields exist
const hasAdditionalFields = computed(() => {
  return additionalFields.value.length > 0
})

// Check if all CSL fields section should be shown
const hasAllCSLFields = computed(() => {
  return allCSLFields.value.length > 0
})

// Group all CSL fields by category
const groupedCSLFields = computed(() => {
  const groups = {
    contributors: [] as any[],
    dates: [] as any[],
    bibliographic: [] as any[],
    technical: [] as any[],
  }

  allCSLFields.value.forEach((field) => {
    if (groups[field.category as keyof typeof groups]) {
      groups[field.category as keyof typeof groups].push(field)
    }
  })

  return groups
})

// Check if identifier section should be shown
const hasIdentifiers = computed(() => {
  return identifierFields.value.length > 0
})
</script>

<template>
  <v-list
    density="compact"
    slim
  >
    <v-list-subheader>{{ subheader }}</v-list-subheader>

    <!-- MAIN FIELDS -->
    <ReferenceMetadataItem
      v-for="field in mainFields"
      :key="field.id"
      :icon="field.icon"
      :title="field.title"
      :text="field.text()"
      :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
    />

    <!-- IDENTIFIERS SECTION -->
    <template v-if="hasIdentifiers">
      <v-divider class="my-2" />

      <ReferenceMetadataItem
        v-for="field in identifierFields"
        :key="field.id"
        :icon="field.icon"
        :title="field.title"
        :text="field.text()"
        :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
        :link="field.link"
      />
    </template>

    <!-- URL FIELDS -->
    <ReferenceMetadataItem
      v-for="field in urlFields"
      :key="field.id"
      :icon="field.icon"
      :title="field.title"
      :text="field.text()"
      :link="field.link"
    />

    <!-- ADDITIONAL FIELDS SECTION (Collapsible) -->
    <template v-if="hasAdditionalFields">
      <v-divider class="my-2" />

      <v-list-item
        :title="showAdditionalFields ? t('hide-additional-fields') : t('show-additional-fields')"
        :prepend-icon="showAdditionalFields ? mdiChevronUp : mdiChevronDown"
        nav
        @click="showAdditionalFields = !showAdditionalFields"
      />

      <v-expand-transition>
        <div v-if="showAdditionalFields">
          <ReferenceMetadataItem
            v-for="field in additionalFields"
            :key="field.id"
            :icon="field.icon"
            :title="field.title"
            :text="field.text()"
            :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
          />
        </div>
      </v-expand-transition>
    </template>

    <!-- ALL CSL FIELDS SECTION (Collapsible, Categorized) -->
    <template v-if="hasAllCSLFields">
      <v-divider class="my-2" />

      <v-list-item
        :title="showAllCSLFields ? t('hide-all-csl-fields') : t('show-all-csl-fields')"
        :prepend-icon="showAllCSLFields ? mdiChevronUp : mdiChevronDown"
        nav
        @click="showAllCSLFields = !showAllCSLFields"
      />

      <v-expand-transition>
        <div v-if="showAllCSLFields">
          <!-- Contributors -->
          <template v-if="groupedCSLFields.contributors.length > 0">
            <v-list-subheader class="text-sm font-weight-medium text-primary">
              {{ t('contributors') }}
            </v-list-subheader>
            <ReferenceMetadataItem
              v-for="field in groupedCSLFields.contributors"
              :key="field.id"
              :icon="field.icon"
              :title="field.title"
              :text="field.text()"
              :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
            />
          </template>

          <!-- Dates -->
          <template v-if="groupedCSLFields.dates.length > 0">
            <v-list-subheader class="text-sm font-weight-medium text-primary">
              {{ t('dates') }}
            </v-list-subheader>
            <ReferenceMetadataItem
              v-for="field in groupedCSLFields.dates"
              :key="field.id"
              :icon="field.icon"
              :title="field.title"
              :text="field.text()"
              :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
            />
          </template>

          <!-- Bibliographic -->
          <template v-if="groupedCSLFields.bibliographic.length > 0">
            <v-list-subheader class="text-sm font-weight-medium text-primary">
              {{ t('bibliographic') }}
            </v-list-subheader>
            <ReferenceMetadataItem
              v-for="field in groupedCSLFields.bibliographic"
              :key="field.id"
              :icon="field.icon"
              :title="field.title"
              :text="field.text()"
              :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
            />
          </template>

          <!-- Technical/Archive -->
          <template v-if="groupedCSLFields.technical.length > 0">
            <v-list-subheader class="text-sm font-weight-medium text-primary">
              {{ t('technical') }}
            </v-list-subheader>
            <ReferenceMetadataItem
              v-for="field in groupedCSLFields.technical"
              :key="field.id"
              :icon="field.icon"
              :title="field.title"
              :text="field.text()"
              :modifications="field.fieldPath ? getModificationsForField(field.fieldPath) : []"
            />
          </template>
        </div>
      </v-expand-transition>
    </template>
  </v-list>
</template>

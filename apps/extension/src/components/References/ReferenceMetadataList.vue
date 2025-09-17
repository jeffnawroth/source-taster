<script setup lang="ts" generic="T extends ApiExtractReference | ApiSearchCandidate">
import type { ApiExtractReference, ApiSearchCandidate } from '@source-taster/types'
import type { DeepReadonly, UnwrapNestedRefs } from 'vue'
import { mdiAccountGroup, mdiAccountTie, mdiBookmark, mdiBookOpenBlankVariantOutline, mdiCalendarClock, mdiCalendarOutline, mdiCalendarRange, mdiChevronDown, mdiChevronUp, mdiDomain, mdiEarth, mdiFileDocumentOutline, mdiGavel, mdiIdentifier, mdiInformation, mdiLibrary, mdiLink, mdiMapMarker, mdiMedicalBag, mdiMicrophone, mdiNewspaper, mdiNotebookOutline, mdiNoteText, mdiNumeric, mdiOfficeBuilding, mdiRuler, mdiTag, mdiTelevision, mdiText, mdiTranslate } from '@mdi/js'
import { formatCSLDateForDisplay, stringifyCSLName } from '@source-taster/types'

const props = defineProps<{
  reference: DeepReadonly<UnwrapNestedRefs<T>> | T
  subheader?: string
}>()

const { t } = useI18n()

// State for collapsible sections
const showOtherFields = ref(false)

// Main metadata fields configuration
const mainFields = computed(() => [
  {
    id: 'original-text',
    condition: () => 'originalText' in props.reference && props.reference.originalText,
    icon: mdiText,
    title: t('original-text'),
    text: () => 'originalText' in props.reference ? props.reference.originalText : '',
  },
  {
    id: 'title',
    condition: () => props.reference.metadata.title,
    icon: mdiFileDocumentOutline,
    title: t('title'),
    text: () => props.reference.metadata.title,
  },
  {
    id: 'authors',
    condition: () => props.reference.metadata.author?.length,
    icon: mdiAccountGroup,
    title: t('authors'),
    text: () => props.reference.metadata.author?.map((author) => {
      return stringifyCSLName(author)
    }).join(', ') || '',
  },
  {
    id: 'container-title',
    condition: () => props.reference.metadata['container-title'],
    icon: mdiEarth,
    title: t('containerTitle'),
    text: () => props.reference.metadata['container-title'] || '',
  },
  {
    id: 'issued',
    condition: () => props.reference.metadata.issued,
    icon: mdiCalendarOutline,
    title: t('issued'),
    text: () => formatCSLDateForDisplay(props.reference.metadata.issued) || '',
  },
  {
    id: 'volume',
    condition: () => props.reference.metadata.volume,
    icon: mdiBookOpenBlankVariantOutline,
    title: t('volume'),
    text: () => props.reference.metadata.volume || '',
  },
  {
    id: 'issue',
    condition: () => props.reference.metadata.issue,
    icon: mdiCalendarRange,
    title: t('issue'),
    text: () => props.reference.metadata.issue || '',
  },
  {
    id: 'pages',
    condition: () => props.reference.metadata.page,
    icon: mdiNotebookOutline,
    title: t('pages'),
    text: () => props.reference.metadata.page || '',
  },
  {
    id: 'publisher',
    condition: () => props.reference.metadata.publisher,
    icon: mdiDomain,
    title: t('publisher'),
    text: () => props.reference.metadata.publisher || '',
  },
  {
    id: 'publication-place',
    condition: () => props.reference.metadata['publisher-place'],
    icon: mdiMapMarker,
    title: t('publication-place'),
    text: () => props.reference.metadata['publisher-place'] || '',
  },
  {
    id: 'edition',
    condition: () => props.reference.metadata.edition,
    icon: mdiBookmark,
    title: t('edition'),
    text: () => props.reference.metadata.edition || '',
  },
  {
    id: 'type',
    condition: () => props.reference.metadata.type,
    icon: mdiTag,
    title: t('type'),
    text: () => props.reference.metadata.type || '',
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
    link: true,
  },
  {
    id: 'arxiv',
    condition: () => props.reference.metadata.arxivId,
    icon: mdiNewspaper,
    title: 'arXiv ID',
    text: () => props.reference.metadata.arxivId,
    link: true,
  },
  {
    id: 'pmid',
    condition: () => props.reference.metadata.PMID,
    icon: mdiMedicalBag,
    title: 'PMID',
    text: () => props.reference.metadata.PMID,
    link: true,
  },
  {
    id: 'pmcid',
    condition: () => props.reference.metadata.PMCID,
    icon: mdiMedicalBag,
    title: 'PMCID',
    text: () => props.reference.metadata.PMCID,
    link: true,
  },
  {
    id: 'isbn',
    condition: () => props.reference.metadata.ISBN,
    icon: mdiLibrary,
    title: 'ISBN',
    text: () => props.reference.metadata.ISBN,
    link: true,
  },
  {
    id: 'issn',
    condition: () => props.reference.metadata.ISSN,
    icon: mdiNewspaper,
    title: 'ISSN',
    text: () => props.reference.metadata.ISSN,
    link: true,
  },
].filter(field => field.condition()))

// URL fields configuration
const urlFields = computed(() => [
  {
    id: 'url',
    condition: () => props.reference.metadata.URL,
    icon: mdiLink,
    title: t('url'),
    text: () => props.reference.metadata.URL || '',
    link: true,
  },
].filter(field => field.condition()))

// Other fields configuration (collapsed section)
const otherFieldConfigs = computed(() => [
  // Commonly useful extras shown first
  {
    id: 'title-short',
    condition: () => props.reference.metadata['title-short'],
    icon: mdiFileDocumentOutline,
    title: t('title-short'),
    text: () => props.reference.metadata['title-short'] || '',
  },
  {
    id: 'medium',
    condition: () => props.reference.metadata.medium,
    icon: mdiTelevision,
    title: t('medium'),
    text: () => props.reference.metadata.medium || '',
  },
  {
    id: 'original-title',
    condition: () => props.reference.metadata['original-title'],
    icon: mdiTranslate,
    title: t('original-title'),
    text: () => props.reference.metadata['original-title'] || '',
  },
  {
    id: 'genre',
    condition: () => props.reference.metadata.genre,
    icon: mdiTag,
    title: t('genre'),
    text: () => props.reference.metadata.genre || '',
  },
  {
    id: 'abstract',
    condition: () => props.reference.metadata.abstract,
    icon: mdiText,
    title: t('abstract'),
    text: () => props.reference.metadata.abstract || '',
  },
  {
    id: 'language',
    condition: () => props.reference.metadata.language,
    icon: mdiTranslate,
    title: t('language'),
    text: () => props.reference.metadata.language || '',
  },
  {
    id: 'note',
    condition: () => props.reference.metadata.note,
    icon: mdiNotebookOutline,
    title: t('note'),
    text: () => props.reference.metadata.note || '',
  },
  {
    id: 'number',
    condition: () => props.reference.metadata.number,
    icon: mdiNumeric,
    title: t('number'),
    text: () => props.reference.metadata.number || '',
  },
  {
    id: 'number-of-pages',
    condition: () => props.reference.metadata['number-of-pages'],
    icon: mdiNotebookOutline,
    title: t('number-of-pages'),
    text: () => props.reference.metadata['number-of-pages'] || '',
  },
  {
    id: 'event',
    condition: () => props.reference.metadata.event,
    icon: mdiMicrophone,
    title: t('event'),
    text: () => props.reference.metadata.event || '',
  },
  {
    id: 'event-title',
    condition: () => props.reference.metadata['event-title'],
    icon: mdiMicrophone,
    title: t('event-title'),
    text: () => props.reference.metadata['event-title'] || '',
  },
  {
    id: 'event-place',
    condition: () => props.reference.metadata['event-place'],
    icon: mdiMapMarker,
    title: t('event-place'),
    text: () => props.reference.metadata['event-place'] || '',
  },

  // Comprehensive CSL coverage
  // Contributors (Name fields)
  {
    id: 'editor',
    condition: () => props.reference.metadata.editor?.length,
    icon: mdiAccountTie,
    title: t('editor'),
    text: () => props.reference.metadata.editor?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'translator',
    condition: () => props.reference.metadata.translator?.length,
    icon: mdiTranslate,
    title: t('translator'),
    text: () => props.reference.metadata.translator?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'director',
    condition: () => props.reference.metadata.director?.length,
    icon: mdiAccountTie,
    title: t('director'),
    text: () => props.reference.metadata.director?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'chair',
    condition: () => props.reference.metadata.chair?.length,
    icon: mdiAccountTie,
    title: t('chair'),
    text: () => props.reference.metadata.chair?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'collection-editor',
    condition: () => props.reference.metadata['collection-editor']?.length,
    icon: mdiAccountTie,
    title: t('collection-editor'),
    text: () => props.reference.metadata['collection-editor']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'compiler',
    condition: () => props.reference.metadata.compiler?.length,
    icon: mdiAccountTie,
    title: t('compiler'),
    text: () => props.reference.metadata.compiler?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'composer',
    condition: () => props.reference.metadata.composer?.length,
    icon: mdiMicrophone,
    title: t('composer'),
    text: () => props.reference.metadata.composer?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'container-author',
    condition: () => props.reference.metadata['container-author']?.length,
    icon: mdiAccountGroup,
    title: t('container-author'),
    text: () => props.reference.metadata['container-author']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'contributor',
    condition: () => props.reference.metadata.contributor?.length,
    icon: mdiAccountTie,
    title: t('contributor'),
    text: () => props.reference.metadata.contributor?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'curator',
    condition: () => props.reference.metadata.curator?.length,
    icon: mdiLibrary,
    title: t('curator'),
    text: () => props.reference.metadata.curator?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'editorial-director',
    condition: () => props.reference.metadata['editorial-director']?.length,
    icon: mdiAccountTie,
    title: t('editorial-director'),
    text: () => props.reference.metadata['editorial-director']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'executive-producer',
    condition: () => props.reference.metadata['executive-producer']?.length,
    icon: mdiTelevision,
    title: t('executive-producer'),
    text: () => props.reference.metadata['executive-producer']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'guest',
    condition: () => props.reference.metadata.guest?.length,
    icon: mdiAccountGroup,
    title: t('guest'),
    text: () => props.reference.metadata.guest?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'host',
    condition: () => props.reference.metadata.host?.length,
    icon: mdiMicrophone,
    title: t('host'),
    text: () => props.reference.metadata.host?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'interviewer',
    condition: () => props.reference.metadata.interviewer?.length,
    icon: mdiMicrophone,
    title: t('interviewer'),
    text: () => props.reference.metadata.interviewer?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'illustrator',
    condition: () => props.reference.metadata.illustrator?.length,
    icon: mdiFileDocumentOutline,
    title: t('illustrator'),
    text: () => props.reference.metadata.illustrator?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'narrator',
    condition: () => props.reference.metadata.narrator?.length,
    icon: mdiMicrophone,
    title: t('narrator'),
    text: () => props.reference.metadata.narrator?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'organizer',
    condition: () => props.reference.metadata.organizer?.length,
    icon: mdiAccountTie,
    title: t('organizer'),
    text: () => props.reference.metadata.organizer?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'original-author',
    condition: () => props.reference.metadata['original-author']?.length,
    icon: mdiAccountGroup,
    title: t('original-author'),
    text: () => props.reference.metadata['original-author']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'performer',
    condition: () => props.reference.metadata.performer?.length,
    icon: mdiMicrophone,
    title: t('performer'),
    text: () => props.reference.metadata.performer?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'producer',
    condition: () => props.reference.metadata.producer?.length,
    icon: mdiTelevision,
    title: t('producer'),
    text: () => props.reference.metadata.producer?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'recipient',
    condition: () => props.reference.metadata.recipient?.length,
    icon: mdiAccountGroup,
    title: t('recipient'),
    text: () => props.reference.metadata.recipient?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'reviewed-author',
    condition: () => props.reference.metadata['reviewed-author']?.length,
    icon: mdiAccountGroup,
    title: t('reviewed-author'),
    text: () => props.reference.metadata['reviewed-author']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'script-writer',
    condition: () => props.reference.metadata['script-writer']?.length,
    icon: mdiFileDocumentOutline,
    title: t('script-writer'),
    text: () => props.reference.metadata['script-writer']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  {
    id: 'series-creator',
    condition: () => props.reference.metadata['series-creator']?.length,
    icon: mdiTelevision,
    title: t('series-creator'),
    text: () => props.reference.metadata['series-creator']?.map((person) => {
      return stringifyCSLName(person)
    }).join(', ') || '',
  },
  // Dates
  {
    id: 'accessed',
    condition: () => props.reference.metadata.accessed,
    icon: mdiCalendarClock,
    title: t('accessed'),
    text: () => formatCSLDateForDisplay(props.reference.metadata.accessed) || '',
  },
  {
    id: 'submitted',
    condition: () => props.reference.metadata.submitted,
    icon: mdiCalendarClock,
    title: t('submitted'),
    text: () => formatCSLDateForDisplay(props.reference.metadata.submitted) || '',
  },
  {
    id: 'available-date',
    condition: () => props.reference.metadata['available-date'],
    icon: mdiCalendarClock,
    title: t('available-date'),
    text: () => formatCSLDateForDisplay(props.reference.metadata['available-date']) || '',
  },
  {
    id: 'event-date',
    condition: () => props.reference.metadata['event-date'],
    icon: mdiCalendarClock,
    title: t('event-date'),
    text: () => formatCSLDateForDisplay(props.reference.metadata['event-date']) || '',
  },
  {
    id: 'original-date',
    condition: () => props.reference.metadata['original-date'],
    icon: mdiCalendarClock,
    title: t('original-date'),
    text: () => formatCSLDateForDisplay(props.reference.metadata['original-date']) || '',
  },
  // Bibliographic
  {
    id: 'collection-title',
    condition: () => props.reference.metadata['collection-title'],
    icon: mdiBookmark,
    title: t('collection-title'),
    text: () => props.reference.metadata['collection-title'] || '',
  },
  {
    id: 'container-title-short',
    condition: () => props.reference.metadata['container-title-short'],
    icon: mdiEarth,
    title: t('container-title-short'),
    text: () => props.reference.metadata['container-title-short'] || '',
  },
  {
    id: 'part-title',
    condition: () => props.reference.metadata['part-title'],
    icon: mdiFileDocumentOutline,
    title: t('part-title'),
    text: () => props.reference.metadata['part-title'] || '',
  },
  {
    id: 'title-short',
    condition: () => props.reference.metadata['title-short'],
    icon: mdiFileDocumentOutline,
    title: t('title-short'),
    text: () => props.reference.metadata['title-short'] || '',
  },
  {
    id: 'original-title',
    condition: () => props.reference.metadata['original-title'],
    icon: mdiFileDocumentOutline,
    title: t('original-title'),
    text: () => props.reference.metadata['original-title'] || '',
  },
  {
    id: 'reviewed-title',
    condition: () => props.reference.metadata['reviewed-title'],
    icon: mdiFileDocumentOutline,
    title: t('reviewed-title'),
    text: () => props.reference.metadata['reviewed-title'] || '',
  },
  {
    id: 'collection-number',
    condition: () => props.reference.metadata['collection-number'],
    icon: mdiNumeric,
    title: t('collection-number'),
    text: () => props.reference.metadata['collection-number'] || '',
  },
  {
    id: 'chapter-number',
    condition: () => props.reference.metadata['chapter-number'],
    icon: mdiNumeric,
    title: t('chapter-number'),
    text: () => props.reference.metadata['chapter-number'] || '',
  },
  {
    id: 'citation-number',
    condition: () => props.reference.metadata['citation-number'],
    icon: mdiNumeric,
    title: t('citation-number'),
    text: () => props.reference.metadata['citation-number'] || '',
  },
  {
    id: 'citation-label',
    condition: () => props.reference.metadata['citation-label'],
    icon: mdiFileDocumentOutline,
    title: t('citation-label'),
    text: () => props.reference.metadata['citation-label'] || '',
  },
  {
    id: 'first-reference-note-number',
    condition: () => props.reference.metadata['first-reference-note-number'],
    icon: mdiNumeric,
    title: t('first-reference-note-number'),
    text: () => props.reference.metadata['first-reference-note-number'] || '',
  },
  {
    id: 'genre',
    condition: () => props.reference.metadata.genre,
    icon: mdiTag,
    title: t('genre'),
    text: () => props.reference.metadata.genre || '',
  },
  {
    id: 'issue',
    condition: () => props.reference.metadata.issue,
    icon: mdiNumeric,
    title: t('issue'),
    text: () => props.reference.metadata.issue || '',
  },
  {
    id: 'jurisdiction',
    condition: () => props.reference.metadata.jurisdiction,
    icon: mdiMapMarker,
    title: t('jurisdiction'),
    text: () => props.reference.metadata.jurisdiction || '',
  },
  {
    id: 'keyword',
    condition: () => props.reference.metadata.keyword,
    icon: mdiTag,
    title: t('keyword'),
    text: () => props.reference.metadata.keyword || '',
  },
  {
    id: 'locator',
    condition: () => props.reference.metadata.locator,
    icon: mdiMapMarker,
    title: t('locator'),
    text: () => props.reference.metadata.locator || '',
  },
  {
    id: 'medium',
    condition: () => props.reference.metadata.medium,
    icon: mdiFileDocumentOutline,
    title: t('medium'),
    text: () => props.reference.metadata.medium || '',
  },
  {
    id: 'note',
    condition: () => props.reference.metadata.note,
    icon: mdiNoteText,
    title: t('note'),
    text: () => props.reference.metadata.note || '',
  },
  {
    id: 'number',
    condition: () => props.reference.metadata.number,
    icon: mdiNumeric,
    title: t('number'),
    text: () => props.reference.metadata.number || '',
  },
  {
    id: 'number-of-pages',
    condition: () => props.reference.metadata['number-of-pages'],
    icon: mdiNumeric,
    title: t('number-of-pages'),
    text: () => props.reference.metadata['number-of-pages'] || '',
  },
  {
    id: 'number-of-volumes',
    condition: () => props.reference.metadata['number-of-volumes'],
    icon: mdiNumeric,
    title: t('number-of-volumes'),
    text: () => props.reference.metadata['number-of-volumes'] || '',
  },
  {
    id: 'original-publisher',
    condition: () => props.reference.metadata['original-publisher'],
    icon: mdiOfficeBuilding,
    title: t('original-publisher'),
    text: () => props.reference.metadata['original-publisher'] || '',
  },
  {
    id: 'original-publisher-place',
    condition: () => props.reference.metadata['original-publisher-place'],
    icon: mdiMapMarker,
    title: t('original-publisher-place'),
    text: () => props.reference.metadata['original-publisher-place'] || '',
  },
  {
    id: 'page',
    condition: () => props.reference.metadata.page,
    icon: mdiNumeric,
    title: t('page'),
    text: () => props.reference.metadata.page || '',
  },
  {
    id: 'page-first',
    condition: () => props.reference.metadata['page-first'],
    icon: mdiNumeric,
    title: t('page-first'),
    text: () => props.reference.metadata['page-first'] || '',
  },
  {
    id: 'references',
    condition: () => props.reference.metadata.references,
    icon: mdiBookmark,
    title: t('references'),
    text: () => props.reference.metadata.references || '',
  },
  {
    id: 'section',
    condition: () => props.reference.metadata.section,
    icon: mdiFileDocumentOutline,
    title: t('section'),
    text: () => props.reference.metadata.section || '',
  },
  {
    id: 'source',
    condition: () => props.reference.metadata.source,
    icon: mdiFileDocumentOutline,
    title: t('source'),
    text: () => props.reference.metadata.source || '',
  },
  {
    id: 'status',
    condition: () => props.reference.metadata.status,
    icon: mdiInformation,
    title: t('status'),
    text: () => props.reference.metadata.status || '',
  },
  {
    id: 'supplement',
    condition: () => props.reference.metadata.supplement,
    icon: mdiFileDocumentOutline,
    title: t('supplement'),
    text: () => props.reference.metadata.supplement || '',
  },
  {
    id: 'version',
    condition: () => props.reference.metadata.version,
    icon: mdiNumeric,
    title: t('version'),
    text: () => props.reference.metadata.version || '',
  },
  {
    id: 'volume',
    condition: () => props.reference.metadata.volume,
    icon: mdiNumeric,
    title: t('volume'),
    text: () => props.reference.metadata.volume || '',
  },
  {
    id: 'volume-title',
    condition: () => props.reference.metadata['volume-title'],
    icon: mdiFileDocumentOutline,
    title: t('volume-title'),
    text: () => props.reference.metadata['volume-title'] || '',
  },
  {
    id: 'volume-title-short',
    condition: () => props.reference.metadata['volume-title-short'],
    icon: mdiFileDocumentOutline,
    title: t('volume-title-short'),
    text: () => props.reference.metadata['volume-title-short'] || '',
  },
  {
    id: 'year-suffix',
    condition: () => props.reference.metadata['year-suffix'],
    icon: mdiCalendarClock,
    title: t('year-suffix'),
    text: () => props.reference.metadata['year-suffix'] || '',
  },
  // Technical/Archive
  {
    id: 'archive',
    condition: () => props.reference.metadata.archive,
    icon: mdiLibrary,
    title: t('archive'),
    text: () => props.reference.metadata.archive || '',
  },
  {
    id: 'call-number',
    condition: () => props.reference.metadata['call-number'],
    icon: mdiNumeric,
    title: t('call-number'),
    text: () => props.reference.metadata['call-number'] || '',
  },
  {
    id: 'archive-collection',
    condition: () => props.reference.metadata.archive_collection,
    icon: mdiLibrary,
    title: t('archive-collection'),
    text: () => props.reference.metadata.archive_collection || '',
  },
  {
    id: 'archive-location',
    condition: () => props.reference.metadata.archive_location,
    icon: mdiMapMarker,
    title: t('archive-location'),
    text: () => props.reference.metadata.archive_location || '',
  },
  {
    id: 'archive-place',
    condition: () => props.reference.metadata['archive-place'],
    icon: mdiMapMarker,
    title: t('archive-place'),
    text: () => props.reference.metadata['archive-place'] || '',
  },
  {
    id: 'authority',
    condition: () => props.reference.metadata.authority,
    icon: mdiGavel,
    title: t('authority'),
    text: () => props.reference.metadata.authority || '',
  },
  {
    id: 'event',
    condition: () => props.reference.metadata.event,
    icon: mdiCalendarRange,
    title: t('event'),
    text: () => props.reference.metadata.event || '',
  },
  {
    id: 'event-place',
    condition: () => props.reference.metadata['event-place'],
    icon: mdiMapMarker,
    title: t('event-place'),
    text: () => props.reference.metadata['event-place'] || '',
  },
  {
    id: 'event-title',
    condition: () => props.reference.metadata['event-title'],
    icon: mdiCalendarRange,
    title: t('event-title'),
    text: () => props.reference.metadata['event-title'] || '',
  },
  {
    id: 'language',
    condition: () => props.reference.metadata.language,
    icon: mdiTranslate,
    title: t('language'),
    text: () => props.reference.metadata.language || '',
  },
  {
    id: 'annote',
    condition: () => props.reference.metadata.annote,
    icon: mdiNoteText,
    title: t('annote'),
    text: () => props.reference.metadata.annote || '',
  },
  {
    id: 'abstract',
    condition: () => props.reference.metadata.abstract,
    icon: mdiText,
    title: t('abstract'),
    text: () => props.reference.metadata.abstract || '',
  },
  {
    id: 'dimensions',
    condition: () => props.reference.metadata.dimensions,
    icon: mdiRuler,
    title: t('dimensions'),
    text: () => props.reference.metadata.dimensions || '',
  },
  {
    id: 'division',
    condition: () => props.reference.metadata.division,
    icon: mdiFileDocumentOutline,
    title: t('division'),
    text: () => props.reference.metadata.division || '',
  },
  {
    id: 'part',
    condition: () => props.reference.metadata.part,
    icon: mdiNumeric,
    title: t('part'),
    text: () => props.reference.metadata.part || '',
  },
  {
    id: 'printing',
    condition: () => props.reference.metadata.printing,
    icon: mdiNumeric,
    title: t('printing'),
    text: () => props.reference.metadata.printing || '',
  },
  {
    id: 'reviewed-genre',
    condition: () => props.reference.metadata['reviewed-genre'],
    icon: mdiTag,
    title: t('reviewed-genre'),
    text: () => props.reference.metadata['reviewed-genre'] || '',
  },
  {
    id: 'scale',
    condition: () => props.reference.metadata.scale,
    icon: mdiRuler,
    title: t('scale'),
    text: () => props.reference.metadata.scale || '',
  },
  {
    id: 'categories',
    condition: () => props.reference.metadata.categories?.length,
    icon: mdiTag,
    title: t('categories'),
    text: () => props.reference.metadata.categories?.join(', ') || '',
  },
  {
    id: 'citation-key',
    condition: () => props.reference.metadata['citation-key'],
    icon: mdiFileDocumentOutline,
    title: t('citation-key'),
    text: () => props.reference.metadata['citation-key'] || '',
  },
  {
    id: 'journalAbbreviation',
    condition: () => props.reference.metadata.journalAbbreviation,
    icon: mdiNewspaper,
    title: t('journalAbbreviation'),
    text: () => props.reference.metadata.journalAbbreviation || '',
  },
  {
    id: 'shortTitle',
    condition: () => props.reference.metadata.shortTitle,
    icon: mdiFileDocumentOutline,
    title: t('shortTitle'),
    text: () => props.reference.metadata.shortTitle || '',
  },
  {
    id: 'custom',
    condition: () => props.reference.metadata.custom && Object.keys(props.reference.metadata.custom).length > 0,
    icon: mdiTag,
    title: t('custom'),
    text: () => JSON.stringify(props.reference.metadata.custom) || '',
  },

].filter(field => field.condition()))
const otherFields = computed(() => {
  const excludedIds = new Set([
    ...mainFields.value.map(field => field.id),
    ...identifierFields.value.map(field => field.id),
    ...urlFields.value.map(field => field.id),
  ])

  const seen = new Set<string>()

  return otherFieldConfigs.value.filter((field) => {
    if (excludedIds.has(field.id)) {
      return false
    }

    if (seen.has(field.id)) {
      return false
    }

    seen.add(field.id)
    return true
  })
})

const hasOtherFields = computed(() => {
  return otherFields.value.length > 0
})

// Check if identifier section should be shown
const hasIdentifiers = computed(() => {
  return identifierFields.value.length > 0
})
</script>

<template>
  <v-list
    density="compact"
  >
    <v-list-subheader>{{ subheader }}</v-list-subheader>

    <!-- MAIN FIELDS -->
    <ReferenceMetadataItem
      v-for="field in mainFields"
      :key="field.id"
      :icon="field.icon"
      :title="field.title"
      :text="field.text()"
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

    <!-- OTHER FIELDS SECTION (Collapsible) -->
    <template v-if="hasOtherFields">
      <v-divider class="my-2" />

      <v-list-item
        :title="showOtherFields ? t('hide-all-fields') : t('show-all-fields')"
        :prepend-icon="showOtherFields ? mdiChevronUp : mdiChevronDown"
        nav
        @click="showOtherFields = !showOtherFields"
      />

      <v-expand-transition>
        <div v-if="showOtherFields">
          <ReferenceMetadataItem
            v-for="field in otherFields"
            :key="field.id"
            :icon="field.icon"
            :title="field.title"
            :text="field.text()"
          />
        </div>
      </v-expand-transition>
    </template>
  </v-list>
</template>

<script setup lang="ts">
import type { ExternalSource, FieldProcessingResult, Reference } from '@source-taster/types'
import {
  mdiAccountGroup,
  mdiAccountTie,
  mdiBookmark,
  mdiBookOpenBlankVariantOutline,
  mdiCalendarClock,
  mdiCalendarOutline,
  mdiCalendarRange,
  mdiChevronDown,
  mdiChevronUp,
  mdiDomain,
  mdiEarth,
  mdiFileDocumentOutline,
  mdiFileMultiple,
  mdiGavel,
  mdiIdentifier,
  mdiLibrary,
  mdiLink,
  mdiMapMarker,
  mdiMedicalBag,
  mdiMicrophone,
  mdiNewspaper,
  mdiNotebookOutline,
  mdiNumeric,
  mdiSchool,
  mdiTag,
  mdiTelevision,
  mdiText,
  mdiTranslate,
} from '@mdi/js'

const props = defineProps<{
  reference: Reference | ExternalSource
  subheader?: string
}>()

const { t } = useI18n()

// Helper function to get all modifications for a specific field
function getModificationsForField(fieldPath: string): FieldProcessingResult[] {
  if (!('processingResults' in props.reference) || !props.reference.processingResults) {
    return []
  }

  // Find modifications that match the exact fieldPath or are sub-fields of it
  return props.reference.processingResults.filter((mod) => {
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
const showDateFields = ref(false)

// Computed property for formatted date display
const formattedDate = computed(() => {
  const date = props.reference.metadata.date

  if (!date)
    return null

  // Handle special date cases first
  if (date.noDate) {
    return t('no-date-indicator')
  }

  if (date.inPress) {
    return t('in-press-indicator')
  }

  if (!date.year && !date.month && !date.day)
    return null

  const parts: string[] = []

  // Format: Day Month Year (e.g., "15 March 2023" or "March 2023" or "2023")

  // Add day if available
  if (date.day) {
    parts.push(date.day.toString())
  }

  // Add month if available
  if (date.month) {
    parts.push(date.month)
  }

  // Add year if available
  if (date.year) {
    let yearStr = date.year.toString()
    if (date.yearSuffix) {
      yearStr += date.yearSuffix
    }
    parts.push(yearStr)
  }

  const formattedStr = parts.join(' ')

  // Handle date range
  if (date.dateRange && date.yearEnd && date.year) {
    return `${date.year}–${date.yearEnd}`
  }

  // Handle approximate date
  if (date.approximateDate && formattedStr) {
    return `ca. ${formattedStr}`
  }

  return formattedStr || null
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
    condition: () => props.reference.metadata.authors?.length,
    icon: mdiAccountGroup,
    title: t('authors'),
    text: () => props.reference.metadata.authors?.map((author) => {
      if (typeof author === 'string')
        return author
      const name = `${author.firstName || ''} ${author.lastName || ''}`.trim()
      return author.role ? `${name} (${author.role})` : name
    }).join(', ') || '',
    fieldPath: 'metadata.authors',
  },
  {
    id: 'container-title',
    condition: () => props.reference.metadata.source?.containerTitle,
    icon: mdiEarth,
    title: t('containerTitle'),
    text: () => props.reference.metadata.source?.containerTitle || '',
    fieldPath: 'metadata.source.containerTitle',
  },
  {
    id: 'publication-date',
    condition: () => formattedDate.value,
    icon: mdiCalendarOutline,
    title: t('publication-date'),
    text: () => formattedDate.value || '',
    fieldPath: 'metadata.date',
  },
  {
    id: 'volume',
    condition: () => props.reference.metadata.source?.volume,
    icon: mdiBookOpenBlankVariantOutline,
    title: t('volume'),
    text: () => props.reference.metadata.source?.volume || '',
    fieldPath: 'metadata.source.volume',
  },
  {
    id: 'issue',
    condition: () => props.reference.metadata.source?.issue,
    icon: mdiCalendarRange,
    title: t('issue'),
    text: () => props.reference.metadata.source?.issue || '',
    fieldPath: 'metadata.source.issue',
  },
  {
    id: 'pages',
    condition: () => props.reference.metadata.source?.pages,
    icon: mdiNotebookOutline,
    title: t('pages'),
    text: () => props.reference.metadata.source?.pages || '',
    fieldPath: 'metadata.source.pages',
  },
  {
    id: 'source-type',
    condition: () => props.reference.metadata.source?.sourceType,
    icon: mdiTag,
    title: t('source-type'),
    text: () => props.reference.metadata.source?.sourceType || '',
    fieldPath: 'metadata.source.sourceType',
  },
  {
    id: 'publisher',
    condition: () => props.reference.metadata.source?.publisher,
    icon: mdiDomain,
    title: t('publisher'),
    text: () => props.reference.metadata.source?.publisher || '',
    fieldPath: 'metadata.source.publisher',
  },
  {
    id: 'publication-place',
    condition: () => props.reference.metadata.source?.publicationPlace,
    icon: mdiMapMarker,
    title: t('publication-place'),
    text: () => props.reference.metadata.source?.publicationPlace || '',
    fieldPath: 'metadata.source.publicationPlace',
  },
  {
    id: 'edition',
    condition: () => props.reference.metadata.source?.edition,
    icon: mdiBookmark,
    title: t('edition'),
    text: () => props.reference.metadata.source?.edition || '',
    fieldPath: 'metadata.source.edition',
  },
  {
    id: 'series',
    condition: () => props.reference.metadata.source?.series,
    icon: mdiLibrary,
    title: t('series'),
    text: () => props.reference.metadata.source?.series || '',
    fieldPath: 'metadata.source.series',
  },
  {
    id: 'institution',
    condition: () => props.reference.metadata.source?.institution,
    icon: mdiSchool,
    title: t('institution'),
    text: () => props.reference.metadata.source?.institution || '',
    fieldPath: 'metadata.source.institution',
  },
].filter(field => field.condition()))

// Identifier fields configuration
const identifierFields = computed(() => [
  {
    id: 'doi',
    condition: () => props.reference.metadata.identifiers?.doi,
    icon: mdiIdentifier,
    title: 'DOI',
    text: () => props.reference.metadata.identifiers?.doi,
    fieldPath: 'metadata.identifiers.doi',
    link: true,
  },
  {
    id: 'arxiv',
    condition: () => props.reference.metadata.identifiers?.arxivId,
    icon: mdiNewspaper,
    title: 'arXiv ID',
    text: () => props.reference.metadata.identifiers?.arxivId,
    fieldPath: 'metadata.identifiers.arxivId',
    link: true,
  },
  {
    id: 'pmid',
    condition: () => props.reference.metadata.identifiers?.pmid,
    icon: mdiMedicalBag,
    title: 'PMID',
    text: () => props.reference.metadata.identifiers?.pmid,
    fieldPath: 'metadata.identifiers.pmid',
    link: true,
  },
  {
    id: 'pmcid',
    condition: () => props.reference.metadata.identifiers?.pmcid,
    icon: mdiMedicalBag,
    title: 'PMCID',
    text: () => props.reference.metadata.identifiers?.pmcid,
    fieldPath: 'metadata.identifiers.pmcid',
    link: true,
  },
  {
    id: 'isbn',
    condition: () => props.reference.metadata.identifiers?.isbn,
    icon: mdiLibrary,
    title: 'ISBN',
    text: () => props.reference.metadata.identifiers?.isbn,
    fieldPath: 'metadata.identifiers.isbn',
    link: true,
  },
  {
    id: 'issn',
    condition: () => props.reference.metadata.identifiers?.issn,
    icon: mdiNewspaper,
    title: 'ISSN',
    text: () => props.reference.metadata.identifiers?.issn,
    fieldPath: 'metadata.identifiers.issn',
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
    fieldPath: 'metadata.url',
    link: true,
  },
  {
    id: 'source-url',
    condition: () => props.reference.metadata.source?.url,
    icon: mdiLink,
    title: t('source-url'),
    text: () => props.reference.metadata.source?.url || '',
    fieldPath: 'metadata.source.url',
    link: true,
  },
].filter(field => field.condition()))

// Additional fields configuration
const additionalFields = computed(() => [
  {
    id: 'subtitle',
    condition: () => props.reference.metadata.source?.subtitle,
    icon: mdiFileDocumentOutline,
    title: t('subtitle'),
    text: () => props.reference.metadata.source?.subtitle || '',
    fieldPath: 'metadata.source.subtitle',
  },
  {
    id: 'location',
    condition: () => props.reference.metadata.source?.location,
    icon: mdiMapMarker,
    title: t('location'),
    text: () => props.reference.metadata.source?.location || '',
    fieldPath: 'metadata.source.location',
  },
  {
    id: 'retrieval-date',
    condition: () => props.reference.metadata.source?.retrievalDate,
    icon: mdiCalendarClock,
    title: t('retrieval-date'),
    text: () => props.reference.metadata.source?.retrievalDate || '',
    fieldPath: 'metadata.source.retrievalDate',
  },
  {
    id: 'contributors',
    condition: () => props.reference.metadata.source?.contributors?.length,
    icon: mdiAccountTie,
    title: t('contributors'),
    text: () => props.reference.metadata.source?.contributors?.map((contributor) => {
      if (typeof contributor === 'string')
        return contributor
      const name = `${contributor.firstName || ''} ${contributor.lastName || ''}`.trim()
      return contributor.role ? `${name} (${contributor.role})` : name
    }).join(', ') || '',
    fieldPath: 'metadata.source.contributors',
  },
  {
    id: 'page-type',
    condition: () => props.reference.metadata.source?.pageType,
    icon: mdiNotebookOutline,
    title: t('page-type'),
    text: () => props.reference.metadata.source?.pageType || '',
    fieldPath: 'metadata.source.pageType',
  },
  {
    id: 'paragraph-number',
    condition: () => props.reference.metadata.source?.paragraphNumber,
    icon: mdiNumeric,
    title: t('paragraph-number'),
    text: () => props.reference.metadata.source?.paragraphNumber || '',
    fieldPath: 'metadata.source.paragraphNumber',
  },
  {
    id: 'volume-prefix',
    condition: () => props.reference.metadata.source?.volumePrefix,
    icon: mdiBookOpenBlankVariantOutline,
    title: t('volume-prefix'),
    text: () => props.reference.metadata.source?.volumePrefix || '',
    fieldPath: 'metadata.source.volumePrefix',
  },
  {
    id: 'issue-prefix',
    condition: () => props.reference.metadata.source?.issuePrefix,
    icon: mdiCalendarRange,
    title: t('issue-prefix'),
    text: () => props.reference.metadata.source?.issuePrefix || '',
    fieldPath: 'metadata.source.issuePrefix',
  },
  {
    id: 'supplement-info',
    condition: () => props.reference.metadata.source?.supplementInfo,
    icon: mdiFileMultiple,
    title: t('supplement-info'),
    text: () => props.reference.metadata.source?.supplementInfo || '',
    fieldPath: 'metadata.source.supplementInfo',
  },
  {
    id: 'article-number',
    condition: () => props.reference.metadata.source?.articleNumber,
    icon: mdiNumeric,
    title: t('article-number'),
    text: () => props.reference.metadata.source?.articleNumber || '',
    fieldPath: 'metadata.source.articleNumber',
  },
  {
    id: 'conference',
    condition: () => props.reference.metadata.source?.conference,
    icon: mdiMicrophone,
    title: t('conference'),
    text: () => props.reference.metadata.source?.conference || '',
    fieldPath: 'metadata.source.conference',
  },
  {
    id: 'series-number',
    condition: () => props.reference.metadata.source?.seriesNumber,
    icon: mdiLibrary,
    title: t('series-number'),
    text: () => props.reference.metadata.source?.seriesNumber || '',
    fieldPath: 'metadata.source.seriesNumber',
  },
  {
    id: 'chapter-title',
    condition: () => props.reference.metadata.source?.chapterTitle,
    icon: mdiFileDocumentOutline,
    title: t('chapter-title'),
    text: () => props.reference.metadata.source?.chapterTitle || '',
    fieldPath: 'metadata.source.chapterTitle',
  },
  {
    id: 'medium',
    condition: () => props.reference.metadata.source?.medium,
    icon: mdiTelevision,
    title: t('medium'),
    text: () => props.reference.metadata.source?.medium || '',
    fieldPath: 'metadata.source.medium',
  },
  {
    id: 'original-title',
    condition: () => props.reference.metadata.source?.originalTitle,
    icon: mdiTranslate,
    title: t('original-title'),
    text: () => props.reference.metadata.source?.originalTitle || '',
    fieldPath: 'metadata.source.originalTitle',
  },
  {
    id: 'original-language',
    condition: () => props.reference.metadata.source?.originalLanguage,
    icon: mdiTranslate,
    title: t('original-language'),
    text: () => props.reference.metadata.source?.originalLanguage || '',
    fieldPath: 'metadata.source.originalLanguage',
  },
  {
    id: 'degree',
    condition: () => props.reference.metadata.source?.degree,
    icon: mdiGavel,
    title: t('degree'),
    text: () => props.reference.metadata.source?.degree || '',
    fieldPath: 'metadata.source.degree',
  },
  {
    id: 'advisor',
    condition: () => props.reference.metadata.source?.advisor,
    icon: mdiAccountTie,
    title: t('advisor'),
    text: () => props.reference.metadata.source?.advisor || '',
    fieldPath: 'metadata.source.advisor',
  },
  {
    id: 'department',
    condition: () => props.reference.metadata.source?.department,
    icon: mdiSchool,
    title: t('department'),
    text: () => props.reference.metadata.source?.department || '',
    fieldPath: 'metadata.source.department',
  },
  {
    id: 'is-standalone',
    condition: () => props.reference.metadata.source?.isStandAlone !== undefined,
    icon: mdiBookOpenBlankVariantOutline,
    title: t('is-standalone'),
    text: () => props.reference.metadata.source?.isStandAlone ? t('yes') : t('no'),
    fieldPath: 'metadata.source.isStandAlone',
  },
].filter(field => field.condition()))

// Extended date fields configuration
const extendedDateFields = computed(() => [
  {
    id: 'season',
    condition: () => props.reference.metadata.date?.season,
    icon: mdiCalendarOutline,
    title: t('season'),
    text: () => props.reference.metadata.date?.season || '',
    fieldPath: 'metadata.date.season',
  },
  {
    id: 'date-range',
    condition: () => props.reference.metadata.date?.dateRange && props.reference.metadata.date?.yearEnd,
    icon: mdiCalendarRange,
    title: t('date-range'),
    text: () => `${props.reference.metadata.date?.year}–${props.reference.metadata.date?.yearEnd}`,
    fieldPath: 'metadata.date.dateRange',
  },
].filter(field => field.condition()))

// Computed properties to check if additional fields exist
const hasAdditionalFields = computed(() => {
  return additionalFields.value.length > 0
})

const hasExtendedDateFields = computed(() => {
  return extendedDateFields.value.length > 0
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

    <!-- EXTENDED DATE FIELDS SECTION (Collapsible) -->
    <template v-if="hasExtendedDateFields">
      <v-divider class="my-2" />

      <v-list-item
        :title="showDateFields ? t('hide-date-details') : t('show-date-details')"
        :prepend-icon="showDateFields ? mdiChevronUp : mdiChevronDown"
        nav
        @click="showDateFields = !showDateFields"
      />

      <v-expand-transition>
        <div v-if="showDateFields">
          <ReferenceMetadataItem
            v-for="field in extendedDateFields"
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

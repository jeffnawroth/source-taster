<script setup lang="ts">
import type { ExternalSource, Reference } from '@source-taster/types'
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

// State for collapsible sections
const showAdditionalFields = ref(false)
const showDateFields = ref(false)

// Computed properties to check if additional fields exist
const hasAdditionalFields = computed(() => {
  const source = props.reference.metadata.source
  return !!(
    source.subtitle
    || source.location
    || source.retrievalDate
    || source.contributors?.length
    || source.pageType
    || source.paragraphNumber
    || source.volumePrefix
    || source.issuePrefix
    || source.supplementInfo
    || source.articleNumber
    || source.conference
    || source.seriesNumber
    || source.chapterTitle
    || source.medium
    || source.originalTitle
    || source.originalLanguage
    || source.degree
    || source.advisor
    || source.department
    || source.isStandAlone !== undefined
  )
})

const hasExtendedDateFields = computed(() => {
  const date = props.reference.metadata.date
  return !!(
    date.season
    || date.dateRange
    || date.yearEnd
    // Note: yearSuffix, noDate, inPress, approximateDate are now handled in formattedDate
  )
})

// Computed property for formatted date display
const formattedDate = computed(() => {
  const date = props.reference.metadata.date

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
</script>

<template>
  <v-list
    density="compact"
    slim
  >
    <v-list-subheader>{{ subheader }}</v-list-subheader>

    <!-- ORIGINAL TEXT -->
    <ReferenceMetadataItem
      v-if="'originalText' in props.reference && props.reference.originalText"
      :icon="mdiText"
      :title="t('original-text')"
      :text="props.reference.originalText"
    />

    <!-- TITLE -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.title"
      :icon="mdiFileDocumentOutline"
      :title="t('title')"
      :text="props.reference.metadata.title"
    />

    <!-- AUTHORS -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.authors?.length"
      :icon="mdiAccountGroup"
      :title="t('authors')"
      :text="props.reference.metadata.authors?.map(author => {
        if (typeof author === 'string') return author
        const name = `${author.firstName || ''} ${author.lastName || ''}`.trim()
        return author.role ? `${name} (${author.role})` : name
      }).join(', ')"
    />

    <!-- JOURNAL/CONTAINER TITLE -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.containerTitle"
      :icon="mdiEarth"
      :title="t('containerTitle')"
      :text="props.reference.metadata.source.containerTitle"
    />

    <!-- PUBLICATION DATE (combined day, month, year) -->
    <ReferenceMetadataItem
      v-if="formattedDate"
      :icon="mdiCalendarOutline"
      :title="t('publication-date')"
      :text="formattedDate"
    />

    <!-- VOLUME -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.volume"
      :icon="mdiBookOpenBlankVariantOutline"
      :title="t('volume')"
      :text="props.reference.metadata.source.volume"
    />

    <!-- ISSUE -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.issue"
      :icon="mdiCalendarRange"
      :title="t('issue')"
      :text="props.reference.metadata.source.issue"
    />

    <!-- PAGES -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.pages"
      :icon="mdiNotebookOutline"
      :title="t('pages')"
      :text="props.reference.metadata.source.pages"
    />

    <!-- SOURCE TYPE -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.sourceType"
      :icon="mdiTag"
      :title="t('source-type')"
      :text="props.reference.metadata.source.sourceType"
    />

    <!-- PUBLISHER -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.publisher"
      :icon="mdiDomain"
      :title="t('publisher')"
      :text="props.reference.metadata.source.publisher"
    />

    <!-- PUBLICATION PLACE -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.publicationPlace"
      :icon="mdiMapMarker"
      :title="t('publication-place')"
      :text="props.reference.metadata.source.publicationPlace"
    />

    <!-- EDITION -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.edition"
      :icon="mdiBookmark"
      :title="t('edition')"
      :text="props.reference.metadata.source.edition"
    />

    <!-- SERIES -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.series"
      :icon="mdiLibrary"
      :title="t('series')"
      :text="props.reference.metadata.source.series"
    />

    <!-- INSTITUTION -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.institution"
      :icon="mdiSchool"
      :title="t('institution')"
      :text="props.reference.metadata.source.institution"
    />

    <!-- IDENTIFIERS SECTION (Important) -->
    <template
      v-if="props.reference.metadata.identifiers && (
        props.reference.metadata.identifiers.doi
        || props.reference.metadata.identifiers.arxivId
        || props.reference.metadata.identifiers.pmid
        || props.reference.metadata.identifiers.pmcid
        || props.reference.metadata.identifiers.isbn
        || props.reference.metadata.identifiers.issn
      )"
    >
      <v-divider class="my-2" />

      <!-- DOI -->
      <ReferenceMetadataItem
        v-if="props.reference.metadata.identifiers?.doi"
        :icon="mdiIdentifier"
        title="DOI"
        :text="props.reference.metadata.identifiers.doi"
        link
      />

      <!-- ARXIV ID -->
      <ReferenceMetadataItem
        v-if="props.reference.metadata.identifiers?.arxivId"
        :icon="mdiNewspaper"
        title="arXiv ID"
        :text="props.reference.metadata.identifiers.arxivId"
        link
      />

      <!-- PMID -->
      <ReferenceMetadataItem
        v-if="props.reference.metadata.identifiers?.pmid"
        :icon="mdiMedicalBag"
        title="PMID"
        :text="props.reference.metadata.identifiers.pmid"
        link
      />

      <!-- PMCID -->
      <ReferenceMetadataItem
        v-if="props.reference.metadata.identifiers?.pmcid"
        :icon="mdiMedicalBag"
        title="PMCID"
        :text="props.reference.metadata.identifiers.pmcid"
        link
      />

      <!-- ISBN -->
      <ReferenceMetadataItem
        v-if="props.reference.metadata.identifiers?.isbn"
        :icon="mdiLibrary"
        title="ISBN"
        :text="props.reference.metadata.identifiers.isbn"
        link
      />

      <!-- ISSN -->
      <ReferenceMetadataItem
        v-if="props.reference.metadata.identifiers?.issn"
        :icon="mdiNewspaper"
        title="ISSN"
        :text="props.reference.metadata.identifiers.issn"
        link
      />
    </template>

    <!-- URL for ExternalSource -->
    <ReferenceMetadataItem
      v-if="'url' in props.reference && props.reference.url"
      :icon="mdiLink"
      title="URL"
      :text="props.reference.url"
      link
    />

    <!-- SOURCE URL -->
    <ReferenceMetadataItem
      v-if="props.reference.metadata.source.url"
      :icon="mdiLink"
      :title="t('source-url')"
      :text="props.reference.metadata.source.url"
      link
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
          <!-- SUBTITLE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.subtitle"
            :icon="mdiFileDocumentOutline"
            :title="t('subtitle')"
            :text="props.reference.metadata.source.subtitle"
          />

          <!-- LOCATION -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.location"
            :icon="mdiMapMarker"
            :title="t('location')"
            :text="props.reference.metadata.source.location"
          />

          <!-- RETRIEVAL DATE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.retrievalDate"
            :icon="mdiCalendarClock"
            :title="t('retrieval-date')"
            :text="props.reference.metadata.source.retrievalDate"
          />

          <!-- CONTRIBUTORS -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.contributors?.length"
            :icon="mdiAccountTie"
            :title="t('contributors')"
            :text="props.reference.metadata.source.contributors?.map(contributor => {
              if (typeof contributor === 'string') return contributor
              const name = `${contributor.firstName || ''} ${contributor.lastName || ''}`.trim()
              return contributor.role ? `${name} (${contributor.role})` : name
            }).join(', ')"
          />

          <!-- PAGE TYPE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.pageType"
            :icon="mdiNotebookOutline"
            :title="t('page-type')"
            :text="props.reference.metadata.source.pageType"
          />

          <!-- PARAGRAPH NUMBER -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.paragraphNumber"
            :icon="mdiNumeric"
            :title="t('paragraph-number')"
            :text="props.reference.metadata.source.paragraphNumber"
          />

          <!-- VOLUME PREFIX -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.volumePrefix"
            :icon="mdiBookOpenBlankVariantOutline"
            :title="t('volume-prefix')"
            :text="props.reference.metadata.source.volumePrefix"
          />

          <!-- ISSUE PREFIX -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.issuePrefix"
            :icon="mdiCalendarRange"
            :title="t('issue-prefix')"
            :text="props.reference.metadata.source.issuePrefix"
          />

          <!-- SUPPLEMENT INFO -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.supplementInfo"
            :icon="mdiFileMultiple"
            :title="t('supplement-info')"
            :text="props.reference.metadata.source.supplementInfo"
          />

          <!-- ARTICLE NUMBER -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.articleNumber"
            :icon="mdiNumeric"
            :title="t('article-number')"
            :text="props.reference.metadata.source.articleNumber"
          />

          <!-- CONFERENCE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.conference"
            :icon="mdiMicrophone"
            :title="t('conference')"
            :text="props.reference.metadata.source.conference"
          />

          <!-- SERIES NUMBER -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.seriesNumber"
            :icon="mdiLibrary"
            :title="t('series-number')"
            :text="props.reference.metadata.source.seriesNumber"
          />

          <!-- CHAPTER TITLE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.chapterTitle"
            :icon="mdiFileDocumentOutline"
            :title="t('chapter-title')"
            :text="props.reference.metadata.source.chapterTitle"
          />

          <!-- MEDIUM -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.medium"
            :icon="mdiTelevision"
            :title="t('medium')"
            :text="props.reference.metadata.source.medium"
          />

          <!-- ORIGINAL TITLE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.originalTitle"
            :icon="mdiTranslate"
            :title="t('original-title')"
            :text="props.reference.metadata.source.originalTitle"
          />

          <!-- ORIGINAL LANGUAGE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.originalLanguage"
            :icon="mdiTranslate"
            :title="t('original-language')"
            :text="props.reference.metadata.source.originalLanguage"
          />

          <!-- DEGREE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.degree"
            :icon="mdiGavel"
            :title="t('degree')"
            :text="props.reference.metadata.source.degree"
          />

          <!-- ADVISOR -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.advisor"
            :icon="mdiAccountTie"
            :title="t('advisor')"
            :text="props.reference.metadata.source.advisor"
          />

          <!-- DEPARTMENT -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.department"
            :icon="mdiSchool"
            :title="t('department')"
            :text="props.reference.metadata.source.department"
          />

          <!-- IS STANDALONE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.source.isStandAlone !== undefined"
            :icon="mdiBookOpenBlankVariantOutline"
            :title="t('is-standalone')"
            :text="props.reference.metadata.source.isStandAlone ? t('yes') : t('no')"
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
          <!-- SEASON -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.date.season"
            :icon="mdiCalendarOutline"
            :title="t('season')"
            :text="props.reference.metadata.date.season"
          />

          <!-- DATE RANGE -->
          <ReferenceMetadataItem
            v-if="props.reference.metadata.date.dateRange && props.reference.metadata.date.yearEnd"
            :icon="mdiCalendarRange"
            :title="t('date-range')"
            :text="`${props.reference.metadata.date.year}–${props.reference.metadata.date.yearEnd}`"
          />
        </div>
      </v-expand-transition>
    </template>
  </v-list>
</template>

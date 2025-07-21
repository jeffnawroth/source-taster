<script setup lang="ts">
import { mdiBookOpen, mdiCalendar, mdiFileDocument, mdiIdentifier, mdiSchool, mdiWrench } from '@mdi/js'
import { computed } from 'vue'
import { extractionSettings } from '../logic'
import ExtractionFieldSection from './ExtractionFieldSection.vue'

// TRANSLATION
const { t } = useI18n()

// FIELD DEFINITIONS
const coreFields = ['title', 'authors', 'year']
const dateFields = ['month', 'day', 'yearSuffix', 'dateRange', 'yearEnd', 'noDate', 'inPress', 'approximateDate', 'season']
const identifierFields = ['doi', 'isbn', 'issn', 'pmid', 'pmcid', 'arxivId']
const publicationFields = ['containerTitle', 'subtitle', 'volume', 'issue', 'pages', 'publisher', 'publicationPlace', 'url', 'sourceType', 'location', 'retrievalDate', 'edition', 'medium', 'originalTitle', 'originalLanguage', 'chapterTitle', 'contributors']
const academicFields = ['conference', 'institution', 'series', 'seriesNumber', 'degree', 'advisor', 'department']
const technicalFields = ['pageType', 'paragraphNumber', 'volumePrefix', 'issuePrefix', 'supplementInfo', 'articleNumber', 'isStandAlone']

// COMPUTED - Wrapper for ExtractionFieldSection compatibility
const extractionSettingsWrapper = computed({
  get: () => ({ enabledFields: extractionSettings.value.enabledFields as unknown as Record<string, boolean> }),
  set: (value) => {
    Object.assign(extractionSettings.value.enabledFields, value.enabledFields)
  },
})
const getCoreFieldsCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return coreFields.filter(field => fields[field as keyof typeof fields]).length
})

const getCoreFieldsColor = computed(() => {
  const count = getCoreFieldsCount.value
  if (count === 3)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'error'
})

const getDateFieldsCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return dateFields.filter(field => fields[field as keyof typeof fields]).length
})

const getDateFieldsColor = computed(() => {
  const count = getDateFieldsCount.value
  if (count >= 4)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'default'
})

const getIdentifiersCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return identifierFields.filter(field => fields[field as keyof typeof fields]).length
})

const getIdentifiersColor = computed(() => {
  const count = getIdentifiersCount.value
  if (count >= 3)
    return 'success'
  if (count >= 1)
    return 'warning'
  return 'default'
})

const getPublicationCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return publicationFields.filter(field => fields[field as keyof typeof fields]).length
})

const getPublicationColor = computed(() => {
  const count = getPublicationCount.value
  if (count >= 8)
    return 'success'
  if (count >= 4)
    return 'warning'
  return 'default'
})

const getAcademicCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return academicFields.filter(field => fields[field as keyof typeof fields]).length
})

const getAcademicColor = computed(() => {
  const count = getAcademicCount.value
  if (count >= 4)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'default'
})

const getTechnicalCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return technicalFields.filter(field => fields[field as keyof typeof fields]).length
})

const getTechnicalColor = computed(() => {
  const count = getTechnicalCount.value
  if (count >= 3)
    return 'success'
  if (count >= 1)
    return 'warning'
  return 'default'
})

const extractionFieldSections = computed(() => [
  {
    title: t('core-metadata'),
    icon: mdiBookOpen,
    fields: coreFields,
    totalFields: coreFields.length,
    count: getCoreFieldsCount.value,
    color: getCoreFieldsColor.value,

  },
  {
    title: t('date-information'),
    icon: mdiCalendar,
    fields: dateFields,
    totalFields: dateFields.length,
    count: getDateFieldsCount.value,
    color: getDateFieldsColor.value,
  },
  {
    title: t('identifiers'),
    icon: mdiIdentifier,
    fields: identifierFields,
    totalFields: identifierFields.length,
    count: getIdentifiersCount.value,
    color: getIdentifiersColor.value,
  },
  {
    title: t('publication-details'),
    icon: mdiFileDocument,
    fields: publicationFields,
    totalFields: publicationFields.length,
    count: getPublicationCount.value,
    color: getPublicationColor.value,
  },
  {
    title: t('academic-institutional'),
    icon: mdiSchool,
    fields: academicFields,
    totalFields: academicFields.length,
    count: getAcademicCount.value,
    color: getAcademicColor.value,
  },
  {
    title: t('technical-details'),
    icon: mdiWrench,
    fields: technicalFields,
    totalFields: technicalFields.length,
    count: getTechnicalCount.value,
    color: getTechnicalColor.value,
  },
])
</script>

<template>
  <v-expansion-panels elevation="0">
    <ExtractionFieldSection
      v-for="section in extractionFieldSections"
      :key="section.title"
      v-model="extractionSettingsWrapper"
      v-bind="section"
    />
  </v-expansion-panels>
</template>

<script setup lang="ts">
import type { ExtractionFields } from '@source-taster/types'
import { mdiBookOpen, mdiCalendar, mdiFileDocument, mdiIdentifier, mdiSchool, mdiWrench } from '@mdi/js'
import {
  ACADEMIC_FIELDS,
  CORE_FIELDS,
  DATE_FIELDS,
  IDENTIFIER_FIELDS,
  PUBLICATION_FIELDS,
  TECHNICAL_FIELDS,
} from '@source-taster/types'
import { computed } from 'vue'
import { extractionSettings } from '../../../../logic'
import ExtractionFieldSection from './ExtractionFieldSection.vue'

// TRANSLATION
const { t } = useI18n()

// COMPUTED - Wrapper for ExtractionFieldSection compatibility
const extractionSettingsWrapper = computed({
  get: () => ({ enabledFields: extractionSettings.value.enabledFields as unknown as Record<string, boolean> }),
  set: (value) => {
    Object.assign(extractionSettings.value.enabledFields, value.enabledFields)
  },
})
const getCoreFieldsCount = computed(() => {
  const fields = extractionSettings.value.enabledFields
  return CORE_FIELDS.filter((field: keyof ExtractionFields) => fields[field]).length
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
  return DATE_FIELDS.filter((field: keyof ExtractionFields) => fields[field]).length
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
  return IDENTIFIER_FIELDS.filter((field: keyof ExtractionFields) => fields[field]).length
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
  return PUBLICATION_FIELDS.filter((field: keyof ExtractionFields) => fields[field]).length
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
  return ACADEMIC_FIELDS.filter((field: keyof ExtractionFields) => fields[field]).length
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
  return TECHNICAL_FIELDS.filter((field: keyof ExtractionFields) => fields[field]).length
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
    fields: CORE_FIELDS,
    totalFields: CORE_FIELDS.length,
    count: getCoreFieldsCount.value,
    color: getCoreFieldsColor.value,

  },
  {
    title: t('date-information'),
    icon: mdiCalendar,
    fields: DATE_FIELDS,
    totalFields: DATE_FIELDS.length,
    count: getDateFieldsCount.value,
    color: getDateFieldsColor.value,
  },
  {
    title: t('identifiers'),
    icon: mdiIdentifier,
    fields: IDENTIFIER_FIELDS,
    totalFields: IDENTIFIER_FIELDS.length,
    count: getIdentifiersCount.value,
    color: getIdentifiersColor.value,
  },
  {
    title: t('publication-details'),
    icon: mdiFileDocument,
    fields: PUBLICATION_FIELDS,
    totalFields: PUBLICATION_FIELDS.length,
    count: getPublicationCount.value,
    color: getPublicationColor.value,
  },
  {
    title: t('academic-institutional'),
    icon: mdiSchool,
    fields: ACADEMIC_FIELDS,
    totalFields: ACADEMIC_FIELDS.length,
    count: getAcademicCount.value,
    color: getAcademicColor.value,
  },
  {
    title: t('technical-details'),
    icon: mdiWrench,
    fields: TECHNICAL_FIELDS,
    totalFields: TECHNICAL_FIELDS.length,
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

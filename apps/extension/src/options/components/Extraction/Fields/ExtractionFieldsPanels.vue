<script setup lang="ts">
import { mdiBookOpen, mdiCalendar, mdiFileDocument, mdiIdentifier, mdiSchool, mdiWrench } from '@mdi/js'
import { ACADEMIC_FIELDS, CORE_FIELDS, DATE_FIELDS, type ExtractableField, IDENTIFIER_FIELDS, PUBLICATION_FIELDS, TECHNICAL_FIELDS } from '@source-taster/types'
import { extractionSettings } from '../../../../logic'
import ExtractionFieldSection from './ExtractionFieldSection.vue'

// TRANSLATION
const { t } = useI18n()

function isFieldEnabled(field: ExtractableField): boolean {
  return extractionSettings.value.extractionConfig.fields.includes(field)
}

function countEnabledFields(fields: ExtractableField[]): number {
  return fields.filter(field => isFieldEnabled(field)).length
}

function getColorForCount(count: number, excellent: number, good: number): string {
  if (count >= excellent)
    return 'success'
  if (count >= good)
    return 'warning'
  return 'default'
}

// Core fields computeds
const getCoreFieldsCount = computed(() => countEnabledFields(CORE_FIELDS))
const getCoreFieldsColor = computed(() => {
  const count = getCoreFieldsCount.value
  if (count === CORE_FIELDS.length)
    return 'success'
  if (count >= 2)
    return 'warning'
  return 'error'
})

// Date fields computeds
const getDateFieldsCount = computed(() => countEnabledFields(DATE_FIELDS))
const getDateFieldsColor = computed(() =>
  getColorForCount(getDateFieldsCount.value, 4, 2),
)

// Identifier fields computeds
const getIdentifiersCount = computed(() => countEnabledFields(IDENTIFIER_FIELDS))
const getIdentifiersColor = computed(() =>
  getColorForCount(getIdentifiersCount.value, 3, 1),
)

// Publication fields computeds
const getPublicationCount = computed(() => countEnabledFields(PUBLICATION_FIELDS))
const getPublicationColor = computed(() =>
  getColorForCount(getPublicationCount.value, 8, 4),
)

// Academic fields computeds
const getAcademicCount = computed(() => countEnabledFields(ACADEMIC_FIELDS))
const getAcademicColor = computed(() =>
  getColorForCount(getAcademicCount.value, 4, 2),
)

// Technical fields computeds
const getTechnicalCount = computed(() => countEnabledFields(TECHNICAL_FIELDS))
const getTechnicalColor = computed(() =>
  getColorForCount(getTechnicalCount.value, 3, 1),
)

/**
 * Create extraction field sections configuration
 * Single responsibility: Section configuration
 */
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
    title: t('academic-details'),
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
  <v-expansion-panels
    multiple
    variant="accordion"
  >
    <ExtractionFieldSection
      v-for="section in extractionFieldSections"
      :key="section.title"
      :title="section.title"
      :icon="section.icon"
      :fields="section.fields"
      :total-fields="section.totalFields"
      :count="section.count"
      :color="section.color"
    />
  </v-expansion-panels>
</template>

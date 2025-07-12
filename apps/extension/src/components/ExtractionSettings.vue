<script setup lang="ts">
import { mdiBookOpen, mdiCalendar, mdiFileDocument, mdiIdentifier, mdiSchool, mdiWrench } from '@mdi/js'
import { computed } from 'vue'
import { extractionSettings } from '../logic'
import ExtractionFieldSection from './ExtractionFieldSection.vue'

// TRANSLATION
const { t } = useI18n()

// FIELD DEFINITIONS
const coreFields = ['title', 'authors', 'year']
const dateFields = ['month', 'day', 'yearSuffix', 'dateRange', 'noDate', 'inPress', 'approximateDate', 'season']
const identifierFields = ['doi', 'isbn', 'issn', 'pmid', 'pmcid', 'arxivId']
const publicationFields = ['containerTitle', 'subtitle', 'volume', 'issue', 'pages', 'publisher', 'publicationPlace', 'url', 'sourceType', 'location', 'retrievalDate', 'edition', 'medium', 'originalTitle', 'originalLanguage', 'chapterTitle']
const academicFields = ['conference', 'institution', 'series', 'seriesNumber', 'degree', 'advisor', 'department']
const technicalFields = ['pageType', 'paragraphNumber', 'volumePrefix', 'issuePrefix', 'supplementInfo', 'articleNumber']

// COMPUTED - Field Counts and Colors
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

// METHODS
function deselectAll() {
  const fields = extractionSettings.value.enabledFields
  Object.keys(fields).forEach((key) => {
    fields[key as keyof typeof fields] = false
  })
}

function selectAll() {
  const fields = extractionSettings.value.enabledFields
  Object.keys(fields).forEach((key) => {
    fields[key as keyof typeof fields] = true
  })
}

function selectEssentials() {
  // First deselect all
  deselectAll()

  // Then select essential fields
  const fields = extractionSettings.value.enabledFields
  fields.title = true
  fields.authors = true
  fields.year = true
  fields.doi = true
  fields.containerTitle = true
  fields.pages = true
}
</script>

<template>
  <v-card
    flat
    :title="t('extraction-settings')"
    :subtitle="t('extraction-settings-description')"
  >
    <v-card-text>
      <!-- Quick Actions -->
      <v-btn
        size="small"
        variant="outlined"
        class="mr-2"
        @click="selectAll"
      >
        {{ t('select-all') }}
      </v-btn>
      <v-btn
        size="small"
        variant="outlined"
        class="mr-2"
        @click="selectEssentials"
      >
        {{ t('select-essentials') }}
      </v-btn>
      <v-btn
        size="small"
        variant="outlined"
        @click="deselectAll"
      >
        {{ t('deselect-all') }}
      </v-btn>

      <v-expansion-panels
        elevation="0"
      >
        <!-- Core Fields Section -->
        <ExtractionFieldSection
          v-model="extractionSettings"
          :title="t('core-metadata')"
          :icon="mdiBookOpen"
          :fields="coreFields"
          :count="getCoreFieldsCount"
          :total-fields="3"
          :color="getCoreFieldsColor"
        />

        <!-- Date Information Section -->
        <ExtractionFieldSection
          v-model="extractionSettings"
          :title="t('date-information')"
          :icon="mdiCalendar"
          :fields="dateFields"
          :count="getDateFieldsCount"
          :total-fields="8"
          :color="getDateFieldsColor"
        />

        <!-- Identifiers Section -->
        <ExtractionFieldSection
          v-model="extractionSettings"
          :title="t('identifiers')"
          :icon="mdiIdentifier"
          :fields="identifierFields"
          :count="getIdentifiersCount"
          :total-fields="6"
          :color="getIdentifiersColor"
        />

        <!-- Publication Details Section -->
        <ExtractionFieldSection
          v-model="extractionSettings"
          :title="t('publication-details')"
          :icon="mdiFileDocument"
          :fields="publicationFields"
          :count="getPublicationCount"
          :total-fields="16"
          :color="getPublicationColor"
        />

        <!-- Academic & Institutional Section -->
        <ExtractionFieldSection
          v-model="extractionSettings"
          :title="t('academic-institutional')"
          :icon="mdiSchool"
          :fields="academicFields"
          :count="getAcademicCount"
          :total-fields="7"
          :color="getAcademicColor"
        />

        <!-- Technical Details Section -->
        <ExtractionFieldSection
          v-model="extractionSettings"
          :title="t('technical-details')"
          :icon="mdiWrench"
          :fields="technicalFields"
          :count="getTechnicalCount"
          :total-fields="6"
          :color="getTechnicalColor"
        />
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { ExtractionSettings } from '@source-taster/types'
import { mdiBookOpen, mdiCalendar, mdiCheckboxMultipleMarked, mdiFileDocument, mdiIdentifier, mdiSchool, mdiWrench } from '@mdi/js'
import { computed } from 'vue'
import ExtractionFieldSection from './ExtractionFieldSection.vue'

// Use defineModel for cleaner reactive binding
const modelValue = defineModel<ExtractionSettings>({ required: true })

// TRANSLATION
const { t } = useI18n()

// FIELD DEFINITIONS
const coreFields = ['title', 'authors', 'year']
const dateFields = ['month', 'day', 'yearSuffix', 'dateRange', 'yearEnd', 'noDate', 'inPress', 'approximateDate', 'season']
const identifierFields = ['doi', 'isbn', 'issn', 'pmid', 'pmcid', 'arxivId']
const publicationFields = ['containerTitle', 'subtitle', 'volume', 'issue', 'pages', 'publisher', 'publicationPlace', 'url', 'sourceType', 'location', 'retrievalDate', 'edition', 'medium', 'originalTitle', 'originalLanguage', 'chapterTitle', 'contributors']
const academicFields = ['conference', 'institution', 'series', 'seriesNumber', 'degree', 'advisor', 'department']
const technicalFields = ['pageType', 'paragraphNumber', 'volumePrefix', 'issuePrefix', 'supplementInfo', 'articleNumber', 'isStandAlone']

// COMPUTED - Field Counts and Colors
const getCoreFieldsCount = computed(() => {
  const fields = modelValue.value.enabledFields
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
  const fields = modelValue.value.enabledFields
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
  const fields = modelValue.value.enabledFields
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
  const fields = modelValue.value.enabledFields
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
  const fields = modelValue.value.enabledFields
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
  const fields = modelValue.value.enabledFields
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
  const fields = modelValue.value.enabledFields
  Object.keys(fields).forEach((key) => {
    fields[key as keyof typeof fields] = false
  })
}

function selectAll() {
  const fields = modelValue.value.enabledFields
  Object.keys(fields).forEach((key) => {
    fields[key as keyof typeof fields] = true
  })
}

function selectEssentials() {
  // First deselect all
  deselectAll()

  // Then select essential fields
  const fields = modelValue.value.enabledFields
  fields.title = true
  fields.authors = true
  fields.year = true
  fields.doi = true
  fields.containerTitle = true
  fields.pages = true
}
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <div class="d-flex align-center">
        <v-icon
          :icon="mdiCheckboxMultipleMarked"
          class="me-3"
        />
        <div>
          <div class="text-h6">
            {{ $t('extractionSettings.description') }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ $t('extractionSettings.fieldSelectionDescription') }}
          </div>
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <!-- Quick Actions -->
      <div class="mb-4">
        <v-btn
          size="small"
          color="primary"
          class="mr-2"
          variant="tonal"
          @click="selectAll"
        >
          {{ t('select-all') }}
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          class="mr-2"
          color="primary"
          @click="selectEssentials"
        >
          {{ t('select-essentials') }}
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          color="primary"
          @click="deselectAll"
        >
          {{ t('deselect-all') }}
        </v-btn>
      </div>

      <v-expansion-panels
        elevation="0"
      >
        <!-- Core Fields Section -->
        <ExtractionFieldSection
          v-model="modelValue"
          :title="t('core-metadata')"
          :icon="mdiBookOpen"
          :fields="coreFields"
          :count="getCoreFieldsCount"
          :total-fields="3"
          :color="getCoreFieldsColor"
        />

        <!-- Date Information Section -->
        <ExtractionFieldSection
          v-model="modelValue"
          :title="t('date-information')"
          :icon="mdiCalendar"
          :fields="dateFields"
          :count="getDateFieldsCount"
          :total-fields="9"
          :color="getDateFieldsColor"
        />

        <!-- Identifiers Section -->
        <ExtractionFieldSection
          v-model="modelValue"
          :title="t('identifiers')"
          :icon="mdiIdentifier"
          :fields="identifierFields"
          :count="getIdentifiersCount"
          :total-fields="6"
          :color="getIdentifiersColor"
        />

        <!-- Publication Details Section -->
        <ExtractionFieldSection
          v-model="modelValue"
          :title="t('publication-details')"
          :icon="mdiFileDocument"
          :fields="publicationFields"
          :count="getPublicationCount"
          :total-fields="17"
          :color="getPublicationColor"
        />

        <!-- Academic & Institutional Section -->
        <ExtractionFieldSection
          v-model="modelValue"
          :title="t('academic-institutional')"
          :icon="mdiSchool"
          :fields="academicFields"
          :count="getAcademicCount"
          :total-fields="7"
          :color="getAcademicColor"
        />

        <!-- Technical Details Section -->
        <ExtractionFieldSection
          v-model="modelValue"
          :title="t('technical-details')"
          :icon="mdiWrench"
          :fields="technicalFields"
          :count="getTechnicalCount"
          :total-fields="7"
          :color="getTechnicalColor"
        />
      </v-expansion-panels>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
